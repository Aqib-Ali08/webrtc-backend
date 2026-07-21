# Syncora Backend API ⚙️🚀

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black.svg)](https://socket.io/)

> **Syncora Backend** is the robust server-side architecture powering the Syncora Video Conferencing & Messaging Application. It handles RESTful API requests, real-time WebSocket communication for messaging, and WebRTC signaling for peer-to-peer media streams.

---

## 💡 System Architecture

The backend is designed with a clear separation of concerns, following the **MVC (Model-View-Controller)** pattern adapted for REST APIs. 
- **REST API:** Handles authentication, user management, meeting scheduling, connections, and saving chat logs.
- **WebSocket Server (Socket.io):** Acts as the **Signaling Server** for WebRTC (exchanging SDP and ICE candidates) and handles the real-time delivery of chat messages and notifications.
- **Database (MongoDB):** Provides persistent storage for user profiles, encrypted passwords, chat history, and meeting schedules.

---

## 🚀 Key Features

- **JWT-Based Authentication:** Secure user login and registration with token-based authorization and password hashing (`bcrypt`).
- **WebRTC Signaling Room:** Dedicated socket namespaces and rooms to handle WebRTC handshakes (offers, answers, ICE candidates) seamlessly between multiple peers.
- **Real-Time Messaging:** Instant delivery of chat messages across private and group channels using `socket.io`.
- **Connection/Contact Management:** API endpoints to send, accept, and reject friend requests (connections).
- **Meeting Scheduling & Notes:** CRUD operations for user schedules and personal/meeting notes.

## 🛠️ Technology Stack

**Core Infrastructure**
- **Node.js** & **Express.js** (API Framework)
- **MongoDB** & **Mongoose** (Database & ODM)

**Real-Time & Signaling**
- **Socket.io** (WebSocket communication)

**Security & Utilities**
- **JSON Web Tokens (JWT)** (Authentication)
- **Bcrypt** (Password Hashing)
- **Cors** (Cross-Origin Resource Sharing)
- **Dotenv** (Environment variable management)
- **Morgan** (HTTP request logging)

## 📂 Project Structure

```
src/
├── config/         # Database connection and environment configurations
├── constants/      # Shared constants and enums
├── controllers/    # Business logic for REST API endpoints
├── middlewares/    # Express middlewares (e.g., auth, error handling)
├── models/         # Mongoose schemas (User, Message, Meeting, etc.)
├── routes/         # Express route definitions mapped to controllers
├── sockets/        # Socket.io event handlers (signaling, chat)
├── utils/          # Helper functions and utilities
├── app.js          # Express app configuration
└── server.js       # HTTP Server and Socket.io initialization
```

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd webrtc-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:5173  # URL of your frontend app
   ```

4. **Run the server:**
   - **Development mode** (with nodemon):
     ```bash
     npm run dev
     ```
   - **Production mode:**
     ```bash
     npm start
     ```

## 📈 Challenges & Learnings

- **WebRTC Signaling Logic:** Architecting the socket events to ensure race conditions don't occur when peers attempt to connect simultaneously. Implementing proper "room" logic so streams don't leak to unintended users.
- **Real-Time vs. REST:** Learning when to persist data via standard REST endpoints (like fetching chat history) vs. when to push data instantly via WebSockets (like a new incoming message).
- **Security:** Securing both REST endpoints (via JWT middleware) and Socket connections (authenticating the socket handshake) to prevent unauthorized access to video rooms and chats.