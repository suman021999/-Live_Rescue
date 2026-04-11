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



import nodemailer from "nodemailer";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

export const sendMeetingEmail = async (to, roomId) => {
  // Try ports in order: 465 first, fallback to 2525
  const SMTP_CONFIGS = [
    {
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // SSL
    },
    {
      // Fallback: Mailtrap-compatible or Gmail alternate
      host: "smtp.gmail.com",
      port: 2525,
      secure: false,
    },
  ];

  let transporter = null;
  let lastError = null;

  for (const config of SMTP_CONFIGS) {
    try {
      const t = nodemailer.createTransport({
        ...config,
        family: 4,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 10000, // 10s
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      await t.verify();
      console.log(`✅ SMTP ready on port ${config.port}`);
      transporter = t;
      break;
    } catch (err) {
      console.error(`❌ Port ${config.port} failed: ${err.message}`);
      lastError = err;
    }
  }

  if (!transporter) {
    console.error("❌ All SMTP ports failed. Last error:", lastError?.message);
    throw new Error(`SMTP unavailable: ${lastError?.message}`);
  }

  const joinLink = `${process.env.FRONTEND_URL}/video-call/${roomId}`;

  try {
    const info = await transporter.sendMail({
      from: `"LiveRescue" <${process.env.EMAIL_USER}>`,
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

    console.log("✅ Email sent successfully. MessageID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("❌ SEND ERROR:", err.message);
    throw err;
  }
};