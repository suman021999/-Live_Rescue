// server/utils/sendMail.js

import nodemailer from "nodemailer";
import { resolve4 } from "dns/promises";
import dns from "dns";

// ✅ Force IPv4 at DNS level — belt-and-suspenders approach
dns.setDefaultResultOrder("ipv4first");

export const sendMeetingEmail = async (to, roomId) => {
  // ✅ PRE-RESOLVE smtp.gmail.com to an IPv4 address BEFORE creating the transporter.
  // This is the only 100% reliable way to avoid ENETUNREACH on Render free tier,
  // which resolves hostnames to IPv6 first and the socket connect fails.
  let smtpHost = "smtp.gmail.com";
  try {
    const [ipv4] = await resolve4("smtp.gmail.com");
    smtpHost = ipv4;
    console.log("✅ Resolved smtp.gmail.com →", ipv4);
  } catch (resolveErr) {
    console.warn("⚠️ DNS resolve4 failed, falling back to hostname:", resolveErr.message);
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,            // ✅ IPv4 address (e.g. 74.125.x.x) or hostname fallback
    port: 587,                 // ✅ STARTTLS — open on Render free tier
    secure: false,             // false = STARTTLS (upgrades after connect)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Must be a Gmail App Password
    },
    tls: {
      rejectUnauthorized: false,       // ✅ Avoids cert chain issues on some hosts
      servername: "smtp.gmail.com",    // ✅ Required for TLS SNI when connecting via raw IP
    },
  });

  // ✅ Verify SMTP connection before sending
  try {
    await transporter.verify();
    console.log("✅ SMTP is ready");
  } catch (err) {
    console.error("❌ SMTP ERROR:", err.message);
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
    throw err; // Bubble up so caller (index.js) can catch it
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