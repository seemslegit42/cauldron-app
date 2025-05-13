import React from 'react';
import { cn } from '../../utils/cn';
import { GlassmorphismLevel, getGlassmorphismClasses } from '../../utils/glassmorphism';

export interface GlassHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hero title */
  title: React.ReactNode;
  /** Hero subtitle */
  subtitle?: React.ReactNode;
  /** Hero image or illustration */
  image?: React.ReactNode;
  /** Hero actions (buttons, etc.) */
  actions?: React.ReactNode;
  /** Background image or gradient */
  background?: string;
  /** Whether the hero has a border */
  bordered?: boolean;
  /** Whether the hero has a shadow */
  shadowed?: boolean;
  /** Glassmorphism level */
  glassLevel?: GlassmorphismLevel;
  /** Whether the content is centered */
  centered?: boolean;
  /** Whether the image is on the left or right */
  imagePosition?: 'left' | 'right';
  /** Custom class name for the content */
  contentClassName?: string;
  /** Custom class name for the image */
  imageClassName?: string;
}

/**
 * Glass Hero Component
 * 
 * A hero component with glassmorphism effect for landing pages.
 * 
 * @example
 * ```tsx
 * <GlassHero
 *   title="Welcome to Our App"
 *   subtitle="The best app for your needs"
 *   image={<img src="/hero-image.png" alt="Hero" />}
 *   actions={
 *     <div className="flex gap-4">
 *       <Button>Get Started</Button>
 *       <Button variant="outline">Learn More</Button>
 *     </div>
 *   }
 *   background="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
 * />
 * ```
 */
export const GlassHero: React.FC<GlassHeroProps> = ({
  title,
  subtitle,
  image,
  actions,
  background = 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
  bordered = true,
  shadowed = true,
  glassLevel = 'light',
  centered = false,
  imagePosition = 'right',
  className,
  contentClassName,
  imageClassName,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden py-16 sm:py-24',
        background,
        className
      )}
      {...props}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'overflow-hidden rounded-xl',
            getGlassmorphismClasses({
              level: glassLevel,
              border: bordered,
              shadow: shadowed,
            })
          )}
        >
          <div
            className={cn(
              'grid gap-8 p-8 md:p-12',
              image ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
              imagePosition === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'
            )}
          >
            {/* Content */}
            <div
              className={cn(
                'flex flex-col justify-center',
                centered && 'items-center text-center',
                contentClassName
              )}
            >
              <h1
                className={cn(
                  'text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl',
                  centered && 'text-center'
                )}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className={cn(
                    'mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300',
                    centered && 'text-center'
                  )}
                >
                  {subtitle}
                </p>
              )}
              {actions && <div className="mt-8">{actions}</div>}
            </div>

            {/* Image */}
            {image && (
              <div
                className={cn(
                  'flex items-center justify-center',
                  imageClassName
                )}
              >
                {image}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassHero;
