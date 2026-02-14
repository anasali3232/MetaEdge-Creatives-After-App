# MetaEdge Creatives - Premium Agency Website

## Overview
MetaEdge Creatives is building a premium, multi-page agency website to showcase its services and portfolio. The website aims for a modern design with a Mehrun red color scheme, smooth animations, and a responsive layout. It will feature 8 core services: Web Development, Custom CRM, Mobile App Development, AI Automations, SEO and GEO, Digital Marketing, Graphic Design, and Video Editing. The project also includes ambitious plans for an Admin Portal, Career System, Blog, and a Team Portal system. The overarching vision is to innovate, create, and elevate client businesses through cutting-edge digital solutions.

## User Preferences
- Premium, award-winning design aesthetic
- Unique animations and hover effects
- Mehrun red color scheme extracted from logo
- White background with subtle gradients
- All numbers should animate using AnimatedCounter
- Services order: Web Dev, Custom CRM, Mobile App Dev, AI Automations, SEO & GEO, Digital Marketing, Graphic Design, Video Editing

## System Architecture

### Frontend
The frontend is built with React, utilizing `client/src/pages` for main pages and `client/src/components` for reusable elements. Key components include a Glassmorphism header, animated hero section, service grids, animated statistics, and a technology carousel. Dynamic pages are generated for individual services, portfolio projects, and platform details. All platform/tool icons are clickable and link to their respective detail pages.

### Admin Portal System
A JWT-based authentication system with `super_admin` and `admin` roles manages access to various administrative functions. This includes user management, site settings, team member administration, contact message viewing, page meta/SEO management, newsletter subscriber management, leave approval/rejection (`/admin/leaves`), and employee reports with date range filtering (`/admin/reports`). Dynamic SEO and meta tags are applied across all frontend pages.

### Career System
Features a public careers listing page (`/careers`) and individual job detail pages (`/careers/:slug`). An authenticated admin portal (`/admin/careers`) allows for CRUD operations on job listings.

### Blog System
Includes a public blog listing page (`/blog`) with search functionality and individual blog post pages (`/blog/:slug`) supporting markdown rendering. An admin blog portal (`/admin/blog`) provides content creation, editing, and publishing controls with password authentication.

### Design System
The visual design is anchored by Mehrun red (HSL(350, 78%, 42%) / #C41E3A) and uses Plus Jakarta Sans font. Animations are powered by Framer Motion, while icons are sourced from Lucide React and React Icons. An `AnimatedCounter` component is used for all numerical animations.

### Performance Optimizations
Key optimizations include `React.lazy()` for code splitting, Suspense with loading spinners for smooth transitions, WebP image format usage, and efficient background image patterns. All image uploads within admin and blog systems handle file uploads directly.

### Team Portal System (Hubstaff-like)
A separate `team-portal` system with its own JWT-based authentication (5-minute inactivity auto-logout) for managing employees, teams, tasks (Kanban board), timesheets, leave requests, and personal notes. Access levels include `full`, `multi_team`, and `team_only`.

#### Employee Monitoring Features
- **Activity Heartbeats**: Employees send heartbeat pings every 2 minutes to track active status. Admin dashboard shows real-time active/inactive indicators.
- **Screenshot Capture**: Browser-based screen capture every 10 minutes (requires user permission via Screen Capture API). Screenshots stored in database as base64 JPEG. Admin-only screenshot viewer page.
- **Inactive Employee Indicator**: Dark red ring around employee avatars when inactive 10+ minutes (based on heartbeat data). Green ring when active.
- **Weekly Reports**: Employees submit weekly reports (accomplishments, challenges, next week plan) by team. Team members can view their team's reports; admins see all.
- **Monthly Reports**: Similar to weekly but with monthly summary, achievements, goals for next month, hours/tasks stats.
- **Performance Graphs**: Weekly activity bar chart with trend comparison vs last week (arrow up/down with percentage).

#### New Database Tables (Feb 2026)
- `activity_heartbeats` - Employee activity tracking
- `screenshots` - Captured screen images (base64)
- `weekly_reports` - Weekly team reports
- `monthly_reports` - Monthly team reports

#### Deployment Note
After deploying to production server, run `npx drizzle-kit push` to create the new tables.

## External Dependencies

- **Database:** MySQL/MariaDB via Drizzle ORM (for blog, admin, and team portal data)
- **Email Service:** Resend (for sending various notifications such as contact form submissions, job applications, support tickets, and live chat messages, and leave request notifications)
- **CAPTCHA:** Cloudflare Turnstile (for form protection on contact, newsletter, career application, client/admin login, and client signup/forgot password forms)
- **Animations:** Framer Motion
- **Data Fetching:** TanStack Query
- **UI Components:** Shadcn UI
- **Styling:** Tailwind CSS
- **Icons:** Lucide React and React Icons