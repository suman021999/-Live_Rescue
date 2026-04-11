// server/utils/sendMail.js

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


// import nodemailer from "nodemailer";

// export const sendMeetingEmail = async (to, roomId) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com", // ✅ use host instead of service
//     port: 587,
//     secure: false, // TLS
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS, // ⚠️ MUST be App Password
//     },
//   });

//   // ✅ DEBUG SMTP CONNECTION
//   try {
//     await transporter.verify();
//     console.log("✅ SMTP is ready");
//   } catch (err) {
//     console.error("❌ SMTP ERROR FULL:", err); // 🔥 FULL ERROR
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

//     console.log("✅ Email sent:", info);
//   } catch (err) {
//     console.error("❌ SEND ERROR FULL:", err); // 🔥 FULL ERROR
//   }
// };



import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMeetingEmail = async (to, roomId) => {
  const joinLink = `${process.env.FRONTEND_URL}/video-call/${roomId}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "LiveRescue <onboarding@resend.dev>", // change after domain verify
      to,
      subject: "🚑 Emergency Call - Join Now",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#cc0000;">🚨 Emergency Call Request</h2>
          <p>You have an incoming emergency call on <strong>LiveRescue</strong>.</p>

          <a href="${joinLink}"
             style="display:inline-block;padding:12px 24px;background:#cc0000;
                    color:white;text-decoration:none;border-radius:6px;
                    font-weight:bold;font-size:16px;">
            🔴 Join Emergency Call
          </a>

          <p style="margin-top:20px;color:#666;font-size:13px;">
            Or copy this link: <a href="${joinLink}">${joinLink}</a>
          </p>

          <p style="color:#666;font-size:12px;">Room ID: ${roomId}</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Email error:", error);
      throw new Error(error.message);
    }

    console.log("✅ Email sent:", data);
    return { success: true, data };
  } catch (err) {
    console.error("❌ SEND ERROR:", err.message);
    throw err;
  }
};