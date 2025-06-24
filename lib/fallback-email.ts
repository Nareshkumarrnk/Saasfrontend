// Fallback email service using nodemailer with Gmail
// This is a backup option if Resend is not configured

export async function sendFallbackWelcomeEmail(email: string, name: string) {
  // Check if Gmail credentials are available
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Gmail credentials not found, skipping welcome email")
    return null
  }

  try {
    // Dynamic import to avoid build-time issues
    const nodemailer = await import("nodemailer")

    const transporter = nodemailer.default.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    const mailOptions = {
      from: `"Your Company" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Welcome to Your Company!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background-color: #2563eb; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">YC</span>
            </div>
            <h1 style="color: #1f2937; margin: 0;">Welcome to Your Company!</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${name}!</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining Your Company! We're excited to have you as part of our community.
            </p>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Your account has been successfully created and you can now access all our features and services.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.VERCEL_URL || "https://your-domain.vercel.app"}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                Get Started
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 14px;">
            <p>Need help? Contact us at <a href="mailto:support@yourcompany.com" style="color: #2563eb;">support@yourcompany.com</a></p>
          </div>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    return result
  } catch (error) {
    console.error("Error sending fallback welcome email:", error)
    return null
  }
}
