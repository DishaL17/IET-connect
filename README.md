# IET Connect - Campus Communication & Marketplace Portal

IET Connect is a modern, unified campus collaboration platform designed for students and student organizations. It features a marketplace (for renting and selling items), a lost-and-found system, real-time messaging, administrative verification controls, and campus announcements.

---

## 🚀 Key Features

* **Real-time Messaging**: Fully functional private messaging and conversations supported by Socket.io, including real-time unread count badges on the sidebar and message histories.
* **Campus Marketplace**: List items to rent or sell, browse active listings, and contact sellers directly.
* **Lost & Found System**: Report lost or found campus belongings with custom labels and status indicators.
* **Announcements & Clubs**: Broadcast notices from approved clubs, manage student organization approvals, and view pending organization requests.
* **Role Verification Cards**: Interactive Student and Club/Organization verification forms. Requests are reviewed and verified directly by the Global Admin.
* **Global Admin Approvals**: Verification interface for site administrators to review, approve, or reject student registration and club verification requests.

---

## 🛠️ Technology Stack

* **Frontend**: Vanilla HTML5, CSS3 (Custom Responsive Flexbox/Grid layouts), Vanilla JavaScript (ES6+), FontAwesome & Flaticon icons.
* **Backend**: Node.js, Express, Socket.io (WebSockets).
* **Database**: MongoDB (via Mongoose ODM).

---

## 📁 Project Structure

```text
campus-connect/
├── cc-backend/                 # Node.js Express server
│   ├── config/                 # Database configurations
│   ├── models/                 # Mongoose schemas (User, Message, Item, Announcement, etc.)
│   ├── routes/                 # Express REST endpoint files
│   ├── server.js               # Entry script & WebSocket handlers
│   └── .env                    # Local environment secrets
└── cc-frontend/                # Client-side static files
    ├── home/                   # Dashboard & activity feed
    ├── item/                   # Market post lists and upload forms
    ├── message/                # Chat rooms & inbox views
    ├── announcement/           # Bulletins, admin approvals & club listings
    ├── setting/                # Edit profile, security, and verification forms
    ├── dash.css                # Global UI layout and variables
    ├── common.js               # Dynamic path routing & user session syncs
    ├── loginpage.html          # Authentication entry
    └── register.html           # Student registration page
```

---

## ⚙️ Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) installed locally.
* A running [MongoDB](https://www.mongodb.com/) instance (locally or via MongoDB Atlas).

### 1. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd cc-backend
   ```
2. Install required dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of `/cc-backend` and configure your environment variables:
   ```env
   MONGO_URI="your-mongodb-connection-string"
   PORT=5000
   JWT_SECRET="your-secure-jwt-secret-key"
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 2. Frontend Launch
1. Open the `cc-frontend/loginpage.html` file directly in your browser, or serve it using a local dev server (e.g. VS Code Live Server).
2. Log in using your registered credentials. Note: By default, registrations are restricted to email addresses containing `"ietdavv"`.

---

## 🌐 Production Deployment
For deploying the app to staging or production environments (such as Render, Netlify, or Vercel), refer to the detailed deployment guide for configuring the database connection strings and updating `window.API_BASE_URL` inside `common.js`.
