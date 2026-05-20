*This project has been created as part of the 42 curriculum by ahamuyel.*

# Holy Squad — Plataforma de Gestão Escolar

## Description

Holy Squad is a modern school management platform built for the Angolan educational context. It provides a complete suite of tools for managing students, teachers, classes, grades, attendance, schedules, and institutional communication — all in one place.

### Key Features

- Multi-tenant architecture (each school is an independent organization)
- Role-based access control (super_admin, school_admin, teacher, student, parent)
- Academic management: classes, subjects, courses, lessons, exams, assignments
- Evaluation engine with trimesters, grading configs, and final averages
- Attendance tracking, enrollment management, academic history
- Internal messaging and announcement system
- Real-time notifications via WebSocket
- Public API with rate limiting
- Multi-language support (PT, EN, FR, ES)
- File uploads for assignments, avatars, and documents
- Data import (bulk CSV/XLSX) and export
- GDPR compliance tools (data export, account deletion)
- Two-factor authentication (2FA)
- Friend system with real-time friend requests
- Privacy Policy and Terms of Service pages
- Custom design system with 32+ reusable components
- Advanced search with filters, sorting, and pagination
- Activity audit logging
- Analytics dashboard with charts and statistics

## Technical Stack

### Frontend
- **Framework:** Next.js 16 (React 19) — full-stack framework
- **Styling:** Tailwind CSS 4
- **State Management:** Redux Toolkit
- **UI Components:** Custom design system (32+ components), Lucide icons
- **Charts:** Recharts
- **Calendar:** react-big-calendar

### Backend
- **Framework:** Next.js API Routes (RESTful)
- **Authentication:** Auth.js (NextAuth v5) — credentials + Google OAuth
- **Validation:** Zod
- **ORM:** Prisma
- **Real-time:** WebSocket (ws) on separate port

### Database
- **System:** PostgreSQL (via Neon)
- **Schema:** 40+ models with well-defined relations
- **Choice rationale:** PostgreSQL offers robust relational features, JSON support for flexible configs, and excellent performance for complex academic queries.

### DevOps
- **Containerization:** Docker + Docker Compose
- **Orchestration:** Kubernetes (Minikube)
- **Secrets Management:** Docker secrets
- **Health Check:** Endpoint at `/api/health`

## Database Schema

Key models and their relationships:

- **School** → Users, Teachers, Students, Parents, Classes, Courses, Subjects
- **User** → Teacher/Student/Parent (1:1), Messages, Notifications, Friends
- **School** → AcademicYears → Classes → Students → Enrollments
- **Class** → Lessons, Exams, Assignments, Attendance
- **Subject** → Teachers, Lessons, Exams, Assignments, Results
- **Course** → Classes, Subjects (via CourseSubject)
- **GlobalSubject/GlobalCourse/GlobalClass** → School-specific mappings
- **GradingConfig** → GlobalGradingConfig (inheritance with overrides)
- **Student** → Results, Attendance, Enrollments, AcademicHistory, CycleCertificates
- **Friend** → User friendships with pending/accepted/blocked status
- **AuditLog** → All CRUD operations tracked
- **Notification** → Per-user notifications
- **SupportTicket** → Ticket system with messages

## Instructions

### Prerequisites

- Docker and Docker Compose (or Kubernetes/Minikube)
- Node.js 20+ (for local development)
- PostgreSQL database (Neon or local)

### Setup

1. Clone the repository and copy environment variables:
   ```bash
   cp cur10us/.env.example cur10us/.env
   ```

2. Configure `.env` with your database URL and secrets:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/db
   AUTH_SECRET=<openssl rand -base64 32>
   ```

3. Create Docker secrets:
   ```bash
   mkdir -p secrets
   echo "your-auth-secret" > secrets/auth_secret.txt
   ```

4. Run with Docker Compose:
   ```bash
   make all
   ```
   Or manually:
   ```bash
   docker compose up --build
   ```

5. Access the application at `http://localhost:3000`

### Local Development

```bash
cd cur10us
npm install
cp .env.example .env  # configure your .env
npx prisma db push
npx prisma db seed
npm run dev
```

## Modules

### Major Modules (2pts each)

| Module | Description | Implementation | Team Member |
|--------|-------------|----------------|-------------|
| Web — Framework FE+BE | Next.js full-stack | React 19 frontend + API routes backend | ahamuyel |
| Web — User interaction | Chat, profiles, friends system | Messages system, profile pages, friend requests with notifications | ahamuyel |
| Web — Public API | RESTful API with rate limiting | 91 route files, rate-limited auth endpoints | ahamuyel |
| User Mgmt — Standard | Auth, profiles, avatars | NextAuth v5 with credentials + Google OAuth, avatar upload | ahamuyel |
| User Mgmt — Advanced permissions | Role-based CRUD | 5 roles, granular AdminPermission model, feature flags | ahamuyel |
| User Mgmt — Organization | Multi-tenant schools | Schools as organizations with full CRUD, user management per school | ahamuyel |
| Data — Analytics dashboard | Charts and statistics | Recharts, school stats, admin dashboard with metrics | ahamuyel |
| Web — Real-time features | WebSocket notifications | WS server on port 3001, real-time notification delivery | ahamuyel |

### Minor Modules (1pt each)

| Module | Description | Implementation | Team Member |
|--------|-------------|----------------|-------------|
| Web — ORM | Database ORM | Prisma with PostgreSQL | ahamuyel |
| Web — Notification system | CRUD notifications | Full notification creation/delivery with real-time broadcast | ahamuyel |
| Web — File upload | Multi-type file upload | Vercel Blob integration, client+server validation | ahamuyel |
| Web — Custom design system | Reusable components | 32+ UI components (Table, Pagination, FormModal, etc.) | ahamuyel |
| Web — Advanced search | Search with filters/pagination | Search API, TableSearch component, filter system | ahamuyel |
| User Mgmt — OAuth 2.0 | Social login | Google OAuth via Auth.js | ahamuyel |
| User Mgmt — Activity analytics | User activity tracking | AuditLog model, admin stats page | ahamuyel |
| User Mgmt — 2FA | Two-factor authentication | TOTP-based with QR code setup, speakeasy | ahamuyel |
| Accessibility — Multiple languages | i18n support | 4 languages (PT, EN, FR, ES) with language switcher | ahamuyel |
| Devops — Health check | Status monitoring | `/api/health` endpoint with Docker healthcheck | ahamuyel |
| Data — Data export/import | Bulk operations | ImportJob with XLSX/CSV, audit trail | ahamuyel |
| Data — GDPR compliance | Data rights | Data export (JSON), account deletion, confirmation flows | ahamuyel |

**Total: 28 points** (8 Major × 2pts + 12 Minor × 1pt)

### Module Justification

The module selection was driven by the school management domain:
- **Organization module** maps naturally to multi-tenant schools
- **Advanced permissions** maps to educational hierarchy (admin → teacher → student → parent)
- **Analytics dashboard** provides school administrators with actionable insights
- **GDPR compliance** is essential for handling student/parent data
- **2FA** protects sensitive academic records
- **Real-time WebSockets** enables instant notification delivery for announcements and grades

## Features List

| Feature | Description | Team Member |
|---------|-------------|-------------|
| Authentication | Email/password + Google OAuth with JWT sessions | ahamuyel |
| School Management | Multi-tenant organizations with branding | ahamuyel |
| User Profiles | Editable profiles with avatar upload | ahamuyel |
| Role Management | 5 roles with granular permissions | ahamuyel |
| Class Management | Create/manage classes with capacity and period | ahamuyel |
| Subject & Course Mgmt | Academic subjects, courses, and global catalog | ahamuyel |
| Lesson Scheduling | Timetable management per class/teacher | ahamuyel |
| Exam Management | Exam scheduling and result recording | ahamuyel |
| Assignment Management | Homework with submissions and grading | ahamuyel |
| Result Management | Grades per subject/trimester with formulas | ahamuyel |
| Attendance Tracking | Daily attendance with status tracking | ahamuyel |
| Enrollment Management | Student enrollment per academic year | ahamuyel |
| Academic History | Cross-school academic record portability | ahamuyel |
| Evaluation Engine | Configurable grading with trimester weights | ahamuyel |
| Messaging System | Internal communication between users | ahamuyel |
| Announcements | Priority-based announcements with read tracking | ahamuyel |
| Friend System | Add/remove friends, request/accept flow | ahamuyel |
| Notifications | Real-time platform notifications | ahamuyel |
| Support Tickets | Ticketing system with staff replies | ahamuyel |
| File Uploads | Avatar, assignment attachments, documents | ahamuyel |
| Data Import | Bulk import teachers/students via XLSX/CSV | ahamuyel |
| Analytics Dashboard | Charts, stats, and data visualization | ahamuyel |
| 2FA | TOTP-based two-factor authentication | ahamuyel |
| GDPR Tools | Data export and account deletion | ahamuyel |
| i18n | Multi-language support (PT/EN/FR/ES) | ahamuyel |
| WebSocket | Real-time notification delivery | ahamuyel |
| Public API | Rate-limited RESTful API with 91 endpoints | ahamuyel |
| Terms of Service | Legal page with comprehensive terms | ahamuyel |
| Privacy Policy | GDPR-compliant privacy page | ahamuyel |

## Team Information

| Member | Roles | Responsibilities |
|--------|-------|-----------------|
| ahamuyel | PO, PM, Tech Lead, Developer | Full-stack development, architecture, DevOps, AI-assisted development |

## Project Management

- **Task Distribution:** Solo project with iterative feature development
- **Tools Used:** Git, GitHub
- **Communication:** Self-managed with AI-assisted development
- **AI Usage:** AI was used for code generation of repetitive patterns, debugging assistance, boilerplate creation, and component scaffolding. All AI-generated code was reviewed, tested, and understood before integration.

## Individual Contributions

### ahamuyel
- Full project architecture and database schema design
- Authentication system (credentials + Google OAuth)
- All CRUD APIs (91 route files)
- Frontend implementation (all pages and components)
- Tailwind CSS design system (32+ reusable components)
- Docker and Kubernetes deployment
- Friend system with real-time notifications
- 2FA implementation
- GDPR compliance features
- WebSocket real-time infrastructure
- Multi-language i18n system
- README documentation

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth.js Documentation](https://authjs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org)
- [Zod Documentation](https://zod.dev)
- [WebSocket (ws) Documentation](https://github.com/websockets/ws)
- [Speakeasy (2FA) Documentation](https://github.com/speakeasyjs/speakeasy)

### AI Usage

AI (Claude/Cursor) was used for:
- Generating boilerplate code for CRUD API routes
- Creating component templates
- Debugging type errors and build issues
- Drafting documentation and README sections
- Suggesting module combinations for the ft_transcendence project
- Writing test data seeds
