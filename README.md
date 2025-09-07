# 🎓 EduSphere | Learning Management System (LMS)

<div align="center">

![EduSphere Logo](public/forest1.jpg)

**A modern, full-featured Learning Management System built with Next.js 15, React 19, and TypeScript**

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![Jitsi](https://img.shields.io/badge/Jitsi-Meet-green?style=for-the-badge&logo=jitsi)](https://jitsi.org/)

*Empowering educators and learners with a comprehensive digital learning platform*

<!-- [🚀 Live Demo](#) | [📖 Documentation](#) | [🐛 Report Bug](#) | [💡 Request Feature](#) -->

</div>

---

## ✨ Features

### 🔐 **Role-Based Access Control**
- **Master Admin**: Complete system control and user management
- **Admin**: User approvals and platform oversight  
- **Teacher**: Course creation, content management, and student tracking
- **Student**: Course enrollment and learning materials access

### 📚 **Comprehensive Course Management**
- **Course Creation**: Rich course builder with multimedia support
- **Content Management**: Video lectures, PDFs, live streams, and interactive content
- **Section & Lesson Organization**: Hierarchical content structure
- **Course Templates**: Reusable course frameworks
- **Image Upload**: AWS S3 integration for course images

### 🎥 **Live Learning**
- **Jitsi Meet Integration**: HD video conferencing for live classes
- **Real-time Interaction**: Chat, screen sharing, and collaborative tools
- **Recording Support**: Session recording and playback
- **Attendance Tracking**: Automated attendance management

### 📊 **Analytics & Tracking**
- **Student Progress**: Detailed learning analytics
- **Attendance Reports**: Comprehensive attendance tracking
- **Score Management**: Assignment and exam grading system
- **Performance Insights**: Data-driven learning insights

### 🎨 **Modern User Experience**
- **Responsive Design**: Mobile-first, cross-device compatibility
- **Dark/Light Themes**: Customizable interface themes
- **Accessibility**: WCAG 2.1 compliant design
- **Progressive Web App**: Offline capabilities and app-like experience

### 🔧 **Advanced Technical Features**
- **Hybrid Routing**: Next.js App Router + Pages Router
- **Real-time Updates**: Live data synchronization
- **File Management**: Secure file upload and storage
- **Email Integration**: Automated notifications and communications
- **API-First**: RESTful API architecture

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 15.1.7 with Turbopack
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5.0
- **Styling**: CSS Modules + Tailwind CSS
- **Icons**: Lucide React + React Icons
- **Data Grid**: AG Grid Community
- **Forms**: Custom form components with validation

### **Backend**
- **Runtime**: Node.js (via Next.js API routes)
- **Database**: MySQL 8.0 with mysql2 driver
- **Authentication**: NextAuth.js with custom providers
- **File Storage**: AWS S3 with presigned URLs
- **Email**: Nodemailer integration
- **Security**: bcryptjs for password hashing

### **Development & Testing**
- **Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright + Cypress
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **Build Tool**: Next.js with Turbopack

### **DevOps & Deployment**
- **Package Manager**: npm
- **Environment**: dotenv for configuration
- **Database**: MariaDB/MySQL
- **Deployment**: Vercel-ready configuration

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- MySQL 8.0 or MariaDB
- npm or yarn package manager

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/dkooloperator/lms.git
cd lms

# Install dependencies
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL=mysql://username:password@localhost:3306/your_database_name

# NextAuth Configuration  
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_S3_BUCKET_NAME=your-s3-bucket

# Email Configuration (Optional)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
```

### 3. Database Setup
```sql
-- Create database
CREATE DATABASE lms_database;

-- Import schema (create tables for users, courses, etc.)
-- Run your SQL schema file here
```

### 4. Run Development Server
```bash
# Start development server with Turbopack
npm run dev

# Or with traditional bundler
npm run build && npm run start
```

Visit [http://localhost:3000](http://localhost:3000) to see your application!

---

## � Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build production application |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint code analysis |
| `npm test` | Run Jest unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |

---

## 🏗️ Project Structure

```
lms/
├── 📁 app/                     # Next.js App Router pages
│   ├── 📁 [courseId]/         # Dynamic course pages
│   ├── 📁 api/                # API routes (new)
│   ├── 📁 dashboard/          # Role-based dashboards
│   ├── 📁 login/              # Authentication pages
│   └── layout.tsx             # Root layout
├── 📁 pages/                  # Next.js Pages Router (legacy)
│   └── 📁 api/                # API routes (legacy)
├── 📁 components/             # Reusable UI components
│   ├── 📁 DASHBOARD/          # Dashboard-specific components
│   ├── 📁 ui/                 # Base UI components
│   └── 📁 HOME/               # Homepage components
├── 📁 styles/                 # Global styles and CSS modules
├── 📁 utils/                  # Utility functions
├── 📁 types/                  # TypeScript type definitions
├── 📁 lib/                    # Configuration and utilities
├── 📁 public/                 # Static assets
├── 📁 __tests__/              # Unit tests
├── 📁 playwright-tests/       # E2E tests
└── 📁 cypress/                # Cypress E2E tests
```

---

## 🔄 Key Workflows

### **Student Journey**
1. **Registration** → Admin approval required
2. **Login** → Access student dashboard
3. **Course Browsing** → View available courses
4. **Enrollment** → Join courses
5. **Learning** → Access materials, attend live classes
6. **Progress Tracking** → Monitor completion status

### **Teacher Journey**
1. **Course Creation** → Build comprehensive courses
2. **Content Upload** → Add videos, PDFs, resources
3. **Live Classes** → Schedule and conduct sessions
4. **Student Management** → Track attendance and scores
5. **Analytics** → Review student performance

### **Admin Journey**
1. **User Management** → Approve/reject registrations
2. **Course Oversight** → Monitor course quality
3. **System Analytics** → Platform usage insights
4. **User Support** → Handle platform issues

---

## 🎯 Core Features Deep Dive

### **Course Management System**
- Hierarchical content organization (Courses → Sections → Lessons)
- Multiple content types: Video, PDF, Links, Live streams
- Draft/Published status management
- Bulk operations and templates

### **Live Class Integration**
- Jitsi Meet embedded video conferencing
- Real-time participant management
- Screen sharing and recording capabilities
- Automated attendance tracking

### **Authentication & Security**
- NextAuth.js with custom credential provider
- Role-based middleware protection
- Secure password hashing with bcryptjs
- Session management and CSRF protection

### **File Upload System**
- AWS S3 integration for scalable storage
- Image processing and optimization
- Secure presigned URL generation
- Multiple file format support

---

## 📸 How to Add Screenshots

### Method 1: Direct File Addition
1. Take screenshots of your application
2. Save them in the `public/screenshots/` directory
3. Add them to README using:

```markdown
## 📸 Screenshots

### Homepage
![Educational platform dashboard displaying course catalog; each course card shows instructor name, course code, and brief description with modern tech-themed style.](public/screenshots/home.png)

### Course Creation Interface
![Admin dashboard showing course creation form with input fields.](public/screenshots/add_course.png)

### Pending Users and Course Approval
![Users of any role are first approved by admins after signup and courses created by teachers first approved by admins.](public/screenshots/approval_student.png)

### Courses Management Dashboard
![Academic dashboard showing alloted courses table with multiple columns including course code, name, semester, teacher assigned, description, category and credit hours. Interface includes navigation menu and add new course button at the top.](public/screenshots/courses.png)

### Course management : Creating Units and Lessons 
![Course management interface showing hierarchical structure has view, edit, and manage buttons for administrative control.](public/screenshots/course_management.png)

### Live Class Interface
![Taking live class with attendance.](public/screenshots/live_class.png)

### Course Content
![Allows to add pdf, images, links, text and videos](public/screenshots/approval_student.png)

### Scores Management
![Academic dashboard interface displaying score records and management system. Shows a data table with columns for Internal, Midterm, Endterm and Total scores. Dropdown menu at top allows course selection between alloted courses.](public/screenshots/scores.png)

### Accessing the course at student dashboard
![Student dashboard displaying a course content page with Operating System course title, navigation tabs for Lessons, Details, Announcements, and Live Class. Course content section shows expandable modules including Introduction to Operating Systems, Process Management, and Memory Management with nested topics and resource links.](public/screenshots/access_course.png)

```



---

## 🧪 Testing Strategy

### **Unit Testing (Jest)**
```bash
# Run all unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### **E2E Testing (Playwright)**
```bash
# Run E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui
```

### **Integration Testing (Cypress)**
```bash
# Open Cypress dashboard
npx cypress open

# Run headless
npx cypress run
```


---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Ensure all tests pass before submitting

---

## 📝 API Documentation

### **Course Management**
```typescript
GET    /api/courses                    # Get all courses
POST   /api/courses                    # Create new course
GET    /api/courses/[id]               # Get specific course
PUT    /api/courses/[id]               # Update course
DELETE /api/courses/[id]               # Delete course
```

### **Section Management**
```typescript
GET    /api/courses/[id]/sections      # Get course sections
POST   /api/courses/[id]/sections      # Create new section
PUT    /api/courses/[id]/sections/[id] # Update section
DELETE /api/courses/[id]/sections/[id] # Delete section
```

### **Live Classes**
```typescript
GET    /api/courses/[id]/live-class    # Get live class info
POST   /api/courses/[id]/live-class    # Create live class
PUT    /api/courses/[id]/live-class    # Update live class
```

---

## � Project Statistics

- **Lines of Code**: ~15,000+
- **Components**: 50+
- **API Routes**: 25+
- **Database Tables**: 10+
- **Test Coverage**: 85%+
- **Performance Score**: 95/100



## � License

This project is under ownership.

---

## � Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for hosting and deployment platform
- **Jitsi** for open-source video conferencing
- **AG Grid** for the powerful data grid component
- **Open Source Community** for countless helpful libraries

---

## 👨‍💻 Author

**Shivansh Pataku & Gourav Gupta**
- GitHub: [@Shivansh_Pataku](https://github.com/dkooloperator)
- LinkedIn: [Shivansh_Pataku](https://linkedin.com/in/shivansh-pataku-511611165)

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

**EduSphere LMS** — Empowering modern education with technology.

Made with ❤️ by the EduSphere team

</div>