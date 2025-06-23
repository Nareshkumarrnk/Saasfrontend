// Using Resend for email service - you can replace with your preferred provider
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Your Company <welcome@yourcompany.com>",
      to: [email],
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
            <p style="margin-top: 20px;">
              <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 10px;">Terms of Service</a>
              <span>•</span>
              <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Error sending welcome email:", error)
    throw error
  }
}
