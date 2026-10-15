# PrimeWave Resource Reservation Management System

A full-stack web application developed for the PrimeWave Lab (Pvt) Ltd Software Engineering Internship Technical Assessment.

The system provides a centralized way to manage shared resources and reservations, check resource availability, and reduce scheduling conflicts.

## Overview

Organizations often manage shared facilities through informal communication and manual records. This can lead to overlapping reservations and uncertainty about resource availability.

The Resource Reservation Management System addresses this problem by providing a web-based platform for resource management, reservation scheduling, and availability checking.

## Features

### Authentication and Access Control
- User registration and login.
- Secure password hashing.
- Role-based access for administrators and regular users.
- Protected pages and API endpoints.

### Resource Management
- Administrators can add resources.
- Resources include details such as name, type, location, and description.
- Active resources are available for regular users to browse.

### Reservation Management
- Users can create reservations for available resources.
- Users can view and cancel their own reservations.
- Administrators can view reservations across users.
- Reservation requests are checked for overlapping confirmed bookings.

### Availability and Dashboard
- Check resource availability for a selected time period.
- View resource and reservation information through the dashboard.
- Display reservation and resource statistics.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js App Router | Full-stack web framework |
| TypeScript | Type-safe application development |
| React | User interface |
| Tailwind CSS | Styling |
| PostgreSQL | Persistent relational database |
| Prisma ORM | Database access and migrations |
| Auth.js / NextAuth | Authentication |
| bcryptjs | Password hashing |
| Git and GitHub | Version control and source code hosting |

## Prerequisites

Install the following before setting up the project:

- Node.js and npm
- PostgreSQL
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ishqafathima/resource-reservation-managment.git
cd resource-reservation-managment
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

Configure the PostgreSQL connection string and authentication secret required by the application.

Example:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/YOUR_DATABASE"
AUTH_SECRET="YOUR_AUTH_SECRET"
```

Replace the example values with your own local credentials. Use the variable names expected by the project configuration.

**Security:** Never commit `.env` files, database passwords, or authentication secrets to GitHub.

### 4. Create the database

Create a PostgreSQL database for the application and ensure that PostgreSQL is running.

### 5. Apply database migrations

Run the following command to apply the existing Prisma migrations:

```bash
npx prisma migrate deploy
```

Generate the Prisma Client if required:

```bash
npx prisma generate
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Build for production

To check whether the application builds successfully, run:

```bash
npm run build
```

## User Roles

### Administrator
- Add and manage resources.
- View reservations across users.
- Manage reservations according to the application's permissions.

### Regular User
- Register and log in.
- Browse active resources.
- Check resource availability.
- Create and view reservations.
- Cancel their own reservations.

## Project Structure

```text
app/
├── api/
│   ├── auth/
│   ├── register/
│   ├── reservations/
│   └── resources/
├── availability/
├── login/
├── register/
├── reservations/
├── resources/
├── layout.tsx
└── page.tsx

lib/
└── prisma.ts

prisma/
├── migrations/
└── schema.prisma

scripts/
auth.ts
prisma7.config.ts
package.json
README.md
```

## Database Design

The application uses PostgreSQL for persistent storage and Prisma ORM to define and manage its database schema.

The database includes entities for users, resources, and reservations, with relationships that associate reservations with their users and selected resources.

**Entity Relationship (ER) Diagram:** (https://mermaid.live/edit#pako:eNq1U01PwkAQ_SubOQORrRbojSgmxEQNigfTy9odYUO728xu_ar8dwcEgqYaE3UOzbx5b153ZtsaMqcREkA6MWpGqkgptYJjejWaCPfabrtaTEYMbobX44tzkYhCLdBvZUxdTCfHI_HaJJ2rtfCDZ71FqzA2CKPF5dl-0QcydiasKrChjIUyuZg2dZTK-0dHep-auBwF8WO_qFXAYAoUGSGnehga2arUH9nl_jS70X87UXgum8q5y1QwzooUXLlKVJ5Cg06jz8iU30rvHG9AWWH8MAvm4V-Wsbv3H-8jmPDFvfigKFyboplFqz9zG0fuC5X_i-m2Zyf0rqIMx1qcnn0mK4-0JhoXv4QWzMhoSAJV2IICib9dhlCvBCmEOfIUkHBKqKuntla0aGcud8QudtVfKnvrXLG1IFfN5pDcq9wzej_05sfdVYnXg3TsKhsgkd21ByQ1PDHqHXS6Ufco7sreQA7iQQueIYlkJ46klP3-EZP9KF624GX90oNOv3c44IhZ0ItlJJdvazdJ_A)

## Assessment Demonstration

**Demonstration Video:** [Add the video link here when available]
Get-Content prisma/schema.prisma
The demonstration should show the main workflows, including authentication, resource management, availability checking, reservation creation, and reservation management.

## Future Improvements

- Stronger protection against simultaneous conflicting reservation requests.
- Automated tests for API endpoints and reservation rules.
- Improved reservation filtering and reporting.
- More detailed operational monitoring and error handling.

## Author
Fathima Ishka

GitHub: [@ishqafathima](https://github.com/ishqafathima)

## Project Information

Developed as part of the PrimeWave Lab (Pvt) Ltd Software Engineering Internship Technical Assessment.

Repository: [Resource Reservation Management System](https://github.com/ishqafathima/resource-reservation-managment)