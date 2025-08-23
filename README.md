# EduSphere | Learning Management System (LMS)

A modern, full-featured Learning Management System built with Next.js, React, and TypeScript.  
EduSphere empowers teachers to create and manage course content, enables students to access learning materials, and provides robust role-based management for administrators.

---

## 🚀 Features

- **Role-Based Access:**  
  Secure, robust access control for Teachers, Students, and Admins.
- **Course Management:**  
  Teachers can create, update, and manage courses, including video lectures, resource links, downloadable files, and live classes.
- **Student Dashboard:**  
  Students can browse, enroll, and access all their courses and materials through a responsive interface.
- **Attendance & Scores:**  
  Track student attendance and manage scores with easy-to-use interfaces.
- **User Approval:**  
  Admins can approve or reject user registrations and manage platform users.
- **Live Classes:**  
  Integrated live class scheduling and participation.
- **Responsive UI:**  
  Modern, mobile-friendly design using React and CSS Modules.
- **RESTful APIs:**  
  Efficient, scalable backend endpoints for all major operations.
- **Image Handling:**  
  Advanced image processing and fallbacks for course images.
- **Hybrid Routing:**  
  Utilizes both Next.js App Router and Pages Router for incremental migration and flexibility.

---

## 🛠️ Tech Stack

- **Frontend:**  
  React.js, Next.js (App Router & Pages Router), TypeScript, CSS Modules, Next.js Image
- **Backend:**  
  Node.js (via Next.js API routes), TypeScript
- **Database:**  
  MariaDB / MySQL (SQL)
- **Other:**  
  RESTful API, async/await, role-based access control

---

## ⚙️ Getting Started

### 1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/edusphere-lms.git
cd edusphere-lms
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Configure Environment Variables**
Create a `.env.local` file with your database and other secrets:
```
DATABASE_URL=mysql://user:password@localhost:3306/univ
```

### 4. **Set Up the Database**
- Ensure MariaDB/MySQL is running.
- Create the required tables (`courses`, `course_sections`, `course_scores`, `live_classes`, etc.) as per your schema.

### 5. **Run the Development Server**
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧑‍💻 Usage

- **Teachers:**  
  Log in, create and manage courses, upload content, schedule live classes, and manage student scores and attendance.
- **Students:**  
  Browse available courses, enroll, access course materials, and join live classes.
- **Admins:**  
  Approve users, manage platform settings, and oversee all activities.

---

## 🏗️ Key Code Concepts

- **Async/Await:**  
  Used for all data fetching and database operations for clean, readable asynchronous code.
- **JSON:**  
  Standard format for all API requests and responses.
- **RESTful API:**  
  All backend endpoints follow REST conventions for resource management.
- **Component-Based Architecture:**  
  UI is built from reusable, maintainable React components.
- **Hybrid Routing:**  
  Both App Router and Pages Router are used for flexibility and incremental migration.

---

## 📸 Screenshots

*(Add screenshots of your dashboard, course view, live class, etc. here)*

---

## 📝 License

This project is under ownership.

---

## 🙋‍♂️ Contact

For questions, suggestions, or contributions, reach out on LinkedIn.

---

**EduSphere LMS** — Empowering modern education with technology.