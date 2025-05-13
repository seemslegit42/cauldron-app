/**
 * Arcana Module - Personalization Service
 * 
 * This service manages user personalization settings and provides
 * functions for adapting the UI and content based on user preferences.
 */

import { PersonaType, DashboardLayout, PersonaStyle, UserContext } from '../types';

/**
 * Gets persona-specific styles
 * @param persona - User persona
 * @returns Persona style object
 */
export const getPersonaStyles = (persona: PersonaType = 'hacker-ceo'): PersonaStyle => {
  switch (persona) {
    case 'hacker-ceo':
      return {
        accentColor: 'text-blue-400',
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        cardBorder: 'border-blue-500',
        gradientStart: 'from-gray-900',
        gradientEnd: 'to-blue-900',
        iconColor: 'text-blue-400'
      };
    case 'podcast-mogul':
      return {
        accentColor: 'text-pink-400',
        buttonBg: 'bg-pink-600 hover:bg-pink-700',
        cardBorder: 'border-pink-500',
        gradientStart: 'from-gray-900',
        gradientEnd: 'to-pink-900',
        iconColor: 'text-pink-400'
      };
    case 'enterprise-admin':
      return {
        accentColor: 'text-green-400',
        buttonBg: 'bg-green-600 hover:bg-green-700',
        cardBorder: 'border-green-500',
        gradientStart: 'from-gray-900',
        gradientEnd: 'to-green-900',
        iconColor: 'text-green-400'
      };
    default:
      return {
        accentColor: 'text-blue-400',
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        cardBorder: 'border-blue-500',
        gradientStart: 'from-gray-900',
        gradientEnd: 'to-blue-900',
        iconColor: 'text-blue-400'
      };
  }
};

/**
 * Gets dashboard layout configuration
 * @param layout - Dashboard layout type
 * @returns Layout configuration
 */
export const getDashboardLayout = (layout: DashboardLayout = 'default'): {
  mainGrid: string;
  metricsWidth: string;
  sidebarWidth: string;
  spacing: string;
} => {
  switch (layout) {
    case 'compact':
      return {
        mainGrid: 'grid-cols-1 lg:grid-cols-4',
        metricsWidth: 'lg:col-span-3',
        sidebarWidth: 'lg:col-span-1',
        spacing: 'gap-4 mb-4'
      };
    case 'expanded':
      return {
        mainGrid: 'grid-cols-1 lg:grid-cols-5',
        metricsWidth: 'lg:col-span-4',
        sidebarWidth: 'lg:col-span-1',
        spacing: 'gap-8 mb-8'
      };
    default:
      return {
        mainGrid: 'grid-cols-1 lg:grid-cols-3',
        metricsWidth: 'lg:col-span-2',
        sidebarWidth: 'lg:col-span-1',
        spacing: 'gap-6 mb-6'
      };
  }
};

/**
 * Gets persona-specific greeting
 * @param name - User name
 * @param timeOfDay - Time of day (morning, afternoon, evening)
 * @param persona - User persona
 * @returns Personalized greeting
 */
export const getPersonalizedGreeting = (
  name: string,
  timeOfDay: string = 'day',
  persona: PersonaType = 'hacker-ceo'
): string => {
  const greetings: Record<PersonaType, Record<string, string[]>> = {
    'hacker-ceo': {
      morning: [
        `Morning, ${name}. Let's crush it today.`,
        `Ready to hack the day, ${name}?`,
        `Systems online, ${name}. Let's get to work.`
      ],
      afternoon: [
        `Afternoon check-in, ${name}. How are we tracking?`,
        `Mid-day status, ${name}. Systems operational.`,
        `Afternoon, ${name}. Time to optimize performance.`
      ],
      evening: [
        `Evening, ${name}. Time to review the day's metrics.`,
        `Night ops active, ${name}. What's our status?`,
        `Evening, ${name}. Let's close some loops before shutdown.`
      ]
    },
    'podcast-mogul': {
      morning: [
        `Rise and shine, ${name}! Your audience awaits.`,
        `Good morning, ${name}! Ready to create something amazing?`,
        `Morning vibes, ${name}! Let's make some content magic.`
      ],
      afternoon: [
        `Afternoon inspiration, ${name}! How's content flowing?`,
        `Hey ${name}, afternoon check-in! Your audience is growing.`,
        `Mid-day creative pulse, ${name}. What's trending?`
      ],
      evening: [
        `Evening, ${name}! Time to plan tomorrow's content.`,
        `Winding down, ${name}? Let's review today's engagement.`,
        `Evening reflection time, ${name}. Your audience loved today's content.`
      ]
    },
    'enterprise-admin': {
      morning: [
        `Good morning, ${name}. Your dashboard is ready for review.`,
        `Morning, ${name}. All systems operational and ready for your review.`,
        `Welcome back, ${name}. Your morning briefing is prepared.`
      ],
      afternoon: [
        `Good afternoon, ${name}. Here's your mid-day status report.`,
        `Afternoon, ${name}. Operations proceeding as expected.`,
        `Mid-day update, ${name}. All metrics within acceptable parameters.`
      ],
      evening: [
        `Good evening, ${name}. Here's your end-of-day summary.`,
        `Evening, ${name}. Time to review today's performance.`,
        `End of day, ${name}. Your summary report is ready.`
      ]
    }
  };

  // Get greetings for the persona and time of day
  const options = greetings[persona]?.[timeOfDay] || [`Hello, ${name}`];
  
  // Return a random greeting from the options
  return options[Math.floor(Math.random() * options.length)];
};

/**
 * Gets persona-specific metric priorities
 * @param persona - User persona
 * @returns Array of metric categories in priority order
 */
export const getMetricPriorities = (persona: PersonaType = 'hacker-ceo'): string[] => {
  switch (persona) {
    case 'hacker-ceo':
      return ['security', 'business', 'social', 'media'];
    case 'podcast-mogul':
      return ['media', 'social', 'business', 'security'];
    case 'enterprise-admin':
      return ['business', 'security', 'media', 'social'];
    default:
      return ['business', 'security', 'social', 'media'];
  }
};

/**
 * Gets persona-specific suggested prompts
 * @param persona - User persona
 * @returns Array of suggested prompts
 */
export const getSuggestedPrompts = (persona: PersonaType = 'hacker-ceo'): Array<{
  text: string;
  icon: string;
  category?: string;
}> => {
  const commonPrompts = [
    { text: "What's my top priority today?", icon: "🎯", category: "productivity" },
    { text: "Show me today's metrics", icon: "📊", category: "business" },
    { text: "Generate a weekly report", icon: "📝", category: "reports" }
  ];
  
  const personaPrompts: Record<PersonaType, Array<{ text: string; icon: string; category?: string }>> = {
    'hacker-ceo': [
      { text: "Analyze my security posture", icon: "🛡️", category: "security" },
      { text: "Show me active threats", icon: "⚠️", category: "security" },
      { text: "Optimize my growth strategy", icon: "📈", category: "business" }
    ],
    'podcast-mogul': [
      { text: "Generate content ideas", icon: "💡", category: "content" },
      { text: "Analyze audience engagement", icon: "👥", category: "social" },
      { text: "Plan my content calendar", icon: "📅", category: "content" }
    ],
    'enterprise-admin': [
      { text: "Review resource allocation", icon: "📋", category: "operations" },
      { text: "Show compliance status", icon: "✓", category: "security" },
      { text: "Optimize operational efficiency", icon: "⚙️", category: "operations" }
    ]
  };
  
  return [...commonPrompts, ...personaPrompts[persona]];
};

/**
 * Gets default user preferences based on persona
 * @param persona - User persona
 * @returns Default user preferences
 */
export const getDefaultPreferences = (persona: PersonaType = 'hacker-ceo'): Record<string, any> => {
  const commonPreferences = {
    darkMode: true,
    notificationsEnabled: true,
    autoRefresh: true,
    refreshInterval: 5 // minutes
  };
  
  const personaPreferences: Record<PersonaType, Record<string, any>> = {
    'hacker-ceo': {
      preferredCategories: ['security', 'business'],
      dashboardLayout: 'default',
      metricDisplayMode: 'detailed',
      aiInteractionStyle: 'direct'
    },
    'podcast-mogul': {
      preferredCategories: ['media', 'social'],
      dashboardLayout: 'expanded',
      metricDisplayMode: 'visual',
      aiInteractionStyle: 'conversational'
    },
    'enterprise-admin': {
      preferredCategories: ['business', 'security'],
      dashboardLayout: 'compact',
      metricDisplayMode: 'tabular',
      aiInteractionStyle: 'formal'
    }
  };
  
  return { ...commonPreferences, ...personaPreferences[persona] };
};

/**
 * Merges user preferences with defaults
 * @param userContext - User context data
 * @param persona - User persona
 * @returns Merged preferences
 */
export const getMergedPreferences = (
  userContext?: UserContext,
  persona: PersonaType = 'hacker-ceo'
): Record<string, any> => {
  const defaultPrefs = getDefaultPreferences(persona);
  
  if (!userContext || !userContext.preferences) {
    return defaultPrefs;
  }
  
  // Parse user preferences if they're stored as a string
  const userPrefs = typeof userContext.preferences === 'string'
    ? JSON.parse(userContext.preferences)
    : userContext.preferences;
  
  // Merge with defaults, preferring user preferences when available
  return { ...defaultPrefs, ...userPrefs };
};
