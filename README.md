# Council Vote - Campus Voting & Proposal System

A secure, role-based voting platform for campus elections built with React Native and Node.js. This system enables transparent candidate proposals, multi-moderator approval workflows, anonymous voting, and result publication.

---

## 📋 Problem Statement

Traditional campus elections often face challenges with:
- **Lack of transparency** in candidate approval processes
- **Difficulty in managing** multiple positions and applications simultaneously
- **Security concerns** around vote manipulation and double voting
- **Manual coordination** between administrators, moderators, and candidates
- **Limited accessibility** for students to participate in the voting process

This system solves these problems by providing a **secure, mobile-first platform** that ensures:
- ✅ Anonymous voting with double-vote prevention
- ✅ Multi-moderator approval workflow (requires 2 moderators)
- ✅ Role-based access control (Super Admin, Moderator, Candidate)
- ✅ Transparent result publication
- ✅ Real-time position and candidate management

---

## 🛠️ Tech Stack Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM for database management
- **PostgreSQL** - Relational database
- **JWT (jsonwebtoken)** - Authentication
- **bcrypt** - Password hashing
- **TypeScript** - Type safety

### Frontend
- **React Native** - Mobile app framework
- **Expo** - Development platform
- **Expo Router** - File-based routing
- **NativeWind** - Tailwind CSS for React Native
- **TypeScript** - Type safety
- **AsyncStorage** - Local data persistence
- **Axios** - HTTP client

### Development Tools
- **Prisma Studio** - Database GUI
- **Expo Go** - Mobile testing
- **ESLint** - Code linting

---

## ✨ Features Implemented

### 🔐 Authentication & Authorization
- JWT-based authentication with secure token management
- Role-based access control (RBAC) with three roles:
  - **Super Admin**: System-wide control
  - **Moderator**: Position and candidate management
  - **Candidate**: Apply, vote, and view results
- Email domain validation for institutional access
- Persistent login sessions

### 👑 Super Admin Features
- Approve/reject positions created by moderators
- Set voting schedules (start and end dates)
- Create moderator accounts
- Publish voting results
- View system-wide statistics
- Monitor all positions and candidates

### 🛡️ Moderator Features
- Create positions with application deadlines
- Review candidate proposals
- Approve/reject candidates (requires 2 moderators for decision)
- View approved positions
- Track moderator actions

### 🎓 Candidate/Student Features
- Browse available positions accepting applications
- Apply for positions with manifesto
- Vote anonymously during voting period
- View published results
- Track application status
- One vote per position enforcement

### 🔒 Security Features
- Anonymous voting (no user_id stored in votes)
- Double-vote prevention mechanism
- Password hashing with bcrypt
- JWT token expiration
- Role-based middleware protection
- Email domain whitelisting

### 📱 Mobile App Features
- Beautiful, modern UI with custom color scheme
- Pull-to-refresh on all lists
- Real-time status updates
- Responsive design
- Smooth animations and transitions

---

## 🚀 How to Run the Project Locally

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**
- **Expo CLI** (for mobile app)
- **iOS Simulator** (Mac) or **Android Studio** (for mobile testing)

---

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd council-vote
```

---

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd council-vote-backend
```

#### 2.2 Install Dependencies
```bash
npm install
```

#### 2.3 Configure Environment Variables
Create a `.env` file in the `council-vote-backend` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/council_vote
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=5000
ALLOWED_EMAIL_DOMAINS=@gmail.com
```

**Important:** Replace `username`, `password`, and database name with your PostgreSQL credentials.

#### 2.4 Database Setup

Reset and initialize the database:
```bash
npm run db:reset
```

Generate Prisma client:
```bash
npm run prisma:generate
```

Run migrations:
```bash
npm run prisma:migrate
```

Seed the database with sample data:
```bash
npm run prisma:seed
```

#### 2.5 Start the Backend Server
```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

#### 2.6 Sample Credentials (After Seeding)

- **Super Admin:** `admin@gmail.com` / `admin123`
- **Moderator 1:** `moderator1@gmail.com` / `mod123`
- **Moderator 2:** `moderator2@gmail.com` / `mod123`
- **Candidate 1:** `alice@gmail.com` / `student123`
- **Candidate 2:** `bob@gmail.com` / `student123`
- **Candidate 3:** `charlie@gmail.com` / `student123`

---

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory
Open a new terminal window:
```bash
cd council-vote-frontend
```

#### 3.2 Install Dependencies
```bash
npm install
```

#### 3.3 Configure Environment Variables
Create a `.env` file in the `council-vote-frontend` directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

**For physical device testing:** Replace `localhost` with your computer's local IP address (e.g., `http://192.168.1.100:5000/api`)

#### 3.4 Start the Mobile App
```bash
npm start
```

#### 3.5 Run on Device/Simulator

After starting, press:
- **`i`** - Open in iOS Simulator (Mac only)
- **`a`** - Open in Android Emulator
- **`w`** - Open in web browser

Or scan the QR code with **Expo Go** app on your physical device.

---

### Step 4: Verify Installation

1. Open the mobile app
2. Login with one of the sample credentials
3. Test the features based on your role

---

### 🔐 Authentication Endpoints

#### Login
```http
POST /login
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "Super Admin",
    "email": "admin@gmail.com",
    "role": "SUPER_ADMIN"
  },
  "token": "jwt_token_here"
}
```

#### Sign Up
```http
POST /signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "password123"
}
```

---

### 👑 Super Admin Endpoints

#### Get Pending Positions
```http
GET /admin/positions/pending
Authorization: Bearer <admin_token>
```

#### Approve Position
```http
POST /admin/positions/:id/approve
Authorization: Bearer <admin_token>
```

#### Reject Position
```http
POST /admin/positions/:id/reject
Authorization: Bearer <admin_token>
```

#### Get Approved Positions
```http
GET /admin/positions/approved
Authorization: Bearer <admin_token>
```

#### Set Voting Schedule
```http
POST /admin/positions/:id/schedule
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "votingStartDate": "2025-02-05T00:00:00Z",
  "votingEndDate": "2025-02-10T23:59:59Z"
}
```

#### Create Moderator Account
```http
POST /admin/moderators/create
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Moderator",
  "email": "newmod@gmail.com",
  "password": "mod123"
}
```

#### Publish Results
```http
POST /admin/results/publish
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "positionIds": ["position_id_1", "position_id_2"]
}
```

#### Get All Results (Admin View)
```http
GET /admin/results
Authorization: Bearer <admin_token>
```

---

### 🛡️ Moderator Endpoints

#### Create Position
```http
POST /moderator/positions
Authorization: Bearer <moderator_token>
Content-Type: application/json

{
  "name": "Secretary",
  "description": "Manage documentation and communication",
  "applicationEndDate": "2025-02-01T23:59:59Z"
}
```

#### Get Approved Positions
```http
GET /moderator/positions/approved
Authorization: Bearer <moderator_token>
```

#### Get Pending Candidates
```http
GET /moderator/candidates/pending
Authorization: Bearer <moderator_token>
```

#### Approve Candidate
```http
POST /moderator/candidates/:id/approve
Authorization: Bearer <moderator_token>
```

#### Reject Candidate
```http
POST /moderator/candidates/:id/reject
Authorization: Bearer <moderator_token>
```

---

### 🎓 Candidate/User Endpoints

#### Get Available Positions (Accepting Applications)
```http
GET /positions/available
Authorization: Bearer <candidate_token>
```

#### Apply for Position
```http
POST /candidate/apply
Authorization: Bearer <candidate_token>
Content-Type: application/json

{
  "positionId": "position_id_here",
  "manifesto": "I am passionate about serving the student community..."
}
```

#### Get Live Voting Positions
```http
GET /positions/live
Authorization: Bearer <candidate_token>
```

#### Vote for Candidate
```http
POST /vote
Authorization: Bearer <candidate_token>
Content-Type: application/json

{
  "candidateId": "candidate_proposal_id"
}
```

#### Get Position Results
```http
GET /results/:positionId
```

#### Get All Published Results
```http
GET /results
```

---

### 📊 Response Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 409 | Conflict (duplicate/already voted) |
| 500 | Internal server error |

---

## 🧪 Testing the System

### Complete Test Flow

1. **Login as Moderator** (`moderator1@gmail.com` / `mod123`)
   - Create a new position

2. **Login as Super Admin** (`admin@gmail.com` / `admin123`)
   - Approve the position
   - Set voting schedule

3. **Login as Candidate** (`alice@gmail.com` / `student123`)
   - Apply for the position with manifesto

4. **Login as Moderator 1** (`moderator1@gmail.com`)
   - Approve Alice's application

5. **Login as Moderator 2** (`moderator2@gmail.com`)
   - Approve Alice's application (now APPROVED)

6. **Login as Another Candidate** (`bob@gmail.com` / `student123`)
   - Vote for Alice

7. **Login as Super Admin**
   - Publish results

8. **View Results** (any user or public)
   - Check vote counts

---

## 🔧 Troubleshooting

### Backend Issues

**Database connection error:**
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists

**Port already in use:**
- Change `PORT` in `.env`
- Kill process using port 5000: `lsof -ti:5000 | xargs kill`

### Frontend Issues

**API not connecting:**
- Ensure backend is running on port 5000
- Check `EXPO_PUBLIC_API_URL` in `.env`
- For physical device, use local IP instead of localhost

**Fonts not loading:**
- Check internet connection (Google Fonts)
- Clear app cache and restart

**App crashes on startup:**
- Clear Metro bundler cache: `npm start -- --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`

---

**Made with React Native & Node.js**
