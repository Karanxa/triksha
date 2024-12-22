# Welcome to Geraid

## Project info

## Supabase Setup (Required)

Before running this project, you need to set up your own Supabase project:

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Once created, go to Project Settings -> API to find your:
   - Project URL (VITE_SUPABASE_URL)
   - Project API Key (VITE_SUPABASE_ANON_KEY)
3. Create a `.env` file in the root directory with these values:
```sh
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_project_anon_key
```

## How can I run this project?

There are several ways to run this application:

**Using Docker (Recommended)**

1. Make sure you have Docker installed on your machine
2. Clone this repository
3. Set up Supabase as described above
4. Navigate to the project directory
5. Build and run the Docker container:

```sh
# Build the Docker image
docker build -t geraid-app .

# Run the container
docker run -p 5173:5173 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_supabase_anon_key \
  geraid-app
```

6. Open your browser and visit `http://localhost:5173`

**Use your preferred IDE**

Requirements:
- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Set up Supabase as described in the Supabase Setup section
# Create a .env file with your Supabase credentials

# Step 4: Install the necessary dependencies
npm install

# Step 5: Start the development server
npm run dev
```

## Required Environment Variables

The following environment variables are required to run the application:

- `VITE_SUPABASE_URL`: Your Supabase project URL (found in Project Settings -> API)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase project's anonymous key (found in Project Settings -> API)

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend & Authentication)
- Docker

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/be33e0b7-385f-407c-bc6c-36be439fca6f) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)