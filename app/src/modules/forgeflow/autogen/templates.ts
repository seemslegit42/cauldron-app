/**
 * AutoGen Studio Templates
 * 
 * This file provides predefined templates for AutoGen Studio workflows.
 */

import { AutoGenStudioWorkflow, AutoGenStudioAgent } from './autogenStudio';

// Predefined agent templates
export const agentTemplates: Record<string, Omit<AutoGenStudioAgent, 'id'>> = {
  userProxy: {
    name: 'User Proxy',
    role: 'user_proxy',
    description: 'A proxy for the human user, allowing them to interact with the workflow.',
    systemMessage: 'You are a proxy for the human user. You can interact with the workflow on their behalf.',
    model: {
      provider: 'gemini',
      name: 'gemini-1.5-flash-8b',
      temperature: 0.7,
    },
    tools: [],
    isHuman: true,
  },
  assistant: {
    name: 'Assistant',
    role: 'assistant',
    description: 'A helpful AI assistant that can answer questions and perform tasks.',
    systemMessage: 'You are a helpful AI assistant. You can answer questions and perform tasks for the user.',
    model: {
      provider: 'gemini',
      name: 'gemini-1.5-flash-8b',
      temperature: 0.7,
    },
    tools: [],
  },
  researcher: {
    name: 'Researcher',
    role: 'researcher',
    description: 'An AI agent specialized in research and information gathering.',
    systemMessage: 'You are a research specialist. Your goal is to gather comprehensive information on topics and present it in a clear, organized manner.',
    model: {
      provider: 'gemini',
      name: 'gemini-1.5-pro-latest',
      temperature: 0.3,
    },
    tools: [
      {
        name: 'search',
        description: 'Search for information on the web',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query',
            },
          },
          required: ['query'],
        },
      },
    ],
  },
  coder: {
    name: 'Coder',
    role: 'coder',
    description: 'An AI agent specialized in writing and reviewing code.',
    systemMessage: 'You are a coding specialist. Your goal is to write clean, efficient code and review existing code for improvements.',
    model: {
      provider: 'gemini',
      name: 'gemini-1.5-pro-latest',
      temperature: 0.2,
    },
    tools: [
      {
        name: 'execute_code',
        description: 'Execute code in a sandbox environment',
        parameters: {
          type: 'object',
          properties: {
            language: {
              type: 'string',
              description: 'The programming language',
              enum: ['python', 'javascript', 'typescript', 'bash', 'sql'],
            },
            code: {
              type: 'string',
              description: 'The code to execute',
            },
          },
          required: ['language', 'code'],
        },
      },
    ],
  },
  planner: {
    name: 'Planner',
    role: 'planner',
    description: 'An AI agent specialized in planning and task decomposition.',
    systemMessage: 'You are a planning specialist. Your goal is to break down complex tasks into manageable steps and create detailed plans.',
    model: {
      provider: 'gemini',
      name: 'gemini-1.5-flash-8b',
      temperature: 0.5,
    },
    tools: [],
  },
  critic: {
    name: 'Critic',
    role: 'critic',
    description: 'An AI agent specialized in reviewing and providing feedback.',
    systemMessage: 'You are a critical reviewer. Your goal is to analyze content, identify issues, and suggest improvements.',
    model: {
      provider: 'gemini',
      name: 'gemini-1.5-flash-8b',
      temperature: 0.7,
    },
    tools: [],
  },
};

// Predefined workflow templates
export const workflowTemplates: Record<string, Omit<AutoGenStudioWorkflow, 'id'>> = {
  researchAndSummarize: {
    name: 'Research and Summarize',
    description: 'A workflow for researching a topic and generating a summary.',
    agents: [
      {
        ...agentTemplates.userProxy,
        id: 'user-proxy',
      },
      {
        ...agentTemplates.researcher,
        id: 'researcher',
      },
      {
        ...agentTemplates.assistant,
        id: 'summarizer',
        name: 'Summarizer',
        systemMessage: 'You are a summarization specialist. Your goal is to create concise, informative summaries of complex information.',
      },
    ],
    config: {
      maxRounds: 10,
      maxMessages: 50,
      memoryType: 'basic',
      humanInTheLoop: true,
    },
    tasks: [
      {
        id: 'research-task',
        name: 'Research Topic',
        description: 'Research the given topic and gather relevant information.',
        agentId: 'researcher',
        input: 'Research the following topic: {topic}',
      },
      {
        id: 'summarize-task',
        name: 'Summarize Research',
        description: 'Create a concise summary of the research findings.',
        agentId: 'summarizer',
        input: 'Summarize the following research: {research}',
        dependsOn: ['research-task'],
      },
    ],
    visualization: {
      layout: 'circular',
      showMessages: true,
      showAgentStatus: true,
    },
  },
  codingAssistant: {
    name: 'Coding Assistant',
    description: 'A workflow for writing and reviewing code.',
    agents: [
      {
        ...agentTemplates.userProxy,
        id: 'user-proxy',
      },
      {
        ...agentTemplates.coder,
        id: 'coder',
      },
      {
        ...agentTemplates.critic,
        id: 'code-reviewer',
        name: 'Code Reviewer',
        systemMessage: 'You are a code review specialist. Your goal is to review code for bugs, inefficiencies, and style issues.',
      },
    ],
    config: {
      maxRounds: 15,
      maxMessages: 100,
      memoryType: 'basic',
      humanInTheLoop: true,
    },
    tasks: [
      {
        id: 'write-code-task',
        name: 'Write Code',
        description: 'Write code based on the requirements.',
        agentId: 'coder',
        input: 'Write code for the following requirements: {requirements}',
      },
      {
        id: 'review-code-task',
        name: 'Review Code',
        description: 'Review the code for issues and suggest improvements.',
        agentId: 'code-reviewer',
        input: 'Review the following code: {code}',
        dependsOn: ['write-code-task'],
      },
      {
        id: 'revise-code-task',
        name: 'Revise Code',
        description: 'Revise the code based on the review feedback.',
        agentId: 'coder',
        input: 'Revise the code based on this feedback: {feedback}',
        dependsOn: ['review-code-task'],
      },
    ],
    visualization: {
      layout: 'circular',
      showMessages: true,
      showAgentStatus: true,
    },
  },
  contentCreation: {
    name: 'Content Creation',
    description: 'A workflow for creating and refining content.',
    agents: [
      {
        ...agentTemplates.userProxy,
        id: 'user-proxy',
      },
      {
        ...agentTemplates.researcher,
        id: 'content-researcher',
        name: 'Content Researcher',
      },
      {
        ...agentTemplates.assistant,
        id: 'content-writer',
        name: 'Content Writer',
        systemMessage: 'You are a content creation specialist. Your goal is to create engaging, informative content on various topics.',
      },
      {
        ...agentTemplates.critic,
        id: 'content-editor',
        name: 'Content Editor',
        systemMessage: 'You are a content editing specialist. Your goal is to review content for clarity, engagement, and accuracy.',
      },
    ],
    config: {
      maxRounds: 20,
      maxMessages: 150,
      memoryType: 'advanced',
      humanInTheLoop: true,
    },
    tasks: [
      {
        id: 'research-topic-task',
        name: 'Research Topic',
        description: 'Research the topic for content creation.',
        agentId: 'content-researcher',
        input: 'Research the following topic for content creation: {topic}',
      },
      {
        id: 'write-content-task',
        name: 'Write Content',
        description: 'Write content based on the research.',
        agentId: 'content-writer',
        input: 'Write content based on this research: {research}',
        dependsOn: ['research-topic-task'],
      },
      {
        id: 'edit-content-task',
        name: 'Edit Content',
        description: 'Edit and improve the content.',
        agentId: 'content-editor',
        input: 'Edit the following content: {content}',
        dependsOn: ['write-content-task'],
      },
      {
        id: 'finalize-content-task',
        name: 'Finalize Content',
        description: 'Finalize the content based on edits.',
        agentId: 'content-writer',
        input: 'Finalize the content based on these edits: {edits}',
        dependsOn: ['edit-content-task'],
      },
    ],
    visualization: {
      layout: 'force',
      showMessages: true,
      showAgentStatus: true,
    },
  },
};
