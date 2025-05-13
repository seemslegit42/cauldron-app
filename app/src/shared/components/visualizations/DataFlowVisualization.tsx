import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

export interface DataFlowItem {
  /** Name of the data item */
  name: string;
  /** Value of the data item */
  value: number;
  /** Color class for the data item (e.g., 'bg-blue-500') */
  color: string;
}

export interface DataFlowVisualizationProps {
  /** Data items to visualize */
  data: DataFlowItem[];
  /** Whether to animate the visualization */
  animate?: boolean;
  /** Animation speed in milliseconds */
  animationSpeed?: number;
  /** Whether to show labels */
  showLabels?: boolean;
  /** Whether to show values */
  showValues?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Data Flow Visualization Component
 * 
 * A cyberpunk-styled visualization that shows data flowing through a system.
 * 
 * @example
 * ```tsx
 * <DataFlowVisualization
 *   data={[
 *     { name: 'Revenue', value: 50000, color: 'bg-blue-500' },
 *     { name: 'Expenses', value: 30000, color: 'bg-red-500' },
 *     { name: 'Profit', value: 20000, color: 'bg-green-500' },
 *   ]}
 * />
 * ```
 */
export const DataFlowVisualization: React.FC<DataFlowVisualizationProps> = ({
  data,
  animate = true,
  animationSpeed = 2000,
  showLabels = true,
  showValues = true,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  // Extract color from Tailwind class
  const extractColor = (colorClass: string): string => {
    // This is a simplified approach - in a real app, you might want to use a more robust method
    // or define colors explicitly rather than extracting from class names
    if (colorClass.includes('red')) return '#ef4444';
    if (colorClass.includes('blue')) return '#3b82f6';
    if (colorClass.includes('green')) return '#10b981';
    if (colorClass.includes('yellow')) return '#eab308';
    if (colorClass.includes('purple')) return '#8b5cf6';
    if (colorClass.includes('pink')) return '#ec4899';
    if (colorClass.includes('orange')) return '#f97316';
    if (colorClass.includes('teal')) return '#14b8a6';
    return '#6b7280'; // gray default
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class for animation
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;
      
      constructor(color: string) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.color = color;
        this.opacity = Math.random() * 0.5 + 0.3;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }
    }

    // Create particles for each data item
    const particles: Particle[] = [];
    data.forEach(item => {
      const color = extractColor(item.color);
      const particleCount = Math.floor((item.value / totalValue) * 100);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(color));
      }
    });

    // Animation loop
    let animationFrameId: number;
    
    const render = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections between particles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Update and draw particles
      particles.forEach(particle => {
        if (animate) particle.update();
        particle.draw();
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [data, animate, totalValue]);

  return (
    <div className={cn('relative w-full h-full', className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {/* Labels */}
      {showLabels && (
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center text-xs">
              <div className={cn('w-3 h-3 rounded-full mr-1', item.color)} />
              <span>{item.name}</span>
              {showValues && (
                <span className="ml-1 opacity-70">
                  ({Math.round((item.value / totalValue) * 100)}%)
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataFlowVisualization;
