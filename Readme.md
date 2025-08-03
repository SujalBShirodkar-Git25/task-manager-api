# 📝 Task Manager API

This is a **Task Manager REST API** built completely from scratch using **Node.js, Express.js, and MongoDB**. It includes full **user authentication and authorization** with secure JWT tokens, and supports complete **CRUD operations for task management**.

---

## 🚀 Features

### 👤 User Management
- ✅ User Registration
- ✅ User Login with JWT Access + Refresh Tokens
- ✅ Logout (token blacklisting supported via refresh tokens)
- ✅ Get Current User Info
- ✅ Update User Profile
- ✅ Reset Password
- ✅ Delete User Account

### ✅ Task Management
- ✅ Create New Task
- ✅ Get All Tasks for Logged-in User
- ✅ Get a Single Task by ID
- ✅ Update Task by ID
- ✅ Delete Task by ID

---

## 🧰 Tech Stack

- **Backend Framework:** Node.js + Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (Access + Refresh Tokens)
- **Validation & Errors:** Custom error handler + API response class
- **Middleware:** 
  - `verifyJWT` for route protection
  - `multer` for form data parsing (via `formParser` middleware)

---

## 📂 Project Structure (Simplified)

- 📁 controllers/
- 📁 db/
- 📁 middlewares/
- 📁 models/
- 📁 routes/
- 📁 utils/
- app.js
- index.js


---

## 🔐 API Routes

### 👤 User Routes

| Method | Route               | Description                     |
|--------|---------------------|---------------------------------|
| POST   | `/api/v1/user/register`       | Register new user             |
| POST   | `/api/v1/user/login`          | Login user                    |
| POST   | `/api/v1/user/logout`         | Logout user                   |
| POST   | `/api/v1/user/refresh-token`  | Refresh JWT access token      |
| POST   | `/api/v1/user/reset-password` | Reset password                |
| GET    | `/api/v1/user/get-user`       | Get logged-in user info       |
| PATCH  | `/api/v1/user/update`         | Update user details           |
| DELETE | `/api/v1/user/delete`         | Delete user account           |

### 📌 Task Routes

| Method | Route                 | Description                     |
|--------|-----------------------|---------------------------------|
| POST   | `/api/v1/task/create`        | Create a new task              |
| GET    | `/api/v1/task/get-tasks`     | Get all tasks for user         |
| GET    | `/api/v1/task/get-task/:id`  | Get specific task by ID        |
| PATCH  | `/api/v1/task/update/:id`    | Update task by ID              |
| DELETE | `/api/v1/task/delete/:id`    | Delete task by ID              |

---
