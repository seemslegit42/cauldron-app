import type { NavigationItem } from '../NavBar/NavBar';
import { routes } from 'wasp/client/router';
import { BlogUrl, DocsUrl } from '../../../shared/common';

export const appNavigationItems: NavigationItem[] = [
  { name: 'Arcana', to: routes.ArcanaRoute.to },
  { name: 'Forgeflow', to: routes.ForgeflowRoute.to },
  { name: 'Sentinel', to: routes.SentinelRoute.to },
  { name: 'Athena', to: routes.AthenaRoute.to },
  { name: 'Phantom', to: routes.PhantomRoute.to },
  { name: 'AI Scheduler (Demo App)', to: routes.DemoAppRoute.to },
  { name: 'File Upload (AWS S3)', to: routes.FileUploadRoute.to },
  { name: 'Pricing', to: routes.PricingPageRoute.to },
  { name: 'Documentation', to: DocsUrl },
  { name: 'Blog', to: BlogUrl },
];
