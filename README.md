# Muzik Release Manager (VRMS)

A full stack application designed to enable artists in managing their music releases and provide administrators with tools to review and publish content. This project uses a modern web application architecture using Fastify for the backend, React for the frontend, PostgreSQL as the database, and Cloudinary for media storage.

## Features

* **User Authentication and Authorization**  
  Secure login and registration for both ARTIST and ADMIN roles using JWT.

* **Artist Dashboard**
  * Overview of all submitted releases and their current status
  * Multi-step wizard for creating new releases, including album details and track uploads
  * Upload cover art and audio files directly to Cloudinary
  * Track release processing status with real-time polling

* **Admin Dashboard**
  * Centralized queue for releases in `PENDING_REVIEW`
  * Detailed review page for each release with audio playback and metadata inspection
  * Approve or reject releases with rejection reasons

* **Public Browsing**
  * Browse published albums and individual tracks
  * Album and track pages with pagination and search
  * Integrated audio player for public previews

* **Robust File Management**  
  Scalable and secure media storage using Cloudinary.

* **Simulated Background Processing**  
  Demonstrates asynchronous handling of media processing (e.g., transcoding, metadata extraction).

* **API Documentation**  
  Interactive Swagger UI for all backend endpoints.

* **Rate Limiting**  
  Protects API endpoints from abuse.

* **Responsive Modern UI**  
  Built with React and Tailwind CSS using a sleek glassmorphism design.

---

## Technology Stack

### Backend
* Framework: Fastify v4
* Language: TypeScript
* Database: PostgreSQL
* Database Driver: `pg`
* Authentication: `@fastify/jwt`, `bcrypt`
* File Uploads: `@fastify/multipart`, Cloudinary
* API Docs: `@fastify/swagger`, `@fastify/swagger-ui`
* Utilities: `@fastify/rate-limit`, `@fastify/sensible`, `@fastify/cors`, `dotenv`, `pino`
* Testing: Jest

### Frontend
* Framework: React v18
* Build Tool: Vite
* Language: TypeScript
* Styling: Tailwind CSS
* Routing: React Router DOM v7
* Forms & Validation: React Hook Form + Zod
* Notifications: React Hot Toast
* Icons: React Icons
* Testing: Vitest

### Shared
* Shared TypeScript interfaces and types used by both frontend and backend.

---

## Architecture Overview

The project follows a **monorepo structure**, grouping related codebases in a single repository.

* **client** – React frontend SPA consuming the REST API  
* **server** – Fastify backend handling business logic, auth, media uploads, and APIs  
* **shared** – Common TypeScript types (User, Release, Track, AuthPayload)  
* **database** – PostgreSQL schema and setup scripts

### Key Architectural Decisions

1. Monorepo for simpler code sharing and versioning
2. Fastify for high-performance APIs
3. React + Vite for modern frontend DX
4. End-to-end TypeScript for type safety
5. PostgreSQL for reliable relational storage
6. Cloudinary for scalable media handling
7. JWT-based stateless authentication
8. Role-based access control via Fastify hooks
9. Background processing simulation for long-running tasks
10. Swagger-based API documentation
11. Rate limiting for stability and security
12. Strong separation of concerns across layers

---

## Getting Started

### Prerequisites

* Node.js v18+
* npm
* PostgreSQL
* Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/g1ftmkyelu/muzik-release-manager.git
cd muzik-release-manager
````

---

### 2. Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=6155

DATABASE_URL=postgresql://username:password@localhost:5432/muzik_dbms

JWT_SECRET=supersecretjwtkeythatisatleast32charslong

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:6155
VITE_APP_NAME=Muzik Release Manager
```

---

### 3. Install Dependencies

Linux/macOS:

```bash
./install.sh
```

Windows:

```bash
install.bat
```

---

### 4. Database Setup

Linux/macOS:

```bash
./setup-db.sh
```

Windows:

```bash
setup-db.bat
```

Cleanup scripts:

```bash
./cleanup-db.sh
# or
cleanup-db.bat
```

---

### 5. Running the Application

Linux/macOS:

```bash
./start.sh native
```

Windows:

```bash
start.bat native
```

#### Project Ports

* Backend API: [http://localhost:6155](http://localhost:6155)
* Frontend UI: [http://localhost:3000](http://localhost:3000)
* Swagger Docs: [http://localhost:6155/documentation](http://localhost:6155/documentation)

---

## Testing

### Backend (Jest)

```bash
cd server
npm test
```

### Frontend (Vitest)

```bash
cd client
npm test
```

---

## Contributing

We welcome contributions to the Muzik Release Manager 🎵

Please read the **[CONTRIBUTING.md](./CONTRIBUTING.md)** file for complete contribution guidelines, including:

* Development setup
* Coding standards
* Commit message conventions
* Testing requirements
* Pull request and review process
* Bug reports and feature proposals

All contributions should follow the rules outlined there.

---

## Live Demo

If all goes as planned, the project will be hosted at:

**Frontend:**
[https://vrms.giftmkyelu.dev](https://vrms.giftmkyelu.dev)

**API Documentation:**
[https://vrmsapi.giftmkyelu.dev/documentation](https://vrmsapi.giftmkyelu.dev/documentation)



