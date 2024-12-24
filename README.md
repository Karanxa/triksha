<div align="center">
  <img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80" alt="Triksha Banner" width="800"/>

  # Triksha - LLM Security Testing Platform

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
</div>

## 🚀 Overview

Triksha is a comprehensive platform for testing and enhancing the security of Large Language Models (LLMs). With advanced scanning capabilities, contextual analysis, and customizable security tests, Triksha helps ensure your AI models are robust and secure.

<div align="center">
  <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80" alt="Features Preview" width="800"/>
</div>

## ✨ Key Features

- 🔒 **LLM Security Scanning**: Comprehensive security testing for language models
- 🎯 **Contextual Analysis**: Deep dive into model behavior patterns
- 📊 **Detailed Results**: In-depth analysis and vulnerability reporting
- 🔄 **Custom Testing**: Create and manage your own security test suites
- 📈 **Fine-tuning**: Enhance model security through targeted training
- 📆 **Scheduled Scans**: Automated security monitoring

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase
- **Containerization**: Docker
- **Authentication**: Supabase Auth

## 🚦 Getting Started

### Prerequisites

Before running this project, you need to set up your own Supabase project:

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Go to Project Settings -> API to find your:
   - Project URL (VITE_SUPABASE_URL)
   - Project API Key (VITE_SUPABASE_ANON_KEY)
3. Create a `.env` file in the root directory:

```sh
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_project_anon_key
```

### Installation Options

#### 🐳 Using Docker (Recommended)

```sh
# Build the Docker image
docker build -t triksha-app .

# Run the container
docker run -p 5173:5173 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_supabase_anon_key \
  triksha-app
```

#### 💻 Local Development

Requirements:
- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🌐 Deployment

### Quick Deploy
Simply open [Lovable](https://lovable.dev/projects/be33e0b7-385f-407c-bc6c-36be439fca6f) and click on Share -> Publish.

### Custom Domain
While we don't currently support custom domains directly, you can deploy your project using Netlify. Visit our [Custom Domains Documentation](https://docs.lovable.dev/tips-tricks/custom-domain/) for detailed instructions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or need help, please open an issue in the repository or contact our support team.

---

<div align="center">
  Made with ❤️ using <a href="https://lovable.dev">Lovable</a>
</div>