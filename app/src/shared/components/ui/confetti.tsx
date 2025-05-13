import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPieceProps {
  color: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  delay: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ color, x, y, size, rotation, delay }) => {
  return (
    <motion.div
      className="absolute"
      initial={{ 
        x: `calc(50% + ${x}px)`, 
        y: `calc(50% + ${y}px)`, 
        opacity: 1,
        scale: 0 
      }}
      animate={{ 
        x: `calc(50% + ${x + (Math.random() * 200 - 100)}px)`, 
        y: `calc(50% + ${y + 300 + (Math.random() * 100)}px)`, 
        opacity: 0,
        scale: 1,
        rotate: rotation + (Math.random() * 360)
      }}
      transition={{ 
        duration: 2 + Math.random() * 2,
        delay: delay,
        ease: [0.1, 0.4, 0.7, 1] 
      }}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '0%',
      }}
    />
  );
};

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
}

const Confetti: React.FC<ConfettiProps> = ({ 
  isActive, 
  duration = 3000,
  particleCount = 100,
  colors = ['#FF5252', '#FFD740', '#00C853', '#2196F3', '#9C27B0', '#FF4081']
}) => {
  const [isVisible, setIsVisible] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  const confettiPieces = Array.from({ length: particleCount }).map((_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    x: (Math.random() * 400) - 200,
    y: (Math.random() * 100) - 200,
    size: 5 + Math.random() * 10,
    rotation: Math.random() * 360,
    delay: Math.random() * 0.5,
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, delay: 2 }}
        >
          {confettiPieces.map((piece) => (
            <ConfettiPiece
              key={piece.id}
              color={piece.color}
              x={piece.x}
              y={piece.y}
              size={piece.size}
              rotation={piece.rotation}
              delay={piece.delay}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { Confetti };
