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


import nodemailer from "nodemailer";

export const sendMeetingEmail = async (to, roomId) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // ✅ use host instead of service
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // ⚠️ MUST be App Password
    },
  });

  // ✅ DEBUG SMTP CONNECTION
  try {
    await transporter.verify();
    console.log("✅ SMTP is ready");
  } catch (err) {
    console.error("❌ SMTP ERROR FULL:", err); // 🔥 FULL ERROR
    return;
  }

  const joinLink = `http://localhost:5173/video-call/${roomId}`;

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
        <p>Room ID: ${joinLink}</p>
      `,
    });

    console.log("✅ Email sent:", info);
  } catch (err) {
    console.error("❌ SEND ERROR FULL:", err); // 🔥 FULL ERROR
  }
};