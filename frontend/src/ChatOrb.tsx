import React, { useEffect, useRef } from 'react';
import './ChatOrb.css';

interface ChatOrbProps {
  isDarkMode: boolean;
  onClick: () => void;
}

export default function ChatOrb({ isDarkMode, onClick }: ChatOrbProps) {
  const eyeLeft = useRef<HTMLDivElement>(null);
  const eyeRight = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Blinking effect
    const blinkInterval = setInterval(() => {
      const eyes = [eyeLeft.current, eyeRight.current];
      eyes.forEach(e => {
        if (e) {
          e.style.height = '3px';
          setTimeout(() => {
            if (e) e.style.height = '12px';
          }, 180);
        }
      });
    }, 3500);

    // Eye follow effect
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 6;
      const y = (e.clientY / window.innerHeight - 0.5) * 6;

      const eyes = [eyeLeft.current, eyeRight.current];
      eyes.forEach(eye => {
        if (eye) {
          eye.style.transform = `translate(${x}px, ${y}px)`;
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(blinkInterval);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      id="orb"
      className={isDarkMode ? 'dark-mode' : 'light-mode'}
      onClick={onClick}
    >
      <div className="ring"></div>
      <div className="center">
        <div className="eyes">
          <div className="eye" ref={eyeLeft}></div>
          <div className="eye" ref={eyeRight}></div>
        </div>
      </div>
    </div>
  );
}
