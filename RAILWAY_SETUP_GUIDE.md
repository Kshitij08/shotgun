# Railway Setup Guide - Complete Walkthrough

## Prerequisites

✅ You have Railway's $5 Hobby plan  
✅ You have a GitHub account  
✅ Your server code is in a GitHub repository

## Repository Structure

Your monorepo structure:
```
shotgun/
├── contracts/          # Smart contracts
├── server/            # Backend server (Railway deploys this)
│   ├── index.js
│   ├── package.json
│   ├── db/
│   │   └── schema.sql
│   └── ...
├── shotgun-app/       # Frontend app
└── ...
```

---

## Step 1: Set Up Database

### 1.1 Create PostgreSQL Database

1. Log into [Railway.app](https://railway.app)
2. Click **"New Project"**
3. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
4. Railway will create a PostgreSQL database
5. Click on the database to see connection details

### 1.2 Get Database Connection String

1. In your database dashboard, go to **"Variables"** tab
2. Copy the `DATABASE_URL` value
3. **Note**: Railway automatically provides `DATABASE_URL` to your services - you don't need to manually add it!

### 1.3 Run Database Schema

Railway's Data tab doesn't have a Query button. Use one of these methods:

**Option A: Quick Node.js Script (Easiest)**
1. Navigate to `db-populate` folder: `cd db-populate`
2. Install dependencies: `npm install`
3. Get `DATABASE_URL` from Railway: Database → Variables → DATABASE_URL
4. Set it: `$env:DATABASE_URL="postgresql://..."` (PowerShell) or `export DATABASE_URL="postgresql://..."` (macOS/Linux)
5. Run: `node run-schema.js`

**Option B: Railway CLI**
```bash
railway connect postgres < server/db/schema.sql
```

**Option C: Database Client (DBeaver, pgAdmin, TablePlus)**
1. Get connection details from Railway Connect button
2. Connect with your database client
3. Run SQL from `server/db/schema.sql`

**See `RAILWAY_DATABASE_SETUP.md` for detailed instructions.**

✅ After running, verify tables `games` and `game_claims` were created!

---

## Step 2: Deploy Server

### 2.1 Connect GitHub Repository

1. In Railway dashboard, click **"New"** → **"GitHub Repo"**
2. Select your repository (`shotgun`)
3. Railway will create a service

### 2.2 Set Root Directory (IMPORTANT for Monorepo!)

Since your repo has multiple folders, you need to tell Railway which folder contains the server:

1. Go to your service (the one you just created)
2. Click **"Settings"** tab
3. Scroll down to **"Root Directory"**
4. Set it to: `server`
5. Click **"Save"**

✅ Now Railway will:
- Look for `package.json` in the `server/` folder
- Run `npm install` in that folder
- Run `npm start` in that folder

### 2.3 Configure Build Settings

Railway should auto-detect from `server/package.json`:
- **Build Command**: `npm install` (auto-detected)
- **Start Command**: `npm start` (auto-detected)

Verify these are correct in **Settings** → **Deploy** section.

### 2.3 Set Environment Variables

Go to your service → **"Variables"** tab → Add these:

```env
# Server
PORT=3000
NODE_ENV=production

# Database (Railway provides this automatically)
# DATABASE_URL is already set by Railway, don't add it manually!

# Blockchain
RPC_URL=https://testnet-rpc.monad.xyz
CONTRACT_ADDRESS=0xF282FD3903F70E4c4bed148723efB1d0fa20Bc40

# Server Wallet (IMPORTANT: Generate a new wallet!)
SERVER_PRIVATE_KEY=0x...your-private-key-here...
SERVER_WALLET_ADDRESS=0x...your-wallet-address-here...

# Server Secret (Generate random 32-byte hex string)
SERVER_SECRET_KEY=your-random-32-byte-hex-string-here

# CORS - Your frontend domain
ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2.4 Generate Server Wallet

**Option A: Using Node.js**
```bash
node -e "const { ethers } = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Private Key:', wallet.privateKey); console.log('Address:', wallet.address);"
```

**Option B: Using ethers CLI**
```bash
npx ethers wallet generate
```

**⚠️ IMPORTANT:**
- Save the private key securely
- Never commit it to git
- Add it to Railway environment variables

### 2.5 Generate Server Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add to `SERVER_SECRET_KEY`

---

## Step 3: Deploy

### 3.1 Automatic Deployment

Railway automatically deploys when you:
- Push to your GitHub repo
- Or click **"Deploy"** in Railway dashboard

### 3.2 Check Deployment

1. Go to your service dashboard
2. Click **"Deployments"** tab
3. Watch the build logs
4. Wait for "Deploy successful"

### 3.3 Get Your Server URL

1. In your service dashboard
2. Click **"Settings"** → **"Generate Domain"**
3. Copy the URL (e.g., `https://your-app.railway.app`)

---

## Step 4: Test Your Server

### 4.1 Health Check

```bash
curl https://your-app.railway.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "serverWallet": "0x...",
  "timestamp": 1234567890
}
```

### 4.2 Test Game Start

```bash
curl -X POST https://your-app.railway.app/api/game/start \
  -H "Content-Type: application/json" \
  -d '{
    "playerAddress": "0x...",
    "baseSeed": "0x..."
  }'
```

---

## Step 5: Update Your Contract

### 5.1 Set Server Wallet in Contract

Make sure your contract's `serverWallet` matches the wallet you generated:

```solidity
// In your contract deployment
constructor(
    address _entropyAddress,
    address _serverWallet  // Use the address from Step 2.4
)
```

---

## Step 6: Update Frontend

### 6.1 Update API URL

In your frontend code, update the server URL:

```javascript
const SERVER_URL = 'https://your-app.railway.app';
```

### 6.2 Test Integration

1. Start a game
2. Play the game
3. End the game
4. Claim reward

---

## Troubleshooting

### Database Connection Issues

**Problem**: "Connection refused" or "Database not found"

**Solution**:
1. Check `DATABASE_URL` in Railway variables
2. Make sure database is running
3. Check database schema was created

### Server Not Starting

**Problem**: Server crashes on startup

**Solution**:
1. Check Railway logs
2. Verify all environment variables are set
3. Check `SERVER_PRIVATE_KEY` is valid
4. Check `SERVER_SECRET_KEY` is set

### CORS Errors

**Problem**: Frontend can't connect to server

**Solution**:
1. Add your frontend domain to `ALLOWED_ORIGINS`
2. Format: `https://your-domain.com,http://localhost:3000`

### Rate Limiting

**Problem**: Too many requests error

**Solution**:
1. Adjust `RATE_LIMIT_MAX_REQUESTS` in environment variables
2. Or increase `RATE_LIMIT_WINDOW_MS`

---

## Monitoring

### View Logs

1. Go to your service in Railway
2. Click **"Deployments"** → Select deployment → **"View Logs"**

### View Database

1. Go to your database in Railway
2. Click **"Data"** tab
3. View tables and data

### Metrics

Railway shows:
- CPU usage
- Memory usage
- Network traffic
- Request count

---

## Cost Management

### Railway $5 Hobby Plan

- ✅ $5 credit/month
- ✅ Usually enough for small-medium apps
- ✅ Pay-as-you-go after credit

### Monitor Usage

1. Go to Railway dashboard
2. Click **"Usage"** tab
3. See current month's usage

### Tips to Stay Under Budget

- Use efficient database queries
- Implement caching if needed
- Monitor and optimize

---

## Next Steps

1. ✅ Database set up
2. ✅ Server deployed
3. ✅ Environment variables configured
4. ✅ Server URL obtained
5. ✅ Frontend connected
6. ✅ Testing complete

**Your server is now live! 🚀**

---

## Quick Reference

### Server Endpoints

- `GET /api/health` - Health check
- `POST /api/game/start` - Start game
- `POST /api/game/end` - End game and reveal RNG
- `POST /api/game/verify-and-sign` - Verify and sign claim
- `GET /api/game/state/:gameId` - Get game state
- `POST /api/game/verify-commitment` - Verify RNG commitment

### Important Files

- `server/index.js` - Main server file
- `server/db/schema.sql` - Database schema
- `server/package.json` - Dependencies
- `server/.env` - Environment variables (not in git!)

### Monorepo Notes

- **Root Directory**: Set to `server` in Railway settings
- **Database**: Created separately in Railway
- **Frontend**: `shotgun-app/` is separate (not deployed to Railway)
- **Contracts**: `contracts/` are deployed separately with Hardhat

### Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

