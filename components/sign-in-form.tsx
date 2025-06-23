"use client"

import type React from "react"

import { useState, useActionState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Github, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { signIn, signUp, forgotPassword, socialSignIn } from "@/app/actions/auth"

export function SignInForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [signInState, signInAction] = useActionState(signIn, { error: null, success: false })
  const [signUpState, signUpAction] = useActionState(signUp, { error: null, success: false })
  const [forgotState, forgotAction] = useActionState(forgotPassword, { error: null, success: false })

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setIsLoading(true)
    try {
      await socialSignIn(provider)
    } catch (error) {
      console.error("Social sign-in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("email", forgotEmail)
    await forgotAction(formData)
  }

  if (showForgotPassword) {
    return (
      <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Enter your email address and we'll send you a reset link</CardDescription>
        </CardHeader>
        <form onSubmit={handleForgotPassword}>
          <CardContent className="space-y-4">
            {forgotState.error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{forgotState.error}</AlertDescription>
              </Alert>
            )}
            {forgotState.success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">Password reset link sent to your email!</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-colors">
              Send Reset Link
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForgotPassword(false)} className="w-full">
              Back to Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
        <CardDescription>
          {isSignUp ? "Sign up to get started with your account" : "Sign in to your account to continue"}
        </CardDescription>
      </CardHeader>

      <form action={isSignUp ? signUpAction : signInAction}>
        <CardContent className="space-y-4">
          {(signInState.error || signUpState.error) && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{signInState.error || signUpState.error}</AlertDescription>
            </Alert>
          )}

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {!isSignUp && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="px-0 text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-colors" disabled={isLoading}>
            {isLoading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialSignIn("google")}
              disabled={isLoading}
              className="transition-all duration-200 hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialSignIn("github")}
              disabled={isLoading}
              className="transition-all duration-200 hover:bg-gray-50"
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-blue-600 hover:text-blue-800"
                  onClick={() => setIsSignUp(false)}
                >
                  Sign in
                </Button>
              </>
            ) : (
              <>
                New user?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-blue-600 hover:text-blue-800"
                  onClick={() => setIsSignUp(true)}
                >
                  Create account
                </Button>
              </>
            )}
          </div>

          <div className="text-center text-xs text-gray-500 space-x-4">
            <Link href="/terms" className="hover:text-gray-700 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
