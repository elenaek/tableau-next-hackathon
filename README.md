# Patient Transparency Portal - Tableau Next Hackathon 🏥

A healthcare transparency solution built for the **Tableau Next Hackathon**, demonstrating the power of Salesforce's ecosystem to bring clarity and understanding to the patient care journey.

![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Salesforce](https://img.shields.io/badge/Salesforce-Platform-00A1E0?style=for-the-badge&logo=salesforce)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🎯 Project Vision

Bringing **transparency to the ER/Hospital system** by empowering:
- **Patients** to better understand their diagnoses, treatment process, and what to expect during their stay
- **Care Teams** to view patient metrics and collaborate more effectively (Phase 2)

## ✨ Key Features

### Patient Dashboard
- **Real-time Patient Information** - View admission details, diagnosis, and care team
- **Treatment Progress Tracker** - Interactive, expandable timeline of care journey
- **Department Status** - Live occupancy rates and estimated wait times
- **AI-Powered Insights** - Compassionate, easy-to-understand explanations of medical conditions

### Medical Records Management
- **Comprehensive Record Access** - Lab results, imaging, consultations, prescriptions
- **Smart Filtering & Search** - Quickly find specific records
- **AI Record Explanations** - Understand complex medical terminology
- **Document Attachments** - View related files and reports

### Vital Signs Monitoring
- **Five Core Vitals** - Heart rate, blood pressure, temperature, respiratory rate, O2 saturation
- **Visual Charts & Trends** - 7-day historical data with trend analysis
- **Status Indicators** - Clear alerts for abnormal readings
- **Interactive Detailed Views** - Drill down into specific metrics

### Department Metrics Dashboard
- **Hospital-Wide Analytics** - Real-time occupancy across all departments
- **Tableau Next Integration** - Static dashboard images with caching
- **Smart Caching** - Auto-loads cached dashboards for instant viewing
- **AI Metrics Analysis** - Understand how department occupancy affects care

### Agentforce AI Assistant
- **Context-Aware Chat** - Understands which page you're viewing
- **HIPAA-Compliant Messaging** - Secure communication about your care
- **Medical Explanations** - Get answers about diagnoses, treatments, and procedures
- **Wait Time Predictions** - AI calculates estimated wait times based on occupancy
- **Department Analytics** - Explains hospital capacity and resource allocation
- **24/7 Availability** - Always-on support powered by Salesforce Einstein

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Salesforce Developer Account
- Data Cloud Access (for real data integration)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/tableau-next-hackathon.git
cd tableau-next-hackathon
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env.local` file with:
```env
# Authentication
TNEXT_PATIENT_USERNAME="your-username"
TNEXT_PATIENT_PW="your-secure-password"

# Salesforce OAuth2
SALESFORCE_CLIENT_ID="your-consumer-key"
SALESFORCE_CLIENT_SECRET="your-consumer-secret"
SALESFORCE_TOKEN_URL="https://your-instance.salesforce.com/services/oauth2/token"
SALESFORCE_AI_INSIGHTS_MODEL="sfdc_ai__DefaultGPT35Turbo"

# Tableau Next REST API (for dashboard images)
# Uses existing Salesforce OAuth - no additional config needed
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials
- Username: `patient-demo`
- Password: (check your `.env.local` file)

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.5.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **Framer Motion** - Smooth animations
- **Lucide Icons** - Beautiful icon set

### Backend & Integration
- **Salesforce Data Cloud** - Patient data management
- **Agentforce Model API** - AI-powered insights (Einstein GPT)
- **Salesforce REST API** - OAuth2 authenticated data access
- **Tableau Next REST API** - Dashboard image downloads with caching
- **LocalStorage Caching** - Smart session-based caching for performance

### UI Components
- **Radix UI** - Accessible component primitives
- **React Markdown** - Render AI responses with formatting
- **Aceternity UI** - Premium animated components

## 📁 Project Structure

```
src/
├── app/
│   ├── api/               # Server-side API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── patient/       # Patient data endpoints
│   │   ├── department/    # Department status
│   │   ├── ai-insights/   # AI insight generation
│   │   └── chat/          # Agentforce chat API
│   ├── context/           # React contexts (Auth, Chat)
│   ├── patient/           # Patient portal pages
│   │   ├── dashboard/     # Main patient dashboard
│   │   ├── records/       # Medical records viewer
│   │   ├── vitals/        # Vital signs monitoring
│   │   ├── metrics/       # Department metrics analytics
│   │   └── messages/      # Secure messaging
│   └── lib/               # Utilities and helpers
├── components/
│   ├── ui/                # Reusable UI components
│   ├── AgentforceChat.tsx # AI chat interface
│   └── TableauNextDashboard.tsx # Tableau dashboard component
└── lib/
    └── salesforce/        # Salesforce API client
```

## 🔐 Security Features

- **Server-side Authentication** - Credentials never exposed to client
- **Session Management** - HTTP-only cookies for security
- **SQL Injection Protection** - Parameterized queries and input validation
- **API Route Protection** - Middleware-based authentication
- **HIPAA Considerations** - Secure data handling practices

## 🎨 Key UI Features

- **Responsive Design** - Works on all screen sizes
- **Accessible Components** - WCAG compliant
- **Real-time Updates** - Live data synchronization
- **Smooth Animations** - Delightful user interactions
- **Collapsible Sidebar** - Maximizes screen space for content
- **Smart Caching** - Instant loading with session-based cache
- **Draggable Chat** - Reposition AI assistant anywhere on screen

## 📊 Data Flow

1. **Patient Data** - Fetched from Salesforce Data Cloud
2. **AI Processing** - Agentforce Model API generates insights
3. **Real-time Updates** - Department status and vitals refresh
4. **Context Awareness** - Chat understands current page context
5. **Secure Storage** - LocalStorage for UI state, server for sensitive data
6. **Dashboard Images** - Tableau Next REST API for static dashboard snapshots
7. **Smart Caching** - Session-based caching with automatic cleanup

## 🚦 Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Type checking
npm run type-check
```

## 🤝 Contributing

This project was created for the Tableau Next Hackathon. While it's primarily a demonstration, we welcome feedback and suggestions for improving healthcare transparency.

## 📝 Important Notes

- **All patient data is SYNTHETIC** - Generated for demonstration purposes only
- **Demo Mode** - Includes disclaimers for hackathon context
- **Compassionate Design** - All AI responses use encouraging, patient-first language
- **Accessibility First** - Designed for patients of all ages and abilities
- **Tableau Next Integration** - Uses new 2025 REST API for dashboard downloads
- **AI Wait Time Predictions** - Intelligent formula-based estimations by priority

## 🏆 Hackathon Focus Areas

1. **Transparency** - Making healthcare understandable
2. **AI Empowerment** - Using Agentforce for patient education
3. **Platform Integration** - Showcasing Salesforce ecosystem capabilities
4. **User Experience** - Intuitive, compassionate interface design

## 📄 License

This project is part of the Tableau Next Hackathon submission and is intended for demonstration purposes.

## 👥 Team

Created with ❤️ for the Tableau Next Hackathon

---

*"Empowering patients through transparency, understanding, and compassionate care"*
