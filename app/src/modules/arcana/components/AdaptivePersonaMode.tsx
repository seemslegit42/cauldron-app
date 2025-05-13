import React, { useState, useEffect } from 'react';

type PersonaType = 'hacker-ceo' | 'podcast-mogul' | 'enterprise-admin';

interface AdaptivePersonaModeProps {
  initialPersona?: PersonaType;
  onPersonaChange?: (persona: PersonaType) => void;
}

export const AdaptivePersonaMode: React.FC<AdaptivePersonaModeProps> = ({ 
  initialPersona = 'hacker-ceo',
  onPersonaChange 
}) => {
  const [activePersona, setActivePersona] = useState<PersonaType>(initialPersona);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [animateTransition, setAnimateTransition] = useState(false);

  // Animate persona change
  useEffect(() => {
    if (animateTransition) {
      const timer = setTimeout(() => {
        setAnimateTransition(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [animateTransition]);

  const handlePersonaChange = (persona: PersonaType) => {
    setAnimateTransition(true);
    setActivePersona(persona);
    setIsOpen(false);
    if (onPersonaChange) {
      onPersonaChange(persona);
    }
  };

  const getPersonaIcon = (persona: PersonaType) => {
    switch (persona) {
      case 'hacker-ceo':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'podcast-mogul':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      case 'enterprise-admin':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getPersonaLabel = (persona: PersonaType) => {
    switch (persona) {
      case 'hacker-ceo':
        return 'Hacker CEO';
      case 'podcast-mogul':
        return 'Podcast Mogul';
      case 'enterprise-admin':
        return 'Enterprise Admin';
      default:
        return 'Unknown';
    }
  };

  const getPersonaDescription = (persona: PersonaType) => {
    switch (persona) {
      case 'hacker-ceo':
        return 'Focused on security operations and technical leadership';
      case 'podcast-mogul':
        return 'Prioritizes media stats and content generation';
      case 'enterprise-admin':
        return 'Emphasizes financial and operational telemetry';
      default:
        return '';
    }
  };

  const getPersonaColor = (persona: PersonaType) => {
    switch (persona) {
      case 'hacker-ceo':
        return 'from-blue-500 to-purple-600';
      case 'podcast-mogul':
        return 'from-pink-500 to-orange-400';
      case 'enterprise-admin':
        return 'from-green-500 to-teal-400';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPersonaThemeColor = (persona: PersonaType) => {
    switch (persona) {
      case 'hacker-ceo':
        return 'text-blue-400 border-blue-500';
      case 'podcast-mogul':
        return 'text-pink-400 border-pink-500';
      case 'enterprise-admin':
        return 'text-green-400 border-green-500';
      default:
        return 'text-gray-400 border-gray-500';
    }
  };

  const getPersonaBackgroundGlow = (persona: PersonaType) => {
    switch (persona) {
      case 'hacker-ceo':
        return 'shadow-[0_0_15px_rgba(59,130,246,0.3)]';
      case 'podcast-mogul':
        return 'shadow-[0_0_15px_rgba(236,72,153,0.3)]';
      case 'enterprise-admin':
        return 'shadow-[0_0_15px_rgba(34,197,94,0.3)]';
      default:
        return '';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-purple-400">Adaptive Persona Mode</h2>
        <button 
          className="text-gray-400 hover:text-white"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="relative">
        <button
          className={`w-full flex items-center justify-between bg-gray-700 rounded-lg p-4 border ${
            animateTransition ? 'border-purple-500' : 'border-gray-600'
          } hover:border-purple-500 transition-colors ${getPersonaBackgroundGlow(activePersona)}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${getPersonaColor(activePersona)} flex items-center justify-center text-white ${
              animateTransition ? 'animate-pulse' : ''
            }`}>
              {getPersonaIcon(activePersona)}
            </div>
            <div className="ml-3">
              <div className={`font-medium ${getPersonaThemeColor(activePersona).split(' ')[0]}`}>
                {getPersonaLabel(activePersona)}
              </div>
              <div className="text-xs text-gray-400">Active Persona</div>
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 mt-2 w-full bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
            {(['hacker-ceo', 'podcast-mogul', 'enterprise-admin'] as PersonaType[]).map((persona) => (
              <button
                key={persona}
                className={`w-full flex items-center p-4 hover:bg-gray-700 transition-colors ${
                  activePersona === persona ? 'bg-gray-700' : ''
                }`}
                onClick={() => handlePersonaChange(persona)}
              >
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${getPersonaColor(persona)} flex items-center justify-center text-white`}>
                  {getPersonaIcon(persona)}
                </div>
                <div className="ml-3 text-left">
                  <div className={`font-medium ${getPersonaThemeColor(persona).split(' ')[0]}`}>
                    {getPersonaLabel(persona)}
                  </div>
                  <div className="text-xs text-gray-400">{getPersonaDescription(persona)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current persona description */}
      <div className={`mt-4 bg-gray-700 rounded-lg p-4 border ${getPersonaThemeColor(activePersona).split(' ')[1]} transition-colors duration-300`}>
        <h3 className="text-sm font-medium text-gray-300 mb-2">Current Persona Features</h3>
        <p className="text-sm text-gray-400">{getPersonaDescription(activePersona)}</p>
        
        <div className="mt-3 space-y-2">
          {activePersona === 'hacker-ceo' && (
            <>
              <div className="flex items-center text-xs text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Security metrics prioritized
              </div>
              <div className="flex items-center text-xs text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Neon visual aesthetic
              </div>
              <div className="flex items-center text-xs text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Operations-focused layout
              </div>
            </>
          )}
          
          {activePersona === 'podcast-mogul' && (
            <>
              <div className="flex items-center text-xs text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Media stats prioritized
              </div>
              <div className="flex items-center text-xs text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Content generation hub
              </div>
              <div className="flex items-center text-xs text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Audience insights focus
              </div>
            </>
          )}
          
          {activePersona === 'enterprise-admin' && (
            <>
              <div className="flex items-center text-xs text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Financial metrics prioritized
              </div>
              <div className="flex items-center text-xs text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Operational telemetry focus
              </div>
              <div className="flex items-center text-xs text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Business analytics dashboard
              </div>
            </>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Persona Customization</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-400">Theme</div>
                <select className="mt-1 w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300">
                  <option>Default</option>
                  <option>High Contrast</option>
                  <option>Minimal</option>
                </select>
              </div>
              <div>
                <div className="text-xs text-gray-400">Layout</div>
                <select className="mt-1 w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300">
                  <option>Standard</option>
                  <option>Compact</option>
                  <option>Expanded</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-400">Dashboard Widgets</div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" id="widget-metrics" className="mr-2" checked />
                  <label htmlFor="widget-metrics" className="text-sm text-gray-300">Key Metrics Board</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="widget-sentinel" className="mr-2" checked />
                  <label htmlFor="widget-sentinel" className="text-sm text-gray-300">Sentinel Risk Light</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="widget-forgeflow" className="mr-2" checked />
                  <label htmlFor="widget-forgeflow" className="text-sm text-gray-300">Forgeflow Widget</label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Persona Presets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button 
                className={`p-3 rounded-lg border ${activePersona === 'hacker-ceo' ? 'bg-gray-600 border-blue-500' : 'bg-gray-800 border-gray-700'} hover:border-blue-500 transition-colors`}
                onClick={() => handlePersonaChange('hacker-ceo')}
              >
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mb-2">
                    {getPersonaIcon('hacker-ceo')}
                  </div>
                  <div className="text-xs font-medium text-blue-400">Hacker CEO</div>
                </div>
              </button>
              <button 
                className={`p-3 rounded-lg border ${activePersona === 'podcast-mogul' ? 'bg-gray-600 border-pink-500' : 'bg-gray-800 border-gray-700'} hover:border-pink-500 transition-colors`}
                onClick={() => handlePersonaChange('podcast-mogul')}
              >
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white mb-2">
                    {getPersonaIcon('podcast-mogul')}
                  </div>
                  <div className="text-xs font-medium text-pink-400">Podcast Mogul</div>
                </div>
              </button>
              <button 
                className={`p-3 rounded-lg border ${activePersona === 'enterprise-admin' ? 'bg-gray-600 border-green-500' : 'bg-gray-800 border-gray-700'} hover:border-green-500 transition-colors`}
                onClick={() => handlePersonaChange('enterprise-admin')}
              >
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-400 flex items-center justify-center text-white mb-2">
                    {getPersonaIcon('enterprise-admin')}
                  </div>
                  <div className="text-xs font-medium text-green-400">Enterprise Admin</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};