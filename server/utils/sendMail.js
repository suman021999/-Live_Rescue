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


import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMeetingEmail = async (to, roomId) => {
  try {
    if (!to) {
      throw new Error("Recipient email is missing");
    }

    if (!roomId) {
      throw new Error("Room ID is missing");
    }

    const joinLink = `http://localhost:5173/video-call/${roomId}`;

    console.log("📧 Sending email to:", to);
    console.log("🔗 Join link:", joinLink);

    const response = await resend.emails.send({
      from: "LiveRescue <onboarding@resend.dev>", // ⚠️ change later to your domain
      to: to,
      subject: "🚑 Emergency Call - Join Now",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: red;">🚑 Emergency Call Request</h2>
          
          <p>You have an incoming emergency call.</p>
          
          <a 
            href="${joinLink}" 
            style="
              display:inline-block;
              padding:12px 24px;
              background:red;
              color:white;
              text-decoration:none;
              border-radius:6px;
              font-weight:bold;
            "
          >
            Join Call
          </a>

          <p style="margin-top: 20px;">
            Or copy this link:<br/>
            <a href="${joinLink}">${joinLink}</a>
          </p>

          <hr style="margin:20px 0;" />

          <p style="font-size:12px;color:gray;">
            If you did not request this, you can ignore this email.
          </p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully:", response);
    return response;

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error; // 🔥 IMPORTANT: don't swallow errors
  }
};