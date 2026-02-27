# 🌌 MOODVERSE — Deployment Guide

Your Anthropic API key is stored **only** in the `.env` file on your server.
Users never see it. It never appears in the frontend code.

---

## 📁 Project Structure

```
moodverse/
├── server.js          ← Backend (your API key lives here securely)
├── package.json       ← Dependencies
├── .env               ← YOUR SECRET FILE (never share or commit this)
├── .env.example       ← Safe template (no real key)
├── .gitignore         ← Keeps .env out of git
└── public/
    └── index.html     ← The full Moodverse frontend
```

---

## 🔑 Step 1 — Get a New API Key

1. Go to **https://console.anthropic.com**
2. Click **API Keys** → **Create Key**
3. Copy the key (starts with `sk-ant-`)
4. ⚠️ Keep this key secret. Never share it or put it in public code.

---

## 🛠️ Step 2 — Set Up Locally (Test First)

```bash
# 1. Install Node.js if you don't have it
#    Download from https://nodejs.org (get the LTS version)

# 2. Open a terminal in the moodverse folder and run:
npm install

# 3. Create your .env file
cp .env.example .env

# 4. Open .env in any text editor and replace the placeholder:
#    ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# 5. Start the server
npm start

# 6. Open your browser and go to:
#    http://localhost:3000
```

You should see Moodverse running! ✅

---

## 🚀 Deploy to Railway (Easiest — Free Tier Available)

Railway is the simplest way to deploy. Takes about 5 minutes.

### Step-by-step:

**1. Create a GitHub repo**
```bash
# In your moodverse folder:
git init
git add .
git commit -m "Initial Moodverse deployment"
```

Then go to **github.com → New Repository** → name it `moodverse` → push your code:
```bash
git remote add origin https://github.com/YOUR-USERNAME/moodverse.git
git push -u origin main
```

**2. Deploy on Railway**
1. Go to **https://railway.app** and sign up (free)
2. Click **New Project → Deploy from GitHub repo**
3. Select your `moodverse` repo
4. Railway auto-detects Node.js and deploys it ✅

**3. Add your API key as an environment variable**
1. In your Railway project, click **Variables**
2. Click **New Variable**
3. Name: `ANTHROPIC_API_KEY`
4. Value: `sk-ant-your-actual-key-here`
5. Click **Add**
6. Railway automatically restarts your app

**4. Get your live URL**
Railway gives you a URL like: `https://moodverse-production.up.railway.app`

That's your live app! Share it with the world 🌍

---

## 🟢 Deploy to Render (Also Free)

1. Go to **https://render.com** → Sign up
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your key
6. Click **Create Web Service**

Your app will be live at `https://moodverse.onrender.com` (or similar)

---

## ⚡ Deploy to Vercel (Serverless)

Vercel requires a small adjustment for serverless functions but works great.

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project folder
3. Follow the prompts
4. Add environment variable: `vercel env add ANTHROPIC_API_KEY`

---

## 💰 Monetization Setup

Once your app is live, here's how to add real payments:

### Option A — Stripe (Recommended)
1. Create account at **stripe.com**
2. Add these routes to `server.js`:
   - `POST /api/create-checkout` → Stripe payment link
   - `POST /api/webhook` → Handle successful payments
3. On payment success, grant user unlimited credits in your database

### Option B — Gumroad (No-code)
1. Create a product on **gumroad.com** ($4.99/mo)
2. Add a "Buy" button to your app linking to Gumroad
3. Use Gumroad's webhooks to unlock features

### Option C — Buy Me a Coffee / Ko-fi
Simplest: add a donation button. Great for early traction.

---

## 📊 Add Analytics (Free)

Track your visitors and understand your audience:

1. **Google Analytics**: Add the GA4 script to `public/index.html`
2. **Plausible** (privacy-friendly): `<script src="https://plausible.io/js/script.js" data-domain="yourdomain.com"></script>`
3. **Hotjar**: Watch real user sessions

---

## 🔒 Security Checklist

- ✅ `.env` is in `.gitignore` (never committed)
- ✅ API key only in server environment variables
- ✅ Rate limiting: 20 portraits/hour per IP
- ✅ Input validation on all fields
- ✅ Journal entries sanitized (no HTML injection)
- ✅ CORS configured

---

## 🆘 Troubleshooting

**"Missing ANTHROPIC_API_KEY" error on startup**
→ Make sure your `.env` file exists and has the correct key

**Port already in use**
→ Change `PORT=3001` in `.env`

**"Cannot GET /"**
→ Make sure `public/index.html` exists

**API calls returning 401**
→ Your API key is invalid or revoked — generate a new one at console.anthropic.com

**Rate limit errors from Anthropic**
→ You've hit your API quota — check usage at console.anthropic.com/usage

---

## 📞 Need Help?

The app is fully self-contained. If you get stuck:
1. Check your `.env` file has the real API key
2. Run `npm install` again
3. Check Railway/Render logs for error messages

Good luck with Moodverse! 🌌
