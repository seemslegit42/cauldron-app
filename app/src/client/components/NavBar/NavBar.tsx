import { Link as ReactRouterLink } from 'react-router-dom';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { useAuth } from 'wasp/client/auth';
import { useState, Dispatch, SetStateAction } from 'react';
import { Dialog } from '@headlessui/react';
import { BiLogIn } from 'react-icons/bi';
import { AiFillCloseCircle } from 'react-icons/ai';
import { HiBars3 } from 'react-icons/hi2';
import logo from '../../static/logo.webp';
import DropdownUser from '../../../user/DropdownUser';
import { UserMenuItems } from '../../../user/UserMenuItems';
import { DarkModeToggle } from '@src/shared/theme';
import { useIsLandingPage } from '../../hooks/useIsLandingPage';
import { cn } from '../../cn';
import { getGlassmorphismClasses } from '@src/shared/utils/glassmorphism';

export interface NavigationItem {
  name: string;
  to: string;
}

const NavLogo = () => <img className="h-8 w-8" src={logo} alt="Your SaaS App" />;

export default function AppNavBar({ navigationItems }: { navigationItems: NavigationItem[] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLandingPage = useIsLandingPage();

  const { data: user, isLoading: isUserLoading } = useAuth();
  return (
    <header
      className={cn('absolute inset-x-0 top-0 z-50', {
        'sticky': !isLandingPage,
        [getGlassmorphismClasses({
          level: 'medium',
          border: true,
          shadow: true,
          className: 'border-white/10 dark:border-gray-800/20'
        })]: !isLandingPage,
      })}
    >
      {isLandingPage && <Announcement />}
      <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex items-center lg:flex-1">
          <WaspRouterLink
            to={routes.LandingPageRoute.to}
            className="-m-1.5 flex items-center p-1.5 text-gray-900 duration-300 ease-in-out hover:text-yellow-500"
          >
            <NavLogo />
            {isLandingPage && (
              <span className="ml-2 text-sm leading-6 font-semibold dark:text-white">
                Your Saas
              </span>
            )}
          </WaspRouterLink>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <HiBars3 className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">{renderNavigationItems(navigationItems)}</div>
        <div className="hidden items-center justify-end gap-3 lg:flex lg:flex-1">
          <ul className="flex items-center justify-center gap-2 sm:gap-4">
            <DarkModeToggle />
          </ul>
          {isUserLoading ? null : !user ? (
            <WaspRouterLink
              to={routes.LoginRoute.to}
              className="ml-3 text-sm leading-6 font-semibold"
            >
              <div className="flex items-center text-gray-900 duration-300 ease-in-out hover:text-yellow-500 dark:text-white">
                Log in <BiLogIn size="1.1rem" className="mt-[0.1rem] ml-1" />
              </div>
            </WaspRouterLink>
          ) : (
            <div className="ml-3">
              <DropdownUser user={user} />
            </div>
          )}
        </div>
      </nav>
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className={cn(
          "fixed inset-y-0 right-0 z-50 w-full overflow-y-auto px-6 py-6 sm:max-w-sm dark:text-white",
          getGlassmorphismClasses({
            level: 'heavy',
            border: true,
            shadow: true,
            className: 'border-r-0 border-t-0 border-b-0 border-white/20 dark:border-gray-800/30 sm:border-r'
          })
        )}>
          <div className="flex items-center justify-between">
            <WaspRouterLink to={routes.LandingPageRoute.to} className="-m-1.5 p-1.5">
              <span className="sr-only">Your SaaS</span>
              <NavLogo />
            </WaspRouterLink>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <AiFillCloseCircle className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {renderNavigationItems(navigationItems, setMobileMenuOpen)}
              </div>
              <div className="py-6">
                {isUserLoading ? null : !user ? (
                  <WaspRouterLink to={routes.LoginRoute.to}>
                    <div className="flex items-center justify-end text-gray-900 duration-300 ease-in-out hover:text-yellow-500 dark:text-white">
                      Log in <BiLogIn size="1.1rem" className="ml-1" />
                    </div>
                  </WaspRouterLink>
                ) : (
                  <UserMenuItems user={user} setMobileMenuOpen={setMobileMenuOpen} />
                )}
              </div>
              <div className="py-6">
                <DarkModeToggle />
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}

function renderNavigationItems(
  navigationItems: NavigationItem[],
  setMobileMenuOpen?: Dispatch<SetStateAction<boolean>>
) {
  const menuStyles = cn({
    '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-boxdark-2':
      !!setMobileMenuOpen,
    'text-sm font-semibold leading-6 text-gray-900 duration-300 ease-in-out hover:text-yellow-500 dark:text-white':
      !setMobileMenuOpen,
  });

  return navigationItems.map((item) => {
    return (
      <ReactRouterLink
        to={item.to}
        key={item.name}
        className={menuStyles}
        onClick={setMobileMenuOpen && (() => setMobileMenuOpen(false))}
      >
        {item.name}
      </ReactRouterLink>
    );
  });
}

const ContestURL = 'https://github.com/wasp-lang/wasp';

function Announcement() {
  return (
    <div className="z-49 flex w-full items-center justify-center gap-3 bg-gradient-to-r from-[#d946ef] to-[#fc0] p-3 text-center font-semibold text-white">
      <p
        onClick={() => window.open(ContestURL, '_blank')}
        className="hidden cursor-pointer hover:opacity-90 hover:drop-shadow lg:block"
      >
        Support Open-Source Software!
      </p>
      <div className="hidden w-0.5 self-stretch bg-white lg:block"></div>
      <div
        onClick={() => window.open(ContestURL, '_blank')}
        className="hidden cursor-pointer rounded-full bg-neutral-700 px-2.5 py-1 text-xs tracking-wider hover:bg-neutral-600 lg:block"
      >
        Star Our Repo on Github ⭐️ →
      </div>
      <div
        onClick={() => window.open(ContestURL, '_blank')}
        className="cursor-pointer rounded-full bg-neutral-700 px-2.5 py-1 text-xs tracking-wider hover:bg-neutral-600 lg:hidden"
      >
        ⭐️ Star the Our Repo on Github and Support Open-Source! ⭐️
      </div>
    </div>
  );
}
