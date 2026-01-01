# Backend Stack Recommendations

## Quick Answer

**Recommended Stack:**
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (or MySQL)
- **Hosting**: Railway.app (free tier) or Render.com (free tier)
- **Alternative**: Use Hostinger if it supports Node.js (check below)

## Hostinger Business Web Hosting

### ⚠️ Important: Check Node.js Support

**Most shared hosting (including Hostinger) typically supports:**
- ✅ PHP, MySQL, Apache
- ❌ Node.js (usually NOT supported on shared hosting)

**However, Hostinger Business might have:**
- VPS options (supports Node.js)
- Or Node.js add-ons (check your plan)

### How to Check

1. Log into Hostinger control panel
2. Look for:
   - "Node.js" in features
   - "VPS" or "Dedicated Server" options
   - "Application Manager" or "Node.js Manager"

**If Hostinger doesn't support Node.js**, use one of the free alternatives below.

## Recommended Free/Cost-Effective Options

### Option 1: Railway.app (⭐ RECOMMENDED)

**Why:**
- ✅ Free tier: $5 credit/month (usually enough for small apps)
- ✅ Easy deployment (connects to GitHub)
- ✅ Built-in PostgreSQL database
- ✅ Automatic HTTPS
- ✅ Great for Node.js

**Cost:** Free tier, then ~$5-10/month

**Setup:**
1. Sign up at railway.app
2. Connect GitHub repo
3. Deploy Node.js app
4. Add PostgreSQL database (free)

**Perfect for:** Your use case!

---

### Option 2: Render.com

**Why:**
- ✅ Free tier available
- ✅ PostgreSQL database (free tier)
- ✅ Automatic HTTPS
- ✅ Easy deployment

**Cost:** Free tier, then ~$7/month

**Limitations:**
- Free tier spins down after inactivity (takes ~30s to wake up)
- Not ideal for real-time games (but fine for your API)

**Perfect for:** Low-traffic apps

---

### Option 3: Fly.io

**Why:**
- ✅ Free tier: 3 shared VMs
- ✅ Global edge deployment
- ✅ PostgreSQL available
- ✅ Great performance

**Cost:** Free tier, then pay-as-you-go

**Perfect for:** Global apps, good performance

---

### Option 4: Vercel (Serverless)

**Why:**
- ✅ Free tier (generous)
- ✅ Automatic HTTPS
- ✅ Easy deployment
- ⚠️ Serverless (functions, not long-running server)

**Cost:** Free tier, then pay-per-use

**Note:** Works if you use serverless functions, but might need adjustments for your game server

---

### Option 5: Use Hostinger VPS (If Available)

**If Hostinger offers VPS:**
- ✅ You already have subscription
- ✅ Full control
- ✅ Can install Node.js
- ⚠️ Requires server management

**Cost:** Included in your plan (check)

---

## Recommended Tech Stack

### Backend Framework

```javascript
// Node.js + Express.js
// Simple, popular, well-documented
```

**Why Express:**
- ✅ Most popular Node.js framework
- ✅ Huge community
- ✅ Lots of tutorials
- ✅ Easy to learn

### Database

**Option A: PostgreSQL (Recommended)**
- ✅ Free tier on Railway/Render
- ✅ Better for complex queries
- ✅ JSON support (good for game state)

**Option B: MySQL**
- ✅ Free tier available
- ✅ Simpler (if you're familiar with it)
- ✅ Works with Hostinger (if using their hosting)

### Additional Tools

- **ethers.js**: For blockchain interactions
- **dotenv**: For environment variables
- **cors**: For API security
- **express-rate-limit**: Prevent abuse

---

## Complete Setup Guide

### Step 1: Choose Hosting

**If Hostinger supports Node.js:**
- Use Hostinger (you already pay for it)

**If not:**
- Use Railway.app (easiest, free tier)

### Step 2: Project Structure

```
server/
├── package.json
├── .env
├── index.js (main server file)
├── routes/
│   ├── game.js (game endpoints)
│   └── health.js (health check)
├── db/
│   └── database.js (database connection)
├── utils/
│   ├── rng.js (RNG generation)
│   └── signature.js (signing logic)
└── README.md
```

### Step 3: Package.json

```json
{
  "name": "shotgun-roulette-server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ethers": "^6.8.0",
    "pg": "^8.11.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Step 4: Environment Variables (.env)

```env
# Server
PORT=3000
NODE_ENV=production

# Database (Railway/Render provides this)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Blockchain
RPC_URL=https://testnet-rpc.monad.xyz
CONTRACT_ADDRESS=0x...

# Server Wallet (KEEP SECRET!)
SERVER_PRIVATE_KEY=0x...
SERVER_WALLET_ADDRESS=0x...

# Server Secret (KEEP SECRET!)
SERVER_SECRET_KEY=your-secret-key-here

# CORS
ALLOWED_ORIGINS=https://your-frontend.com
```

---

## Quick Start: Railway.app (Recommended)

### 1. Sign Up
- Go to railway.app
- Sign up with GitHub

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Connect your repo

### 3. Add Database
- Click "New" → "Database" → "Add PostgreSQL"
- Railway provides `DATABASE_URL` automatically

### 4. Set Environment Variables
- Go to "Variables" tab
- Add all variables from `.env` file
- Railway automatically uses `DATABASE_URL`

### 5. Deploy
- Railway auto-deploys on git push
- Get your URL: `https://your-app.railway.app`

**That's it!** Your server is live.

---

## Quick Start: Render.com (Alternative)

### 1. Sign Up
- Go to render.com
- Sign up with GitHub

### 2. Create Web Service
- Click "New" → "Web Service"
- Connect GitHub repo
- Settings:
  - Build Command: `npm install`
  - Start Command: `node index.js`

### 3. Add Database
- Click "New" → "PostgreSQL"
- Render provides connection string

### 4. Set Environment Variables
- Add all variables in "Environment" tab

### 5. Deploy
- Render auto-deploys
- Get your URL: `https://your-app.onrender.com`

---

## Cost Comparison

| Option | Free Tier | Paid Tier | Best For |
|--------|-----------|-----------|----------|
| Railway | $5 credit/month | $5-10/month | ⭐ Best overall |
| Render | Free (with limits) | $7/month | Low traffic |
| Fly.io | 3 VMs free | Pay-as-you-go | Global apps |
| Vercel | Generous free | Pay-per-use | Serverless |
| Hostinger | Included | Included | If supports Node.js |

---

## Recommendation for You

**Since you're new to backend:**

1. **Start with Railway.app**
   - Easiest to set up
   - Free tier is generous
   - Great documentation
   - Automatic HTTPS

2. **Use this stack:**
   - Node.js + Express.js
   - PostgreSQL (Railway provides free)
   - ethers.js for blockchain

3. **Later, if needed:**
   - Move to Hostinger VPS (if you want)
   - Or stay on Railway (it's cheap)

---

## Next Steps

1. ✅ Choose hosting (Railway recommended)
2. ✅ Set up database (Railway provides free PostgreSQL)
3. ✅ Deploy server (I can help with code)
4. ✅ Test endpoints
5. ✅ Connect to frontend

**Want me to create the complete server code for you?** I can set it up with:
- Express.js server
- Database connection
- Game logic endpoints
- Signature verification
- All the security features we discussed

Just let me know! 🚀

