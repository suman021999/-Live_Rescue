// server/utils/sendMail.js

import nodemailer from "nodemailer";
import dns from "dns";

// ✅ Force IPv4 — fixes ENETUNREACH on Render free tier (IPv6-first by default)
dns.setDefaultResultOrder("ipv4first");

export const sendMeetingEmail = async (to, roomId) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",  // ✅ explicit host
    port: 587,               // ✅ STARTTLS — port 587 is open on Render free tier
    secure: false,           // false = STARTTLS (upgrades after connect)
    family: 4,               // ✅ Force IPv4 socket — critical for Render free tier
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Must be a Gmail App Password
    },
    tls: {
      rejectUnauthorized: false, // ✅ Avoids TLS cert issues on some hosting providers
    },
  });

  // ✅ Verify SMTP connection before sending
  try {
    await transporter.verify();
    console.log("✅ SMTP is ready");
  } catch (err) {
    console.error("❌ SMTP ERROR:", err.message);
    throw err; // ✅ Bubble up so caller (index.js) can catch it properly
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
    
    throw err; // ✅ Bubble up so caller can catch it
  }
};

// console.log("EMAIL_USER:", process.env.EMAIL_USER);
//     console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);