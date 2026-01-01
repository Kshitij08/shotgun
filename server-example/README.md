# Shotgun Roulette Server

Backend server for the Shotgun Roulette game with commit-reveal RNG and server verification.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required:**
- `SERVER_PRIVATE_KEY` - Your server wallet private key
- `SERVER_SECRET_KEY` - Random secret key (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `DATABASE_URL` - PostgreSQL connection string (provided by hosting)

### 3. Set Up Database

Run the SQL schema (see `db/schema.sql`)

### 4. Run Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## Deployment

### Railway.app (Recommended)

1. Sign up at railway.app
2. Connect GitHub repo
3. Add PostgreSQL database
4. Set environment variables
5. Deploy!

### Render.com

1. Sign up at render.com
2. Create Web Service
3. Add PostgreSQL database
4. Set environment variables
5. Deploy!

## API Endpoints

- `POST /api/game/start` - Start new game
- `POST /api/game/move` - Process player move
- `POST /api/game/result` - Get signed game result
- `POST /api/game/verify-and-sign` - Verify and sign claim
- `GET /api/health` - Health check

## Security

- ✅ Rate limiting
- ✅ CORS protection
- ✅ Environment variable secrets
- ✅ Database connection pooling
- ✅ Input validation

## Environment Variables

See `.env.example` for all required variables.

**Important:** Never commit `.env` file to git!

