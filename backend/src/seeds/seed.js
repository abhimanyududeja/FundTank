import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "fundtank";

const CATEGORIES = [
  "FinTech",
  "HealthTech",
  "EdTech",
  "GreenTech",
  "AI/ML",
  "SaaS",
  "E-Commerce",
  "Social Media",
  "Gaming",
  "FoodTech",
  "Logistics",
  "Real Estate",
];

const RISK_PREFERENCES = ["conservative", "moderate", "aggressive"];

const STRATEGIES = [
  "spread across different sectors, leaning into green stuff",
  "looking for fast growing tech plays that can scale big",
  "sticking to safe bets with proven business models",
  "finding early stage startups before everyone else piles in",
  "picking based on how fast the funding is moving",
  "going after pitches that nobody else is looking at",
  "mostly fintech and saas, thats what i know best",
  "trying to balance risk across the whole portfolio",
  "looking for good deals that arent overhyped",
  "following the momentum, whatever category is trending",
];

const PITCH_NAMES = [
  "QuickPay", "MedLink", "EduFlow", "GreenGrid", "DataMinds",
  "CloudSync", "ShopWave", "BuzzFeed", "GameForge", "FreshBite",
  "LogiTrack", "PropTech", "AgroBot", "CodeNest", "PayBridge",
  "HealthPal", "LearnHub", "EcoVolt", "NeuralNet", "SaaSly",
  "CartGenius", "SocialPulse", "PlayVerse", "MealPrep", "RouteOpt",
  "HomeBase", "CropAI", "DevStack", "WalletGuard", "TeleDoc",
  "SkillForge", "SolarFlow", "DeepSight", "CloudOps", "MarketMesh",
  "VoiceHive", "QuestRealm", "FoodLoop", "FleetSync", "RentEase",
  "FarmTech", "BuildKit", "CashFlow", "DocStream", "TutorBot",
  "WindPower", "BrainWave", "StackOps", "TradeHub", "VibeCheck",
];

const DESCRIPTIONS = [
  "Revolutionizing payments with instant cross-border transfers using blockchain technology.",
  "AI-powered health monitoring platform that connects patients with specialists in real-time.",
  "Adaptive learning system that personalizes education paths based on student performance data.",
  "Smart grid management tool that optimizes renewable energy distribution across urban networks.",
  "Machine learning analytics suite that transforms raw business data into actionable insights.",
  "Unified cloud infrastructure management reducing DevOps overhead by 60%.",
  "Next-gen e-commerce platform with AR-powered virtual try-on and smart recommendations.",
  "Community-driven content platform rewarding creators through transparent engagement metrics.",
  "Cloud gaming infrastructure enabling AAA titles on any device with zero latency.",
  "Farm-to-table marketplace connecting local producers directly with urban consumers.",
  "Real-time fleet tracking and route optimization cutting delivery costs by 40%.",
  "Fractional real estate investment platform making property ownership accessible to everyone.",
  "Precision agriculture drones automating crop monitoring and targeted pesticide application.",
  "Low-code development platform empowering non-technical founders to build MVPs in days.",
  "Embedded finance API enabling any platform to offer banking services natively.",
];

const TAGLINES = [
  "The future of finance, today.",
  "Healthcare without boundaries.",
  "Learning that adapts to you.",
  "Powering a greener tomorrow.",
  "Insights that drive growth.",
  "Scale without complexity.",
  "Shopping reimagined.",
  "Where creators thrive.",
  "Play anywhere, anytime.",
  "Fresh. Local. Connected.",
  "Delivery, optimized.",
  "Own the future of property.",
  "Farming meets intelligence.",
  "Build faster, launch sooner.",
  "Banking as a feature.",
];

const FIRST_NAMES = [
  "Alex", "Jordan", "Morgan", "Taylor", "Casey", "Riley", "Avery",
  "Quinn", "Skyler", "Drew", "Charlie", "Dakota", "Emery", "Finley",
  "Hayden", "Jamie", "Kai", "Logan", "Micah", "Nico", "Oakley",
  "Parker", "Reese", "Sage", "Tatum", "Blake", "Cameron", "Devon",
  "Ellis", "Frankie", "Gray", "Harper", "Indigo", "Jules", "Kendall",
  "Lane", "Marley", "Noel", "Onyx", "Peyton", "Remy", "Shiloh",
  "Toby", "Val", "Wren", "Zion", "Addison", "Bailey", "Corey", "Dana",
];

const LAST_NAMES = [
  "Chen", "Patel", "Garcia", "Kim", "Thompson", "Nakamura", "Singh",
  "Mueller", "Santos", "Anderson", "Okafor", "Johansson", "Ibrahim",
  "Petrov", "Williams", "Tanaka", "Sharma", "Costa", "Nguyen", "Park",
  "Ali", "Jensen", "Kovac", "Moreau", "Fischer", "Lopez", "Suzuki",
  "Rao", "Silva", "Brown", "Sato", "Kumar", "Oliveira", "Lee",
  "Hansen", "Ivanov", "Hernandez", "Yamamoto", "Gupta", "Eriksson",
];

const COMMENTS = [
  "not bad, putting some money here",
  "the budget split feels off but i like the idea",
  "been watching this one for a while, finally going in",
  "small bet, wanna see how it plays out",
  "this category is hot rn, worth a shot",
  "kinda risky but the upside is huge",
  "numbers make sense to me, im in",
  "going conservative on this one",
  "their pitch was really convincing ngl",
  "heard good things about this team",
  "not sure about the market size but the product is cool",
  "diversifying into this sector",
  "feels undervalued compared to others",
  "the funding is moving fast, getting in early",
  "solid idea, just hope they can execute",
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateBudgetBreakdown(total) {
  const engineering = Math.round(total * (0.3 + Math.random() * 0.2));
  const marketing = Math.round(total * (0.15 + Math.random() * 0.15));
  const operations = Math.round(total * (0.1 + Math.random() * 0.1));
  const talent = Math.round(total * (0.1 + Math.random() * 0.1));
  const misc = total - engineering - marketing - operations - talent;
  return {
    engineering,
    marketing,
    operations,
    talent,
    miscellaneous: Math.max(misc, 0),
  };
}

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    // Clear existing data
    await db.collection("users").deleteMany({});
    await db.collection("pitches").deleteMany({});
    await db.collection("investments").deleteMany({});
    await db.collection("comments").deleteMany({});

    console.log("Cleared existing data");

    // Create users (50 users)
    const hashedPassword = await bcrypt.hash("password123", 10);
    const users = [];

    for (let i = 0; i < 50; i++) {
      const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
      const lastName = LAST_NAMES[i % LAST_NAMES.length];
      const user = {
        _id: new ObjectId(),
        username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        password: hashedPassword,
        displayName: `${firstName} ${lastName}`,
        strategy: randomItem(STRATEGIES),
        riskPreference: randomItem(RISK_PREFERENCES),
        budget: 100000,
        totalInvested: 0,
        totalReturns: randomBetween(0, 50000),
        successfulPicks: randomBetween(0, 15),
        createdAt: new Date(
          Date.now() - randomBetween(1, 90) * 24 * 60 * 60 * 1000
        ),
        updatedAt: new Date(),
      };
      users.push(user);
    }

    await db.collection("users").insertMany(users);
    console.log(`Seeded ${users.length} users`);

    // Create pitches (200 pitches)
    const pitches = [];
    for (let i = 0; i < 200; i++) {
      const author = randomItem(users);
      const fundingGoal = randomBetween(10000, 500000);
      const totalFunding = 0;
      const fundVotes = randomBetween(0, 80);
      const passVotes = randomBetween(0, 30);

      const baseName = PITCH_NAMES[i % PITCH_NAMES.length];
      const pitch = {
        _id: new ObjectId(),
        name: i < PITCH_NAMES.length ? baseName : `${baseName} ${Math.ceil((i + 1) / PITCH_NAMES.length)}`,
        description: randomItem(DESCRIPTIONS),
        tagline: randomItem(TAGLINES),
        category: randomItem(CATEGORIES),
        budgetBreakdown: generateBudgetBreakdown(fundingGoal),
        fundingGoal,
        totalFunding,
        fundVotes,
        passVotes,
        voters: [],
        authorId: author._id,
        authorName: author.displayName,
        status: Math.random() > 0.1 ? "active" : "funded",
        createdAt: new Date(
          Date.now() - randomBetween(1, 60) * 24 * 60 * 60 * 1000
        ),
        updatedAt: new Date(),
      };

      // Add some voters
      const voterCount = Math.min(fundVotes + passVotes, 15);
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
      for (let v = 0; v < voterCount && v < shuffledUsers.length; v++) {
        if (shuffledUsers[v]._id.toString() !== author._id.toString()) {
          pitch.voters.push({
            userId: shuffledUsers[v]._id,
            vote: Math.random() > 0.3 ? "fund" : "pass",
            votedAt: new Date(
              Date.now() - randomBetween(0, 30) * 24 * 60 * 60 * 1000
            ),
          });
        }
      }

      pitches.push(pitch);
    }

    await db.collection("pitches").insertMany(pitches);
    console.log(`Seeded ${pitches.length} pitches`);

    // Create investments (800+ investments) - respecting each user's $100K budget
    const investments = [];
    const userSpent = {};
    const pitchFundingActual = {};

    // Initialize tracking
    for (const u of users) {
      userSpent[u._id.toString()] = 0;
    }
    for (const p of pitches) {
      pitchFundingActual[p._id.toString()] = 0;
    }

    let attempts = 0;
    while (investments.length < 800 && attempts < 2000) {
      attempts++;
      const investor = randomItem(users);
      const pitch = randomItem(pitches);
      const investorKey = investor._id.toString();
      const pitchKey = pitch._id.toString();

      // Skip if investing in own pitch
      if (pitch.authorId.toString() === investorKey) continue;

      // Check remaining budget (cap at 80K spent so users always have some left)
      const remaining = 80000 - userSpent[investorKey];
      if (remaining < 500) continue;

      const maxAmount = Math.min(remaining, 8000);
      const amount = randomBetween(500, maxAmount);

      const fundRatio =
        pitch.fundVotes + pitch.passVotes > 0
          ? pitch.fundVotes / (pitch.fundVotes + pitch.passVotes)
          : 0.5;
      const returnMultiplier = 1 + fundRatio * 0.5 + (Math.random() > 0.5 ? 0.3 : 0);

      userSpent[investorKey] += amount;
      pitchFundingActual[pitchKey] += amount;

      investments.push({
        _id: new ObjectId(),
        investorId: investor._id,
        investorName: investor.displayName,
        pitchId: pitch._id,
        pitchName: pitch.name,
        amount,
        notes: Math.random() > 0.4 ? randomItem(COMMENTS) : "",
        returnMultiplier: parseFloat(returnMultiplier.toFixed(2)),
        estimatedReturn: parseFloat((amount * returnMultiplier).toFixed(2)),
        status: "active",
        createdAt: new Date(
          Date.now() - randomBetween(0, 45) * 24 * 60 * 60 * 1000
        ),
        updatedAt: new Date(),
      });
    }

    await db.collection("investments").insertMany(investments);
    console.log(`Seeded ${investments.length} investments`);

    // Update user totalInvested and totalReturns based on actual investments
    for (const user of users) {
      const spent = userSpent[user._id.toString()] || 0;
      const userInvs = investments.filter(
        (inv) => inv.investorId.toString() === user._id.toString()
      );
      const totalReturns = userInvs.reduce(
        (sum, inv) => sum + inv.estimatedReturn,
        0
      );
      const successfulPicks = userInvs.filter(
        (inv) => inv.returnMultiplier > 1.3
      ).length;
      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            totalInvested: spent,
            totalReturns: parseFloat(totalReturns.toFixed(2)),
            successfulPicks,
          },
        }
      );
    }

    // Update pitch totalFunding based on actual investments
    for (const pitch of pitches) {
      const actualFunding = pitchFundingActual[pitch._id.toString()] || 0;
      await db.collection("pitches").updateOne(
        { _id: pitch._id },
        { $set: { totalFunding: actualFunding } }
      );
    }

    // Create comments/Q&A (150+ comments across pitches)
    const QUESTIONS = [
      "how are you guys planning to get your first users?",
      "whats different about this vs whats already out there?",
      "any idea when you'd actually start making money?",
      "whos on the team? any relevant experience?",
      "what could go wrong here? whats the biggest risk?",
      "can this actually scale or does it break at 10k users?",
      "how do you know people actually want this?",
      "do you have any deals or partnerships lined up?",
      "how did you come up with the pricing?",
      "if you get fully funded what does the spending look like?",
      "whats the burn rate looking like monthly?",
      "any legal or regulation stuff to worry about?",
      "how do you keep users coming back after signup?",
      "do the numbers work if you 5x the user base?",
      "what stops a bigger company from just copying this?",
    ];

    const REPLIES = [
      "good question! mostly word of mouth and some content marketing to start. paid ads come later once we nail the messaging",
      "honestly the main thing is we built this for a specific niche first. everyone else is trying to be everything for everyone",
      "looking at about 14-16 months to break even if growth stays on track. could be sooner if we land a couple enterprise deals",
      "two cofounders, both worked in this space for 5+ years. our lead dev built similar stuff at her last company",
      "biggest risk is probably timing. we're launching a beta with 500 users first to validate before going all in",
      "yeah we designed it to scale from day one. each piece runs independently so we can throw more resources at whatever needs it",
      "we ran a 3 month beta with about 200 users. retention was solid and the feedback has been really positive",
      "we have a few LOIs from companies and one partnership thats close to being finalized",
      "tested a few price points with beta users. $29/mo hit the sweet spot, about a third of testers converted",
      "most of it goes to eng and product. maybe 25% to marketing, rest is ops and hiring",
      "right now about 12k/month with 4 people. after funding probably 30-35k with a bigger team",
      "we checked with a lawyer and we're good in the US and EU. some countries might need extra paperwork later",
      "building community features into the product. users who engage with those stick around way longer from what we've seen",
      "yeah the math works. CAC goes down significantly at scale and LTV keeps growing as we add features",
      "the data advantage is real. the more people use it the smarter it gets, and thats really hard to replicate from scratch",
    ];

    const comments = [];
    for (let i = 0; i < 150; i++) {
      const pitch = randomItem(pitches);
      const commenter = randomItem(users);

      // Skip if commenting on own pitch (save that for replies)
      if (commenter._id.toString() === pitch.authorId.toString()) continue;

      const comment = {
        _id: new ObjectId(),
        pitchId: pitch._id,
        pitchName: pitch.name,
        authorId: commenter._id,
        authorName: commenter.displayName,
        text: randomItem(QUESTIONS),
        parentId: null,
        isAuthorReply: false,
        createdAt: new Date(
          Date.now() - randomBetween(0, 30) * 24 * 60 * 60 * 1000
        ),
        updatedAt: new Date(),
      };
      comments.push(comment);

      // 60% chance the pitch author replies
      if (Math.random() > 0.4) {
        const author = users.find(
          (u) => u._id.toString() === pitch.authorId.toString()
        );
        if (author) {
          comments.push({
            _id: new ObjectId(),
            pitchId: pitch._id,
            pitchName: pitch.name,
            authorId: author._id,
            authorName: author.displayName,
            text: randomItem(REPLIES),
            parentId: comment._id,
            isAuthorReply: true,
            createdAt: new Date(
              Date.now() - randomBetween(0, 25) * 24 * 60 * 60 * 1000
            ),
            updatedAt: new Date(),
          });
        }
      }
    }

    await db.collection("comments").insertMany(comments);
    console.log(`Seeded ${comments.length} comments`);

    const totalRecords =
      users.length + pitches.length + investments.length + comments.length;
    console.log(`\nTotal records seeded: ${totalRecords}`);
    console.log("  Users: " + users.length);
    console.log("  Pitches: " + pitches.length);
    console.log("  Investments: " + investments.length);
    console.log("  Comments: " + comments.length);

    // Create indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ username: 1 }, { unique: true });
    await db.collection("pitches").createIndex({ category: 1 });
    await db.collection("pitches").createIndex({ totalFunding: -1 });
    await db.collection("pitches").createIndex({ authorId: 1 });
    await db.collection("investments").createIndex({ investorId: 1 });
    await db.collection("investments").createIndex({ pitchId: 1 });
    await db.collection("comments").createIndex({ pitchId: 1 });
    await db.collection("comments").createIndex({ authorId: 1 });
    console.log("Created indexes");

    console.log("\nSeed complete! Test login: email=alex.chen0@example.com password=password123");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await client.close();
  }
}

seed();
