# TaskFlow ⚡

> **A streamlined, distraction-free project and task management platform built for modern agile teams.**  
> Effortlessly organize projects, track progress on visual Kanban boards, collaborate with teammates, and keep discussions in context.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-TaskFlow%20on%20Vercel-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://taskflow-1-lime.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 🌐 Live Website

Experience TaskFlow directly in your browser:  
🔗 **[https://taskflow-1-lime.vercel.app/](https://taskflow-1-lime.vercel.app/)**

---

## 💡 Why TaskFlow?

Most project management tools today suffer from feature bloat—complex configuration menus, endless sub-menus, and steep learning curves that slow teams down instead of speeding them up.

**TaskFlow** was built to restore simplicity and momentum:
- **Zero Friction**: Jump straight from idea to action without setting up dozens of custom fields or complicated workflows.
- **Visual Clarity**: See what needs doing at a glance across clean, responsive Kanban boards.
- **Contextual Discussions**: Keep conversations right where the work happens with dedicated task comment streams.
- **Team-First Collaboration**: Easily invite teammates and assign responsibilities with clear priority flags and deadlines.

---

## ✨ Key Features

### 📋 Visual Kanban Boards
- Dynamic columns for **To Do**, **In Progress**, and **Done**.
- Immediate status updates, color-coded priority indicators (**Low**, **Medium**, **High**), and due-date badges.

### 👥 Project & Team Workspace
- Create separate workspaces for different products, sprints, or initiatives.
- Invite team members via email and manage project ownership effortlessly.
- Personal dashboard summarizing your projects and pending action items.

### 📝 Granular Task Management
- Detailed task view with rich descriptions, assignees, priorities, and deadlines.
- Clean inline editing and quick deletion controls.

### 💬 In-Task Collaboration
- Chronological comment threads directly attached to every task.
- Ensure everyone stays aligned without losing context across fragmented chat apps.

### 🔐 Secure & Seamless Auth
- Token-based stateless authentication (JWT) with secure `bcrypt` password hashing.
- Automatic session hydration and persistent login via local storage.

### 🐘 Smart Dual-Storage Architecture
- **Neon PostgreSQL**: Production-grade serverless cloud database with connection pooling and automated schema initialization.
- **In-Memory Fallback**: Seamless local fallback mode when no database URL is provided—clone, run, and test instantly without local database configuration.

---

## 🛠️ Tech Stack

### Frontend (`web/`)
| Technology | Purpose |
| :--- | :--- |
| **React 18** | Component-driven UI library |
| **Vite** | Blazing-fast build tool and dev server |
| **React Router v6** | Client-side routing with protected route guards |
| **Axios** | Centralized API client with JWT bearer interceptors & 401 handlers |
| **React Context API** | Global authentication & user state management |
| **Vanilla CSS Design System** | Modern custom-property design tokens, glassmorphism, responsive flex/grid layouts, and Google Fonts (*Inter* & *Plus Jakarta Sans*) |
| **Vitest & React Testing Library** | Frontend unit and component testing |

### Backend (`backend/`)
| Technology | Purpose |
| :--- | :--- |
| **Node.js & Express** | Lightweight, high-performance RESTful API runtime |
| **Neon PostgreSQL (`pg`)** | Serverless PostgreSQL database with connection pooling and auto-migrations |
| **JSON Web Tokens (JWT)** | Stateless authentication and secure route authorization |
| **Bcrypt.js** | Cryptographic password hashing |
| **Zod** | Schema validation for all incoming API payloads with actionable error formatting |
| **Jest & Supertest** | Backend integration and API endpoint test suites |

---

## 📁 Project Structure

TaskFlow is organized as an intuitive, modular monorepo:

```text
TaskFlow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Neon PostgreSQL pooling & auto-schema init
│   │   ├── controllers/            # Request handlers & HTTP response orchestrators
│   │   ├── middleware/             # JWT auth guard, Zod validator, error handling
│   │   ├── routes/                 # Express API route declarations
│   │   ├── services/               # Business logic & dual-mode data stores
│   │   ├── utils/                  # JWT helpers, password hash utilities
│   │   ├── validators/             # Zod input validation schemas
│   │   ├── app.js                  # Express app middleware setup & CORS
│   │   └── server.js               # Server entry point
│   ├── tests/                      # Jest & Supertest integration tests
│   └── package.json
│
├── web/
│   ├── src/
│   │   ├── api/                    # Axios client instance with auth interceptors
│   │   ├── components/             # Reusable UI components (Navbar, TaskCard, Modal, etc.)
│   │   ├── context/                # AuthContext & global state providers
│   │   ├── pages/                  # Route views (Landing, Dashboard, ProjectBoard, TaskDetail, Auth)
│   │   ├── tests/                  # React Testing Library test suites
│   │   ├── App.jsx                 # Route configurations
│   │   ├── index.css               # Global CSS design tokens and theme styling
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── docs/
│   ├── api-spec.md                 # Complete REST API documentation
│   └── requirements.md             # Functional & system specifications
│
├── package.json                    # Root workspace scripts (concurrent execution)
└── vercel.json                     # Vercel deployment configuration
```

---

## 🚀 Getting Started

Follow these steps to get TaskFlow running on your local machine.

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

---

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

---

### 2. Install Dependencies

You can install all dependencies across the entire monorepo with a single command from the root:

```bash
npm run install:all
```

*(Alternatively, run `npm install` inside both `backend` and `web` directories separately.)*

---

### 3. Configure Environment Variables

#### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGIN=http://localhost:5173

# Optional: Neon PostgreSQL connection string.
# If omitted, TaskFlow automatically runs in zero-config In-Memory mode!
DATABASE_URL=postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

#### Frontend (`web/.env`)
Create a `.env` file in the `web/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### 4. Run the Development Environment

Start both the backend API and frontend Vite dev server concurrently with one command:

```bash
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🧪 Testing & Verification

TaskFlow includes comprehensive automated testing across both backend and frontend.

### Run All Tests
```bash
npm test
```

### Run Backend Tests (Jest & Supertest)
```bash
npm run test:backend
```

### Run Frontend Tests (Vitest & React Testing Library)
```bash
npm run test:frontend
```

---

## 📡 REST API Summary

All protected endpoints require the `Authorization: Bearer <JWT_TOKEN>` header.

### 🔑 Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/signup` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |

### 📁 Projects
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/projects` | List all user projects | Yes |
| `POST` | `/api/projects` | Create a new project | Yes |
| `GET` | `/api/projects/:id` | Get project details and members | Yes |
| `PUT` | `/api/projects/:id` | Update project metadata | Yes |
| `DELETE` | `/api/projects/:id` | Delete a project | Yes |
| `POST` | `/api/projects/:id/members` | Invite a member by email | Yes |
| `GET` | `/api/projects/:id/tasks` | Get all tasks for a project | Yes |

### 📋 Tasks & Comments
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/tasks` | Create a new task in a project | Yes |
| `GET` | `/api/tasks/:id` | Get task details | Yes |
| `PUT` | `/api/tasks/:id` | Update task (status, assignee, priority, due date) | Yes |
| `DELETE` | `/api/tasks/:id` | Delete a task | Yes |
| `GET` | `/api/tasks/:id/comments` | Retrieve task comments | Yes |
| `POST` | `/api/tasks/:id/comments` | Post a comment on a task | Yes |

*For complete payload schemas and example responses, see [`docs/api-spec.md`](docs/api-spec.md).*

---

## 🚢 Deployment

TaskFlow is production-ready and configured for seamless deployment:
- **Frontend**: Hosted on [Vercel](https://vercel.com/) with automatic routing rewrites (`vercel.json`).
- **Backend**: Can be hosted on Vercel Serverless Functions, Render, Railway, or AWS.
- **Database**: Cloud-hosted serverless PostgreSQL via [Neon](https://neon.tech/).

---

## 🤝 Contributing

Contributions, feedback, and feature requests are welcome!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ for teams that value focus, speed, and simplicity.</sub>
</div>
