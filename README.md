# Saraswati School Gochtada - Digital Haven

A modern, responsive school website and admin panel built with React, TypeScript, and Supabase. This project provides a complete digital solution for Saraswati School Gochtada with a beautiful public website and a comprehensive admin panel for content management.

## 🌟 Features

### Public Website
- **Homepage**: Hero section with school statistics and featured content
- **Staff Directory**: Complete staff profiles with photos and qualifications
- **Events Calendar**: Upcoming and past school events with detailed information
- **Gallery**: Photo and video gallery organized by categories
- **News & Announcements**: Latest school news and important announcements
- **Contact Form**: Interactive contact form with inquiry management
- **Responsive Design**: Mobile-first design that works on all devices

### Admin Panel
- **Secure Authentication**: Role-based access control with Supabase Auth
- **Dashboard**: Overview of all content with statistics
- **Staff Management**: Full CRUD operations for staff profiles with photo uploads
- **Events Management**: Create, edit, and manage school events
- **Gallery Management**: Upload and organize photos/videos by categories
- **News Management**: Create and publish news articles
- **Achievements Management**: Showcase student and school achievements
- **Contact Inquiries**: View and manage contact form submissions
- **Media Upload**: Secure file uploads to Supabase Storage

### Technical Features
- **Modern Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn/ui component library for consistent design
- **Database**: Supabase PostgreSQL with real-time subscriptions
- **Authentication**: Secure admin authentication with role-based access
- **File Storage**: Supabase Storage for media uploads
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd saraswati-digital-haven
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Supabase Setup

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key

#### Run Database Migrations
The project includes SQL migrations in the `supabase/migrations/` folder. Run these in your Supabase SQL editor:

1. **First Migration** (`20250912143935_cc22d479-413e-485a-867b-f25c80b13628.sql`):
   - Creates all database tables (staff, events, gallery, news, achievements, etc.)
   - Sets up Row Level Security (RLS) policies
   - Creates storage buckets for media uploads
   - Inserts sample data

2. **Second Migration** (`20250912144003_9f02a15e-252a-4f0e-8fed-eec22320f677.sql`):
   - Fixes security issues with the user creation function

#### Configure Storage Buckets
The following storage buckets are created automatically:
- `staff-photos`: For staff profile pictures
- `event-media`: For event images and videos
- `gallery-media`: For gallery photos and videos
- `school-assets`: For general school assets

#### Set Up Authentication
1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your site URL (e.g., `http://localhost:5173` for development)
3. Add redirect URLs for your domain

### 4. Environment Configuration

The Supabase configuration is already set up in `src/integrations/supabase/client.ts`. Update the following values:

```typescript
const SUPABASE_URL = "your-project-url";
const SUPABASE_PUBLISHABLE_KEY = "your-anon-key";
```

### 5. Create Admin User

To create an admin user:

1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add user" and create a new user
3. The user will automatically get admin privileges through the database trigger

Alternatively, you can create a user programmatically by signing up through the admin login page.

### 6. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── layout/          # Layout components (Header, Footer, Layout)
│   ├── sections/       # Page sections (Hero, Director, Events, etc.)
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts (AuthContext)
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/      # Supabase client and types
├── lib/               # Utility functions
├── pages/             # Page components
│   ├── Index.tsx      # Homepage
│   ├── Staff.tsx      # Staff directory
│   ├── Events.tsx     # Events page
│   ├── Gallery.tsx    # Gallery page
│   ├── News.tsx       # News page
│   ├── Contact.tsx    # Contact page
│   ├── AdminLogin.tsx # Admin login
│   ├── AdminDashboard.tsx # Admin dashboard
│   └── AdminStaff.tsx # Staff management
└── assets/            # Static assets
```

## 🎨 Customization

### Branding
The school branding is defined in `src/index.css` and `tailwind.config.ts`:

- **Primary Color**: Educational blue (`hsl(214, 84%, 56%)`)
- **Secondary Color**: Educational green (`hsl(158, 64%, 52%)`)
- **Gradients**: Hero gradient combining primary and secondary colors
- **Typography**: Clean, readable fonts optimized for education

### Content Management
All content is managed through the admin panel:

1. **Staff**: Add/edit staff members with photos, qualifications, and bios
2. **Events**: Create events with dates, times, locations, and descriptions
3. **Gallery**: Upload photos/videos and organize by categories
4. **News**: Write and publish news articles with rich text content
5. **Achievements**: Showcase student and school accomplishments

## 🔒 Security

- **Authentication**: Supabase Auth with secure session management
- **Authorization**: Role-based access control (admin-only for management features)
- **Data Protection**: Row Level Security (RLS) policies on all database tables
- **File Uploads**: Secure file uploads with proper validation
- **Environment Variables**: Sensitive data stored securely

## 📱 Responsive Design

The website is fully responsive and optimized for:
- **Mobile**: Touch-friendly interface with mobile navigation
- **Tablet**: Optimized layouts for medium screens
- **Desktop**: Full-featured experience with hover effects
- **Accessibility**: WCAG compliant with proper contrast and navigation

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Manual Deployment
1. Build the project: `npm run build`
2. Upload the `dist` folder to your web server
3. Configure your web server to serve the SPA

## 🔧 Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Adding New Features
1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Update routing in `src/App.tsx`
4. Add database tables/migrations if needed
5. Update TypeScript types in `src/integrations/supabase/types.ts`

## 📊 Database Schema

### Tables
- **staff**: Staff member profiles
- **events**: School events and activities
- **gallery_categories**: Gallery organization
- **gallery_items**: Photos and videos
- **news**: News articles and announcements
- **achievements**: Student and school achievements
- **contact_inquiries**: Contact form submissions
- **newsletter_subscriptions**: Newsletter signups
- **profiles**: User profiles for admin authentication

### Storage Buckets
- **staff-photos**: Staff profile pictures
- **event-media**: Event images and videos
- **gallery-media**: Gallery photos and videos
- **school-assets**: General school assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common issues

## 🎯 Future Enhancements

- **Student Portal**: Individual student accounts and progress tracking
- **Parent Portal**: Parent access to student information
- **Online Admissions**: Digital admission form processing
- **Fee Management**: Online fee payment system
- **Exam Results**: Digital result publication
- **Library Management**: Digital library catalog
- **Transport Tracking**: School bus tracking system
- **Multi-language Support**: Support for regional languages

---

**Built with ❤️ for Saraswati School Gochtada**

*Empowering education through technology*