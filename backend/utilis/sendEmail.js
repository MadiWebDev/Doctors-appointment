import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
  // Check if email credentials are configured
  if (!process.env.SMTP_MAIL || !process.env.SMTP_PASSWORD) {
    console.warn("⚠️ Email credentials not configured. Skipping email send.");
    console.warn("To enable emails, set SMTP_MAIL and SMTP_PASSWORD in .env");
    return;
  }

  try {
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
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    // Don't throw error - allow signup to continue even if email fails
  }
};

export default sendEmail;
