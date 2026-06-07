# TDC Matchmaker Dashboard MVP

A production-quality internal CRM and matching engine built for the professional matchmaking consultants at The Date Crew (TDC). This application allows matchmakers to manage high-end clientele, track their journey, and leverage a sophisticated, culturally-aware, hybrid AI matching algorithm to suggest the best potential partners.

## Tech Stack
* **Frontend:** React + Vite, Tailwind CSS v4, React Router DOM, Axios
* **Backend:** Node.js, Express.js, MongoDB Atlas (Mongoose)
* **Authentication:** JWT (JSON Web Tokens)
* **AI Integration:** Google Gemini API (2.5-Flash)

---

## The Matchmaking Pipeline (Hybrid Architecture)

This project features a highly robust matching engine specifically tuned for the Indian matrimonial space. It uses a **Two-Way Hybrid Local + AI Pipeline** to ensure scalability, accuracy, and fairness.

### Step 1: Pre-Screening & DB Filter
When a matchmaker clicks "Run Engine" for a specific client, the backend first queries the database for all opposite-gender profiles who have an active status (`Searching` or `New Lead`). 

### Step 2: The Two-Way Local Algorithm
To save AI tokens and prevent latency/hallucinations, the system runs a deterministic 10-dimension local algorithm on the filtered pool.
It calculates **reciprocal compatibility**:
`Final Local Score = (Score: Target -> Candidate + Score: Candidate -> Target) / 2`

**The 10 Dimensions Evaluated:**
1. **Dealbreakers:** Instantly filters out conflicting views on having kids or extreme dietary friction (e.g., Veg vs Non-Veg).
2. **Religion (14 pts) & Caste (8 pts):** High-priority cultural filters.
3. **Age (16 pts):** Gender-directional scoring (rewards traditional 2-4 year age gaps but softened for progressive couples).
4. **Income (12 pts):** Parity-friendly logic that doesn't over-punish high-earning women.
5. **Education (7 pts):** Directional tier matching (High School → PhD).
6. **Height (7 pts):** Includes a soft-floor so tall women aren't automatically excluded.
7. **Family Values (14 pts):** Alignment on joint/nuclear family setups and marital history.
8. **Lifestyle (14 pts):** Diet, Smoking, Drinking, and overlapping Hobby calculations.
9. **Location (6 pts):** Current city and willingness to relocate.

### Step 3: AI Ranking & Tie-Breaking
The local engine isolates the **Top 10 Matches**. Only these 10 profiles (stripped of heavy metadata) are sent to the Google Gemini API.
* Gemini acts as an executive matchmaker, analyzing the pairs.
* It returns an AI Score and a personalized 1-sentence reasoning.
* **Final Blend:** The ultimate score is `90% Local Algo + 10% AI Score`. This prevents AI hallucinations from ruining solid matches, while keeping the AI's personalized reasoning for the UI.

### Step 4: AI Fallbacks
If the Gemini API hits a rate limit (429) or goes down, the backend gracefully catches the error and seamlessly falls back to 100% Local Engine scoring, meaning the UI never breaks.

---

## Features & User Flow

1. **Secure Login:** Matchmakers log in using secure credentials. (e.g., `matchmaker1` / `password123`).
2. **Dashboard Overview:** Displays high-level funnel metrics, active matches, and new leads.
3. **Customer CRM:** A searchable, filterable list of all clients.
4. **Detailed Profile View:** 
   * Complete Biodata.
   * Auto-generated AI Profile Summaries.
   * A persistent Notes section for consultants to log calls/updates.
5. **Match Suggestion Panel:**
   * Runs the engine and displays the Top 10 candidates.
   * Features animated progress bars breaking down the score for each dimension (Green=Strong, Gold=Moderate, Grey=Weak).
6. **Review & Send Match:**
   * Matchmakers can click into a match to see a side-by-side photo comparison.
   * Triggers an AI Compatibility Analysis (Strengths & Considerations).
   * Generates a personalized introductory email draft that the matchmaker can send to both parties.

---

## Setup & Installation

### Prerequisites
* Node.js (v18+)
* MongoDB Atlas Cluster URI
* Google Gemini API Key

### 1. Clone & Install
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Seed the Database
To test the matching engine, you need realistic data. Run the seed script to generate 20 matchmaker accounts and 200 diverse customer profiles:
```bash
cd backend
node seed.js
```

### 4. Run the Application
You need to run both the frontend and backend servers simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### 5. Access
Open your browser and navigate to `http://localhost:5173`.
Login using:
* **Username:** `matchmaker1`
* **Password:** `password123`
