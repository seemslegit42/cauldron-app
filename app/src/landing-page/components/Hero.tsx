import openSaasBannerWebp from '../../client/static/open-saas-banner.webp';
import { DocsUrl } from '../../shared/config/urls';

export default function Hero() {
  return (
    <div className="relative w-full pt-14">
      <TopGradient />
      <BottomGradient />
      <div className="py-24 sm:py-32">
        <div className="max-w-8xl mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center lg:mb-18">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl dark:text-white">
              Where <span className="text-arcana-purple-500">Digital Alchemy</span> Meets Enterprise Intelligence
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-white">
              CauldronOS brews potent concoctions of cybersecurity, business intelligence, and workflow automation—all supervised by the mystical Sentient Loop™.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href={DocsUrl}
                className="rounded-md bg-arcana-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-arcana-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcana-purple-600"
              >
                Summon the Magic <span aria-hidden="true">✨</span>
              </a>
              <a
                href="#features"
                className="rounded-md px-3.5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 ring-inset hover:ring-2 hover:ring-arcana-purple-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcana-purple-600 dark:text-white"
              >
                Peek Into the Cauldron
              </a>
            </div>
          </div>
          <div className="mt-14 flow-root sm:mt-14">
            <div className="-m-2 flex justify-center rounded-xl lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                src={openSaasBannerWebp}
                alt="App screenshot"
                width={1000}
                height={530}
                loading="lazy"
                className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopGradient() {
  return (
    <div
      className="absolute top-0 right-0 -z-10 w-full transform-gpu overflow-hidden blur-3xl sm:top-0"
      aria-hidden="true"
    >
      <div
        className="aspect-[1020/880] w-[55rem] flex-none bg-gradient-to-tr from-arcana-purple-500 to-arcana-blue-500 opacity-40 sm:right-1/4 sm:translate-x-1/2 dark:opacity-20 dark:from-arcana-purple-700 dark:to-arcana-blue-700"
        style={{
          clipPath: 'polygon(80% 20%, 90% 55%, 50% 100%, 70% 30%, 20% 50%, 50% 0)',
        }}
      />
    </div>
  );
}

function BottomGradient() {
  return (
    <div
      className="absolute inset-x-0 top-[calc(100%-40rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-65rem)]"
      aria-hidden="true"
    >
      <div
        className="relative aspect-[1020/880] w-[72.1875rem] bg-gradient-to-br from-arcana-pink-500 to-arcana-purple-500 opacity-50 sm:-left-3/4 sm:translate-x-1/4 dark:opacity-20 dark:from-arcana-pink-700 dark:to-arcana-purple-700"
        style={{
          clipPath: 'ellipse(80% 30% at 80% 50%)',
        }}
      />
    </div>
  );
}
