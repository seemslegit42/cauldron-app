import React, { useState } from 'react';
import { DocsUrl } from '../../shared/config/urls';

interface DemoStep {
  id: number;
  title: string;
  description: string;
  image: string;
  color: string;
}

export default function DemoSection() {
  const [activeStep, setActiveStep] = useState(1);
  
  const demoSteps: DemoStep[] = [
    {
      id: 1,
      title: 'Command Dashboard',
      description: 'The Arcana module provides a centralized command center with real-time metrics, AI-generated insights, and a natural language interface for interacting with the Sentient Loop™.',
      image: 'https://placehold.co/600x400/3b0764/ffffff?text=Arcana+Dashboard',
      color: 'bg-arcana-purple-600',
    },
    {
      id: 2,
      title: 'Threat Intelligence',
      description: 'The Phantom module monitors your digital perimeter, detecting threats, domain clones, and vulnerabilities with advanced AI analysis and visualization.',
      image: 'https://placehold.co/600x400/0c4a6e/ffffff?text=Phantom+Security',
      color: 'bg-arcana-blue-600',
    },
    {
      id: 3,
      title: 'Business Intelligence',
      description: 'The Athena module analyzes your business data to provide strategic insights, market trends, and growth opportunities with AI-powered recommendations.',
      image: 'https://placehold.co/600x400/166534/ffffff?text=Athena+Analytics',
      color: 'bg-arcana-green-600',
    },
    {
      id: 4,
      title: 'Workflow Automation',
      description: 'The Forgeflow module enables you to create custom AI workflows with a visual no-code interface, automating complex processes while maintaining human oversight.',
      image: 'https://placehold.co/600x400/9d174d/ffffff?text=Forgeflow+Builder',
      color: 'bg-arcana-pink-600',
    },
  ];

  return (
    <div className="relative bg-gray-50 dark:bg-gray-900 py-24 sm:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-arcana-purple-400/20 to-arcana-blue-400/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-arcana-pink-400/20 to-arcana-purple-400/20 blur-3xl"></div>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-arcana-purple-600 dark:text-arcana-purple-400">Interactive Preview</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Glimpse the Arcane Interface
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Explore the mystical capabilities of CauldronOS through our interactive preview. See how our modules transform data into actionable intelligence.
          </p>
        </div>
        
        <div className="mx-auto max-w-6xl">
          {/* Demo viewer */}
          <div className="relative rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {/* Demo header */}
            <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="mx-auto font-mono text-sm text-gray-500 dark:text-gray-400">
                CauldronOS v1.0.0
              </div>
            </div>
            
            {/* Demo content */}
            <div className="relative aspect-[16/9]">
              <img 
                src={demoSteps[activeStep - 1].image} 
                alt={demoSteps[activeStep - 1].title}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay with info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-xl font-bold text-white">
                  {demoSteps[activeStep - 1].title}
                </h3>
                <p className="mt-2 text-gray-200 max-w-3xl">
                  {demoSteps[activeStep - 1].description}
                </p>
              </div>
            </div>
            
            {/* Demo navigation */}
            <div className="flex p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2 mx-auto">
                {demoSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      activeStep === step.id ? step.color : 'bg-gray-300 dark:bg-gray-600'
                    } ${activeStep === step.id ? 'scale-125' : ''}`}
                    aria-label={`View ${step.title}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={DocsUrl}
              className="inline-flex items-center justify-center rounded-md bg-arcana-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-arcana-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcana-purple-600"
            >
              <span className="mr-2">✨</span> Summon Full Demo
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-md bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700"
            >
              <span className="mr-2">🧙‍♂️</span> Book a Guided Scrying
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
