import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

export interface SecurityScanVisualizationProps {
  /** Number of grid cells in each row */
  gridSize?: number;
  /** Animation speed in milliseconds */
  scanSpeed?: number;
  /** Color of the scan line */
  scanColor?: string;
  /** Whether to show a glow effect */
  glow?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Security Scan Visualization Component
 * 
 * A cyberpunk-styled visualization that simulates a security scan process.
 * 
 * @example
 * ```tsx
 * <SecurityScanVisualization gridSize={20} scanSpeed={50} scanColor="teal" glow />
 * ```
 */
export const SecurityScanVisualization: React.FC<SecurityScanVisualizationProps> = ({
  gridSize = 20,
  scanSpeed = 50,
  scanColor = 'teal',
  glow = true,
  className,
}) => {
  const [grid, setGrid] = useState<Array<Array<number>>>([]);
  const [scanLine, setScanLine] = useState<number>(0);
  const [scanDirection, setScanDirection] = useState<'down' | 'up'>('down');
  const [threatDetected, setThreatDetected] = useState<boolean>(false);
  const [threatPosition, setThreatPosition] = useState<{ x: number, y: number } | null>(null);
  const [scanComplete, setScanComplete] = useState<boolean>(false);
  
  // Initialize grid
  useEffect(() => {
    const newGrid = Array(gridSize).fill(0).map(() => 
      Array(gridSize).fill(0).map(() => Math.random() * 0.3)
    );
    
    // Randomly place a "threat" in the grid
    if (Math.random() > 0.5) {
      const threatX = Math.floor(Math.random() * gridSize);
      const threatY = Math.floor(Math.random() * gridSize);
      newGrid[threatY][threatX] = 1;
      setThreatPosition({ x: threatX, y: threatY });
    }
    
    setGrid(newGrid);
    setScanLine(0);
    setScanDirection('down');
    setThreatDetected(false);
    setScanComplete(false);
  }, [gridSize]);
  
  // Animate scan line
  useEffect(() => {
    if (scanComplete) return;
    
    const interval = setInterval(() => {
      setScanLine(prev => {
        // Check if threat is detected
        if (threatPosition && scanDirection === 'down' && prev === threatPosition.y) {
          setThreatDetected(true);
        }
        
        // Update scan direction
        if (prev >= gridSize - 1) {
          setScanDirection('up');
          return prev - 1;
        } else if (prev <= 0 && scanDirection === 'up') {
          setScanComplete(true);
          return 0;
        } else {
          return scanDirection === 'down' ? prev + 1 : prev - 1;
        }
      });
    }, scanSpeed);
    
    return () => clearInterval(interval);
  }, [gridSize, scanSpeed, scanDirection, threatPosition, scanComplete]);
  
  // Get color class based on scan color
  const getScanColorClass = () => {
    switch (scanColor) {
      case 'red':
        return 'bg-red-500';
      case 'green':
        return 'bg-green-500';
      case 'blue':
        return 'bg-blue-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'purple':
        return 'bg-purple-500';
      case 'teal':
        return 'bg-teal-500';
      case 'pink':
        return 'bg-pink-500';
      default:
        return 'bg-teal-500';
    }
  };
  
  // Get glow class based on scan color
  const getGlowClass = () => {
    if (!glow) return '';
    
    switch (scanColor) {
      case 'red':
        return 'shadow-red-500/50 shadow-md';
      case 'green':
        return 'shadow-green-500/50 shadow-md';
      case 'blue':
        return 'shadow-blue-500/50 shadow-md';
      case 'yellow':
        return 'shadow-yellow-500/50 shadow-md';
      case 'purple':
        return 'shadow-purple-500/50 shadow-md';
      case 'teal':
        return 'shadow-teal-500/50 shadow-md';
      case 'pink':
        return 'shadow-pink-500/50 shadow-md';
      default:
        return 'shadow-teal-500/50 shadow-md';
    }
  };
  
  const scanColorClass = getScanColorClass();
  const glowClass = getGlowClass();
  
  return (
    <div className={cn('relative w-full h-full flex items-center justify-center', className)}>
      <div className="relative grid" style={{ 
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: '1px',
      }}>
        {grid.map((row, y) => 
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={cn(
                'w-2 h-2 rounded-sm transition-all duration-300',
                threatDetected && threatPosition && x === threatPosition.x && y === threatPosition.y
                  ? 'bg-red-500 animate-pulse'
                  : cell > 0.2 
                    ? 'bg-gray-600' 
                    : 'bg-gray-800'
              )}
            />
          ))
        )}
        
        {/* Scan line */}
        {!scanComplete && (
          <div 
            className={cn(
              'absolute left-0 right-0 h-0.5 transition-all',
              scanColorClass,
              glowClass
            )}
            style={{ 
              top: `${(scanLine / gridSize) * 100}%`,
              transform: 'translateY(-50%)',
            }}
          />
        )}
      </div>
      
      {/* Status indicators */}
      <div className="absolute bottom-2 left-2 flex items-center text-xs">
        <div className={cn(
          'w-2 h-2 rounded-full mr-1',
          scanComplete 
            ? threatDetected 
              ? 'bg-red-500 animate-pulse' 
              : 'bg-green-500' 
            : scanColorClass
        )} />
        <span>
          {scanComplete 
            ? threatDetected 
              ? 'Threat Detected' 
              : 'Scan Complete - No Threats' 
            : 'Scanning...'}
        </span>
      </div>
    </div>
  );
};

export default SecurityScanVisualization;
