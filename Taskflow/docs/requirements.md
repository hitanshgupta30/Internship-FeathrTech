# TaskFlow - Requirements Specification

## 1. Project Overview
TaskFlow is a collaborative task and project management platform inspired by lightweight Trello/Asana workflows. It allows team members to create projects, invite collaborators, create tasks organized by status and priority, assign responsibilities, track due dates, and communicate through task comment threads.

---

## 2. Target Workflow
1. **Signup**: New users register with name, email, and password.
2. **Login**: Existing users authenticate to receive a JWT session token.
3. **Dashboard**: Users view an overview of their owned and shared projects, along with open task metrics.
4. **Create Project**: Users create projects with a title and description.
5. **Open Project (Project Board)**: View project details, members, and a 3-column task board (`TODO`, `IN PROGRESS`, `DONE`).
6. **Add Members**: Project owners invite new team members by email.
7. **Create Tasks**: Add tasks specifying title, description, status, priority, due date, and assignee.
8. **Assign Tasks & Change Status/Priority**: Update task attributes dynamically.
9. **Open Task (Task Detail)**: Inspect task details, edit fields, or delete tasks.
10. **Add Comments**: Post feedback and collaborate in a chronological comment stream.

---

## 3. Functional Requirements

### 3.1 Authentication & User Management
- **FR-AUTH-1**: User signup requiring valid name, unique email format, and secure password (minimum 6 characters).
- **FR-AUTH-2**: User login with email and password, returning a signed JWT and user profile (excluding password).
- **FR-AUTH-3**: User profile verification (`/api/auth/me`) using Bearer JWT authentication.
- **FR-AUTH-4**: Client-side authentication persistence via `localStorage` and automatic state hydration.

### 3.2 Project Management
- **FR-PROJ-1**: Authenticated users can create new projects with a name and optional description.
- **FR-PROJ-2**: Users can list projects they own or are members of.
- **FR-PROJ-3**: View single project details, owner information, and member roster.
- **FR-PROJ-4**: Project owners can add members via email.
- **FR-PROJ-5**: Project owners can update or delete projects.

### 3.3 Task Management
- **FR-TASK-1**: Create tasks within a project with attributes: `title`, `description`, `status` (`todo`, `in_progress`, `done`), `priority` (`low`, `medium`, `high`), `dueDate`, and `assigneeId`.
- **FR-TASK-2**: List tasks for a specific project grouped/filtered by status.
- **FR-TASK-3**: Fetch details for a specific task.
- **FR-TASK-4**: Update task properties (title, description, status, priority, due date, assignee).
- **FR-TASK-5**: Delete tasks.

### 3.4 Comments & Collaboration
- **FR-COMM-1**: View comments for a task in chronological order (oldest first).
- **FR-COMM-2**: Authenticated users can post comments on any accessible task.
- **FR-COMM-3**: Comments record author name, content, and creation timestamp.

---

## 4. Non-Functional Requirements

### 4.1 Architecture & Modularity
- **NFR-ARCH-1**: Layered backend architecture: Routes $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Data Store.
- **NFR-ARCH-2**: Isolated storage layer allowing seamless migration from in-memory store to Neon PostgreSQL.
- **NFR-ARCH-3**: No persistent database or ORM dependencies in v1.0.

### 4.2 Security
- **NFR-SEC-1**: Password hashing using `bcrypt` before storage.
- **NFR-SEC-2**: Stateless authentication using standard JSON Web Tokens (JWT).
- **NFR-SEC-3**: Input validation on all incoming payload bodies using `Zod` schemas.
- **NFR-SEC-4**: CORS configuration restricting unauthorized origins.
- **NFR-SEC-5**: Passwords are never returned in any API responses.

### 4.3 Performance & Reliability
- **NFR-PERF-1**: Fast response times with centralized error handling preventing unhandled crashes.
- **NFR-PERF-2**: Frontend responsive design supporting mobile, tablet, and desktop viewports.
- **NFR-PERF-3**: Explicit UI state handling for loading spinners, error alerts, and empty states.
