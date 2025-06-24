import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { sendWelcomeEmail } from "@/lib/email"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const VERCEL_DOMAIN = process.env.VERCEL_URL || "https://your-domain.vercel.app"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code || state !== "github") {
      return NextResponse.redirect(`${VERCEL_DOMAIN}?error=oauth_error`)
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${VERCEL_DOMAIN}?error=token_error`)
    }

    // Get user info from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "YourApp",
      },
    })

    const userData = await userResponse.json()

    // Get user email (GitHub might not return email in user endpoint)
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "YourApp",
      },
    })

    const emailData = await emailResponse.json()
    const primaryEmail = emailData.find((email: any) => email.primary)?.email || userData.email

    if (!primaryEmail) {
      return NextResponse.redirect(`${VERCEL_DOMAIN}?error=email_required`)
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if user exists
    let user = await db.collection("users").findOne({ email: primaryEmail })
    let isNewUser = false

    if (!user) {
      // Create new user
      isNewUser = true
      const newUser = {
        name: userData.name || userData.login,
        email: primaryEmail,
        provider: "github",
        githubId: userData.id,
        avatar: userData.avatar_url,
        createdAt: new Date(),
        lastLogin: new Date(),
      }

      const result = await db.collection("users").insertOne(newUser)
      user = { ...newUser, _id: result.insertedId }

      // Send welcome email for new users
      try {
        await sendWelcomeEmail(primaryEmail, userData.name || userData.login)
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError)
      }
    } else {
      // Update existing user's last login
      await db.collection("users").updateOne({ email: primaryEmail }, { $set: { lastLogin: new Date() } })
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })

    // Create response with redirect
    const response = NextResponse.redirect(VERCEL_DOMAIN)
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 604800, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("GitHub OAuth error:", error)
    return NextResponse.redirect(`${VERCEL_DOMAIN}?error=oauth_error`)
  }
}
