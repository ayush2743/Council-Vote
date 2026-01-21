# Council Vote Backend

A secure proposal-based voting system backend built with Node.js, Express, Prisma, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database (configured in `.env`)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

3. **Run migrations (creates database tables):**
   ```bash
   npm run prisma:migrate
   ```

4. **Seed the database with sample data:**
   ```bash
   npm run prisma:seed
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

### Reset Database (Optional)

If you need to reset the database and start fresh:

```bash
npm run db:reset
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

The server will start on `http://localhost:5000`

## 📋 Sample Credentials

After seeding, you can login with these accounts:

- **Super Admin:** `admin@gmail.com` / `admin123`
- **Moderator 1:** `moderator1@gmail.com` / `mod123`
- **Moderator 2:** `moderator2@gmail.com` / `mod123`
- **Candidate 1:** `alice@gmail.com` / `student123`
- **Candidate 2:** `bob@gmail.com` / `student123`
- **Candidate 3:** `charlie@gmail.com` / `student123`

## 🔧 Environment Variables

Configure these in your `.env` file:

```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
PORT=5000
ALLOWED_EMAIL_DOMAINS=@gmail.com
```

### Allowed Email Domains

You can configure multiple allowed email domains (comma-separated):

```env
ALLOWED_EMAIL_DOMAINS=@gmail.com,@scaler.com,@university.edu
```

## 📚 API Endpoints

### Authentication

- `POST /api/login` - Login
- `POST /api/signup` - Register new user

### Super Admin APIs

- `GET /api/admin/positions/pending` - Get pending positions
- `POST /api/admin/positions/:id/approve` - Approve a position
- `POST /api/admin/positions/:id/reject` - Reject a position
- `GET /api/admin/positions/approved` - Get approved positions
- `POST /api/admin/positions/:id/schedule` - Set voting schedule
- `POST /api/admin/moderators/create` - Create moderator account
- `POST /api/admin/results/publish` - Publish results
- `GET /api/admin/results` - Get all results

### Moderator APIs

- `POST /api/moderator/positions` - Create a position
- `GET /api/moderator/positions/approved` - Get approved positions
- `GET /api/moderator/candidates/pending` - Get pending candidates
- `POST /api/moderator/candidates/:id/approve` - Approve candidate
- `POST /api/moderator/candidates/:id/reject` - Reject candidate

### Candidate/User APIs

- `GET /api/positions/available` - Get positions accepting applications
- `POST /api/candidate/apply` - Apply for a position
- `GET /api/positions/live` - Get live voting positions
- `POST /api/vote` - Vote for a candidate
- `GET /api/results/:positionId` - Get position results
- `GET /api/results` - Get all published results

## 🔐 Authentication

All protected routes require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 Database Schema

The system uses the following main entities:

- **Users** - Super admins, moderators, and candidates
- **Positions** - Election positions created by moderators
- **Candidate Proposals** - Applications from candidates
- **Moderator Actions** - Approval/rejection tracking
- **Votes** - Anonymous votes (no user_id stored)
- **Vote Status** - Prevents double voting

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Email domain validation
- Anonymous voting
- Double-vote prevention
- Password hashing with bcrypt

## 🎯 System Flow

1. **Position Creation**: Moderator creates position → Super Admin approves → Super Admin sets voting dates
2. **Candidate Application**: Candidates apply with manifesto → 2 moderators review → Approved/Rejected
3. **Voting**: Users vote anonymously during voting period
4. **Results**: Super Admin publishes results → Public can view

## 🛠️ Development

### Run in development mode:
```bash
npm run dev
```

### View database:
```bash
npm run prisma:studio
```

## 📝 Notes

- Votes are completely anonymous (no user_id stored)
- Each user can vote only once per position
- 2 moderator approvals/rejections required for candidate decisions
- Positions must be approved before accepting applications
- Results can only be viewed after super admin publishes them
