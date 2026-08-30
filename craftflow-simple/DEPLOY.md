# CraftFlow Deployment Guide
## Free Deployment: Render (Backend) + Vercel (Frontend)

---

## Step 1 — Push to GitHub

Make sure your code is on GitHub first.

---

## Step 2 — Deploy Backend on Render (Free)

1. Go to **render.com** → Sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Set **Root Directory** → `backend`
5. Set these:
   - **Runtime**: Java
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/craftflow-backend-1.0.0.jar`
6. Under **Environment Variables** add:
   ```
   JWT_SECRET=any-long-random-string-minimum-32-characters
   CORS_ORIGINS=https://your-app.vercel.app
   ```
7. Click **Create Web Service**
8. Wait 3-5 minutes → copy your Render URL (e.g. `https://craftflow-backend.onrender.com`)

> Note: Render free tier sleeps after 15 min of inactivity. First request takes ~30 seconds to wake up.

---

## Step 3 — Deploy Frontend on Vercel (Free)

1. Go to **vercel.com** → Sign up with GitHub
2. Click **New Project** → import your repo
3. Set **Root Directory** → `frontend`
4. Under **Environment Variables** add:
   ```
   VITE_API_URL=https://craftflow-backend.onrender.com/api
   ```
   (paste your Render URL from Step 2)
5. Click **Deploy**
6. Done! Your app is live at `https://your-app.vercel.app`

---

## Step 4 — Update CORS on Render

1. Go back to Render → your backend service → **Environment**
2. Update `CORS_ORIGINS` to your actual Vercel URL:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   ```
3. Render auto-redeploys

---

## Running Locally (No setup needed!)

**Backend:**
```bash
cd backend
mvn spring-boot:run
```
Starts on http://localhost:8080
H2 Console at http://localhost:8080/api/h2-console

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Opens on http://localhost:3000

---

## Notes

- Uses **H2 in-memory database** — no PostgreSQL setup needed
- Data resets every time the backend restarts (fine for portfolio)
- To persist data, upgrade to Render PostgreSQL addon (free tier available)
