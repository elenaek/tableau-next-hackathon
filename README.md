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
- **Encrypted Messaging** - Secure communication about your care
- **Medical Explanations** - Get answers about diagnoses, treatments, and procedures
- **Wait Time Predictions** - AI calculates estimated wait times based on occupancy
- **Department Analytics** - Explains hospital capacity and resource allocation
- **24/7 Availability** - Always-on support powered by Salesforce Einstein
- **Character Limit** - 300 character limit on messages for optimal AI responses
- **Rate Limiting** - Prevents abuse with 10 requests/minute per IP

### Interactive Guided Tours
- **First-Time User Onboarding** - Interactive walkthrough of key features
- **React Joyride Integration** - Step-by-step tooltips and highlights
- **Contextual Help** - Learn about features as you explore
- **Persistent Settings** - Tour preferences saved in localStorage

### Rate Limiting & Security
- **Per-IP Rate Limiting** - Upstash Redis-based rate limiting across all endpoints
- **Tiered Limits** - Different limits for AI (10/min), Auth (5/15min), Data (30/min)
- **Graceful Degradation** - Works without Upstash in development
- **Visual Notifications** - User-friendly warnings when limits are reached
- **Analytics Tracking** - Built-in analytics for monitoring abuse patterns

### User Notifications
- **Floating Notifications** - Beautiful animated toast notifications
- **Rate Limit Warnings** - Clear feedback when API limits are hit
- **Context-Aware Messaging** - Different messages for different limit types
- **Auto-Dismiss** - Configurable duration with manual close option
- **Multiple Banners** - Demo, project info, and voting banners with localStorage persistence

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

# Upstash Redis (for rate limiting - optional in development)
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"

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
- **Upstash Redis** - Serverless rate limiting and analytics
- **LocalStorage Caching** - Smart session-based caching for performance

### UI Components
- **Radix UI** - Accessible component primitives
- **React Markdown** - Render AI responses with formatting
- **React Joyride** - Interactive guided tours
- **Zustand** - Lightweight state management
- **Framer Motion** - Animated notifications and transitions
- **Aceternity UI** - Premium animated components

## 📁 Project Structure

```
src/
├── app/
│   ├── api/               # Server-side API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── patient/       # Patient data endpoints
│   │   ├── department/    # Department status & metrics
│   │   ├── ai-insights/   # AI insight generation
│   │   ├── chat/          # Agentforce chat API
│   │   └── tableau-image/ # Tableau dashboard snapshots
│   ├── context/           # React contexts
│   │   ├── AuthContext.tsx        # Authentication state
│   │   ├── ChatContext.tsx        # Chat state management
│   │   ├── TourContext.tsx        # Guided tour state
│   │   └── NotificationContext.tsx # Global notifications
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
    ├── rate-limit.ts      # Upstash rate limiting
    └── salesforce/        # Salesforce API client
```

## 🔐 Security Features

- **Server-side Authentication** - Credentials never exposed to client
- **Session Management** - HTTP-only cookies for security
- **Rate Limiting** - Per-IP limits on all API endpoints
  - AI endpoints: 10 requests/minute
  - Auth endpoints: 5 requests/15 minutes
  - Data endpoints: 30 requests/minute
- **Input Validation** - Character limits and type checking on all inputs
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
- **Floating Notifications** - Beautiful toast notifications for user feedback
- **Dismissible Banners** - Demo, project, and voting banners with persistence
- **Character Counters** - Real-time feedback on input limits

## 📊 Data Flow

1. **Patient Data** - Fetched from Salesforce Data Cloud
2. **AI Processing** - Agentforce Model API generates insights
3. **Real-time Updates** - Department status and vitals refresh
4. **Context Awareness** - Chat understands current page context
5. **State Management** - Zustand for global state, localStorage for persistence
6. **Secure Storage** - LocalStorage for UI state, server for sensitive data
7. **Dashboard Images** - Tableau Next REST API for static dashboard snapshots
8. **Smart Caching** - Session-based caching with automatic cleanup

## 🚦 Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build with Turbopack
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

## 🔧 Troubleshooting

### Dependency Issues
If you encounter peer dependency warnings with React 19:
- The project includes a `.npmrc` file with `legacy-peer-deps=true`
- This allows compatibility with libraries that haven't updated to React 19 yet

### Build Issues on Vercel
- Ensure the `.npmrc` file is committed to your repository
- The build uses Next.js 15.5.3 with Turbopack for optimal performance

### Rate Limiting Setup
To enable rate limiting in production:
1. Create a free account at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and Token
4. Add to Vercel environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
5. Rate limiting works without these in development (graceful degradation)

## 🤝 Contributing

This project was created for the Tableau Next Hackathon. While it's primarily a demonstration, we welcome feedback and suggestions for improving healthcare transparency.

## 📝 Important Notes

- **All patient data is SYNTHETIC** - Generated for demonstration purposes only
- **Demo Mode** - Includes disclaimers for hackathon context
- **Compassionate Design** - All AI responses use encouraging, patient-first language
- **Accessibility First** - Designed for patients of all ages and abilities
- **Tableau Next Integration** - Uses new 2025 REST API for dashboard downloads
- **AI Wait Time Predictions** - Intelligent formula-based estimations by priority
- **React 19 Compatibility** - Using legacy peer deps for library compatibility
- **Guided Tour Support** - Interactive onboarding for new users
- **Rate Limiting** - Production-ready with Upstash Redis, graceful degradation in dev
- **Character Limits** - 300 character max on chat messages for optimal AI performance
- **User Notifications** - Visual feedback for rate limits and system messages

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
