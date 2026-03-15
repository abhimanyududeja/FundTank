# FundTank

A startup simulation platform where users roleplay as entrepreneurs and investors in a fictional startup ecosystem. Pitch your startup ideas, allocate virtual capital, vote on ventures, and compete on leaderboards. Think Shark Tank meets a stock market game.

![FundTank Screenshot](screenshot.png)

## Authors

- **Kashish Rahulbhai Khatri** (Startup Pitches & Voting story)
- **Abhimanyu Dudeja** (Investment Portfolio & Analytics story)

## Class

CS5610 Web Development, Northeastern University, Khoury College of Computer Sciences

Class Link: [https://johnguerra.co/classes/webDevelopment_online_spring_2026/](https://johnguerra.co/classes/webDevelopment_online_spring_2026/)

## Project Objective

FundTank lets users experience startup culture through simulation. Entrepreneurs create startup pitches with business plans, categories, and budget breakdowns. Investors receive $100,000 in virtual currency to allocate across startups and vote on which ventures deserve funding. Startups are ranked by total funding and community votes. Investors track their portfolio, estimated returns, and compare strategies on a global leaderboard.

## Live Demo

Deployed at: [https://fundtank.onrender.com](https://fundtank.onrender.com)

Demo video: [YouTube Link](https://youtube.com)

## Features

### Startup Pitches & Voting (Kashish)

- Create startup pitches with name, tagline, description, category, funding goal, and budget breakdown
- Edit and delete your own pitches
- Browse and filter pitches by category, popularity, and search terms
- Vote on pitches (Fund / Pass) to influence which startups get funded
- View pitch stats including votes, funding received, and investor comments
- Startup leaderboard ranked by funding secured and vote approval ratio

### Investment Portfolio & Analytics (Abhimanyu)

- Create an investor profile with display name, investment strategy, and risk preference
- Allocate virtual currency from your $100K budget into startups
- View your portfolio with all investments, estimated returns, and ROI
- Leave comments and notes on startup pitches with threaded replies
- View any investor's public profile with portfolio history and returns
- Global investor leaderboard ranked by returns and successful picks

## Tech Stack

- **Frontend:** React 18, React Router v6, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB (4 collections: users, pitches, investments, comments)
- **Auth:** JSON Web Tokens (JWT) with bcrypt password hashing
- **Styling:** Custom CSS with CSS variables, DM Sans + Space Mono fonts
- **Linting:** ESLint (flat config) + Prettier

## Design

- **Fonts:** DM Sans (body text) and Space Mono (monospace accents), loaded from Google Fonts
- **Color Palette:** Dark theme with a deep navy background (#0a0e1a), cyan (#22d3ee) as primary accent, pink (#f472b6) for secondary highlights, green (#34d399) for positive/success states, amber (#fbbf24) for warnings, and red (#f87171) for destructive/cancel actions. Approval and cancel colors are consistent across the entire app.
- **Layout:** Top left hierarchy with the brand logo and navigation. Hero section draws attention first, followed by stats and featured pitches. Cards use consistent border radius, padding, and hover states throughout.

## Screenshots

> Add screenshots of the Home page, Pitch List, Pitch Detail, Portfolio, Leaderboard, and Profile pages before submission.

## Instructions to Build

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB instance)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/fundtank.git
cd fundtank
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (use `.env.example` as reference):

```
MONGO_URI=your_mongodb_connection_string
DB_NAME=fundtank
JWT_SECRET=your_secret_key_here
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Seed the database with synthetic data (1200+ records):

```bash
npm run seed
```

Start the backend server:

```bash
npm start
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Test login

After seeding, you can log in with:

- Email: `alex.chen0@example.com`
- Password: `password123`

### 5. Linting

```bash
# Frontend
cd frontend
npm run lint

# Backend
cd backend
npm run lint
```

### 6. Production build

```bash
cd frontend
npm run build
```

The built files go to `frontend/dist/`. The Express server serves these static files in production.

## Database

FundTank uses 4 MongoDB collections with full CRUD operations:

| Collection    | Create | Read | Update | Delete | Records |
|---------------|--------|------|--------|--------|---------|
| users         | Register | Profile, Leaderboard | Edit profile | N/A | 50+ |
| pitches       | Create pitch | Browse, Detail, Leaderboard | Edit pitch | Delete pitch | 200+ |
| investments   | Invest in startup | Portfolio, Analytics | Edit amount/notes | Withdraw | 800+ |
| comments      | Post comment | View on pitch | Edit comment | Delete comment | 150+ |

Total synthetic records seeded: **1200+**

## Project Structure

```
fundtank/
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/       # React components (one per file)
│   │   │   ├── Comments.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PitchCard.jsx
│   │   │   ├── PitchDetail.jsx
│   │   │   ├── PitchForm.jsx
│   │   │   ├── PitchList.jsx
│   │   │   ├── Portfolio.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   └── UserProfile.jsx
│   │   ├── styles/           # CSS modules (one per component)
│   │   │   ├── global.css
│   │   │   ├── Comments.css
│   │   │   ├── Home.css
│   │   │   ├── Leaderboard.css
│   │   │   └── ... (one CSS file per component)
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── .prettierrc
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── connection.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── comments.js
│   │   │   ├── investments.js
│   │   │   ├── pitches.js
│   │   │   └── users.js
│   │   ├── seeds/
│   │   │   └── seed.js
│   │   └── server.js
│   ├── eslint.config.js
│   ├── .prettierrc
│   ├── .env.example
│   └── package.json
├── designdoc.md
├── README.md
└── LICENSE
```

## Accessibility

- All form inputs have associated `<label>` elements
- Interactive cards support keyboard navigation (tabIndex + Enter key handling)
- Semantic HTML elements used throughout (nav, main, form, button, table, thead, tbody)
- Color contrast designed for readability on dark backgrounds
- Focus states visible on all interactive elements

## License

MIT License. See [LICENSE](LICENSE) for details.