# Backend Project Generation Prompt

## Project Overview

Create a robust **Node.js/Express backend** for a Task Management System. This backend will serve an existing React frontend and must act as the source of truth for all data, connecting to a **MySQL database** named `hello_manage`.

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL (Database name: `hello_manage`)
- **ORM**: Prisma (preferred) or Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Bcrypt for password hashing, CORS, Helmet

## Database Schema Requirements

The database schema must strictly align with the frontend's TypeScript interfaces.

### 1. Users Table

- `id`: UUID (Primary Key)
- `name`: String
- `email`: String (Unique)
- `password`: String (Hashed)
- `role`: Enum ('admin', 'staff')
- `avatar`: String (URL or specific path, optional)
- `department`: String (optional)
- `needs_password_change`: Boolean (Default: true for new users)
- `created_at`: DateTime
- `updated_at`: DateTime

### 2. Tasks Table

- `id`: UUID (Primary Key)
- `title`: String
- `description`: Text
- `status`: Enum ('todo', 'in-process', 'review', 'completed')
- `priority`: Enum ('low', 'medium', 'high')
- `due_date`: DateTime (optional)
- `time_allocation`: Integer (optional, in hours/minutes)
- `creator_id`: UUID (Foreign Key -> Users.id)
- `assignee_id`: UUID (Foreign Key -> Users.id, optional)
- `created_at`: DateTime
- `updated_at`: DateTime

### 3. ActivityLogs Table

- `id`: UUID (Primary Key)
- `task_id`: UUID (Foreign Key -> Tasks.id)
- `user_id`: UUID (Foreign Key -> Users.id)
- `action`: String (Description of the action)
- `timestamp`: DateTime (Default: now)

### 4. Organization Table (Singleton)

- `id`: UUID (Primary Key)
- `name`: String
- `description`: Text
- `logo`: String (optional)

## API Endpoints Specification

All responses should differ standard JSON format.

### Authentication (`/api/auth`)

1.  **POST `/login`**:
    - Input: `email`, `password`
    - Logic: Validate credentials. If `needs_password_change` is true, allow login but frontend will prompt change.
    - Output: `token` (JWT), `user` object.
2.  **POST `/change-password`**:
    - Authentication Required.
    - Input: `password` (current), `newPassword`.
    - Logic: Verify current, update to new, set `needs_password_change` to false.

### Users (`/api/users`)

1.  **GET `/`**: List all users. (Admin only or Authenticated)
2.  **GET `/:id`**: Get single user details.
3.  **POST `/`**: Create new user (Admin only).
    - Logic: Generate a random temporary password if not provided. Return the temp password in the response for the admin to see once.
4.  **PUT `/:id`**: Update user details (Name, Department, Role).
5.  **DELETE `/:id`**: Remove user (Admin only).

### Tasks (`/api/tasks`)

1.  **GET `/`**: List all tasks. include `assignee` and `creator` relations.
2.  **GET `/:id`**: Get task details with `activityLogs`.
3.  **POST `/`**: Create task.
    - Logic: Auto-create an initial "Task created" ActivityLog.
4.  **PUT `/:id`**: Update task fields.
    - Logic: If `status` changes, auto-create a status change ActivityLog.
5.  **PATCH `/:id/status`**: Specialized endpoint for drag-and-drop status updates.
6.  **DELETE `/:id`**: Delete task.

## Configuration & Environment

- Use `dotenv` for configuration.
- `PORT`: Server port (e.g., 5000)
- `DATABASE_URL`: Connection string for MySQL (e.g., `mysql://user:password@localhost:3306/hello_manage`)
- `JWT_SECRET`: Secret key for signing tokens.

## Implementation Steps

1.  **Initialize Project**: Setup `package.json`, install dependencies (`express`, `prisma`, `mysql2`, `typescript`, etc.).
2.  **Setup Prisma**: Initialize prisma, define `schema.prisma` with the models above.
3.  **Database Migration**: Run migration to create tables in `hello_manage`.
4.  **Seed Data**: Create a seed script to ensure a default Admin user exists:
    - Email: `avsinfo0824@gmail.com`
    - Password: (A known default or instructions to set one)
    - Role: `admin`
5.  **Develop API**: Implement controllers and routes for all endpoints.
6.  **Middleware**: Implement `authMiddleware` to verify JWTs and `roleMiddleware` for admin-only routes.
7.  **Main Application**: Setup `server.ts` to combine routes, middleware, and start the server.

## Output Expectations

- Full source code for the backend structure.
- `schema.prisma` file.
- `.env.example` file.
- Instructions on how to run migrations and start the server.
