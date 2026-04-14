// server/utils/gmailNotify.js
// ✅ Replaces sendMail.js — uses Gmail REST API (OAuth2), works on Render

import { google } from "googleapis";

// ================= OAUTH2 CLIENT =================
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // redirect URI used to get refresh token
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// ================= SEND GMAIL =================
export const sendInstantCallEmail = async (roomId, callType = "Emergency") => {
  try {
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const joinLink = `${frontendUrl}/video-call/${roomId}`;
    const to = "sankupatra2@gmail.com";

    const typeLabels = {
      medical: "🏥 Medical Help",
      sos: "🆘 Safety SOS",
      disaster: "🌪️ Disaster Help",
      roadside: "🚗 Roadside Assistance",
    };
    const label = typeLabels[callType] || "🚨 Emergency";

    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
    .card { background: white; border-radius: 12px; padding: 30px; max-width: 500px; margin: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .badge { background: #dc2626; color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; display: inline-block; }
    h2 { color: #111; margin-top: 16px; }
    p { color: #555; font-size: 14px; }
    .btn { display: inline-block; margin-top: 20px; padding: 14px 28px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; }
    .room { background: #f9f9f9; border: 1px solid #ddd; border-radius: 6px; padding: 10px; font-size: 12px; color: #888; margin-top: 16px; word-break: break-all; }
    .footer { margin-top: 24px; font-size: 11px; color: #aaa; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">LIVE CALL REQUEST</span>
    <h2>${label} — Someone Needs Help Now</h2>
    <p>A user has requested an emergency video call. Tap the button below to join immediately.</p>
    <a href="${joinLink}" class="btn">📞 Join Call Now</a>
    <div class="room">Room ID: ${roomId}<br>Link: ${joinLink}</div>
    <div class="footer">LiveRescue · Sent at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</div>
  </div>
</body>
</html>`;

    // RFC 2822 raw message
    const raw = [
      `To: ${to}`,
      `From: "LiveRescue" <${process.env.GMAIL_USER}>`,
      `Subject: ${label} — Join Call Now`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      emailBody,
    ].join("\n");

    const encodedMessage = Buffer.from(raw)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    console.log("✅ Gmail API email sent:", res.data.id);
    return res.data;
  } catch (err) {
    console.error("❌ Gmail API Error:", err.message);
    // Don't throw — call should still proceed even if email fails
  }
};
