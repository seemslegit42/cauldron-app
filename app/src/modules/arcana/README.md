# Arcana Module - Command Dashboard

Arcana is the primary user-facing interface for interacting with the Sentient Loop™. It delivers real-time business telemetry, AI-curated insights, and a conversation-first command layer — all personalized to the user's role and behavior.

## Features

### 🎯 Personalized Executive Summary (Hero Panel)
- User name, avatar, and role-based greeting
- Key business vitals (Revenue today, Threat Index, Top trend)
- Top 3 AI-generated suggested actions

### 📊 Key Metrics Board
- Real-time business KPIs (editable by user or agent suggestions)
- Types: Revenue/conversion/growth metrics, Threat intelligence indicators, Media/social pulse
- Visuals: Line graphs, spark bars, donut charts, heatmaps

### 🤖 AI Prompt Assistant (Command Line + Suggestion Queue)
- Natural language interface for commands and queries
- Suggested Quick Prompts for common actions
- Works like a copilot for commands and insights

### 📦 Forgeflow Widget
- Mini version of the drag-and-drop Flow Builder
- Shows active automations
- Allows inline edits

### 🛡️ Sentinel Risk Light (Business Defense Pulse)
- Red/Yellow/Green "Cyberlight" status indicator
- Tooltip shows recent triggers from security monitoring
- AI insight on security posture

### 🧬 Adaptive Persona Mode
- Theme shifts based on user identity or company mode:
  - Hacker CEO: neon visuals, ops-focused layout
  - Podcast Mogul: media stats first, content generation hub
  - Enterprise Admin: financial + operational telemetry prioritized

## Implementation Details

### Database Schema
The Arcana module uses the `UserContext` model to store user-specific data:
- `metrics`: JSON data for business metrics
- `projects`: JSON data for active projects
- `decisions`: JSON data for pending decisions
- `goals`: JSON data for user goals
- `persona`: String for the active persona mode

### Components
- `HeroPanel.tsx`: Displays user greeting and top-level metrics
- `KeyMetricsBoard.tsx`: Interactive dashboard with charts and metrics
- `AiPromptAssistant.tsx`: Command-line interface for the Sentient Loop
- `ForgeflowWidget.tsx`: Mini workflow manager
- `SentinelRiskLight.tsx`: Security status indicator
- `AdaptivePersonaMode.tsx`: Persona selector and customizer

### Operations
- `getUserContext`: Fetches user context data
- `updateUserContext`: Updates user context data
- `updateUserPersona`: Updates user persona
- `getSentientRecommendations`: Gets AI-generated recommendations
- `getActiveWorkflows`: Gets active workflows for the Forgeflow widget
- `processCommand`: Processes commands from the AI Prompt Assistant

## Getting Started

1. Ensure you have run the database migration to add the persona field:
```
npx prisma migrate dev --name add_persona_to_user_context
```

2. Start the application:
```
pnpm start
```

3. Navigate to the Arcana dashboard at `/arcana`

## Customization

### Adding New Metrics
To add new metrics, update the `getUserContext` function in `operations.ts` to include the new metrics in the JSON data.

### Adding New Persona Modes
To add a new persona mode:
1. Update the `AdaptivePersonaMode.tsx` component to include the new persona
2. Add persona-specific styles in the `ArcanaPage.tsx` file
3. Add persona-specific recommendations in the `getSentientRecommendations` function

## Future Enhancements
- Real-time data updates using WebSockets
- More advanced AI command processing
- Additional visualization options for metrics
- Integration with external data sources
- Enhanced personalization based on user behavior