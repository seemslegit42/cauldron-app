# Autogen Studio Integration for Forgeflow

This directory contains the integration of Microsoft's Autogen Studio into the Forgeflow module of Cauldron.

## What is Autogen Studio?

Autogen Studio is a low-code interface built to help you rapidly prototype AI agents, enhance them with tools, compose them into teams and interact with them to accomplish tasks. It is built on [AutoGen AgentChat](https://microsoft.github.io/autogen) - a high-level API for building multi-agent applications.

## Features

Autogen Studio offers four main interfaces to help you build and manage multi-agent systems:

1. **Team Builder**
   - A visual interface for creating agent teams through declarative specification (JSON) or drag-and-drop
   - Supports configuration of all core components: teams, agents, tools, models, and termination conditions
   - Fully compatible with AgentChat's component definitions

2. **Playground**
   - Interactive environment for testing and running agent teams
   - Features include:
     - Live message streaming between agents
     - Visual representation of message flow through a control transition graph
     - Interactive sessions with teams using UserProxyAgent
     - Full run control with the ability to pause or stop execution

3. **Gallery**
   - Curated collection of pre-built agent teams for common use cases
   - Easily import and customize existing teams for your specific needs

4. **Deploy**
   - Deploy agent teams as API endpoints
   - Test API endpoints with sample requests

## Setup

Before using Autogen Studio, you need to set up the required dependencies:

1. Make sure you have Python 3.10+ installed on your system
2. Run the setup script:

```bash
cd app/src/modules/forgeflow/autogen
node setup-autogen-studio.js
```

This script will:
- Install the Python dependencies for Autogen Studio
- Install the frontend dependencies
- Build the frontend

## Usage

Once the setup is complete, you can access Autogen Studio through the Forgeflow module:

1. Navigate to the Forgeflow module in Cauldron
2. Click on the "Autogen Studio" link in the navigation bar
3. Click the "Start Server" button to start the Autogen Studio server
4. Once the server is running, you can use the Autogen Studio interface

## Integration with Forgeflow

Autogen Studio is integrated with Forgeflow to provide a seamless experience for building and testing multi-agent systems. You can use Autogen Studio to:

1. Prototype agent workflows visually
2. Test agent interactions in real-time
3. Export agent configurations for use in Forgeflow workflows

## Troubleshooting

If you encounter any issues with Autogen Studio, try the following:

1. Check that Python 3.10+ is installed and available in your PATH
2. Make sure all dependencies are installed correctly
3. Check the server logs for any error messages
4. Restart the Autogen Studio server

## Resources

- [Autogen Documentation](https://microsoft.github.io/autogen)
- [Autogen Studio Documentation](https://microsoft.github.io/autogen/docs/autogen-studio/getting-started)
- [Autogen GitHub Repository](https://github.com/microsoft/autogen)
