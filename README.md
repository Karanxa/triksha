# Welcome to Geraid

## Project info

**URL**: https://lovable.dev/projects/be33e0b7-385f-407c-bc6c-36be439fca6f

## How can I run this project?

There are several ways to run this application:

**Using Docker (Recommended)**

1. Make sure you have Docker installed on your machine
2. Clone this repository
3. Create a `.env` file in the root directory with the following variables:
```sh
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
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

If you want to work locally using your own IDE without Docker, you can:

Requirements:
- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Bun (optional but recommended for faster package installation) - [install guide](https://bun.sh/docs/installation)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Create a .env file with the required environment variables
cp .env.example .env
# Edit the .env file with your values

# Step 4: Install the necessary dependencies (using bun or npm).
bun install
# or
npm install

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Required Environment Variables

The following environment variables are required to run the application:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase project's anonymous key

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