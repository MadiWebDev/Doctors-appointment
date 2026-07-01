import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
  // Check if email credentials are configured
  if (!process.env.SMTP_MAIL || !process.env.SMTP_PASSWORD) {
    const msg = "Email credentials not configured. Set SMTP_MAIL and SMTP_PASSWORD in .env";
    console.warn("⚠️ " + msg);
    throw new Error(msg);
  }

  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
  console.log("✅ Email sent successfully");
};

export default sendEmail;
