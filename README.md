# 🧭 JetSet - AI Travel Planner

An AI-powered travel planning SaaS that creates personalized itineraries using Groq's fast AI models and modern web technologies.

## 🚀 Features

- **AI-Powered Itinerary Generation**: Creates detailed travel plans using Groq's fast AI models
- **Multi-Step Trip Wizard**: Intuitive 4-step process for trip planning
- **Budget Management**: Smart cost estimation and budget tracking
- **Personalized Recommendations**: Tailored suggestions based on traveler personas
- **Beautiful UI**: Modern, responsive design with shadcn/ui components
- **Trip Management**: Dashboard to manage and view all your trips
- **Local Storage**: Trips saved locally (ready for Supabase integration)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **AI Integration**: Groq AI API
- **Database**: Supabase (PostgreSQL) - configured but not yet integrated
- **Authentication**: Supabase Auth - ready for implementation
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## 📦 Project Structure

```
jetset/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Trip management dashboard
│   ├── itinerary/[id]/    # AI-generated itinerary display
│   ├── plan/              # Trip creation wizard
│   └── layout.tsx         # Root layout with header/footer
├── components/            
│   ├── layout/            # Header and footer components
│   ├── trip-wizard/       # Multi-step trip creation form
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── groq.ts            # Server-side AI integration
│   ├── types.ts           # Shared TypeScript interfaces
│   ├── supabase.ts        # Database client and types
│   └── utils.ts           # Utility functions
└── lib/database.sql       # Database schema with RLS policies
```

## 🎯 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Groq API key
- Supabase account (for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jetset
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   touch .env.local
   ```

   Add your API keys to `.env.local`:
   ```env
   # Groq AI API Key (Required)
# Get your API key from: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

   # Optional: Supabase Configuration (not required for MVP)
   # NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Get your Groq API key**
   - Visit [Groq Console](https://console.groq.com/keys)
   - Create a new API key
   - Copy the API key and add it to your `.env.local` file
   - ⚠️ **Important**: Keep your API key secure and never commit it to version control

5. **Set up Supabase (optional for MVP)**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `lib/database.sql` in your Supabase SQL editor
   - Update your environment variables

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Usage

### Planning a Trip

1. **Start Planning**: Click "Start Planning" on the homepage
2. **Trip Details**: Enter destination, dates, and trip name
3. **Set Budget**: Define your total budget with helpful presets
4. **Choose Style**: Select your traveler persona (foodie, adventurer, etc.)
5. **Pick Interests**: Choose activities you're interested in
6. **Generate**: AI creates your personalized itinerary

### Managing Trips

- **Dashboard**: View all your planned trips with stats
- **Itinerary View**: See detailed day-by-day plans with costs
- **Regenerate**: Create new variations of your itinerary
- **Delete**: Remove trips you no longer need

## 🔧 Development

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Adding New Features

1. **UI Components**: Use shadcn/ui components in `components/ui/`
2. **AI Prompts**: Extend prompts in `lib/groq.ts`
3. **Database**: Add tables/policies to `lib/database.sql`
4. **Pages**: Create new routes in `app/`

## 📊 Current Status

✅ **Completed Features**:
- Landing page with marketing content
- Multi-step trip wizard
- AI-powered itinerary generation
- Trip dashboard and management
- Responsive design
- Local storage for trips

🚧 **In Progress**:
- Supabase integration
- User authentication
- Deal alerts system
- Trip sharing functionality

## 🔮 Roadmap

- [ ] User authentication with Supabase
- [ ] Real-time deal alerts
- [ ] Trip sharing and collaboration
- [ ] PDF export functionality
- [ ] Mobile app (React Native)
- [ ] Integration with booking APIs
- [ ] Advanced AI features (group planning, budget optimization)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Groq](https://groq.com/) for fast AI capabilities
- [Supabase](https://supabase.com/) for backend services
- [Lucide](https://lucide.dev/) for icons

---

**Built with ❤️ for travelers worldwide**
