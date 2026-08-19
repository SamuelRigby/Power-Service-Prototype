# Software Stack

Python (FastAPI)
JavaScript/TypeScript (React and Next.js)
MongoDB
Docker Swarm
nginx
GitHub
REST and SOAP Integrations

# Project Structure

Power-Service-Prototype/
├── backend/          (FastAPI)
├── frontend/         (Next.js)
├── nginx/            (config files)
├── docker-compose.yml
├── docker-stack.yml  (for Swarm)
├── README.md
├── CLAUDE.md
└── PLAN.md

PLAN.md (this document) is the feature spec. CLAUDE.md is ongoing project memory: coding conventions, decisions made during the build, and gotchas discovered along the way.

# Build Order

1. FastAPI backend skeleton + MongoDB connection (motor).
2. Data models and CRUD endpoints for customers and power sources.
3. Authentication (signup/login).
4. Weekly power scheduling grid endpoints.
5. Mock SOAP endpoint + FastAPI integration.
6. Next.js frontend: home page.
7. Next.js frontend: login/signup pages.
8. Next.js frontend: service pages.
9. Docker Compose for local development.
10. Docker Swarm stack file + nginx reverse proxy.
11. Polish, README, deployment testing.

# Terminology

"Client" refers to a logged-in site user (e.g., a utility employee/admin). "Customer" refers to a utility customer managed by a client, not a site user.

# Features

The site should have a home page for visitors, a login/signup page for account creation and logging in, and a service page for clients who are logged in. The signup and login should only require a username and password since this is a prototype website. The service provides clients with a modifiable list of customers, a modifiable list of power sources, and a static, cyclical weekly power scheduling grid (Sunday through Saturday, repeating every week with no date attached) that enables choosing power sources for the hours of all seven days, with each day having twenty-four hourly slots.

# Authentication

Passwords hashed with bcrypt before storage. On successful login, issue a JWT. All /service routes require a valid JWT.

# Data Models for MongoDB

For site users (clients), only a username and password should be saved (unique usernames only, passwords stored hashed).

For each client's list of customers, the following information should be saved for each: service account number (unique), ZIP code, state, city, street address, kilowatt-hours consumed for the current monthly cycle, lifetime kilowatt-hours consumed, payment history (array of {date, amount} objects), value of total overdue payment in dollars and cents (0 if not overdue).

For each client's list of power sources, the following information should be saved for each: power type (wind, hydro, solar, geothermal, natural gas, coal, nuclear, waste heat), instantaneous output in megawatts, and actual output in megawatt-hours.

For each client's weekly power scheduling grid, save exactly one document per client (no date or week identifier), structured as a mapping of day to hour to selected power source ID (e.g., {day: {hour: power_source_id}}), where day is an integer 0–6 (0 = Sunday) and hour is an integer 0–23. This schedule is a recurring template reused every week, not tied to any specific calendar week.

# SOAP Integration

Since a real legacy SOAP service isn't available, build a mock SOAP endpoint (e.g. simulating a legacy meter-reading system) that FastAPI calls to demonstrate REST-to-SOAP integration handling.

# Containerization

The project should be containerized and Swarm-deployable. Local development uses docker-compose.yml; production-style deployment uses docker-stack.yml with nginx as a reverse proxy in front of the frontend and backend.

# API/REST Conventions

REST endpoints follow /api/v1/resource convention and JSON request/response bodies.