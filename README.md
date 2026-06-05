*This project has been created as part of the 42 curriculum by enobrega, ahamuyel, kfragoso, cmatias, edgomes.*

# Cur10usX - School Management System

## Description
**Cur10usX** is a modern, multi-tenant School Management System designed specifically for the educational context of Angola. The platform unifies administration, academic management, communication, and performance evaluation into a single cloud-native application.

Built with scalability and user experience in mind, Cur10usX allows multiple schools to operate independently within the same infrastructure, each with its own branding, students, teachers, and academic rules.

### Key Features
- **Multi-tenancy**: Independent data and branding for each school.
- **Academic Management**: Full control over classes, subjects, courses, and enrollments.
- **Evaluation Engine**: Automated grading based on trimesters and configurable formulas.
- **Real-time Communication**: Internal messaging and notifications via WebSockets.
- **Secure Authentication**: 2FA, email verification, and role-based access control.
- **Data Insights**: Dashboards for administrators, teachers, and parents.

---

## Instructions

### Prerequisites
- **Node.js**: v20 or higher
- **Docker & Docker Compose**: For containerized deployment
- **PostgreSQL**: v14 or higher (if running locally without Docker)
- **NPM**: Package manager

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd transcendence
   ```
2. Set up environment variables:
   - Copy the example file: `cp .env.example .env`
   - Fill in the required variables (DATABASE_URL, AUTH_SECRET, etc.).
3. Build and start the containers:
   ```bash
   make all
   ```
   *This will build the images, start the containers, and set up the database.*

### Execution

#### Standard Deployment
To start the entire application (App, DB, Redis, Nginx, WebSocket):
```bash
make up
```

#### Database Management
- **Migrate**: `make db-migrate`
- **Seed**: `make db-seed`
- **Reset**: `make db-reset`
- **Studio (UI)**: `make db-studio`

#### Other Commands
- **Stop**: `make down`
- **Logs**: `make logs`
- **Tests**: `make test`
- **Shell Access**: `make shell`
- **Cleanup**: `make clean` (removes volumes) or `make fclean` (prunes Docker)

---

## Resources

### References
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma ORM Guide](https://www.prisma.io/docs)
- [Auth.js (NextAuth v5)](https://authjs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/)

### AI Usage
AI tools (GitHub Copilot and Gemini CLI) were used during development for:
- **Boilerplate generation**: Creating repetitive UI components and Zod schemas.
- **Refactoring**: Optimizing complex Prisma queries and improving type safety.
- **Documentation**: Drafting initial sections of the technical documentation.
- **Bug fixing**: Identifying edge cases in the evaluation engine logic.

---

## Team Information

| Name | Role | Responsibilities |
| --- | --- | --- |
| **ahamuyel** | Tech Lead / Architect | Technical architecture, code review, infrastructure management, core engine. |
| **enobrega** | Frontend Lead | UI/UX design, component library, landing page, responsiveness. |
| **kfragoso** | Backend Lead | API routes, business logic, evaluation engine, unit testing. |
| **cmatias** | Fullstack Developer | CRUD endpoints, forms, Docker support, data import. |
| **edgomes** | QA / Documentation | E2E testing, documentation, UX polishing, bug tracking. |

---

## Project Management
The team followed an **Agile/Scrum** approach:
- **Daily Standups**: Conducted via Discord to sync on progress and blockers.
- **Task Tracking**: GitHub Issues and Projects were used to manage the backlog.
- **Code Reviews**: Mandatory peer reviews for every PR before merging to `dev`.
- **Communication**: Discord/Slack for real-time collaboration and technical syncing.

---

## Technical Stack

- **Frontend**: Next.js 16 (React 19), Tailwind CSS 4, Redux Toolkit.
- **Backend**: Next.js API Routes (Node.js), WebSockets (`ws` library).
- **Database**: PostgreSQL with Prisma ORM.
- **Authentication**: Auth.js (NextAuth v5) with JWT and Database sessions.
- **Deployment**: Docker, Nginx (Reverse Proxy), Redis (Session/Cache placeholder).

**Justification**: Next.js was chosen for its unified full-stack architecture, allowing shared types between frontend and backend. Prisma provides type-safe database access, crucial for a complex schema with 30+ models.

---

## Database Schema
The database is structured to support multi-tenancy and complex academic relations:
- **Core Models**: `School` (Tenant), `User` (Authentication), `Role`.
- **Academic Models**: `Class`, `Subject`, `Course`, `AcademicYear`, `Enrollment`.
- **People Models**: `Teacher`, `Student`, `Parent` (linked to `User`).
- **Communication Models**: `Message`, `Conversation`, `ChatMessage`, `Notification`.
- **Tracking Models**: `AuditLog`, `ImportJob`, `SupportTicket`.

*Visual Representation*:
`School (1) <-> (N) User (1) <-> (1) [Teacher/Student/Parent]`
`Class (1) <-> (N) Enrollment (N) <-> (1) Student`
`Subject (1) <-> (N) Lesson (N) <-> (1) Class`

---

## Features List

| Feature | Implemented By | Description |
| --- | --- | --- |
| **Auth System** | ahamuyel / kfragoso | Email/Password, Google OAuth, 2FA, Email verification. |
| **Multi-tenancy** | ahamuyel | Row-level isolation and custom branding per school. |
| **Chat System** | enobrega | Real-time private messaging with delivery receipts. |
| **Evaluation Engine**| kfragoso / ahamuyel | Complex grading logic based on academic years and trimesters. |
| **Data Import** | cmatias | Bulk import of students and teachers via CSV/XLSX. |
| **Audit Logs** | edgomes / kfragoso | Tracking of all administrative actions for security. |

---

## Modules Verification

Total Points: **18** (Passes the 14-point requirement)

| Category | Module | Type | Points | Justification |
| --- | --- | --- | --- | --- |
| **Web** | Major Frameworks | Major | 2 | Uses Next.js (Fullstack) + Prisma + Node. |
| **Web** | Real-time Features | Major | 2 | WebSockets for Chat and Notifications. |
| **Web** | User Interaction | Major | 2 | Full Chat, Friends, and Profile systems. |
| **Web** | ORM | Minor | 1 | Uses Prisma for all DB interactions. |
| **Web** | Notifications | Minor | 1 | Real-time notification system for platform actions. |
| **User Mgmt**| Std User Management| Major | 2 | Profiles, Avatars, and Online Status. |
| **User Mgmt**| Advanced Permissions| Major | 2 | Granular role-based access for school admins. |
| **User Mgmt**| Org System | Major | 2 | Multi-tenant school management architecture. |
| **User Mgmt**| 2FA | Minor | 1 | TOTP-based Two-Factor Authentication. |
| **i18n** | Multiple Languages | Minor | 1 | Support for PT, EN, FR, and ES. |
| **Data** | Export/Import | Minor | 1 | CSV/XLSX import for bulk user creation. |
| **Data** | GDPR Compliance | Minor | 1 | Data export and deletion endpoints for users. |

---

## Individual Contributions

### ahamuyel (Tech Lead)
- **Contributions**: Designed the multi-tenant architecture and the evaluation engine core. Managed the DevOps infrastructure and set up the WebSocket server.
- **Challenges**: Ensuring data isolation across tenants while maintaining a shared global catalog.

### enobrega (Frontend Lead)
- **Contributions**: Built the custom UI component library and ensured full responsiveness across devices. Developed the real-time chat interface.
- **Challenges**: Synchronizing WebSocket events with the Redux store for a seamless chat experience.

### kfragoso (Backend Lead)
- **Contributions**: Implemented the majority of API routes and validation schemas. Developed the academic year transition logic and grading calculations.
- **Challenges**: Managing complex relational queries with Prisma while avoiding N+1 performance issues.

### cmatias (Fullstack Developer)
- **Contributions**: Created CRUD interfaces for students, teachers, and classes. Developed the bulk data import system using Excel/CSV.
- **Challenges**: Handling large file uploads and validating data integrity during bulk imports.

### edgomes (QA / Documentation)
- **Contributions**: Wrote the technical documentation (ARCHITECTURE.md, AUDITORIA.md). Performed E2E testing and tracked bugs across modules.
- **Challenges**: Maintaining consistent documentation as the architecture evolved during the development sprints.