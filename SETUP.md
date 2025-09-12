# Environment Setup Guide

This guide will help you set up the Saraswati School website project locally and configure all necessary services.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)

## Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd saraswati-digital-haven
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18 and TypeScript
- Tailwind CSS for styling
- Supabase client
- shadcn/ui components
- React Router for navigation
- Date-fns for date formatting

## Step 3: Supabase Project Setup

### 3.1 Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `saraswati-school`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest to your location
5. Click "Create new project"

### 3.2 Get Your Project Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

### 3.3 Update Supabase Configuration

Open `src/integrations/supabase/client.ts` and update the values:

```typescript
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "your-anon-key-here";
```

## Step 4: Database Setup

### 4.1 Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/20250912143935_cc22d479-413e-485a-867b-f25c80b13628.sql`
4. Click "Run" to execute the migration
5. Repeat for `supabase/migrations/20250912144003_9f02a15e-252a-4f0e-8fed-eec22320f677.sql`

### 4.2 Verify Database Tables

After running migrations, verify these tables were created:
- `staff`
- `events`
- `gallery_categories`
- `gallery_items`
- `news`
- `achievements`
- `contact_inquiries`
- `newsletter_subscriptions`
- `profiles`

### 4.3 Verify Storage Buckets

Go to **Storage** in your Supabase dashboard and verify these buckets exist:
- `staff-photos`
- `event-media`
- `gallery-media`
- `school-assets`

## Step 5: Authentication Setup

### 5.1 Configure Authentication Settings

1. Go to **Authentication** → **Settings**
2. Update the following settings:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173/admin`
3. Save the settings

### 5.2 Create Admin User

#### Option A: Through Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Enter email and password
4. The user will automatically get admin privileges

#### Option B: Through the Application
1. Start the development server: `npm run dev`
2. Go to `http://localhost:5173/admin/login`
3. Click "Sign up" (if available) or use the credentials from Option A

## Step 6: Test the Application

### 6.1 Start Development Server

```bash
npm run dev
```

The application should start at `http://localhost:5173`

### 6.2 Test Public Pages

Visit these URLs to test the public website:
- `http://localhost:5173/` - Homepage
- `http://localhost:5173/staff` - Staff directory
- `http://localhost:5173/events` - Events page
- `http://localhost:5173/gallery` - Gallery
- `http://localhost:5173/news` - News page
- `http://localhost:5173/contact` - Contact form

### 6.3 Test Admin Panel

1. Go to `http://localhost:5173/admin/login`
2. Sign in with your admin credentials
3. Test the admin dashboard and staff management

## Step 7: Add Sample Data (Optional)

### 7.1 Add Staff Members

1. Go to the admin panel
2. Navigate to Staff Management
3. Add sample staff members with photos

### 7.2 Add Events

1. Go to Events Management
2. Add sample events with dates and descriptions

### 7.3 Add Gallery Items

1. Go to Gallery Management
2. Upload sample photos and videos
3. Organize them by categories

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Supabase Connection Issues
- Verify your project URL and API key are correct
- Check if your Supabase project is active
- Ensure RLS policies are properly set up

#### Authentication Issues
- Verify authentication settings in Supabase
- Check if the user has admin role in the profiles table
- Clear browser cache and cookies

#### File Upload Issues
- Verify storage buckets exist
- Check storage policies are configured
- Ensure file size limits are appropriate

### Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Check the Supabase logs in the dashboard
3. Verify all environment variables are set correctly
4. Ensure all database migrations ran successfully

## Production Deployment

### Environment Variables for Production

When deploying to production, update these settings:

1. **Supabase Settings**:
   - Update Site URL to your production domain
   - Add production redirect URLs
   - Update CORS settings

2. **Application Settings**:
   - Update Supabase URL and key in the client configuration
   - Ensure all environment variables are set

### Deployment Platforms

#### Vercel (Recommended)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

#### Netlify
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy

## Security Considerations

### Production Security
- Use environment variables for sensitive data
- Enable HTTPS in production
- Regularly update dependencies
- Monitor Supabase logs for suspicious activity
- Use strong passwords for admin accounts

### Database Security
- RLS policies are already configured
- Admin access is restricted to authenticated users with admin role
- Public read access is limited to published content only

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor Supabase usage and limits
- Backup database regularly
- Review and update content regularly
- Monitor admin user accounts

### Monitoring
- Check Supabase dashboard for errors
- Monitor application performance
- Review user feedback and inquiries
- Update content based on school needs

---

**Need Help?** Contact the development team or create an issue in the repository.
