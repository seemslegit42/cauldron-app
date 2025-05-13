# Cauldron Database Seed Scripts

This directory contains scripts for seeding the Cauldron database with initial data. These scripts are designed to work in different environments (development, staging, production) with appropriate data volumes for each context.

## Overview

The seed scripts populate the database with:

- System roles and permissions
- Default organizations
- AI agent templates
- User templates
- Module configurations
- Test data (for development and staging only)
- Mock credentials (for development only)

## Usage

### Basic Usage

To seed the database with the default configuration (development mode):

```bash
npx prisma db seed
# or
wasp db seed
```

### Environment-Specific Seeding

To seed the database for a specific environment:

```bash
# Development (default)
NODE_ENV=development npx prisma db seed

# Staging
NODE_ENV=staging npx prisma db seed

# Production
NODE_ENV=production npx prisma db seed
```

## Environment Configurations

The seed scripts behave differently based on the environment:

### Development

- **Data Volume**: Full
- **Test Data**: Included
- **Mock Credentials**: Included
- **Log Level**: Verbose

### Staging

- **Data Volume**: Moderate
- **Test Data**: Included (reduced volume)
- **Mock Credentials**: Not included
- **Log Level**: Minimal

### Production

- **Data Volume**: Minimal (essential system data only)
- **Test Data**: Not included
- **Mock Credentials**: Not included
- **Log Level**: Minimal

## Seed Groups

The seed scripts are organized into logical groups:

| Group | File | Description | Tags |
|-------|------|-------------|------|
| **Roles & Permissions** | `roles-permissions.ts` | System roles and resource-based permissions | `system-data`, `security`, `rbac` |
| **Organizations** | `organizations.ts` | Default and demo organizations | `demo-data`, `organizations` |
| **AI Agents** | `agents.ts` | Default AI agent templates | `demo-data`, `ai-agents`, `templates` |
| **User Templates** | `users.ts` | Admin, operator, and agent user templates | `demo-data`, `users`, `templates` |
| **Module Configs** | `module-configs.ts` | Default module configurations | `demo-data`, `module-configs` |
| **Test Data** | `test-data.ts` | Mock data for testing and development | `demo-data`, `test-data` |
| **Credentials** | `credentials.ts` | Mock API keys and credentials (dev only) | `demo-data`, `credentials`, `security` |

## Default Data

### System Roles

- **Admin**: Full system access with all permissions
- **Operator**: Standard user with operational permissions
- **Agent**: AI agent with limited system access

### Default Organizations

- **Cauldron System**: System default organization
- **TechNova Solutions**: Software development and AI consulting
- **Global Finance Group**: Financial services and investment management
- **HealthPlus Medical**: Healthcare provider and medical research
- **EcoSmart Energy**: Renewable energy and sustainability solutions

### Default AI Agents

- **Cauldron Prime**: Primary system orchestration agent
- **Athena**: Business intelligence and analytics agent
- **Obelisk**: OSINT and external intelligence gathering agent
- **Phantom**: Cybersecurity and threat detection agent
- **Forge**: Content creation and management agent

### Default Users

- **Admin User**: System administrator with full access
- **Operator User**: Standard operator with limited permissions
- **Agent User**: AI agent user with restricted access
- **Demo Users**: Industry-specific demo users for each organization

## Extending the Seeds

To add new seed data:

1. Create a new seed file in the `seeds` directory
2. Export a function that takes `prisma` and `config` parameters
3. Import and call your function from `index.ts`

Example:

```typescript
// my-new-seed.ts
import type { PrismaClient } from '@prisma/client';
import type { SeedConfig } from './index';

export async function seedMyNewData(prisma: PrismaClient, config: SeedConfig) {
  console.log('Seeding my new data...');
  
  // Your seeding logic here
  
  return { /* data to return */ };
}
```

Then update `index.ts` to include your new seed function.

## Best Practices

- Always use `upsert` operations to avoid duplicate data
- Include environment-specific logic for different data volumes
- Use descriptive console logs for visibility during seeding
- Tag seed groups for better documentation
- Return created entities for potential use in dependent seed functions
