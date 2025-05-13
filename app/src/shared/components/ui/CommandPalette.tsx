import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Combobox, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@src/shared/utils/cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: 'navigation' | 'action' | 'search' | 'workflow';
}

/**
 * CommandPalette - Global search and command interface
 * 
 * Features:
 * - Search across modules, actions, and content
 * - Keyboard shortcuts
 * - Categorized results
 * - Animated transitions
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<CommandItem | null>(null);

  // Reset query when dialog opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  // Execute the selected item's action
  useEffect(() => {
    if (selectedItem) {
      selectedItem.action();
      onClose();
      setSelectedItem(null);
    }
  }, [selectedItem, onClose]);

  // Define command items
  const commandItems: CommandItem[] = [
    // Navigation commands
    {
      id: 'nav-arcana',
      name: 'Go to Arcana',
      description: 'Open the Arcana dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      shortcut: 'G A',
      action: () => navigate('/arcana'),
      category: 'navigation',
    },
    {
      id: 'nav-phantom',
      name: 'Go to Phantom',
      description: 'Open the Phantom security dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      shortcut: 'G P',
      action: () => navigate('/phantom'),
      category: 'navigation',
    },
    {
      id: 'nav-athena',
      name: 'Go to Athena',
      description: 'Open the Athena business intelligence dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      shortcut: 'G T',
      action: () => navigate('/athena'),
      category: 'navigation',
    },
    
    // Action commands
    {
      id: 'action-run-briefing',
      name: 'Run Morning Briefing',
      description: 'Start the Sentient Loop™ morning briefing',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      shortcut: 'R B',
      action: () => console.log('Run briefing'),
      category: 'action',
    },
    {
      id: 'action-new-workflow',
      name: 'Create New Workflow',
      description: 'Create a new agent workflow in Forgeflow',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      shortcut: 'N W',
      action: () => navigate('/forgeflow/new'),
      category: 'action',
    },
    
    // Search commands
    {
      id: 'search-threats',
      name: 'Search Security Threats',
      description: 'Search for security threats in Phantom',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      action: () => navigate('/phantom/threats'),
      category: 'search',
    },
    
    // Workflow commands
    {
      id: 'workflow-run-scan',
      name: 'Run Security Scan',
      description: 'Run a comprehensive security scan in Phantom',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      action: () => console.log('Run security scan'),
      category: 'workflow',
    },
  ];

  // Filter items based on query
  const filteredItems = query === ''
    ? commandItems
    : commandItems.filter((item) => {
        return item.name.toLowerCase().includes(query.toLowerCase()) ||
               item.description.toLowerCase().includes(query.toLowerCase());
      });

  // Group items by category
  const groupedItems = filteredItems.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, CommandItem[]>);

  // Category labels
  const categoryLabels = {
    navigation: 'Navigation',
    action: 'Actions',
    search: 'Search',
    workflow: 'Workflows',
  };

  return (
    <Transition.Root show={isOpen} as={Fragment} afterLeave={() => setQuery('')}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[25vh]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Combobox
            as="div"
            className={cn(
              "mx-auto max-w-xl overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/5 transition-all",
              getGlassmorphismClasses({
                level: 'heavy',
                border: true,
                shadow: true,
              })
            )}
            onChange={(item: CommandItem) => setSelectedItem(item)}
          >
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Combobox.Input
                className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                placeholder="Search commands..."
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            {filteredItems.length > 0 && (
              <Combobox.Options static className="max-h-80 overflow-y-auto py-4 text-sm">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="px-4 py-2">
                    <h2 className="mb-2 text-xs font-semibold uppercase text-gray-400">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </h2>
                    <ul>
                      {items.map((item) => (
                        <Combobox.Option
                          key={item.id}
                          value={item}
                          className={({ active }) =>
                            cn(
                              "flex cursor-pointer select-none items-center rounded-md px-3 py-2",
                              active ? "bg-gray-800/50 text-white" : "text-gray-300"
                            )
                          }
                        >
                          {({ active }) => (
                            <>
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gray-800 text-white">
                                {item.icon}
                              </div>
                              <div className="ml-4 flex-auto">
                                <p className={cn("text-sm", active ? "text-white" : "text-gray-200")}>
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-400">{item.description}</p>
                              </div>
                              {item.shortcut && (
                                <div className="ml-2 flex items-center">
                                  {item.shortcut.split(' ').map((key, index) => (
                                    <React.Fragment key={index}>
                                      {index > 0 && <span className="mx-1 text-gray-400">+</span>}
                                      <kbd className="rounded bg-gray-800 px-2 py-1 text-xs font-semibold text-gray-200">
                                        {key}
                                      </kbd>
                                    </React.Fragment>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </Combobox.Option>
                      ))}
                    </ul>
                  </div>
                ))}
              </Combobox.Options>
            )}

            {query !== '' && filteredItems.length === 0 && (
              <div className="px-6 py-14 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 text-sm text-gray-400">No commands found.</p>
              </div>
            )}
          </Combobox>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
};

export default CommandPalette;
