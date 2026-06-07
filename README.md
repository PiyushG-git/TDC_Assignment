# TDC Matchmaker Dashboard MVP

This is an MVP for the internal TDC Matchmaker Dashboard, built with the MERN stack and AI integrations.

## Tech Choices
- **Frontend**: React (Vite), Tailwind CSS v4, React Router, Recharts, Framer Motion. Chosen for high performance, modern premium UI capabilities, and rapid development.
- **Backend**: Node.js, Express, MongoDB (Mongoose). Chosen for scalable JSON handling, flexible schema (for complex biodata), and robust ecosystem.
- **AI Integration**: Google Gemini API via `@google/genai`. Chosen for fast, intelligent summarization, contextual matchmaking reasoning, and generating personalized introductions.

## Matching Logic
The custom Matching Engine (`backend/services/matchingEngine.js`) calculates a compatibility score (0-100) using realistic matrimonial heuristics:
- **Male Customers**: Scored higher for women who are younger or same age, shorter, and earn less or equal.
- **Female Customers**: Scored higher for men who are older or same age, taller, and earn equal or more.
- **Universal Scoring**: Points are added for matching views on children, relocation preferences, city match, religion, and diet preference. 
- Top 10 matches are returned, sorted by highest score.

## AI Usage
1. **AI Profile Summary**: Automatically generates a concise 1-sentence highlight reel for each profile when viewed.
2. **AI Compatibility Analysis**: Can compare two profiles and output a JSON schema with strengths, concerns, and a score.
3. **AI Match Introduction**: When a matchmaker clicks "Send Match", Gemini drafts a warm, personalized introduction email using both profiles' data.

## Assumptions
- Matchmakers authenticate via JWT to access the dashboard.
- Users of this system are strictly internal consultants, not the end clients.
- "Stitch UI" aesthetics imply a premium, modern, clean SaaS interface (using Slate, Purple, and Rose Gold accents).

## Sample Credentials
After running the seed script, you can log in with any of the 20 generated matchmaker accounts:
- **Username**: `matchmaker1`
- **Password**: `password123`

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI
- Google Gemini API Key

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Run the Seed Script to populate the DB with 20 matchmakers and 200 dummy profiles:
```bash
node seed.js
```

Start the Backend server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Start the Frontend development server:
```bash
npm run dev
```

---

## Deployment Guide

### Backend (Render)
1. Push the repository to GitHub.
2. On Render, create a new "Web Service" and connect the repository.
3. Set the Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add the Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`).

### Frontend (Vercel)
1. On Vercel, create a new Project and import the repository.
2. Set the Framework Preset to Vite.
3. Set the Root Directory to `frontend`.
4. Add the Environment Variable for your backend API if you changed the Axios baseURL (e.g., `VITE_API_URL`).
5. Deploy.
