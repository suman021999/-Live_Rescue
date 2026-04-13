// server/utils/sendMail.js

import nodemailer from "nodemailer";
import dns from "dns";

// ✅ Step 1: Set global DNS preference to IPv4
dns.setDefaultResultOrder("ipv4first");

// ✅ Step 2: Patch dns.lookup to FORCE IPv4 for smtp.gmail.com
// WHY: nodemailer v8 uses net.createConnection() internally, which calls
// dns.lookup() at socket creation time — NOT dns.resolve4(). On Render free
// tier, dns.lookup("smtp.gmail.com") returns an IPv6 address first, causing
// the ENETUNREACH error. Patching here intercepts that call before the socket
// is created and forces family:4 (IPv4) for that specific host only.
const _originalLookup = dns.lookup.bind(dns);
dns.lookup = function (hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (hostname === "smtp.gmail.com") {
    // Force IPv4 only for the SMTP host — all other DNS stays unaffected
    options = { ...(options || {}), family: 4 };
  }
  return _originalLookup(hostname, options, callback);
};

export const sendMeetingEmail = async (to, roomId) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,               // STARTTLS — open on Render free tier
    secure: false,           // false = STARTTLS (upgrades after connect)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Must be a Gmail App Password
    },
    tls: {
      rejectUnauthorized: false, // Avoids cert issues on some hosting providers
    },
  });

  // Verify SMTP connection before sending
  try {
    await transporter.verify();
    console.log("✅ SMTP is ready");
  } catch (err) {
    console.error("❌ SMTP ERROR:", err.message);
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
    throw err; // ✅ Bubble up — so index.js logs "❌ Email failed" (not "Email sent")
  }

  const joinLink = `${process.env.FRONTEND_URL}/video-call/${roomId}`;

  try {
    const info = await transporter.sendMail({
      from: `"LiveRescue" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🚑 Emergency Call - Join Now",
      html: `
        <h2>Emergency Call Request</h2>
        <p>You have an incoming emergency call.</p>
        <a href="${joinLink}" style="padding:10px 20px;background:red;color:white;text-decoration:none;">
          Join Call
        </a>
        <p>Room ID: ${roomId}</p>
      `,
    });

    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ SEND ERROR:", err.message);
    throw err; // Bubble up so caller can catch it
  }
};