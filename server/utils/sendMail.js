// server/utils/sendMail.js

import https from "https";

// ✅ SendPulse API Config
// Note: You must add these to your .env file
const CLIENT_ID = process.env.SENDPULSE_CLIENT_ID;
const CLIENT_SECRET = process.env.SENDPULSE_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Gets the Access Token from SendPulse using Client Credentials
 * Uses Port 443 (HTTP), which is NOT blocked by Render.
 */
const getSendPulseToken = async () => {
  // Return cached token if still valid
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
      "Content-Length": postData.length,
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
            // Token usually valid for 3600 seconds, expire 1 minute early for safety
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
 * This bypasses Render's SMTP port blocking (25, 465, 587).
 */
export const sendMeetingEmail = async (to, roomId) => {
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
        subject: "🚑 Emergency Call - Join Now",
        from: {
          name: "LiveRescue",
          email: process.env.EMAIL_USER, // e.g., 'your-verified-email@domain.com'
        },
        to: [
          {
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
        "Content-Length": emailData.length,
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
            console.error("❌ SendPulse API Error:", data);
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