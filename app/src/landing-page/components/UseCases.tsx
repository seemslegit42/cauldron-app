import React from 'react';
import { routes } from 'wasp/client/router';

interface UseCase {
  role: string;
  description: string;
  modules: string[];
  icon: React.ReactNode;
  cta: {
    text: string;
    href: string;
  };
}

export default function UseCases() {
  const useCases: UseCase[] = [
    {
      role: 'Chief Information Security Officer',
      description: 'Monitor your security posture in real-time, detect threats before they materialize, and orchestrate rapid response with AI-assisted decision support.',
      modules: ['Phantom', 'Sentinel', 'Arcana'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      cta: {
        text: 'Conjure Security',
        href: routes.PhantomRoute.to,
      },
    },
    {
      role: 'Chief Technology Officer',
      description: 'Leverage AI to automate workflows, integrate systems, and build custom agents that enhance your technology stack while maintaining human oversight.',
      modules: ['Forgeflow', 'Arcana', 'Sentinel'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      cta: {
        text: 'Brew Automation',
        href: routes.ForgeflowVisualBuilderRoute.to,
      },
    },
    {
      role: 'Chief Revenue Officer',
      description: 'Gain strategic insights into market trends, customer behavior, and revenue opportunities with AI-powered analytics and recommendations.',
      modules: ['Athena', 'Manifold', 'Arcana'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      cta: {
        text: 'Distill Insights',
        href: routes.AthenaRoute.to,
      },
    },
    {
      role: 'Security Analyst',
      description: 'Investigate threats with AI assistance, automate routine security tasks, and focus on high-value analysis with augmented intelligence.',
      modules: ['Phantom', 'Sentinel', 'Forgeflow'],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      cta: {
        text: 'Summon Defense',
        href: routes.SentinelRoute.to,
      },
    },
  ];

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-arcana-purple-600 dark:text-arcana-purple-400">For Teams</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Alchemical Solutions for Every Role
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            CauldronOS transforms how teams work across your organization, with specialized capabilities for each role and department.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            {useCases.map((useCase) => (
              <div key={useCase.role} className="flex flex-col rounded-xl bg-white p-6 shadow-md dark:bg-gray-800/50 dark:shadow-gray-900/10 hover:shadow-lg transition-shadow duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="rounded-lg p-2 bg-arcana-purple-600 text-white">
                    {useCase.icon}
                  </div>
                  {useCase.role}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">{useCase.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {useCase.modules.map((module) => (
                      <span 
                        key={module} 
                        className="inline-flex items-center rounded-md bg-arcana-purple-50 px-2 py-1 text-xs font-medium text-arcana-purple-700 dark:bg-arcana-purple-900/30 dark:text-arcana-purple-300"
                      >
                        {module}
                      </span>
                    ))}
                  </div>
                  <p className="mt-6">
                    <a 
                      href={useCase.cta.href} 
                      className="inline-flex items-center rounded-md bg-arcana-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-arcana-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcana-purple-600"
                    >
                      {useCase.cta.text} <span aria-hidden="true" className="ml-1">→</span>
                    </a>
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
