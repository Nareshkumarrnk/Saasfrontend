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

    if (!code || state !== "google") {
      return NextResponse.redirect(`${VERCEL_DOMAIN}?error=oauth_error`)
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.VERCEL_URL}/api/auth/callback/google`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${VERCEL_DOMAIN}?error=token_error`)
    }

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    if (!userData.email) {
      return NextResponse.redirect(`${VERCEL_DOMAIN}?error=user_info_error`)
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if user exists
    let user = await db.collection("users").findOne({ email: userData.email })
    let isNewUser = false

    if (!user) {
      // Create new user
      isNewUser = true
      const newUser = {
        name: userData.name || userData.email.split("@")[0],
        email: userData.email,
        provider: "google",
        googleId: userData.id,
        avatar: userData.picture,
        createdAt: new Date(),
        lastLogin: new Date(),
      }

      const result = await db.collection("users").insertOne(newUser)
      user = { ...newUser, _id: result.insertedId }

      // Send welcome email for new users
      try {
        await sendWelcomeEmail(userData.email, userData.name || userData.email.split("@")[0])
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError)
      }
    } else {
      // Update existing user's last login
      await db.collection("users").updateOne({ email: userData.email }, { $set: { lastLogin: new Date() } })
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
    console.error("Google OAuth error:", error)
    return NextResponse.redirect(`${VERCEL_DOMAIN}?error=oauth_error`)
  }
}
