# Deployment Guide

This guide covers deploying the Saraswati School website to various platforms and configuring it for production use.

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Completed local development setup
- [ ] Tested all functionality locally
- [ ] Updated Supabase configuration for production
- [ ] Prepared production domain
- [ ] Set up production Supabase project (optional)
- [ ] Created admin user accounts
- [ ] Added initial content (staff, events, etc.)

## Platform-Specific Deployment

### 1. Vercel (Recommended)

Vercel is the easiest platform for deploying React applications with excellent performance and automatic deployments.

#### Setup Steps:

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository

2. **Configure Build Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your-production-supabase-url
     VITE_SUPABASE_ANON_KEY=your-production-supabase-anon-key
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Your site will be available at `https://your-project.vercel.app`

5. **Custom Domain** (Optional):
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS settings as instructed

#### Vercel Configuration File

Create `vercel.json` in your project root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Netlify

Netlify is another excellent platform for static site deployment.

#### Setup Steps:

1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub
   - Click "New site from Git"
   - Choose your repository

2. **Configure Build Settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: 18

3. **Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add your Supabase credentials

4. **Deploy**:
   - Click "Deploy site"
   - Wait for deployment to complete

#### Netlify Configuration File

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 3. GitHub Pages

For free hosting with GitHub Pages.

#### Setup Steps:

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/saraswati-digital-haven"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Configure GitHub Pages**:
   - Go to repository Settings → Pages
   - Select "gh-pages" branch
   - Save settings

### 4. Traditional Web Hosting

For shared hosting or VPS deployment.

#### Setup Steps:

1. **Build the Project**:
   ```bash
   npm run build
   ```

2. **Upload Files**:
   - Upload the entire `dist` folder to your web server
   - Ensure the web server serves `index.html` for all routes

3. **Configure Web Server**:

   **Apache (.htaccess)**:
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

   **Nginx**:
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

## Supabase Production Configuration

### 1. Production Supabase Project

Consider creating a separate Supabase project for production:

1. **Create New Project**:
   - Go to Supabase dashboard
   - Create a new project for production
   - Choose a different region if needed

2. **Run Migrations**:
   - Run the same SQL migrations in your production project
   - Add sample data if needed

3. **Update Configuration**:
   - Update your production environment variables
   - Test the connection

### 2. Authentication Settings

Update authentication settings for production:

1. **Site URL**: Your production domain
2. **Redirect URLs**: Add your production admin URL
3. **CORS Settings**: Add your production domain

### 3. Storage Configuration

Ensure storage buckets are properly configured:

1. **Bucket Policies**: Verify public read access
2. **File Size Limits**: Set appropriate limits
3. **Allowed File Types**: Configure for images/videos

## Environment Variables

### Development
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
```

### Production
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
```

## Security Considerations

### 1. Environment Variables
- Never commit sensitive data to version control
- Use environment variables for all configuration
- Rotate keys regularly

### 2. Supabase Security
- Enable Row Level Security (RLS) on all tables
- Review and update RLS policies
- Monitor authentication logs
- Use strong passwords for admin accounts

### 3. HTTPS
- Always use HTTPS in production
- Configure SSL certificates
- Enable HSTS headers

### 4. Content Security Policy
Add CSP headers to prevent XSS attacks:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://your-project.supabase.co;">
```

## Performance Optimization

### 1. Build Optimization
- Enable code splitting
- Optimize bundle size
- Use dynamic imports for admin routes

### 2. Caching
- Configure proper cache headers
- Use CDN for static assets
- Implement service worker for offline support

### 3. Image Optimization
- Compress images before upload
- Use appropriate image formats
- Implement lazy loading

## Monitoring and Maintenance

### 1. Error Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor Supabase logs
- Track user analytics

### 2. Performance Monitoring
- Use tools like Lighthouse
- Monitor Core Web Vitals
- Track loading times

### 3. Regular Maintenance
- Update dependencies monthly
- Monitor Supabase usage
- Backup database regularly
- Review security logs

## Troubleshooting Deployment

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Environment Variables Not Working
- Verify variable names match exactly
- Check for typos in values
- Ensure variables are set in deployment platform

#### Routing Issues
- Ensure SPA routing is configured
- Check redirect rules
- Verify base URL configuration

#### Supabase Connection Issues
- Verify production URL and key
- Check CORS settings
- Ensure RLS policies are correct

### Getting Help

If you encounter deployment issues:

1. Check deployment logs
2. Verify environment variables
3. Test locally with production settings
4. Contact platform support
5. Check Supabase status page

## Post-Deployment Tasks

### 1. Initial Setup
- [ ] Create admin user accounts
- [ ] Add initial content (staff, events, etc.)
- [ ] Configure school information
- [ ] Test all functionality

### 2. Content Management
- [ ] Upload school logo and images
- [ ] Add staff photos
- [ ] Create event calendar
- [ ] Write initial news articles

### 3. User Training
- [ ] Train admin users on the system
- [ ] Create user documentation
- [ ] Set up backup procedures
- [ ] Establish maintenance schedule

---

**Deployment Complete!** Your Saraswati School website is now live and ready to serve your community.
