import React from 'react';

interface Badge {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function TrustBadges() {
  const badges: Badge[] = [
    {
      title: 'SOC 2 Compliant',
      description: 'Built with enterprise-grade security and compliance standards',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Advanced AI Stack',
      description: 'Powered by state-of-the-art large language models and neural networks',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Early Access Partners',
      description: 'Trusted by 10+ security-forward organizations',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Data Sovereignty',
      description: 'Your data remains within your control at all times',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-12">
          <h2 className="text-base font-semibold leading-7 text-arcana-purple-600 dark:text-arcana-purple-400">Enterprise Ready</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Trusted by Security-Forward Organizations
          </p>
        </div>
        
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
          {badges.map((badge) => (
            <div 
              key={badge.title} 
              className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="rounded-full p-3 bg-arcana-purple-100 dark:bg-arcana-purple-900/30 text-arcana-purple-600 dark:text-arcana-purple-400 mb-4">
                {badge.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{badge.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{badge.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-800 px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="mr-2">🔒</span> Enterprise-grade security and compliance at every layer
          </div>
        </div>
      </div>
    </div>
  );
}
