<div align="center">
  <img src="public/lovable-uploads/1b4300b9-bc60-4940-92c6-406befe6fd18.png" alt="Triksha Interface" width="800"/>

  # Triksha - LLM Security Testing Platform

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
</div>

## 📋 Product Overview

Triksha is a comprehensive security testing platform designed specifically for Large Language Models (LLMs). It provides organizations with the tools needed to identify, analyze, and mitigate potential security vulnerabilities in their AI models.

### Core Value Proposition

- **Proactive Security**: Identify vulnerabilities before they can be exploited
- **Comprehensive Testing**: Multi-layered approach to security assessment
- **Actionable Insights**: Clear reporting and remediation recommendations
- **Continuous Monitoring**: Automated scanning and alerts

## 🎯 Key Features & Capabilities

### 1. Security Scanning Modules

#### Manual Scanning
- Single-prompt vulnerability testing
- Real-time response analysis
- Immediate vulnerability detection
- Custom test case creation

#### Batch Scanning
- Process multiple prompts simultaneously
- CSV file support for bulk testing
- Configurable QPS (Queries Per Second)
- Progress tracking and reporting

#### Contextual Analysis
- Deep behavioral analysis
- Model fingerprinting
- Response pattern analysis
- Context-aware vulnerability detection

### 2. Test Suite Management

#### Custom Test Cases
- Create and manage test scenarios
- Define expected behaviors
- Set validation rules
- Categorize tests by vulnerability type

#### Pre-built Templates
- Common vulnerability patterns
- Industry-standard security tests
- Customizable test parameters
- Version control for test cases

### 3. Monitoring & Automation

#### Scheduled Scans
- Automated security monitoring
- Configurable scan frequencies
- Custom scan parameters
- Email notifications for critical findings

#### Real-time Alerts
- Immediate vulnerability notifications
- Severity-based alerting
- Custom alert thresholds
- Integration with notification systems

### 4. Analysis & Reporting

#### Vulnerability Assessment
- Detailed scan results
- Severity classification
- Impact analysis
- Remediation recommendations

#### Performance Metrics
- Response time analysis
- Model behavior patterns
- Success/failure rates
- Historical trend analysis

### 5. Model Management

#### Multi-Provider Support
- OpenAI integration
- Anthropic models
- Google AI (Gemini)
- Custom model endpoints

#### Fine-tuning Capabilities
- Security-focused model training
- Custom dataset creation
- Performance optimization
- Model behavior modification

## 🔒 Security Categories

1. **Prompt Injection**
   - Command injection detection
   - System prompt leakage
   - Prompt boundary testing
   - Context manipulation checks

2. **Data Leakage**
   - Training data extraction
   - Model information disclosure
   - Sensitive data handling
   - Privacy boundary testing

3. **Model Behavior**
   - Response consistency
   - Output validation
   - Error handling
   - Edge case testing

4. **Safety Bounds**
   - Content filtering
   - Output sanitization
   - Ethical boundary testing
   - Safety layer validation

5. **System Prompt**
   - Role adherence
   - Instruction following
   - Context maintenance
   - Behavioral consistency

6. **Performance**
   - Response time
   - Token optimization
   - Resource utilization
   - Scaling capabilities

## 💻 Technical Architecture

### Frontend Stack
- React + TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- Vite for build tooling

### Backend Infrastructure
- Supabase for data persistence
- Edge Functions for custom logic
- Real-time WebSocket support
- Secure API integrations

### Database Schema
- User management
- Test case storage
- Scan results
- Historical data

### Security Features
- Row Level Security (RLS)
- API key management
- User authentication
- Data encryption

## 🚀 Getting Started

### Prerequisites

1. Create a Supabase Project:
   - Go to [Supabase](https://supabase.com) and create a new project
   - Navigate to Project Settings -> API
   - Copy your Project URL and anon/public key

2. Configure API Keys:
   - OpenAI API key (Get it from [OpenAI Platform](https://platform.openai.com/api-keys))
   - Other provider keys as needed

### Installation Options

#### 🐳 Using Docker (Recommended)

```sh
# Build the Docker image
docker build -t triksha-app .

# Run the container with your environment variables
docker run -p 5173:5173 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_supabase_anon_key \
  triksha-app
```

#### 💻 Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Create .env file with your Supabase credentials
echo "VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key" > .env

# Start development server
npm run dev
```

## 📈 Future Roadmap

### Phase 1: Enhanced Analysis
- Advanced fingerprinting algorithms
- Improved vulnerability detection
- Extended model support
- Custom test suite marketplace

### Phase 2: Enterprise Features
- Team collaboration tools
- Role-based access control
- Audit logging
- Compliance reporting

### Phase 3: Advanced Automation
- CI/CD integration
- Automated remediation
- Advanced analytics
- Custom workflow builder

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to:
- Submit bug reports
- Request features
- Submit pull requests
- Join our community

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- Documentation: [docs.triksha.ai](https://docs.triksha.ai)
- Discord Community: [Join](https://discord.gg/triksha)
- Email Support: support@triksha.ai

---

<div align="center">
  Made with ❤️ by the Triksha Team
</div>