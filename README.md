# Muzik Release Manager (VRMS)

A full stack application designed to enable artists in managing their music releases and provide administrators with tools to review and publish content. This project uses a modern web application architecture using Fastify for the backend, React for the frontend, PostgreSQL as the database, and Cloudinary for  media storage.

## Features

*   User Authentication and Authorization- Secure login and registration for both ARTIST and ADMIN roles using JWT.
*   Artist Dashboard:
    *   Overview of all submitted releases and their current status.
    *   Multi step wizard for creating new releases, including album details and track uploads.
    *   Upload cover art and audio files directly to Cloudinary.
    *   Track release processing status with real time polling.

*   Admin Dashboard:
    *   Centralized queue for releases PENDING_REVIEW.
    *   Detailed review page for each release, allowing playback of tracks and inspection of metadata.
    *   Approve or reject releases, providing a reason for rejection.

*   Public Browsing:
    *   Explore published albums and individual tracks.
    *   Dedicated pages for browsing albums and tracks with pagination and search functionality.
    *   Integrated audio player for public track previews.
*   Robust File Management: Utilizes Cloudinary for scalable and secure storage of cover art and audio files.

*   Simulated Background Processing: Demonstrates asynchronous handling of media processing tasks like transcoding and metadata extraction without blocking the main API thread.

*   API Documentation: Interactive Swagger UI for all backend endpoints.

*   Rate Limiting: Protects API endpoints from abuse.
*   Responsive and Modern UI: Built with React and Tailwind CSS, featuring a sleek glassmorphism design.

## Technology Stack


### Backend
*   Framework: Fastify v4, a fast and low overhead web framework for Node.js.
*   Language: TypeScript for type safety and improved developer experience.
*   Database: PostgreSQL, a powerful, open-source relational database.
*   database Driver: pg Node.js PostgreSQL client.
*   Authentication: @fastify/jwt and bcrypt for secure token-based authentication and password hashing.
*   File Uploads: @fastify/multipart and Cloudinary for handling multipart form data and cloud media storage.
*   API Documentation: @fastify/swagger and @fastify/swagger-ui for auto-generated OpenAPI documentation.
*   Utilities: @fastify/rate-limit, @fastify/sensible, @fastify/cors, dotenv, and pino.
*   Testing: Jest

### Frontend
*   Framework: React v18, a declarative, component-based UI library.
*   Build Tool: Vite, a next-generation frontend tooling.
*   Language: TypeScript
*   Styling: Tailwind CSS, a utility-first CSS framework.
*   Routing: React Router DOM v7 for declarative navigation.
*   Form Management: React Hook Form and Zod for efficient form handling and schema validation.
*   Notifications: React Hot Toast for beautiful and responsive toast notifications.
*   Icons: React Icons
*   Testing: Vitest

### Shared
*   Common TypeScript interfaces and types used by both frontend and backend.

## Architecture Overview

The project uses a monorepo structure, organizing related codebases like client, server, shared, and database within a single repository.

*   client: The React frontend application. It's a Single Page Application that consumes the REST API provided by the backend. It handles user interaction, data presentation, and client-side routing.

*   server: The Fastify backend API. It's responsible for handling all business logic, database interactions, authentication, file uploads to Cloudinary, and exposing RESTful endpoints.

*   shared: Contains common TypeScript type definitions like User, Release, Track, and AuthPayload that are shared between the frontend and backend to ensure type consistency.
*   database: Holds the PostgreSQL schema definition in init.sql and database setup/cleanup scripts.

### Key Architectural Decisions

1.  Monorepo for Simplicity: For a project of this size, a monorepo simplifies code sharing, especially types, versioning, and local development setup.

2.  Fastify for Performance: Chosen for its speed and efficiency, making it a great choice for a high-performance API server. Its pluginbased architecture promotes modularity.

3.  React with Vite for Developer Experience: Provides a modern, fast, and enjoyable developer experience for the frontend, with hot module replacement and optimized builds.

4.  TypeScript End-to-End: Enforces type safety across the entire application, reducing bugs and improving maintainability, especially with shared types.

5.  PostgreSQL as Primary Data Store: A robust and reliable relational database suitable for structured data like user profiles, release metadata, and track information.

6.  Cloudinary for Media Management: Offloads the complexities of media storage, optimization, and delivery. This is crucial for handling large audio and image files efficiently and scalably.

7.  JWT for Stateless Authentication: Provides a secure and scalable way to handle user sessions without relying on server side state.

8.  Role Based Access Control: Implemented via Fastify hooks to ensure that only authorized users, ARTIST or ADMIN, can access specific API endpoints and perform actions.

9.  Simulated Asynchronous Processing: The processingService demonstrates how long running tasks like audio transcoding can be initiated in the background, allowing the API to respond quickly while the work is done asynchronously. This is a common pattern for scalable media platforms.

10. API Documentation with Swagger: Essential for developer collaboration and understanding the API surface.

11. Rate Limiting: A critical security and stability feature to prevent abuse and ensure fair usage of the API.

12. Separation of Concerns: Clear distinction between controllers, services, and plugins in the backend, and components, pages, and contexts in the frontend, promoting maintainability.

## Getting Started



### Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js v18 or higher
*   npm
*   PostgreSQL server running locally or accessible
*   Git


### 1. Clone the Repository

```bash
git clone https://github.com/g1ftmkyelu/muzik-release-manager.git
cd muzik-release-manager
```

### 2. Environment Variables

Create a .env file in the project root directory based on the .env.example provided. You will need to configure your PostgreSQL database connection and Cloudinary credentials.

```env
# .env in project root
NODE_ENV=development
PORT=6155

# PostgreSQL Database
DATABASE_URL=postgresql://username:passwor@localhost:5432/muzik_dbms

# JWT Secret - MUST be at least 32 characters long for security
JWT_SECRET=supersecretjwtkeythatisatleast32charslong

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Also, create a client/.env file based on client/.env.example:

```env
# client/.env in client directory
VITE_API_BASE_URL=http://localhost:6155
VITE_APP_NAME=muzik Release Manager
```

### 3. Install Dependencies

Run the installation script from the project root. This will install dependencies for both the server and client, and build the server.

For Linux/macOS:
```bash
./install.sh
```

For Windows:
```bash
install.bat
```

### 4. Database Setup

Ensure your PostgreSQL server is running and accessible using the DATABASE_URL provided in your .env file. Then, run the database setup script:

For Linux/macOS:
```bash
./setup-db.sh
```

For Windows:
```bash
setup-db.bat
```

To clean up the database and recreate it, you can use:

For Linux/macOS:
```bash
./cleanup-db.sh
```

For Windows:
```bash
cleanup-db.bat
```

### 5. Running the Application

You can run the application  both backend and frontend run natively.


For Linux/macOS:
```bash
./start.sh native
```

For Windows:
```bash
start.bat native
```

####  project ports

*   Backend API: http://localhost:6155
*   Frontend UI: http://localhost:3000
*   API Documentation with Swagger UI: http://localhost:6155/documentation

```

## Testing

The project includes unit tests for both the backend and frontend.

### Backend Tests with Jest
```bash
cd server
npm test
```

### Frontend Tests with Vitest
```bash
cd client
npm test
```

## Contributing

We welcome contributions to the Muzik Release Manager! Whether you're fixing bugs, improving documentation, or proposing new features, your help is appreciated.

### Getting Started

1. **Fork the Repository**
```bash
   git clone https://github.com/YOUR_USERNAME/muzik-release-manager.git
   cd muzik-release-manager
```

2. **Create a Branch**
```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
```

3. **Set Up Your Development Environment**
   Follow the [Getting Started](#getting-started) section to set up the project locally.

### Development Workflow

#### Code Style

- **TypeScript**: We use TypeScript for type safety across the entire stack.
- **Formatting**: Run `npm run format` before committing (if available).
- **Linting**: Ensure your code passes all linting checks with `npm run lint`.
- **Naming Conventions**:
  - Use `camelCase` for variables and functions
  - Use `PascalCase` for components, classes, and types
  - Use `UPPER_SNAKE_CASE` for constants and environment variables

#### Backend Development
```bash
cd server
npm run dev  # Start development server with hot reload
npm test     # Run tests
npm run build # Build TypeScript
```

**Backend Guidelines:**
- Place new routes in `src/routes/`
- Create services in `src/services/` for business logic
- Add controllers in `src/controllers/` for request handling
- Update Swagger documentation with JSDoc comments
- Write unit tests for new services and controllers
- Follow RESTful API conventions

#### Frontend Development
```bash
cd client
npm run dev   # Start development server
npm test      # Run tests
npm run build # Build for production
```

**Frontend Guidelines:**
- Create reusable components in `src/components/`
- Place page components in `src/pages/`
- Use React Context for global state management
- Follow the established component structure
- Ensure responsive design (mobile-first approach)
- Use Tailwind CSS utility classes consistently
- Write tests for complex components and logic

### Testing

- Write tests for all new features and bug fixes
- Ensure existing tests pass before submitting PR
- Aim for meaningful test coverage, not just high percentages

**Running Tests:**
```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# Run all tests
npm test # (from root if script exists)
```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add password reset functionality
fix(player): resolve audio playback issue on Safari
docs(readme): update installation instructions
refactor(api): simplify release approval logic
test(billing): add unit tests for payment integration
```

### Pull Request Process

1. **Update Documentation**
   - Update README.md if you've added new features
   - Add JSDoc comments for new functions/methods
   - Update API documentation if endpoints changed

2. **Test Your Changes**
```bash
   # Ensure all tests pass
   npm test
   
   # Test the full application flow
   ./start.sh native  # or start.bat native on Windows
```

3. **Create Pull Request**
   - Push your branch to your fork
   - Open a PR against the `main` branch
   - Fill out the PR template with:
     - Clear description of changes
     - Related issue numbers (if applicable)
     - Screenshots (for UI changes)
     - Testing steps

4. **PR Requirements**
   - All tests must pass
   - Code must be properly formatted and linted
   - No merge conflicts
   - At least one approving review (for collaborators)

### Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear and concise description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**:
   - OS (e.g., Ubuntu 20.04, Windows 11, macOS 13)
   - Node.js version
   - Browser (if frontend issue)
6. **Screenshots/Logs**: If applicable
7. **Possible Solution**: If you have suggestions

**Bug Report Template:**
```markdown
**Bug Description**
A clear description of the bug.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., Ubuntu 20.04]
- Node.js: [e.g., v18.16.0]
- Browser: [e.g., Chrome 120]

**Additional Context**
Any other relevant information.
```

### Suggesting Features

We love feature suggestions! When proposing new features:

1. **Search Existing Issues**: Check if the feature has been suggested before
2. **Provide Context**: Explain the problem you're trying to solve
3. **Describe the Solution**: Detail your proposed implementation
4. **Consider Alternatives**: Mention alternative approaches you've considered
5. **Additional Context**: Screenshots, mockups, or examples

**Feature Request Template:**
```markdown
**Feature Description**
Clear description of the feature.

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
What other approaches did you consider?

**Additional Context**
Mockups, examples, or related features.
```

### Code Review Process

- All submissions require code review
- Maintainers will review PRs within 3-5 business days
- Address feedback and update your PR accordingly
- Once approved, a maintainer will merge your PR

### Development Best Practices

1. **Keep PRs Focused**: One feature or fix per PR
2. **Write Clear Code**: Prioritize readability over cleverness
3. **Document Complex Logic**: Add comments for non-obvious code
4. **Handle Errors Gracefully**: Provide meaningful error messages
5. **Secure by Default**: Never commit secrets or credentials
6. **Performance Matters**: Consider performance implications
7. **Accessibility First**: Ensure UI is accessible (WCAG guidelines)

### Database Changes

If your contribution involves database schema changes:

1. Document the changes in the PR description
2. Update `database/init.sql` accordingly
3. Provide migration scripts if needed
4. Test with a fresh database setup

### API Changes

For API endpoint changes:

1. Update Swagger documentation
2. Update relevant TypeScript types in `shared/`
3. Document breaking changes clearly
4. Consider backwards compatibility
5. Update API examples and documentation

### Questions or Need Help?

- **Documentation**: Check the README and inline code comments
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for general questions
- **Contact**: Reach out to maintainers at [your-email@example.com]

### License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

### Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes for significant contributions
- CONTRIBUTORS.md file (if you'd like to be listed)

Thank you for contributing to Muzik Release Manager! 🎵


### Live demo 


if all goes as planned i should be able to host it on

https://vrms.giftmkyelu.dev

the api docs at
https://vrmsapi.giftmkyelu.dev/documentation


