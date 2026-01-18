# Fullstack Rust + Next.js App

A simple user management app with a Rust backend and Next.js frontend, all running in Docker.

Based on: https://dev.to/francescoxx/build-a-full-stack-app-with-rust-nextjs-and-docker-436h

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS v4
- **Backend:** Rust (no framework, just stdlib + postgres crate)
- **Database:** PostgreSQL 13
- **Containerization:** Docker Compose

## Running the App

Make sure Docker is running, then:

```bash
docker compose up --build
```

This starts:
- Frontend at http://localhost:3000
- Backend API at http://localhost:8080
- Postgres on port 5432

To run in the background:
```bash
docker compose up -d
```

To stop:
```bash
docker compose down
```

## API Endpoints

All endpoints are under `/api/rust/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rust/users` | Get all users |
| GET | `/api/rust/users/:id` | Get user by ID |
| POST | `/api/rust/users` | Create user (JSON body: `{name, email}`) |
| PUT | `/api/rust/users/:id` | Update user |
| DELETE | `/api/rust/users/:id` | Delete user |