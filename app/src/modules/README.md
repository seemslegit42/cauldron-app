# Modules Directory

This directory contains all the feature modules of the Cauldron application.

## Module Structure

Each module follows a consistent structure:

```
module-name/
├── pages/         # Page components
├── components/    # Module-specific components
├── services/      # Module-specific services
├── api/           # API routes and operations
├── utils/         # Module-specific utilities
├── types/         # Module-specific types
└── agentHooks.ts  # Agent-based workflow hooks
```

## Available Modules

- `admin/` - Admin dashboards and management
- `arcana/` - Central dashboard with personalized summaries and insights
- `athena/` - Business intelligence and decision-making copilot
- `forgeflow/` - Visual no-code Agent Builder
- `manifold/` - Revenue Intelligence Engine 
- `obelisk/` - OSINT Engine
- `phantom/` - Red/White team cyber dashboard
- `sentinel/` - Cybersecurity posture module

## Shared Code

Shared code that is used across multiple modules is located in the `src/shared/` directory.
