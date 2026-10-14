# QuickMe

A full-stack social media app for sharing photos and videos, with likes, comments, user search, and real-time one-to-one messaging.

## Features

- **Authentication** via [Clerk](https://clerk.com), with protected routes on the frontend and an auth middleware on the API
- **Photo and video posts** uploaded to Cloudinary, with optional captions
- **Feed** showing all posts, newest first, with inline video playback
- **Likes** with optimistic UI updates
- **Comments** with an emoji picker
- **User search** and public proffgvbfgbile pages with a post grid
- **Real-time direct messages** over Socket.IO, with message history stored in MongoDB

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Lucide icons |
| Backend | Node.js, Express 5, TypeScript (run with `tsx`) |
| Database | MongoDB with Mongoose |
| Auth | Clerk (`@clerk/clerk-react`, `@clerk/express`) |
| Media storage | Cloudinary, with Multer for upload handling |
| Real-time | Socket.IO |

## Project Structure

```
QuickMe/
├── bd/                  # Backend (Express + Socket.IO)
│   ├── controller/      # Message, Upload, User handlers
│   ├── database/        # MongoDB, Cloudinary, Multer setup
│   ├── middleware/      # Clerk auth middleware
│   ├── models/          # User, Post, Message schemas
│   ├── routes/          # API routes
│   └── server.ts        # Entry point (port 8080)
├── fd/                  # Frontend (React + Vite)
│   └── src/
│       ├── components/  # Footer, ProtectedRoute, etc.
│       └── pages/       # Home, Upload, Search, User, Message, LoginPage
└── package.json         # Root scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [MongoDB](https://www.mongodb.com/) database (local or Atlas)
- A [Clerk](https://clerk.com) application
- A [Cloudinary](https://cloudinary.com) account

### Installation

```bash
git clone https://github.com/Rohit0265/QuickMe.git
cd QuickMe
npm run install:all
```

### Environment Variables

Create `bd/.env`:

```env
MONGODB_URL=your_mongodb_connection_string
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_api_secret
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

Create `fd/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Run in Development

Start the backend (port 8080) and the frontend (port 5173) in two terminals:

```bash
# Terminal 1: backend
cd bd
npm run dev

# Terminal 2: frontend
cd fd
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` requests to the backend.

### Production Build

```bash
npm run build:frontend   # builds fd/dist
npm start                # serves the API and the built frontend on port 8080
```

## API Overview

All routes require a signed-in Clerk session unless noted.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/sync` | Create or sync the user record from Clerk |
| GET | `/api/user/search` | Search users |
| GET | `/api/user/profile/:profileId?` | Get a profile and its posts |
| POST | `/api/upload` | Upload an image or video post |
| GET | `/api/upload` | Get the feed |
| POST | `/api/upload/:postId/like` | Toggle like |
| POST | `/api/upload/:postId/comment` | Add a comment |
| GET | `/api/messages/users` | List users to message |
| GET | `/api/messages/:recipientId` | Get conversation history |
| POST | `/api/messages` | Send a message (broadcast via Socket.IO) |

## Deployment Notes

`fd/netlify.toml` and `fd/vercel.json` proxy `/api` and `/socket.io` to a separately hosted backend. Replace the backend URL in whichever file you use. The backend's CORS and Socket.IO origin are currently set to `http://localhost:5173` in `bd/server.ts`, so update them for your deployed frontend URL.

## Known Limitations

- Follow and unfollow are not implemented yet. Follower and following counts are displayed on profiles, but there is no endpoint to change them.
- The "save post" bookmark on the feed is client-side state only and is not persisted.

## Author

**Rohit Mathur** · [GitHub](https://github.com/Rohit0265) · [Portfolio](https://myportfolio-rsm.in)
