# Modern Sign-In Page

A beautiful, modern sign-in page built with Next.js, featuring traditional and social authentication, MongoDB integration, and automated welcome emails.

## Features

✅ **Traditional Authentication**
- Email/password login and signup
- Password visibility toggle
- Real-time form validation
- Secure password hashing with bcrypt

✅ **Social Authentication**
- Google OAuth integration
- GitHub OAuth integration
- Seamless social login flow

✅ **User Experience**
- Modern, responsive design
- Smooth animations and transitions
- Loading states and error handling
- Forgot password functionality
- Mobile-optimized interface

✅ **Security & Data**
- MongoDB database integration
- JWT session management
- Secure password storage
- CSRF protection
- Input validation and sanitization

✅ **Email Integration**
- Automated welcome emails
- Beautiful HTML email templates
- Resend email service integration
- Password reset emails

✅ **Additional Features**
- Terms of Service and Privacy Policy pages
- Accessibility best practices
- Analytics event tracking ready
- Environment-based configuration

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in your project root:

\`\`\`env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_DB=your-app

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Vercel Domain (your main website URL)
VERCEL_URL=https://your-domain.vercel.app

# Email Service (Resend API Key)
RESEND_API_KEY=re_your-resend-api-key

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
\`\`\`

### 2. MongoDB Setup

1. Create a MongoDB Atlas account or use a local MongoDB instance
2. Create a new database and collection called `users`
3. Run the setup script in `scripts/setup-database.sql` to create indexes
4. Update the `MONGODB_URI` in your environment variables

### 3. Email Service Setup

1. Sign up for [Resend](https://resend.com) (recommended) or another email service
2. Get your API key and add it to `RESEND_API_KEY`
3. Verify your domain for sending emails
4. Update the company email addresses in the welcome email template

### 4. OAuth Setup (Optional)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins

**GitHub OAuth:**
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to your domain
4. Copy Client ID and Client Secret

### 5. Deployment

**Deploy to Vercel:**
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

**Environment Variables in Vercel:**
- Go to your project settings
- Add all variables from `.env.local`
- Redeploy if needed

## Usage

### Basic Authentication Flow

1. Users can sign up with email/password or social providers
2. Passwords are automatically hashed before storage
3. JWT tokens are created for session management
4. Welcome emails are sent automatically on signup
5. Users are redirected to your main application

### Customization

**Styling:**
- Update colors in `tailwind.config.ts`
- Modify the company logo/icon in the sign-in form
- Customize email templates in `lib/email.ts`

**Branding:**
- Replace the circular icon with your company logo
- Update company name and colors throughout
- Modify email templates with your branding

**Functionality:**
- Add additional form fields as needed
- Implement custom validation rules
- Add more OAuth providers
- Customize redirect URLs

## Security Considerations

- Always use HTTPS in production
- Keep JWT secrets secure and rotate regularly
- Implement rate limiting for auth endpoints
- Use strong password requirements
- Regularly update dependencies
- Monitor for suspicious login attempts

## Support

For issues or questions:
- Check the GitHub issues
- Review the documentation
- Contact support at your configured support email

## License

This project is licensed under the MIT License.
