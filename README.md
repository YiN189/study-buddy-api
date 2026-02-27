# StudyBuddy

A full-stack web-based learning management platform that lets students browse courses, enroll, track progress, take quizzes, and collaborate through Q&A — while instructors manage courses and admins oversee the system.

## Team Members

| Name |
| --- |
| Nyi Phyo Kyaw |
| Yoon Hsu Hlaing |
| Shune Lai Wai |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router v7, CSS |
| Backend | Next.js 16.1.6 (API Routes only) |
| Database | MongoDB Atlas |
| Proxy | Nginx (routes traffic, SSL termination) |
| Auth | Plain text (demo) |
| Deployment | Docker Compose on Azure VM |

---

## Features

- **Authentication** — Register and log in as Student, Instructor, or Admin.
- **Course Browsing** — Browse all courses with filtering by category, level, and keyword search.
- **Enrollment** — Students can enroll in free or paid courses.
- **Lesson Progress** — Mark lessons as completed and track progress percentage per course.
- **Quizzes** — Take quizzes embedded in courses and receive instant scores.
- **Q&A Forum** — Students ask questions; instructors provide answers per course.
- **Instructor Dashboard** — View enrolled students, manage courses, create new courses, and answer Q&A.
- **Admin Dashboard** — View system statistics, manage users, courses, and handle reports.
- **Issue Reporting** — Students can report technical or content issues.

---

## Screenshots

### Home
![Home](docs/screenshots/home.png)

### Student Dashboard
![Student Dashboard](docs/screenshots/student-dashboard.png)

### Browse Courses
![Courses](docs/screenshots/courses.png)

### Course View
![Course View](docs/screenshots/course-view.png)

### Quiz
![Quiz](docs/screenshots/quiz.png)

### Instructor Dashboard
![Instructor Dashboard](docs/screenshots/instructor-dashboard.png)

### Admin Dashboard
![Admin Dashboard](docs/screenshots/admin-dashboard.png)

---

## Project Structure

```
project2/
├── docker-compose.yml          # Orchestrates all services
├── nginx/
│   └── default.conf            # Reverse proxy + SSL config
│
├── studybuddy-api/             # Next.js backend (API routes only)
│   └── src/
│       ├── app/api/
│       │   ├── auth/login/         POST  — log in
│       │   ├── auth/register/      POST  — create account
│       │   ├── courses/            GET / POST
│       │   ├── courses/[id]/       GET / PUT / DELETE
│       │   ├── categories/         GET
│       │   ├── enrollments/        GET / POST
│       │   ├── progress/           GET / POST
│       │   ├── qa/                 GET / POST
│       │   ├── qa/[id]/answer/     POST
│       │   ├── quiz/submit/        POST
│       │   ├── reports/            GET / POST
│       │   ├── reports/[id]/       PUT
│       │   ├── admin/stats/        GET
│       │   ├── admin/users/        GET / PUT / DELETE
│       │   ├── instructor/stats/   GET
│       │   └── instructor/students/ GET
│       ├── lib/
│       │   ├── mongodb.js          Mongoose connection
│       │   ├── cors.js             CORS headers
│       │   └── ids.js              ID coercion helpers
│       ├── scripts/
│       │   └── seed.js             Database seeder
│       └── app/
│           ├── route.js            Root route
│           ├── [slug]/route.js     Catch-all route
│           └── api/
│               └── health/route.js Health check endpoint
│
└── StudyBuddy/                 # React + Vite SPA
    └── src/
        ├── utils/
        │   ├── api.js              Axios instance
        │   ├── AuthContext.jsx     Auth state provider
        │   └── mockData.js         Mock/seed data for development
        ├── App.jsx                 Router, navbar, auth state
        ├── components/common/
        │   ├── Navigation.jsx
        │   └── CourseCard.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── student/
            │   ├── StudentDashboard.jsx
            │   ├── Courses.jsx
            │   ├── CourseView.jsx
            │   ├── EnrollmentModal.jsx
            │   ├── Quiz.jsx
            │   └── StudentQA.jsx
            ├── instructor/
            │   ├── InstructorDashboard.jsx
            │   ├── CreateCourse.jsx
            │   ├── ManageCourse.jsx
            │   ├── InstructorStudents.jsx
            │   └── InstructorQA.jsx
            └── admin/
                ├── AdminDashboard.jsx
                ├── AdminCourses.jsx
                ├── AdminUsers.jsx
                └── AdminReports.jsx
```

---

## Data Models

### User

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | |
| `email` | String | unique |
| `password` | String | plain text (demo) |
| `role` | String | `student` \| `instructor` \| `admin` |
| `enrolledCourses` | Array | list of course IDs |
| `completedLessons` | Array | list of lesson IDs |
| `quizScores` | Array | `{ quizId, score, date }` |
| `certificates` | Array | |
| `createdAt` | String | ISO date |

### Course

| Field | Type | Notes |
| --- | --- | --- |
| `title` | String | |
| `description` | String | |
| `instructor` | String | instructor display name |
| `instructorId` | String | ref User |
| `category` | String | e.g. Programming, Data Science |
| `level` | String | Beginner \| Intermediate |
| `duration` | String | e.g. "8 weeks" |
| `price` | Number | 0 = free |
| `rating` | Number | |
| `students` | Number | enrollment count |
| `image` | String | URL |
| `lessons` | Array | embedded `{ id, title, description, duration, content }` |
| `quizzes` | Array | embedded `{ id, title, questions[] }` |

### Category

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | e.g. Programming |
| `count` | Number | number of courses |

### Question (Q&A)

| Field | Type | Notes |
| --- | --- | --- |
| `studentId` | String | ref User |
| `studentName` | String | |
| `courseId` | Number | ref Course |
| `courseName` | String | |
| `question` | String | |
| `date` | String | ISO date |
| `status` | String | `pending` \| `answered` |
| `answers` | Array | `{ text, author, role, date }` |

### Report

| Field | Type | Notes |
| --- | --- | --- |
| `type` | String | `technical` \| `content` \| `general` |
| `userId` | String | ref User |
| `userName` | String | |
| `subject` | String | |
| `description` | String | |
| `date` | String | ISO date |
| `status` | String | `pending` \| `resolved` |

---

## API Reference

All endpoints are prefixed with `/api`.

### Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | — | Health check. |

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | — | Create account. Body: `{ name, email, password, role }` |
| `POST` | `/auth/login` | — | Log in. Body: `{ email, password }` |

### Courses

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/courses` | — | List courses. Query: `category`, `level`, `search`, `instructorId` |
| `POST` | `/courses` | 🔒 | Create a new course (instructor). |
| `GET` | `/courses/:id` | — | Get a single course with lessons and quizzes. |
| `PUT` | `/courses/:id` | 🔒 | Update course details (instructor only). |
| `DELETE` | `/courses/:id` | 🔒 | Delete a course (instructor/admin only). |

### Categories

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/categories` | — | List all course categories. |

### Enrollments

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/enrollments` | — | Get enrolled courses. Query: `studentId` |
| `POST` | `/enrollments` | 🔒 | Enroll in a course. Body: `{ studentId, courseId }` |

### Progress

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/progress` | — | Get lesson progress. Query: `studentId`, `courseId` |
| `POST` | `/progress` | 🔒 | Mark lesson completed. Body: `{ studentId, lessonId }` |

### Q&A

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/qa` | — | List questions. Query: `courseId`, `instructorId` |
| `POST` | `/qa` | 🔒 | Ask a question. Body: `{ studentId, courseId, question, ... }` |
| `POST` | `/qa/:id/answer` | 🔒 | Answer a question (instructor). Body: `{ text, author, role }` |

### Quiz

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/quiz/submit` | 🔒 | Submit quiz result. Body: `{ studentId, quizId, courseId, score }` |

### Reports

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/reports` | 🔒 | List all reports. Query: `status` |
| `POST` | `/reports` | 🔒 | Create a new report. Body: `{ type, subject, description, ... }` |
| `PUT` | `/reports/:id` | 🔒 | Update report status (admin). |

### Admin

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/admin/stats` | 🔒 | System statistics (total users, courses, enrollments, etc). |
| `GET` | `/admin/users` | 🔒 | List all users. |
| `PUT` | `/admin/users` | 🔒 | Update a user. |
| `DELETE` | `/admin/users` | 🔒 | Delete a user. |

### Instructor

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/instructor/stats` | 🔒 | Instructor dashboard stats. |
| `GET` | `/instructor/students` | 🔒 | List students enrolled in instructor's courses. |

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Running with Docker Compose

```bash
# Clone the repository
git clone <your-repo-url>
cd project2

# Create .env file for backend
echo "MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority" > .env
echo "MONGODB_DB=studybuddy" >> .env

# Build and start all services
docker-compose up --build -d
```

The application will be available at your server's domain or `http://localhost`.

| Service | Internal Port | Exposed |
| --- | --- | --- |
| Nginx proxy | 80 / 443 | 80, 443 (main entry point) |
| Frontend (Vite/Nginx) | 80 | via Nginx proxy |
| Backend (Next.js) | 3000 | via Nginx proxy at `/api/` |

### Seeding the Database

```bash
# Run the seed script to populate sample data
cd study-buddy-api
node src/scripts/seed.js
```

This inserts sample users, courses, categories, questions, and reports.

**Demo Accounts:**

| Role | Email | Password |
| --- | --- | --- |
| Student | john@example.com | student123 |
| Instructor | jinchun@example.com | instructor123 |
| Admin | admin@example.com | admin123 |

---

## Environment Variables

### Backend (.env)

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB` | Database name (default: `studybuddy`) |

---

## Notes

- Quizzes are stored as **embedded documents** within the Course collection, following MongoDB's embedded document pattern.
- Enrollment and progress are tracked within the User document (`enrolledCourses`, `completedLessons`, `quizScores` arrays).
- The frontend repo is at: https://github.com/Shunelw/StudyBuddy
- `docker-compose.yml` is included in this repo. To run the full stack, clone both repos side by side:
  ```
  project2/
  ├── studybuddy-api/   ← this repo (https://github.com/YiN189/study-buddy-api)
  └── StudyBuddy/       ← frontend repo (https://github.com/Shunelw/StudyBuddy)
  ```
  Then run `docker-compose up --build -d` from inside `study-buddy-api/`.
