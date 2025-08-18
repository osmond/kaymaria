# Local Database Setup

This project uses [Prisma](https://www.prisma.io/) with a PostgreSQL database.

## Setup

1. Copy `.env.local.example` to `.env.local` and set `DATABASE_URL` to point to your local PostgreSQL instance.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the database migrations:
   ```bash
   npm run db:migrate
   ```
4. Seed the database with sample data:
   ```bash
   npm run db:seed
   ```

After these steps the application can connect to your local database.

