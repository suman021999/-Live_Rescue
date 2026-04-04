// // server/utils/sendMail.js

// import nodemailer from "nodemailer";

// export const sendMeetingEmail = async (to, roomId) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail", // 🔥 change this
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   // ✅ DEBUG SMTP CONNECTION
//   try {
//     await transporter.verify();
//     console.log("✅ SMTP is ready");
//   } catch (err) {
//     console.error("❌ SMTP ERROR:", err.message);
//     return;
//   }

//   const joinLink = `${process.env.FRONTEND_URL}/video-call/${roomId}`;

//   try {
//     const info = await transporter.sendMail({
//       from: `"LiveRescue" <${process.env.EMAIL_USER}>`,
//       to,
//       subject: "🚑 Emergency Call - Join Now",
//       html: `
//         <h2>Emergency Call Request</h2>
//         <p>You have an incoming emergency call.</p>
//         <a href="${joinLink}" style="padding:10px 20px;background:red;color:white;text-decoration:none;">
//           Join Call
//         </a>
//         <p>Room ID: ${joinLink}</p>
//       `,
//     });

//     console.log("✅ Email sent:", info.response);
//   } catch (err) {
//     console.error("❌ SEND ERROR:", err.message);
//   }
// };


// server/utils/sendMail.js

import nodemailer from "nodemailer";

export const sendMeetingEmail = async (to, roomId) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // ⚠️ Must be a Gmail App Password (not your real password)
    },
  });

  // ✅ Verify SMTP connection before sending
  try {
    await transporter.verify();
    console.log("✅ SMTP is ready");
  } catch (err) {
    console.error("❌ SMTP ERROR:", err);
    return; // Exit early — don't try to send if SMTP failed
  }

  const joinLink = `${process.env.FRONTEND_URL}/video-call/${roomId}`;

  try {
    const info = await transporter.sendMail({
      from: `"LiveRescue" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🚑 Emergency Call - Join Now",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #dc2626;">🚑 Emergency Call Request</h2>
          <p>You have an incoming emergency call. Please join immediately.</p>
          <a
            href="${joinLink}"
            style="
              display: inline-block;
              margin: 16px 0;
              padding: 12px 24px;
              background: #dc2626;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            "
          >
            Join Call Now
          </a>
          <p style="color: #6b7280; font-size: 12px;">Room link: ${joinLink}</p>
        </div>
      `,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ SEND ERROR:", err);
  }
};