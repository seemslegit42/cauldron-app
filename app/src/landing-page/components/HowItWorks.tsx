import React from 'react';

interface Step {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export default function HowItWorks() {
  const steps: Step[] = [
    {
      id: 1,
      name: 'Incantation',
      description: 'The Sentient Loop™ summons context from your business data, security posture, and user interactions to establish mystical awareness.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 2,
      name: 'Divination',
      description: 'Our arcane algorithms scry for patterns, anomalies, threats, and opportunities across your enterprise data landscape.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: 3,
      name: 'Conjuration',
      description: 'The cauldron brews options and distills recommendations with supporting evidence for human review and approval.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 4,
      name: 'Manifestation',
      description: 'Upon your enchanted approval, the system transmutes decisions into action, whether it's a security response, business process, or strategic initiative.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
{
  id: 5,
    name: 'Transmutation',
      description: 'The system absorbs the essence of each interaction, transforming its alchemical formulas and adapting to your evolving business needs.',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        ),
    },
  ];

return (
  <div className="bg-gray-50 dark:bg-gray-900 py-24 sm:py-32">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-base font-semibold leading-7 text-arcana-purple-600 dark:text-arcana-purple-400">The Arcane Process</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          The Sentient Loop™ Ritual
        </p>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Our proprietary Sentient Loop™ technology blends digital sorcery with human wisdom to brew powerful, trustworthy results from the cauldron of your data.
        </p>
      </div>
      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
        <div className="grid grid-cols-1 gap-y-10 gap-x-8 lg:grid-cols-2">
          {steps.map((step, stepIdx) => (
            <div key={step.id} className={stepIdx === steps.length - 1 && steps.length % 2 === 1 ? "lg:col-span-2 lg:max-w-xl lg:mx-auto" : ""}>
              <div className="flex items-center gap-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-arcana-purple-600 dark:bg-arcana-purple-800 text-white">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold leading-7 tracking-tight text-gray-900 dark:text-white">
                  {step.name}
                </h3>
              </div>
              <div className="mt-4 ml-13 flex">
                <div className="ml-13">
                  <p className="text-base leading-7 text-gray-600 dark:text-gray-300">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-16 flex justify-center">
        <div className="relative rounded-full px-4 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 dark:text-gray-300 dark:ring-gray-700 dark:hover:ring-gray-600">
          Curious about our Human-in-the-Loop enchantment?{' '}
          <a href="#" className="font-semibold text-arcana-purple-600 dark:text-arcana-purple-400">
            <span className="absolute inset-0" aria-hidden="true" />
            Unravel the Arcane Scrolls <span aria-hidden="true">✨</span>
          </a>
        </div>
      </div>
    </div>
  </div>
);
}
