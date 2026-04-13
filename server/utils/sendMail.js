// server/utils/sendMail.js

import https from "https";

// ✅ SendPulse API Config
const CLIENT_ID = process.env.SENDPULSE_CLIENT_ID;
const CLIENT_SECRET = process.env.SENDPULSE_CLIENT_SECRET;
const SENDER_EMAIL = process.env.EMAIL_USER;

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Gets the Access Token from SendPulse
 */
const getSendPulseToken = async () => {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const postData = JSON.stringify({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const options = {
    hostname: "api.sendpulse.com",
    path: "/oauth/access_token",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) {
            cachedToken = parsed.access_token;
            tokenExpiry = Date.now() + (parsed.expires_in - 60) * 1000;
            resolve(cachedToken);
          } else {
            reject(new Error("Failed to get SendPulse token: " + data));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", (e) => reject(e));
    req.write(postData);
    req.end();
  });
};

/**
 * Sends meeting email via SendPulse REST API
 */
export const sendMeetingEmail = async (to, roomId) => {
  // ✅ Safety check to identify if env variables are missing
  if (!to || !SENDER_EMAIL) {
    const errorMsg = `Missing email parameters. Sender: ${SENDER_EMAIL || "MISSING"}, To: ${to || "MISSING"}`;
    console.error("❌ " + errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const token = await getSendPulseToken();
    const joinLink = `${process.env.FRONTEND_URL}/video-call/${roomId}`;

    const emailData = JSON.stringify({
      email: {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #d32f2f;">Emergency Call Request</h2>
            <p>You have an incoming emergency call. Please join immediately.</p>
            <div style="margin: 30px 0;">
              <a href="${joinLink}" style="padding: 12px 24px; background-color: #f44336; color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">
                Join Video Call
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Room ID: <code style="background: #f4f4f4; padding: 2px 5px; border-radius: 3px;">${roomId}</code></p>
          </div>
        `,
        text: `Emergency Call Request. Join the video call here: ${joinLink}. Room ID: ${roomId}`, // ✅ Added plain text
        subject: "🚑 Emergency Call - Join Now",
        from: {
          name: "LiveRescue",
          email: SENDER_EMAIL, 
        },
        to: [
          {
            name: "Rescue Responder", // ✅ Added name field
            email: to,
          },
        ],
      },
    });

    const options = {
      hostname: "api.sendpulse.com",
      path: "/smtp/emails",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(emailData),
        Authorization: `Bearer ${token}`,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log("✅ Email sent via SendPulse API (Port 443)");
            resolve(data);
          } else {
            reject(new Error("SendPulse API Error: " + data));
          }
        });
      });

      req.on("error", (e) => {
        console.error("❌ SendPulse Request Error:", e.message);
        reject(e);
      });
      req.write(emailData);
      req.end();
    });
  } catch (err) {
    console.error("❌ SEND ERROR:", err.message);
    throw err;
  }
};