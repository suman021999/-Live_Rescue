// server/utils/sendMail.js

import nodemailer from "nodemailer";

export const sendMeetingEmail = async (to, roomId) => {
  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

  const joinLink = `${process.env.FRONTEND_URL}/video-call/${roomId}`;

  await transporter.sendMail({
    from: `"LiveRescue" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🚑 Emergency Call - Join Now",
    html: `
      <h2>Emergency Call Request</h2>
      <p>You have an incoming emergency call.</p>
      <a href="${joinLink}" style="padding:10px 20px;background:red;color:white;text-decoration:none;">
        Join Call
      </a>
      <p>Room ID: ${joinLink}</p>
    `,
  });
};