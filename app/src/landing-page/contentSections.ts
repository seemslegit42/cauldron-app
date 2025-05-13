import type { NavigationItem } from '../client/components/NavBar/NavBar';
import { routes } from 'wasp/client/router';
import { DocsUrl, BlogUrl } from '../shared/config/urls';
import avatarPlaceholder from '../client/static/avatar-placeholder.webp';

export const landingPageNavigationItems: NavigationItem[] = [
  { name: 'Features', to: '#features' },
  { name: 'Pricing', to: routes.PricingPageRoute.to },
  { name: 'Documentation', to: DocsUrl },
  { name: 'Blog', to: BlogUrl },
];
export const features = [
  {
    name: 'Sentient Loop™ Intelligence',
    description: 'AI-driven decision engine with human-in-the-loop validation for critical business operations.',
    icon: '🧠',
    href: DocsUrl,
  },
  {
    name: 'Threat Intelligence Dashboard',
    description: 'Real-time cybersecurity monitoring with OSINT scanning and domain clone detection.',
    icon: '🛡️',
    href: DocsUrl,
  },
  {
    name: 'Business Intelligence Copilot',
    description: 'Strategic insights and recommendations powered by AI analysis of your business metrics.',
    icon: '📊',
    href: DocsUrl,
  },
  {
    name: 'Visual Agent Builder',
    description: 'No-code interface for creating custom AI workflows and automation sequences.',
    icon: '⚙️',
    href: DocsUrl,
  },
  {
    name: 'Enterprise-Grade Security',
    description: 'Advanced RBAC, audit logging, and comprehensive security posture management.',
    icon: '🔐',
    href: DocsUrl,
  },
  {
    name: 'Modular Architecture',
    description: 'Extensible platform with specialized modules for security, analytics, and automation.',
    icon: '🧩',
    href: DocsUrl,
  },
];
export const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CISO @ Enterprise Solutions',
    avatarSrc: avatarPlaceholder,
    socialUrl: '#',
    quote: 'CauldronOS detected a sophisticated phishing campaign targeting our executives that our traditional security tools missed. The Sentient Loop™ not only alerted us but suggested remediation steps that saved us countless hours.',
  },
  {
    name: 'Michael Chen',
    role: 'CTO @ TechSecure',
    avatarSrc: avatarPlaceholder,
    socialUrl: '#',
    quote: 'The Athena module has become our strategic compass. Its AI-driven market analysis identified an emerging trend that led to our most successful product launch this year. The ROI has been extraordinary.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'VP of Operations @ InnovateCorp',
    avatarSrc: avatarPlaceholder,
    socialUrl: '#',
    quote: 'We built custom workflows in Forgeflow that automated our compliance reporting process. What used to take our team a full week now happens automatically with human review only for exceptions. Game-changer.',
  },
  {
    name: 'David Patel',
    role: 'CEO @ NexGen Innovations',
    avatarSrc: avatarPlaceholder,
    socialUrl: '#',
    quote: 'The cyberpunk interface isn\'t just cool-looking—it\'s incredibly functional. Our security team can visualize threats in real-time and make decisions faster than ever. CauldronOS has become mission-critical infrastructure for us.',
  },
];

export const faqs = [
  {
    id: 1,
    question: 'What is CauldronOS?',
    answer: 'CauldronOS is an AI-native digital operations platform that combines cybersecurity, business intelligence, and workflow automation in a unified interface. It features the Sentient Loop™ system for AI-driven decision-making with human oversight.',
    href: '#',
  },
  {
    id: 2,
    question: 'What modules are included in CauldronOS?',
    answer: 'CauldronOS includes Arcana (central dashboard), Phantom (cybersecurity), Athena (business intelligence), Forgeflow (workflow automation), Sentinel (security monitoring), and more specialized modules for enterprise operations.',
    href: '#',
  },
  {
    id: 3,
    question: 'How does the Sentient Loop™ work?',
    answer: 'The Sentient Loop™ is our AI orchestration system that follows a 5-phase intelligence cycle: Wake (context gathering), Detect (issue identification), Decide (option analysis), Act (execution), and Reflect (learning). Critical decisions require human approval before execution.',
    href: '#',
  },
  {
    id: 4,
    question: 'Is CauldronOS secure for enterprise use?',
    answer: 'Absolutely. CauldronOS implements enterprise-grade security with comprehensive RBAC, audit logging, credential scanning, and anomaly detection. The Sentinel module provides continuous security posture monitoring and alerts.',
    href: '#',
  },
  {
    id: 5,
    question: 'How does CauldronOS integrate with existing systems?',
    answer: 'CauldronOS offers flexible API integrations, webhooks, and connectors for seamless integration with your existing infrastructure, including CRMs, ERPs, SIEM systems, and custom applications.',
    href: '#',
  },
  {
    id: 6,
    question: 'Can I customize CauldronOS for my specific needs?',
    answer: 'Yes, CauldronOS is highly customizable. You can build custom workflows in Forgeflow, create specialized agents, design personalized dashboards, and even develop new modules using our developer SDK.',
    href: '#',
  },
];
export const footerNavigation = {
  app: [
    { name: 'Documentation', href: DocsUrl },
    { name: 'Blog', href: BlogUrl },
    { name: 'API Reference', href: DocsUrl + '/api' },
    { name: 'Changelog', href: BlogUrl + '/changelog' },
  ],
  company: [
    { name: 'About', href: '#about' },
    { name: 'Security', href: '#security' },
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
  ],
  resources: [
    { name: 'Community Forum', href: '#forum' },
    { name: 'GitHub', href: 'https://github.com' },
    { name: 'Support', href: '#support' },
    { name: 'Training', href: '#training' },
  ],
};
