# Deployment Instructions

## Backend Deployment (Render.com - Free Tier)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com) and sign in
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `hkadakia05/LungOC`
   - Configure settings:
     - **Name**: `lungoc-api` (or your choice)
     - **Region**: Oregon (or closest to your users)
     - **Branch**: `main`
     - **Root Directory**: Leave empty
     - **Build Command**: `pip install -r src/backend/requirements.txt`
     - **Start Command**: `cd src/backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Copy your API URL (e.g., `https://lungoc-api.onrender.com`)

## Frontend Deployment (Vercel - Free Tier)

1. **Update API URL**
   - In your local `.env` file in the `frontend` directory, add:
     ```
     VITE_API_URL=https://your-api-url.onrender.com
     ```
   - For Vercel, you'll set this as an environment variable in their dashboard

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New" → "Project"
   - Import your GitHub repository: `hkadakia05/LungOC`
   - Configure settings:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add Environment Variable:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://your-api-url.onrender.com` (your Render backend URL)
   - Click "Deploy"
   - Your app will be live at `https://your-project.vercel.app`

## Alternative: Netlify for Frontend

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select `hkadakia05/LungOC`
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL
6. Deploy

## Local Development

**Backend:**
```bash
cd src/backend
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Important Notes

- **Model File**: Make sure `lung_model.pth` is in `src/backend/` directory
- **CORS**: Already configured to allow all origins
- **Free Tier Limitations**: 
  - Render free tier may sleep after inactivity (cold starts ~30s)
  - Consider upgrading for production use
- **Environment Variables**: Always use environment variables for API URLs, never hardcode

## Troubleshooting

- **Backend won't start**: Check `lung_model.pth` is present
- **CORS errors**: Verify backend URL is correct in frontend env vars
- **API timeout**: Render free tier has 30s cold start - first request may be slow
