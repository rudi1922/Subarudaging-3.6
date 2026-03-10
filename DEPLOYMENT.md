# Deployment Guide

This guide explains how to deploy your React application to Vercel and integrate it with Supabase.

## 1. GitHub Repository

1.  Create a new repository on GitHub (e.g., `subaru-erp`).
2.  Initialize a git repository in your project folder if you haven't already:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
3.  Link your local repository to GitHub:
    ```bash
    git remote add origin https://github.com/your-username/subaru-erp.git
    git branch -M main
    git push -u origin main
    ```

## 2. Supabase Integration

1.  **Create a Supabase Project:**
    *   Go to [Supabase](https://supabase.com/) and sign up/log in.
    *   Create a new project.
    *   Note down your `Project URL` and `anon public key` from the API settings.

2.  **Database Setup:**
    *   You will need to create tables in Supabase that match your data structure (e.g., `products`, `transactions`, `employees`, etc.).
    *   You can use the SQL Editor in Supabase to create these tables.

3.  **Environment Variables:**
    *   In your local project, copy `.env.example` to `.env` (do not commit `.env` to GitHub).
    *   Fill in your Supabase URL and Key:
        ```env
        VITE_SUPABASE_URL=your-project-url
        VITE_SUPABASE_ANON_KEY=your-anon-key
        ```

4.  **Code Integration:**
    *   The file `supabase.ts` has been created to initialize the Supabase client.
    *   **Important:** Currently, the app uses mock data in `StoreContext.tsx`. To fully integrate Supabase, you need to modify `StoreContext.tsx` to fetch data from Supabase tables using `supabase.from('table_name').select('*')` and replace the mock data.

## 3. Vercel Deployment

1.  **Sign Up/Log In:**
    *   Go to [Vercel](https://vercel.com/) and sign up using your GitHub account.

2.  **Import Project:**
    *   Click "Add New..." -> "Project".
    *   Select your GitHub repository (`subaru-erp`).

3.  **Configure Project:**
    *   **Framework Preset:** Vercel should automatically detect "Vite".
    *   **Root Directory:** `./` (default).
    *   **Build Command:** `npm run build` (default).
    *   **Output Directory:** `dist` (default).
    *   **Environment Variables:**
        *   Add `VITE_SUPABASE_URL` and paste your Supabase Project URL.
        *   Add `VITE_SUPABASE_ANON_KEY` and paste your Supabase Anon Key.

4.  **Deploy:**
    *   Click "Deploy". Vercel will build and deploy your application.

## 4. Sharing the App

*   Once deployed, Vercel will provide a URL (e.g., `subaru-erp.vercel.app`).
*   You can share this link with your employees.

## 5. Future Migration

*   If you want to move to another hosting provider later, you can simply connect your GitHub repository to the new provider (e.g., Netlify, AWS Amplify) or build the project locally (`npm run build`) and upload the `dist` folder to any static hosting service.
*   To use a custom domain on Vercel, go to your project settings -> Domains and add your domain.
