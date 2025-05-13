import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  X, 
  LayoutDashboard, 
  Shield, 
  Zap, 
  Database, 
  Users, 
  Settings, 
  Workflow, 
  Brain, 
  BarChart3, 
  ChevronDown
} from 'lucide-react';
import { cn } from '../../shared/utils/cn';
import { getGlassmorphismClasses } from '../../shared/utils/glassmorphism';
import Logo from '../../client/static/logo.webp';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../shared/components/ui/accordion';

interface AlchemicalSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

/**
 * AlchemicalSidebar - Corporate cyberpunk themed sidebar with collapsible sections
 */
const AlchemicalSidebar: React.FC<AlchemicalSidebarProps> = ({ 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // Close sidebar when pressing Escape key
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <aside
      ref={sidebar}
      className={cn(
        'fixed left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden duration-300 ease-linear lg:static lg:translate-x-0',
        getGlassmorphismClasses({ 
          level: 'heavy', 
          border: true, 
          shadow: true 
        }),
        {
          'translate-x-0': sidebarOpen,
          '-translate-x-full': !sidebarOpen,
        }
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/admin" className="flex items-center gap-2">
          <img src={Logo} alt="Cauldron" width={40} />
          <span className="text-xl font-bold text-white">Cauldron</span>
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Sidebar Menu */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          {/* Menu Group - Main */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-400">MAIN</h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* Dashboard */}
              <li>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-gray-200 duration-300 ease-in-out hover:bg-gray-700',
                      {
                        'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]': isActive,
                      }
                    )
                  }
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Menu Group - Modules */}
          <div>
            <Accordion type="multiple" className="w-full border-none">
              <AccordionItem value="modules" className="border-none">
                <AccordionTrigger className="py-2 px-4 text-sm font-semibold text-gray-400 hover:no-underline">
                  MODULES
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="flex flex-col gap-1.5">
                    {/* Phantom */}
                    <li>
                      <NavLink
                        to="/admin/phantom"
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-gray-200 duration-300 ease-in-out hover:bg-gray-700',
                            {
                              'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]': isActive,
                            }
                          )
                        }
                      >
                        <Shield className="h-5 w-5" />
                        Phantom
                      </NavLink>
                    </li>
                    {/* Sentinel */}
                    <li>
                      <NavLink
                        to="/admin/sentinel"
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-gray-200 duration-300 ease-in-out hover:bg-gray-700',
                            {
                              'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]': isActive,
                            }
                          )
                        }
                      >
                        <Zap className="h-5 w-5" />
                        Sentinel
                      </NavLink>
                    </li>
                    {/* Arcana */}
                    <li>
                      <NavLink
                        to="/admin/arcana"
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-gray-200 duration-300 ease-in-out hover:bg-gray-700',
                            {
                              'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]': isActive,
                            }
                          )
                        }
                      >
                        <Brain className="h-5 w-5" />
                        Arcana
                      </NavLink>
                    </li>
                    {/* Forgeflow */}
                    <li>
                      <NavLink
                        to="/admin/forgeflow"
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-gray-200 duration-300 ease-in-out hover:bg-gray-700',
                            {
                              'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]': isActive,
                            }
                          )
                        }
                      >
                        <Workflow className="h-5 w-5" />
                        Forgeflow
                      </NavLink>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Menu Group - Admin */}
              <AccordionItem value="admin" className="border-none">
                <AccordionTrigger className="py-2 px-4 text-sm font-semibold text-gray-400 hover:no-underline">
                  ADMIN
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="flex flex-col gap-1.5">
                    {/* Users */}
                    <li>
                      <NavLink
                        to="/admin/users"
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-gray-200 duration-300 ease-in-out hover:bg-gray-700',
                            {
                              'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]': isActive,
                            }
                          )
                        }
                      >
                        <Users className="h-5 w-5" />
                        Users
                      </NavLink>
                    </li>
                    {/* Database */}
                    <li>
                      <NavLink
                        to="/admin/database"
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-gray-200 duration-300 ease-in-out hover:bg-gray-700',
                            {
                              'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]': isActive,
                            }
                          )
                        }
                      >
                        <Database className="h-5 w-5" />
                        Database
                      </NavLink>
                    </li>
                    {/* Analytics */}
                    <li>
                      <NavLink
                        to="/admin/analytics"
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-gray-200 duration-300 ease-in-out hover:bg-gray-700',
                            {
                              'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]': isActive,
                            }
                          )
                        }
                      >
                        <BarChart3 className="h-5 w-5" />
                        Analytics
                      </NavLink>
                    </li>
                    {/* Settings */}
                    <li>
                      <NavLink
                        to="/admin/settings"
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-gray-200 duration-300 ease-in-out hover:bg-gray-700',
                            {
                              'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]': isActive,
                            }
                          )
                        }
                      >
                        <Settings className="h-5 w-5" />
                        Settings
                      </NavLink>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AlchemicalSidebar;
