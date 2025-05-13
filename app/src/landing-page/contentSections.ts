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
    name: 'Modular Architecture',
    description: 'Flexible, modular design for easy customization and extension.',
    icon: '🧩',
    href: DocsUrl,
  },
  {
    name: 'Enterprise Security',
    description: 'Advanced security features to protect your data and systems.',
    icon: '🔐',
    href: DocsUrl,
  },
  {
    name: 'AI Integration',
    description: 'Seamless integration with AI services for intelligent automation.',
    icon: '🤖',
    href: DocsUrl,
  },
  {
    name: 'Scalable Infrastructure',
    description: 'Built to scale with your business needs and growth.',
    icon: '📈',
    href: DocsUrl,
  },
];
export const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CTO @ Enterprise Solutions',
    avatarSrc: avatarPlaceholder,
    socialUrl: '#',
    quote: 'Cauldron has transformed how we approach AI integration in our business.',
  },
  {
    name: 'Michael Chen',
    role: 'Director of Security @ TechSecure',
    avatarSrc: avatarPlaceholder,
    socialUrl: '#',
    quote: 'The security features in Cauldron have significantly improved our threat detection capabilities.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'VP of Operations @ InnovateCorp',
    avatarSrc: avatarPlaceholder,
    socialUrl: '#',
    quote: 'Implementing Cauldron has streamlined our operations and improved efficiency across departments.',
  },
];

export const faqs = [
  {
    id: 1,
    question: 'What is Cauldron?',
    answer: 'Cauldron is a modular, AI-native digital operations platform designed for enterprise security and business intelligence.',
    href: '#',
  },
  {
    id: 2,
    question: 'How does Cauldron integrate with existing systems?',
    answer: 'Cauldron offers flexible API integrations and connectors for seamless integration with your existing infrastructure.',
    href: '#',
  },
  {
    id: 3,
    question: 'What security features does Cauldron provide?',
    answer: 'Cauldron includes advanced threat detection, OSINT monitoring, vulnerability scanning, and comprehensive security dashboards.',
    href: '#',
  },
];
export const footerNavigation = {
  app: [
    { name: 'Documentation', href: DocsUrl },
    { name: 'Blog', href: BlogUrl },
  ],
  company: [
    { name: 'About', href: 'https://wasp.sh' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms of Service', href: '#' },
  ],
};
