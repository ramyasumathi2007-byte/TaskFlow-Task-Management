# TaskFlow – Task Management Application

A full-stack task manager built with React, Node.js, Express, and MongoDB.

## Features
- Register and log in with JWT authentication
- Password hashing with bcryptjs
- Create, read, update, and delete tasks
- Task status: Pending, In Progress, Completed
- Search and status filtering
- Each user can access only their own tasks
- Responsive dashboard

## Requirements
- Node.js 18+
- MongoDB Community Server running locally, or a MongoDB Atlas connection string

## 1. Run the backend
Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to `.env` and update the values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

## 2. Run the frontend
Open another terminal in `frontend`:

```bash
npm install
```

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start React:

```bash
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

## 3. Test the app
1. Register a new account.
2. Log in.
3. Add a task with a title, description, priority, due date, and status.
4. Edit a task or change its status.
5. Search/filter tasks.
6. Delete a task.

## API endpoints

All task endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/tasks` | List own tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update own task |
| DELETE | `/api/tasks/:id` | Delete own task |

## Project structure

```text
taskflow-project/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/User.js
│   ├── models/Task.js
│   ├── routes/authRoutes.js
│   ├── routes/taskRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── styles.css
    ├── .env.example
    ├── index.html
    └── package.json
```

## Security notes
- Passwords are stored as bcrypt hashes, never as plain text.
- JWTs are used to authenticate API requests.
- Task queries are scoped to the authenticated user.
- Set a strong, private `JWT_SECRET` before deployment.
- This learning project stores the token in browser local storage. For production, consider secure, HTTP-only cookies, rate limiting, validation, and HTTPS.
