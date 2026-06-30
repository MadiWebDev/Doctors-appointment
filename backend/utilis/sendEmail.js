import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
  // Check if email credentials are configured
  if (!process.env.SMPT_MAIL || !process.env.SMPT_PASSWORD) {
    console.warn("⚠️ Email credentials not configured. Skipping email send.");
    console.warn("To enable emails, set SMPT_MAIL and SMPT_PASSWORD in .env");
    return;
  }

  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMPT_MAIL,
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
