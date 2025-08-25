# AI Chat Application

A modern ChatGPT-style web application built with React, TypeScript, Supabase, and OpenAI APIs. Features both text generation and image creation capabilities in a beautiful, responsive interface.

## Features

- 🤖 **AI Text Chat**: Powered by OpenAI GPT-3.5-turbo
- 🎨 **Image Generation**: DALL-E 3 integration for creating images from text prompts
- 💾 **Persistent Storage**: Conversation history saved in Supabase
- 🌙 **Dark Mode**: Beautiful dark theme by default with light mode toggle
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- ⚡ **Real-time Experience**: Instant message sending and loading states
- 🎯 **Smart Prompts**: Automatically detects image generation requests

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI APIs**: OpenAI GPT-3.5-turbo & DALL-E 3
- **Build Tool**: Vite
- **State Management**: Custom React hooks
- **Styling**: Tailwind CSS with CSS variables

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

3. **Set up Supabase database:**
   - Click "Connect to Supabase" button in the top right of Bolt
   - The database schema will be automatically created

4. **Start the development server:**
   ```bash
   npm run dev
   ```

### Getting API Keys

#### Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings > API in your project dashboard
3. Copy the "Project URL" and "anon public" key

#### OpenAI Setup
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account and add billing information
3. Go to API Keys and create a new secret key
4. Copy the key (starts with `sk-`)

## Usage

### Text Chat
Simply type your message and press Enter. The AI will respond with helpful, contextual answers.

### Image Generation
Use phrases like:
- "Draw a sunset over mountains"
- "Create an image of a futuristic city"
- "Generate a picture of a cute cat"
- "Make an illustration of..."

The app automatically detects image requests and uses DALL-E 3 to generate high-quality images.

### Managing Conversations
- **New Chat**: Click the "+" button in the sidebar
- **Switch Conversations**: Click any conversation in the sidebar
- **Edit Titles**: Click the edit icon next to any conversation
- **Delete**: Click the trash icon to remove conversations

## Project Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── chat-interface.tsx    # Main chat area
│   │   ├── chat-sidebar.tsx      # Conversations sidebar
│   │   ├── message-input.tsx     # Message input component
│   │   └── message-item.tsx      # Individual message display
│   ├── layout/
│   │   └── header.tsx            # App header with theme toggle
│   └── ui/                       # shadcn/ui components
├── hooks/
│   └── use-chat.ts              # Chat state management
├── lib/
│   ├── supabase.ts              # Supabase client setup
│   └── utils.ts                 # Utility functions
├── services/
│   ├── chat.ts                  # Chat database operations
│   └── openai.ts                # OpenAI API integration
├── types/
│   └── chat.ts                  # TypeScript type definitions
└── App.tsx                      # Main application component
```

## Database Schema

The app uses two main tables:

### Conversations
- `id`: Unique identifier
- `title`: Conversation title
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Messages
- `id`: Unique identifier
- `conversation_id`: References conversations table
- `role`: 'user' | 'assistant' | 'system'
- `content`: Message text content
- `message_type`: 'text' | 'image'
- `image_url`: URL for generated images (nullable)
- `created_at`: Creation timestamp

## Customization

### Themes
The app uses shadcn/ui's theming system. Customize colors in `src/index.css`:

```css
:root {
  --primary: your-color;
  --secondary: your-color;
  /* ... more variables */
}
```

### AI Models
Change the OpenAI models in `src/services/openai.ts`:

```typescript
// Text generation
model: 'gpt-4' // or 'gpt-3.5-turbo'

// Image generation  
model: 'dall-e-2' // or 'dall-e-3'
```

## Deployment

### Build for production:
```bash
npm run build
```

### Deploy to platforms:
- **Vercel**: Connect your GitHub repo
- **Netlify**: Connect your GitHub repo  
- **Supabase**: Use `supabase deploy`

Make sure to set environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter issues:

1. Check that all environment variables are set correctly
2. Verify your OpenAI API key has sufficient credits
3. Ensure your Supabase project is properly configured
4. Check the browser console for error messages
5. Verify your internet connection and API endpoints are accessible

For bugs or feature requests, please open an issue on GitHub.