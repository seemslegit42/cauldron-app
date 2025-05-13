/**
 * Workflow Templates
 * 
 * This file provides predefined workflow templates for common use cases.
 */

// Threat Analysis Workflow
export const threatAnalysisWorkflow = {
  name: 'Threat Analysis',
  description: 'Analyzes security threats and generates a report',
  agents: [
    {
      name: 'ResearchAgent',
      role: 'Security Researcher',
      goal: 'Gather comprehensive information about security threats',
      backstory: 'You are an experienced security researcher with expertise in threat intelligence.',
      verbose: true,
      allowDelegation: false,
      memory: true,
    },
    {
      name: 'DraftingAgent',
      role: 'Security Report Writer',
      goal: 'Create clear, actionable security reports',
      backstory: 'You are a skilled technical writer specializing in cybersecurity documentation.',
      verbose: true,
      allowDelegation: false,
      memory: true,
    },
  ],
  tasks: [
    {
      name: 'research_threat',
      description: 'Research the security threat',
      agent: 'ResearchAgent',
      expectedOutput: 'Comprehensive threat analysis with severity, impact, and mitigation steps',
    },
    {
      name: 'draft_report',
      description: 'Draft a security report based on the research',
      agent: 'DraftingAgent',
      expectedOutput: 'Well-structured security report for executives',
      dependsOn: ['research_threat'],
    },
  ],
  process: [
    'The ResearchAgent researches the security threat',
    'The DraftingAgent creates a report based on the research',
  ],
};

// Content Creation Workflow
export const contentCreationWorkflow = {
  name: 'Content Creation',
  description: 'Creates blog content on a given topic',
  agents: [
    {
      name: 'ResearchAgent',
      role: 'Content Researcher',
      goal: 'Gather comprehensive information on the topic',
      backstory: 'You are a thorough researcher with expertise in finding relevant information.',
      verbose: true,
      allowDelegation: false,
      memory: true,
    },
    {
      name: 'WriterAgent',
      role: 'Content Writer',
      goal: 'Create engaging, informative content',
      backstory: 'You are a skilled writer specializing in creating compelling blog posts.',
      verbose: true,
      allowDelegation: false,
      memory: true,
    },
  ],
  tasks: [
    {
      name: 'research_topic',
      description: 'Research the topic',
      agent: 'ResearchAgent',
      expectedOutput: 'Key points, facts, and insights about the topic',
    },
    {
      name: 'write_content',
      description: 'Write a blog post based on the research',
      agent: 'WriterAgent',
      expectedOutput: 'Well-structured blog post',
      dependsOn: ['research_topic'],
    },
  ],
  process: [
    'The ResearchAgent researches the topic',
    'The WriterAgent creates a blog post based on the research',
  ],
};

// Export all workflow templates
export const workflowTemplates = {
  threatAnalysis: threatAnalysisWorkflow,
  contentCreation: contentCreationWorkflow,
};
