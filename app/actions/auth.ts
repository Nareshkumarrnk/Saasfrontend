"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { sendWelcomeEmail } from "@/lib/email"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const VERCEL_DOMAIN = process.env.NEXT_URL || "https://your-domain.vercel.app"

export async function signIn(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { error: "Email and password are required", success: false }
    }

    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return { error: "Invalid email or password", success: false }
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return { error: "Invalid email or password", success: false }
    }

    // Update last login
    await db.collection("users").updateOne({ email }, { $set: { lastLogin: new Date() } })

    // Create JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })

    // Set cookie and redirect
    const response = new Response()
    response.headers.set("Set-Cookie", `auth-token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`)

    redirect(VERCEL_DOMAIN)
  } catch (error) {
    console.error("Sign in error:", error)
    return { error: "An error occurred during sign in", success: false }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
      return { error: "All fields are required", success: false }
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters", success: false }
    }

    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return { error: "User with this email already exists", success: false }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      provider: "email",
      createdAt: new Date(),
      lastLogin: new Date(),
    }

    const result = await db.collection("users").insertOne(newUser)

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name)
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
      // Don't fail the signup if email fails
    }

    // Create JWT token
    const token = jwt.sign({ userId: result.insertedId, email }, JWT_SECRET, { expiresIn: "7d" })

    // Set cookie and redirect
    const response = new Response()
    response.headers.set("Set-Cookie", `auth-token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`)

    redirect(VERCEL_DOMAIN)
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An error occurred during sign up", success: false }
  }
}

export async function forgotPassword(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string

    if (!email) {
      return { error: "Email is required", success: false }
    }

    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      // Don't reveal if user exists or not
      return { error: null, success: true }
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id, email }, JWT_SECRET, { expiresIn: "1h" })

    // Store reset token in database
    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          resetToken,
          resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour
        },
      },
    )

    // TODO: Send password reset email
    // await sendPasswordResetEmail(email, resetToken)

    return { error: null, success: true }
  } catch (error) {
    console.error("Forgot password error:", error)
    return { error: "An error occurred", success: false }
  }
}

export async function socialSignIn(provider: "google" | "github") {
  if (provider === "google") {
    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(`${process.env.VERCEL_URL}/api/auth/callback/google`)}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `state=google`

    redirect(googleAuthUrl)
  } else if (provider === "github") {
    const githubAuthUrl =
      `https://github.com/login/oauth/authorize?` +
      `client_id=${process.env.GITHUB_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(`${process.env.VERCEL_URL}/api/auth/callback/github`)}&` +
      `scope=user:email&` +
      `state=github`

    redirect(githubAuthUrl)
  }
}
