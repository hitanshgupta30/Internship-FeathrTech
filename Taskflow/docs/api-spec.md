# TaskFlow - API Specification

Base URL: `/api`

All protected endpoints require the HTTP header:
```
Authorization: Bearer <JWT_TOKEN>
```

Standard Success Response Envelope:
```json
{
  "success": true,
  "data": { ... }
}
```

Standard Error Response Envelope:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "issue": "Specific validation failure"
    }
  ]
}
```

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method**: `POST`
- **Route**: `/api/auth/signup`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "name": "Alex Smith",
    "email": "alex@example.com",
    "password": "Password123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "usr_123456",
        "name": "Alex Smith",
        "email": "alex@example.com",
        "createdAt": "2026-08-27T08:00:00.000Z"
      }
    }
  }
  ```

### 1.2 Login User
- **Method**: `POST`
- **Route**: `/api/auth/login`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "Password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "user": {
        "id": "usr_123456",
        "name": "Alex Smith",
        "email": "alex@example.com"
      }
    }
  }
  ```

### 1.3 Get Current User
- **Method**: `GET`
- **Route**: `/api/auth/me`
- **Auth**: Protected
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "usr_123456",
        "name": "Alex Smith",
        "email": "alex@example.com",
        "createdAt": "2026-08-27T08:00:00.000Z"
      }
    }
  }
  ```

---

## 2. Project Endpoints

### 2.1 List Projects
- **Method**: `GET`
- **Route**: `/api/projects`
- **Auth**: Protected
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "projects": [
        {
          "id": "proj_123",
          "name": "Website Redesign",
          "description": "Revamp company portal",
          "ownerId": "usr_123456",
          "owner": {
            "id": "usr_123456",
            "name": "Alex Smith",
            "email": "alex@example.com"
          },
          "members": [],
          "openTaskCount": 5,
          "createdAt": "2026-08-27T08:00:00.000Z"
        }
      ]
    }
  }
  ```

### 2.2 Create Project
- **Method**: `POST`
- **Route**: `/api/projects`
- **Auth**: Protected
- **Request Body**:
  ```json
  {
    "name": "Mobile App Launch",
    "description": "Cross-platform mobile application"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Project created successfully",
    "data": {
      "project": {
        "id": "proj_456",
        "name": "Mobile App Launch",
        "description": "Cross-platform mobile application",
        "ownerId": "usr_123456",
        "members": [],
        "openTaskCount": 0,
        "createdAt": "2026-08-27T08:00:00.000Z"
      }
    }
  }
  ```

### 2.3 Get Project by ID
- **Method**: `GET`
- **Route**: `/api/projects/:id`
- **Auth**: Protected
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "project": {
        "id": "proj_456",
        "name": "Mobile App Launch",
        "description": "Cross-platform mobile application",
        "ownerId": "usr_123456",
        "owner": {
          "id": "usr_123456",
          "name": "Alex Smith",
          "email": "alex@example.com"
        },
        "members": [
          {
            "id": "usr_789",
            "name": "Sara Connor",
            "email": "sara@example.com"
          }
        ],
        "createdAt": "2026-08-27T08:00:00.000Z"
      }
    }
  }
  ```

### 2.4 Update Project
- **Method**: `PUT`
- **Route**: `/api/projects/:id`
- **Auth**: Protected
- **Request Body**:
  ```json
  {
    "name": "Updated Project Name",
    "description": "Updated project description"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Project updated successfully",
    "data": {
      "project": { ... }
    }
  }
  ```

### 2.5 Delete Project
- **Method**: `DELETE`
- **Route**: `/api/projects/:id`
- **Auth**: Protected
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Project deleted successfully"
  }
  ```

### 2.6 Add Project Member
- **Method**: `POST`
- **Route**: `/api/projects/:id/members`
- **Auth**: Protected (Project Owner only)
- **Request Body**:
  ```json
  {
    "email": "teammate@example.com"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Member added successfully",
    "data": {
      "project": { ... }
    }
  }
  ```

---

## 3. Task Endpoints

### 3.1 Get Tasks for a Project
- **Method**: `GET`
- **Route**: `/api/projects/:id/tasks`
- **Auth**: Protected
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "tasks": [
        {
          "id": "task_1",
          "projectId": "proj_456",
          "title": "Design Landing UI",
          "description": "Create mockup in Figma",
          "status": "todo",
          "priority": "high",
          "dueDate": "2026-09-01",
          "assigneeId": "usr_789",
          "assignee": {
            "id": "usr_789",
            "name": "Sara Connor",
            "email": "sara@example.com"
          },
          "createdAt": "2026-08-27T08:00:00.000Z"
        }
      ]
    }
  }
  ```

### 3.2 Create Task
- **Method**: `POST`
- **Route**: `/api/projects/:id/tasks`
- **Auth**: Protected
- **Request Body**:
  ```json
  {
    "title": "Implement Auth Controller",
    "description": "JWT sign & verify",
    "status": "todo",
    "priority": "high",
    "dueDate": "2026-08-30",
    "assigneeId": "usr_123456"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Task created successfully",
    "data": {
      "task": { ... }
    }
  }
  ```

### 3.3 Get Task by ID
- **Method**: `GET`
- **Route**: `/api/tasks/:id`
- **Auth**: Protected
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "task": {
        "id": "task_1",
        "projectId": "proj_456",
        "title": "Design Landing UI",
        "description": "Create mockup in Figma",
        "status": "todo",
        "priority": "high",
        "dueDate": "2026-09-01",
        "assigneeId": "usr_789",
        "project": {
          "id": "proj_456",
          "name": "Mobile App Launch"
        },
        "assignee": {
          "id": "usr_789",
          "name": "Sara Connor"
        },
        "createdAt": "2026-08-27T08:00:00.000Z"
      }
    }
  }
  ```

### 3.4 Update Task
- **Method**: `PUT`
- **Route**: `/api/tasks/:id`
- **Auth**: Protected
- **Request Body**:
  ```json
  {
    "title": "Design Landing UI Updated",
    "description": "Include dark mode styles",
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2026-09-02",
    "assigneeId": "usr_789"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Task updated successfully",
    "data": {
      "task": { ... }
    }
  }
  ```

### 3.5 Delete Task
- **Method**: `DELETE`
- **Route**: `/api/tasks/:id`
- **Auth**: Protected
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```

---

## 4. Comment Endpoints

### 4.1 Get Task Comments
- **Method**: `GET`
- **Route**: `/api/tasks/:id/comments`
- **Auth**: Protected
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "comments": [
        {
          "id": "comm_1",
          "taskId": "task_1",
          "authorId": "usr_123456",
          "authorName": "Alex Smith",
          "body": "Initial wireframe uploaded to Figma.",
          "createdAt": "2026-08-27T08:30:00.000Z"
        }
      ]
    }
  }
  ```

### 4.2 Add Task Comment
- **Method**: `POST`
- **Route**: `/api/tasks/:id/comments`
- **Auth**: Protected
- **Request Body**:
  ```json
  {
    "body": "Looks great, let me review this afternoon!"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Comment added successfully",
    "data": {
      "comment": {
        "id": "comm_2",
        "taskId": "task_1",
        "authorId": "usr_789",
        "authorName": "Sara Connor",
        "body": "Looks great, let me review this afternoon!",
        "createdAt": "2026-08-27T08:35:00.000Z"
      }
    }
  }
  ```
