# FundTank — Design Document

> **Course:** CS5610 Web Development  Northeastern University  Spring 2026
> **Authors:** Abhimanyu Dudeja & Kashish Rahulbhai Khatri

---

## Table of Contents

1. [Project Description](#1-project-description)
2. [User Personas](#2-user-personas)
3. [User Stories](#3-user-stories)
4. [Design Mockups](#4-design-mockups)
5. [System Architecture](#5-system-architecture)
6. [Database Design](#6-database-design)
7. [API Endpoints](#7-api-endpoints)

---

## 1. Project Description

### Overview

**FundTank** is a startup simulation platform where users roleplay as entrepreneurs and investors in a fictional startup ecosystem. Entrepreneurs create startup pitches with a business plan, category, and budget breakdown, then share them with the community. Investors receive $100,000 in virtual currency, allocate funds across startups, and vote on which ventures deserve funding.

Think of it as **Shark Tank meets a stock market game** — making startup culture accessible and fun.

### Problem Statement

Learning about startups and investing today is either intimidating or boring:

- **Startup culture feels inaccessible** — students and beginners have no safe space to practice pitching or investing
- **No gamified learning** — existing simulations are overly complex, paid, or not fun
- **No community feedback** — you can't test a business idea and see how others react without real money on the line
- **Investment strategy is abstract** — reading about portfolio management isn't the same as doing it

### Solution

FundTank solves this by providing:

- **Pitch Creation** — Create startup pitches with name, description, category, budget breakdown, and funding goal
- **Browse & Filter** — Search pitches by category, sort by funding/votes/date
- **Vote System** — Cast Fund or Pass votes to influence which startups rise to the top
- **Virtual Investment** — Allocate from your $100K budget into startups you believe in
- **Portfolio Analytics** — Track investments, estimated returns, ROI, and category breakdown
- **Dual Leaderboards** — Top startups by funding and top investors by returns
- **Q&A Comments** — Ask questions on pitches, get replies from entrepreneurs
- **Investor Profiles** — View anyone's portfolio, strategy, and performance

### Supported Categories

FinTech  HealthTech  EdTech  GreenTech  AI/ML  SaaS  E-Commerce  Social Media  Gaming  FoodTech  Logistics  Real Estate

### Tech Stack

| Layer      | Technology              | Reason                             |
| ---------- | ----------------------- | ---------------------------------- |
| Frontend   | React 18 (Hooks, Router v6) | Course requirement              |
| Backend    | Node.js + Express       | Course requirement                 |
| Database   | MongoDB (Native Driver) | Course requirement — no Mongoose   |
| Build      | Vite                    | Fast dev server and bundler        |
| Auth       | JWT + bcrypt            | Stateless, industry-standard       |
| Deployment | Render.com              | Free cloud hosting                 |

---

## 2. User Personas

### Persona 1 — The Aspiring Entrepreneur

```
┌─────────────────────────────────────────────────────────────┐
│  RAJ KAPOOR                                              │
│      Age 23  CS Graduate Student  Boston, MA               │
├─────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                  │
│  • Has creative business ideas but no platform to test them │
│  • Took an entrepreneurship class but never pitched for real│
│  • Wants to practice crafting compelling startup pitches     │
│  • Curious how investors think about business models         │
├──────────────────────────┬──────────────────────────────────┤
│  GOALS                   │  FRUSTRATIONS                    │
│  • Test startup ideas    │  • No safe space to pitch ideas  │
│    without real money    │  • Real pitch competitions are   │
│  • Get community feedback│    intimidating and high-stakes  │
│    on business concepts  │  • Hard to know if an idea       │
│  • Learn what makes a    │    resonates without asking      │
│    pitch compelling      │    real investors                 │
└──────────────────────────┴──────────────────────────────────┘
```

> _"I have 5 startup ideas in my notes app but no way to know if any of them are actually good. I just want to put them out there and see what happens."_

---

### Persona 2 — The Strategic Investor

```
┌─────────────────────────────────────────────────────────────┐
│  LENA PARK                                               │
│      Age 25  MBA Student  Cambridge, MA                    │
├─────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                  │
│  • Loves analyzing business models and market trends        │
│  • Reads TechCrunch and follows startup funding rounds      │
│  • Wants to practice making investment decisions             │
│  • Competitive — likes comparing performance against others  │
├──────────────────────────┬──────────────────────────────────┤
│  GOALS                   │  FRUSTRATIONS                    │
│  • Build a diversified   │  • Paper trading platforms are   │
│    startup portfolio     │    boring and not startup-focused│
│  • Track ROI and compare │  • No way to practice VC-style   │
│    against other         │    investing without real money  │
│    investors             │  • Existing simulations are      │
│  • Learn which sectors   │    too complex for casual use    │
│    perform best          │                                  │
└──────────────────────────┴──────────────────────────────────┘
```

> _"I want to practice thinking like a VC. Give me $100K of fake money and let me see if I can pick winners."_

---

### Persona 3 — The Casual Browser

```
┌─────────────────────────────────────────────────────────────┐
│  SAM TAYLOR                                              │
│      Age 21  Undergrad  Somerville, MA                     │
├─────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                  │
│  • Enjoys scrolling through creative content                │
│  • Not deeply into strategy but likes voting and ranking    │
│  • Watches Shark Tank for fun                               │
│  • Participates casually — votes, browses, reads Q&A        │
├──────────────────────────┬──────────────────────────────────┤
│  GOALS                   │  FRUSTRATIONS                    │
│  • Browse interesting    │  • Most startup content is       │
│    startup ideas         │    either too serious or too      │
│  • Vote on favorites and │    technical                     │
│    see rankings change   │  • Wants to participate without  │
│  • Read Q&A discussions  │    heavy commitment              │
│    on pitches            │  • Existing platforms require    │
│                          │    too much effort to start      │
└──────────────────────────┴──────────────────────────────────┘
```

> _"I just want to scroll through cool startup ideas, vote on my favorites, and see which ones win. Like Reddit meets Shark Tank."_

---

## 3. User Stories

### Startup Pitches & Voting _(Kashish Rahulbhai Khatri)_

---

#### Story 1 — Create a Startup Pitch

> _As an entrepreneur, I want to create a startup pitch with a name, description, category, and budget breakdown, so investors can evaluate my idea._

**Scenario:** Raj has an idea for an AI tutoring platform. He clicks "Create Pitch," fills in the name "NeuroLearn," picks EdTech as the category, writes a description, sets a $150K funding goal, and breaks down the budget across engineering, marketing, operations, and talent. He submits and sees his pitch live on the browse page within seconds.

#### Story 2 — Edit or Delete Pitches

> _As an entrepreneur, I want to edit or delete my startup pitches, so I can refine my proposals._

**Scenario:** After getting some comments on his pitch, Raj realizes his tagline is weak. He clicks "Edit" on his pitch detail page, updates the tagline, and saves. Later, he decides to scrap a different pitch entirely and uses the "Delete" button.

#### Story 3 — Browse and Filter Pitches

> _As a user, I want to browse and filter startup pitches by category and popularity, so I can discover interesting ventures._

**Scenario:** Sam opens the Pitches page and sees 200 startups. She filters by "FinTech," sorts by "Most Funded," and finds the top-performing financial startups. She uses the search bar to find a specific pitch she heard about.

#### Story 4 — Vote on Pitches

> _As a user, I want to vote on startup pitches (fund / pass), so I can influence which startups get funded._

**Scenario:** Lena reads through a GreenTech pitch and likes the business model. She clicks "Fund." The approval rate updates immediately. On the next pitch, she's not convinced and clicks "Pass."

#### Story 5 — View Pitch Stats

> _As an entrepreneur, I want to view my pitch's stats including total votes, funding received, and investor comments, so I can gauge community reception._

**Scenario:** Raj checks his NeuroLearn pitch and sees it has 45 Fund votes, 12 Pass votes, $28K in funding, and 8 comments in the Q&A section. He reads the investor feedback and replies to questions.

#### Story 6 — Startup Leaderboard

> _As a user, I want to see a leaderboard of top-ranked startups by funding secured and vote ratio, so I can follow the competition._

**Scenario:** Sam clicks the Leaderboard tab and sees the top 20 startups ranked by total funding. She switches to the "Top Investors" tab to see who's making the best picks.

---

### Investment Portfolio & Analytics _(Abhimanyu Dudeja)_

---

#### Story 7 — Create Investor Profile

> _As a new user, I want to create an investor profile with a display name, investment strategy description, and risk preference, so others can see my investing style._

**Scenario:** Lena registers and fills in her display name, writes "High-growth tech with scalable models" as her strategy, and selects "Aggressive" risk preference. She starts with $100,000 in virtual currency.

#### Story 8 — Invest in Startups

> _As an investor, I want to allocate fake currency from my budget into startups, so I can build a portfolio._

**Scenario:** Lena finds a SaaS pitch she likes and invests $5,000. Her navbar budget drops from $100K to $95K instantly. She adds a note: "solid pricing model, good team." She invests in 3 more startups throughout the day.

#### Story 9 — View Portfolio

> _As an investor, I want to view my portfolio showing all my investments and current returns, so I can track my performance._

**Scenario:** Lena opens her Portfolio page and sees 4 stat cards (total investments, amount invested, estimated returns, ROI). Below is a category breakdown chart showing she's heavy in SaaS. She scrolls through her investment list and edits the amount on one, then withdraws from another.

#### Story 10 — Leave Comments on Pitches

> _As an investor, I want to leave comments and notes on startup pitches, so entrepreneurs get feedback and other investors see my analysis._

**Scenario:** Lena has a question about a pitch's pricing model. She scrolls to the Q&A section and posts "how did you come up with the pricing?" The pitch author replies with details. Other investors can see the conversation.

#### Story 11 — View Investor Profiles

> _As a user, I want to view any investor's profile with their portfolio history and total returns, so I can compare strategies._

**Scenario:** Sam clicks on "Lena Park" from the investor leaderboard and sees her profile — risk preference, strategy, total invested, returns, and a list of all her investments.

#### Story 12 — Investor Leaderboard

> _As a user, I want to see a global investor leaderboard ranked by returns and successful picks, so I can find the top-performing investors._

**Scenario:** Lena checks the leaderboard and sees she's ranked #3 by total returns. She clicks on the #1 investor to study their portfolio strategy.

---

## 4. Design Mockups

### Mockup 1 — Home Page (`/`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  FT FundTank      Pitches  Leaderboard  Create Pitch  Portfolio    │
│                                                    $33,781  Logout │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│              ┌ STARTUP SIMULATION PLATFORM ┐                       │
│                                                                     │
│                    Pitch. Invest.                                   │
│                  Dominate the Tank.                                 │
│                                                                     │
│         Create startup pitches, allocate virtual capital,          │
│         compete on leaderboards.                                    │
│                                                                     │
│            [ Create a Pitch ]  [ Browse Startups ]                 │
│                                                                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐      │
│  │    200    │  │     20    │  │  $10,010K │  │    169    │      │
│  │  Active   │  │ Investors │  │   Total   │  │Investments│      │
│  │ Pitches   │  │           │  │  Funded   │  │   Made    │      │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘      │
│                                                                     │
│  Top Funded Startups                              [ View All ]     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ #1 FINTECH   │  │ #2 SAAS      │  │ #3 AI/ML     │             │
│  │ QuickPay     │  │ CloudSync    │  │ NeuralNet    │             │
│  │ $45,200      │  │ $38,100      │  │ $32,500      │             │
│  │ 67 fund  8 p │  │ 52 fund 11 p │  │ 48 fund  6 p │             │
│  │ ████████░░░  │  │ ██████░░░░░  │  │ █████░░░░░░  │             │
│  │ by Alex Chen │  │ by Jordan P  │  │ by Morgan G  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Mockup 2 — Browse Pitches (`/pitches`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  FT FundTank      Pitches  Leaderboard  Create Pitch  Portfolio    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Browse Startups                                                    │
│  200 pitches in the tank                                           │
│                                                                     │
│  [Search pitches...  ] [All Categories ▾] [Newest ▾]           │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ SOCIAL MEDIA │  │ HEALTHTECH   │  │ GREENTECH    │             │
│  │ EduFlow      │  │ GreenGrid 3  │  │ HealthPal 2  │             │
│  │ Farming meets│  │ Where creator│  │ Farming meets│             │
│  │ intelligence │  │ thrive.      │  │ intelligence │             │
│  │ $27,188  24  │  │ $10,515   4  │  │ $22,455  15  │             │
│  │ funded  votes│  │ funded  votes│  │ funded  votes│             │
│  │ ██████░░░░░  │  │ ██░░░░░░░░░  │  │ █████░░░░░░  │             │
│  │ by Onyx Gupta│  │ by Logan C   │  │ by Tatum F   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ HEALTHTECH   │  │ E-COMMERCE   │  │ FINTECH      │             │
│  │ AgroBot      │  │ ShopWave 3   │  │ EduFlow 2    │             │
│  │ ...          │  │ ...          │  │ ...          │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│          [ Previous ]  Page 1 of 17  [ Next ]                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Mockup 3 — Pitch Detail (`/pitches/:id`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  FT FundTank      Pitches  Leaderboard  Create Pitch  Portfolio    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FINTECH                                          [ Edit ] [Delete]│
│  PayBridge 2                                                       │
│  Fresh. Local. Connected.                                          │
│  by Casey Thompson  Jan 30, 2026                                  │
│                                                                     │
│  ┌─────────────────────────┐  ┌──────────────────────┐            │
│  │ About this Startup      │  │ Funding Stats        │            │
│  │                         │  │                      │            │
│  │ Machine learning        │  │ Total Funded $14,879 │            │
│  │ analytics suite that    │  │ Funding Goal $229,681│            │
│  │ transforms raw business │  │ Progress        6%   │            │
│  │ data into actionable    │  │ ██░░░░░░░░░░░░░░░░░  │            │
│  │ insights.               │  │ Fund Votes       53  │            │
│  └─────────────────────────┘  │ Pass Votes       13  │            │
│  ┌─────────────────────────┐  │ Approval Rate   80%  │            │
│  │ Budget Breakdown        │  │                      │            │
│  │ Engineering    $77,062  │  │ [ FUND ]  [ PASS ]   │            │
│  │ Marketing      $47,572  │  └──────────────────────┘            │
│  │ Operations     $25,471  │  ┌──────────────────────┐            │
│  │ Talent         $42,765  │  │ Invest in PayBridge  │            │
│  │ Miscellaneous  $36,811  │  │ Amount ($) [      ]  │            │
│  └─────────────────────────┘  │ Notes      [      ]  │            │
│  ┌─────────────────────────┐  │ [ Invest ]           │            │
│  │ Q&A            8 comments│  └──────────────────────┘            │
│  │ [Ask a question...   ]  │                                      │
│  │                         │                                      │
│  │ Jordan Patel    3d ago  │                                      │
│  │ how are you planning to │                                      │
│  │ get your first users?   │                                      │
│  │ [Reply] [Edit] [Delete] │                                      │
│  │   └ Casey Thompson      │                                      │
│  │     Author  2d ago      │                                      │
│  │     mostly word of mouth│                                      │
│  │     and content mktg    │                                      │
│  └─────────────────────────┘                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Mockup 4 — Create / Edit Pitch (`/pitches/new`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  FT FundTank      Pitches  Leaderboard  Create Pitch  Portfolio    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Create a Pitch                                                    │
│  Share your startup idea with the community                        │
│                                                                     │
│           ┌────────────────────────────────────────────┐           │
│           │ Startup Name                               │           │
│           │ [e.g. QuickPay                          ]  │           │
│           │                                            │           │
│           │ Tagline                                    │           │
│           │ [One-liner that captures your vision    ]  │           │
│           │                                            │           │
│           │ Description                                │           │
│           │ [Describe your startup, the problem it  ]  │           │
│           │ [solves, and your go-to-market strategy  ]  │           │
│           │                                            │           │
│           │ Category            Funding Goal ($)       │           │
│           │ [FinTech      ▾]   [100000             ]   │           │
│           │                                            │           │
│           │ Budget Breakdown (optional)                 │           │
│           │ [Engineering  ] [Marketing   ]             │           │
│           │ [Operations   ] [Talent      ]             │           │
│           │ [Miscellaneous]                            │           │
│           │                                            │           │
│           │ [ Create Pitch ]  [ Cancel ]               │           │
│           └────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Mockup 5 — Portfolio (`/portfolio`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  FT FundTank      Pitches  Leaderboard  Create Pitch  Portfolio    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  My Portfolio                                                      │
│  Track your investments and returns                                │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │    15    │  │  $66,219 │  │  $82,773 │  │  24.97%  │          │
│  │Investments│  │ Invested │  │Est.Return│  │   ROI    │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────┐          │
│  │ Investment by Category                              │          │
│  │                                                     │          │
│  │  $8.2K    $6.1K    $5.4K    $4.8K    $3.2K         │          │
│  │  ████     ███      ███      ██       ██             │          │
│  │  ████     ███      ███      ██       ██             │          │
│  │  ████     ███      ███      ██       ██             │          │
│  │ Gaming  RealEst  GreenTech FoodTech  SaaS           │          │
│  └─────────────────────────────────────────────────────┘          │
│                                                                     │
│  Your Investments (15)                                             │
│  ┌─────────────────────────────────────────────────────┐          │
│  │ QuickPay                    $5,000                  │          │
│  │ solid idea, good team       Est: $6,250 (1.25x)    │          │
│  │                            [ Edit ] [ Withdraw ]    │          │
│  ├─────────────────────────────────────────────────────┤          │
│  │ CloudSync                   $3,500                  │          │
│  │ Invested 2/15/2026          Est: $4,550 (1.3x)     │          │
│  │                            [ Edit ] [ Withdraw ]    │          │
│  └─────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Mockup 6 — Leaderboard (`/leaderboard`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  FT FundTank      Pitches  Leaderboard  Create Pitch  Portfolio    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Leaderboard                                                       │
│  Top startups and investors in the tank                            │
│                                                                     │
│  [ Top Startups active ]  [ Top Investors ]                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ Rank  Startup      Category   Funding   Votes  Approval │      │
│  │ ─────────────────────────────────────────────────────── │      │
│  │ #1    QuickPay     FINTECH    $45,200    67     89%     │      │
│  │ #2    CloudSync    SAAS       $38,100    52     83%     │      │
│  │ #3    NeuralNet    AI/ML      $32,500    48     89%     │      │
│  │ #4    FreshBite    FOODTECH   $28,900    41     78%     │      │
│  │ #5    EcoVolt      GREENTECH  $25,300    38     84%     │      │
│  │ #6    ShopWave     ECOMMERCE  $22,100    35     76%     │      │
│  │ ...                                                     │      │
│  └─────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Mockup 7 — Profile (`/profile`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  FT FundTank      Pitches  Leaderboard  Create Pitch  Portfolio    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  My Profile                                                        │
│                                                                     │
│  ┌─────────────────────────────────────────────────────┐          │
│  │  (AC)  Alex Chen                                    │          │
│  │        @alexchen0                                   │          │
│  │        [MODERATE]  [$33,781 available]               │          │
│  │                                                     │          │
│  │  Total Budget     $100,000  │ Total Returns  $24,500│          │
│  │  Total Invested   $66,219   │ Successful Picks    12│          │
│  │                                                     │          │
│  │  Investment Strategy                                │          │
│  │  looking for fast growing tech plays that can       │          │
│  │  scale big                                          │          │
│  │                                                     │          │
│  │  [ Edit Profile ]                                   │          │
│  └─────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Mockup 8 — Login / Register (`/login`, `/register`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  FT FundTank      Pitches  Leaderboard             Login  Sign Up  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│           ┌────────────────────────────────────────────┐           │
│           │          Welcome Back                      │           │
│           │    Sign in to your FundTank account         │           │
│           │                                            │           │
│           │  EMAIL                                     │           │
│           │  [you@example.com                       ]  │           │
│           │                                            │           │
│           │  PASSWORD                                  │           │
│           │  [Enter your password                   ]  │           │
│           │                                            │           │
│           │  [          Sign In                      ]  │           │
│           │                                            │           │
│           │  Don't have an account? Sign up             │           │
│           └────────────────────────────────────────────┘           │
│                                                                     │
│  ┌ REGISTER FORM ──────────────────────────────────────────────┐   │
│  │  Display Name [        ]  Username [            ]           │   │
│  │  Email        [                                 ]           │   │
│  │  Password     [                                 ]           │   │
│  │  Investment Strategy (optional)                             │   │
│  │  [                                              ]           │   │
│  │  Risk Preference  [Moderate               ▾]               │   │
│  │  [              Create Account               ]              │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT — React 18 SPA                      │
│  React Router v6  Hooks  Fetch API  JWT localStorage      │
│  13 components  PropTypes  CSS modules  Vite build         │
└──────────────────────────┬───────────────────────────────────┘
                           │  REST API / JSON over HTTP
┌──────────────────────────▼───────────────────────────────────┐
│                  SERVER — Node.js + Express                   │
│  /api/auth  /api/pitches  /api/investments  /api/users    │
│  /api/comments  JWT Middleware  Manual CORS  Static Serve │
└──────────────────────────┬───────────────────────────────────┘
                           │  MongoDB Native Driver (no Mongoose)
┌──────────────────────────▼───────────────────────────────────┐
│                  DATABASE — MongoDB Atlas                     │
│  users  pitches  investments  comments (4 collections)    │
│  50 users  200 pitches  800 investments  231 comments     │
│  1,281 total seeded records                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Database Design

### Users Collection

| Field            | Type     | Notes                             |
| ---------------- | -------- | --------------------------------- |
| `_id`            | ObjectId | Primary key                       |
| `username`       | String   | Unique                            |
| `email`          | String   | Unique                            |
| `password`       | String   | bcrypt hashed                     |
| `displayName`    | String   |                                   |
| `strategy`       | String   | Investment strategy description   |
| `riskPreference` | String   | conservative / moderate / aggressive |
| `budget`         | Number   | Starts at 100,000                 |
| `totalInvested`  | Number   |                                   |
| `totalReturns`   | Number   |                                   |
| `successfulPicks`| Number   |                                   |
| `createdAt`      | Date     |                                   |

### Pitches Collection

| Field            | Type       | Notes                            |
| ---------------- | ---------- | -------------------------------- |
| `_id`            | ObjectId   | Primary key                      |
| `name`           | String     | Startup name                     |
| `tagline`        | String     |                                  |
| `description`    | String     |                                  |
| `category`       | String     | One of 12 categories             |
| `budgetBreakdown`| Object     | engineering, marketing, etc.     |
| `fundingGoal`    | Number     |                                  |
| `totalFunding`   | Number     |                                  |
| `fundVotes`      | Number     |                                  |
| `passVotes`      | Number     |                                  |
| `voters`         | Array      | { userId, vote, votedAt }        |
| `authorId`       | ObjectId   | → users                          |
| `authorName`     | String     |                                  |
| `status`         | String     | active / funded                  |

### Investments Collection

| Field             | Type     | Notes                          |
| ----------------- | -------- | ------------------------------ |
| `_id`             | ObjectId | Primary key                    |
| `investorId`      | ObjectId | → users                        |
| `investorName`    | String   |                                |
| `pitchId`         | ObjectId | → pitches                      |
| `pitchName`       | String   |                                |
| `amount`          | Number   |                                |
| `notes`           | String   | Investor's analysis            |
| `returnMultiplier`| Number   | Based on pitch performance     |
| `estimatedReturn` | Number   | amount × multiplier            |
| `status`          | String   | active                         |

### Comments Collection

| Field          | Type     | Notes                           |
| -------------- | -------- | ------------------------------- |
| `_id`          | ObjectId | Primary key                     |
| `pitchId`      | ObjectId | → pitches                       |
| `authorId`     | ObjectId | → users                         |
| `authorName`   | String   |                                 |
| `text`         | String   |                                 |
| `parentId`     | ObjectId | null for top-level, ObjectId for replies |
| `isAuthorReply`| Boolean  | true if pitch creator replied   |

---

## 7. API Endpoints

### Authentication

| Method | Endpoint             | Auth   | Description                    |
| ------ | -------------------- | ------ | ------------------------------ |
| POST   | `/api/auth/register` | —      | Register new user, returns JWT |
| POST   | `/api/auth/login`    | —      | Login, returns JWT + user      |
| GET    | `/api/auth/me`       | JWT | Get current user from token    |

### Pitches _(Kashish Rahulbhai Khatri)_

| Method | Endpoint                | Auth     | Description                              |
| ------ | ----------------------- | -------- | ---------------------------------------- |
| GET    | `/api/pitches`          | Optional | Browse with filters, search, pagination  |
| GET    | `/api/pitches/leaderboard` | —     | Top 20 by funding                        |
| GET    | `/api/pitches/:id`      | Optional | Pitch detail                             |
| POST   | `/api/pitches`          | JWT   | Create pitch                             |
| PUT    | `/api/pitches/:id`      | Owner | Edit pitch                               |
| DELETE | `/api/pitches/:id`      | Owner | Delete pitch                             |
| POST   | `/api/pitches/:id/vote` | JWT   | Vote fund or pass                        |

### Investments _(Abhimanyu Dudeja)_

| Method | Endpoint                          | Auth     | Description                    |
| ------ | --------------------------------- | -------- | ------------------------------ |
| GET    | `/api/investments`                | JWT   | Current user's portfolio       |
| GET    | `/api/investments/user/:userId`   | —        | Any user's investments         |
| GET    | `/api/investments/analytics/summary` | JWT | Portfolio analytics            |
| POST   | `/api/investments`                | JWT   | Invest in a startup            |
| PUT    | `/api/investments/:id`            | Owner | Update investment              |
| DELETE | `/api/investments/:id`            | Owner | Withdraw investment            |

### Users

| Method | Endpoint                | Auth     | Description                    |
| ------ | ----------------------- | -------- | ------------------------------ |
| GET    | `/api/users/leaderboard`| —        | Top 20 investors by returns    |
| GET    | `/api/users/:id`        | —        | Public profile                 |
| PUT    | `/api/users/profile`    | JWT   | Update own profile             |

### Comments _(Abhimanyu Dudeja)_

| Method | Endpoint                       | Auth   | Description                    |
| ------ | ------------------------------ | ------ | ------------------------------ |
| GET    | `/api/comments/pitch/:pitchId` | —      | All comments for a pitch       |
| POST   | `/api/comments`                | JWT | Create comment or reply        |
| PUT    | `/api/comments/:id`            | Owner | Edit own comment             |
| DELETE | `/api/comments/:id`            | Owner | Delete own comment + replies |

---

_FundTank Design Document  CS5610 Web Development  Northeastern University  Spring 2026_
_Authors: Abhimanyu Dudeja & Kashish Rahulbhai Khatri_
