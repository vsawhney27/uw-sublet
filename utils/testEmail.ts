import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

console.log("✅ SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "Loaded" : "Not Found");
console.log("✅ EMAIL_FROM:", process.env.EMAIL_FROM);

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const sendTestEmail = async () => {
    const msg = {
        to: "vsawhney@wisc.edu", // Replace with your real email
        from: process.env.EMAIL_FROM as string,
        subject: "Test Email from Badger Sublets",
        text: "This is a test email to check if SendGrid is working.",
    };

    try {
        console.log("📤 Sending email...");
        await sgMail.send(msg);
        console.log("✅ Email sent successfully!");
    } catch (error) {
        console.error("❌ Error sending email:", error.response?.body || error);
    }
};

sendTestEmail();

