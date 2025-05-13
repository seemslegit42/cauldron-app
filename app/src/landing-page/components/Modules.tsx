import React, { useState } from 'react';
import { routes } from 'wasp/client/router';

interface Module {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

export default function Modules() {
  const modules: Module[] = [
    {
      name: 'Arcana',
      description: 'Central command dashboard with personalized insights and AI-driven recommendations.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-arcana-purple-500',
      href: routes.ArcanaRoute.to,
    },
    {
      name: 'Phantom',
      description: 'Cybersecurity monitoring with threat detection, OSINT scanning, and domain protection.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'bg-arcana-blue-500',
      href: routes.PhantomRoute.to,
    },
    {
      name: 'Athena',
      description: 'Business intelligence copilot for strategic insights, market analysis, and decision support.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'bg-arcana-green-500',
      href: routes.AthenaRoute.to,
    },
    {
      name: 'Forgeflow',
      description: 'Visual no-code agent builder for creating custom AI workflows and automation sequences.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      color: 'bg-arcana-pink-500',
      href: routes.ForgeflowVisualBuilderRoute.to,
    },
    {
      name: 'Sentinel',
      description: 'Security observability with real-time monitoring, alerts, and compliance enforcement.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'bg-yellow-500',
      href: routes.SentinelRoute.to,
    },
    {
      name: 'Manifold',
      description: 'Revenue intelligence engine for sales forecasting, customer insights, and growth opportunities.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-orange-500',
      href: routes.ManifoldRoute.to,
    },
  ];

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-arcana-purple-600 dark:text-arcana-purple-400">Integrated Modules</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            One Platform, Multiple Capabilities
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            CauldronOS combines specialized modules into a unified platform, each designed to address specific enterprise needs while working together seamlessly.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {modules.map((module) => (
              <div key={module.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className={`rounded-lg p-2 ${module.color} text-white`}>
                    {module.icon}
                  </div>
                  {module.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">{module.description}</p>
                  <p className="mt-6 flex space-x-4">
                    <a href={module.href} className="text-sm font-semibold leading-6 text-arcana-purple-600 dark:text-arcana-purple-400">
                      Standard <span aria-hidden="true">→</span>
                    </a>
                    {module.name === 'Arcana' && (
                      <a href={routes.EnhancedArcanaRoute.to} className="text-sm font-semibold leading-6 text-arcana-purple-600 dark:text-arcana-purple-400">
                        Enhanced <span aria-hidden="true">→</span>
                      </a>
                    )}
                    {module.name === 'Phantom' && (
                      <a href={routes.EnhancedPhantomRoute.to} className="text-sm font-semibold leading-6 text-arcana-purple-600 dark:text-arcana-purple-400">
                        Enhanced <span aria-hidden="true">→</span>
                      </a>
                    )}
                    {module.name === 'Athena' && (
                      <a href={routes.EnhancedAthenaRoute.to} className="text-sm font-semibold leading-6 text-arcana-purple-600 dark:text-arcana-purple-400">
                        Enhanced <span aria-hidden="true">→</span>
                      </a>
                    )}
                    {module.name === 'Forgeflow' && (
                      <a href={routes.EnhancedForgeflowRoute.to} className="text-sm font-semibold leading-6 text-arcana-purple-600 dark:text-arcana-purple-400">
                        Enhanced <span aria-hidden="true">→</span>
                      </a>
                    )}
                    {module.name === 'Sentinel' && (
                      <a href={routes.EnhancedSentinelRoute.to} className="text-sm font-semibold leading-6 text-arcana-purple-600 dark:text-arcana-purple-400">
                        Enhanced <span aria-hidden="true">→</span>
                      </a>
                    )}
                    {module.name === 'Manifold' && (
                      <a href={routes.EnhancedManifoldRoute.to} className="text-sm font-semibold leading-6 text-arcana-purple-600 dark:text-arcana-purple-400">
                        Enhanced <span aria-hidden="true">→</span>
                      </a>
                    )}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
