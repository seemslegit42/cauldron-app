import OpenAILogo from "../logos/OpenAILogo";
import PrismaLogo from "../logos/PrismaLogo";
import AstroLogo from "../logos/AstroLogo";
import SalesforceLogo from "../logos/SalesforceLogo";

export default function Clients() {
  return (
    <div className='mt-12 mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-between gap-y-6'>
      <h2 className='mb-6 text-center font-semibold tracking-wide text-gray-500 dark:text-white'>
        Powered by Industry-Leading Technology
      </h2>

      <div className='mx-auto grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-12 sm:max-w-xl md:grid-cols-4 sm:gap-x-10 sm:gap-y-14 lg:mx-0 lg:max-w-none'>
        {
          [<OpenAILogo />, <PrismaLogo />, <AstroLogo />, <SalesforceLogo />].map((logo, index) => (
            <div key={index} className='flex justify-center col-span-1 max-h-12 w-full object-contain dark:opacity-90 hover:scale-110 transition-transform duration-200'>
              {logo}
            </div>
          ))
        }
      </div>
      <p className='mt-8 text-center text-sm text-gray-500 dark:text-gray-400'>
        CauldronOS integrates with leading AI, security, and enterprise platforms to deliver a comprehensive solution.
      </p>
    </div>
  )
}
