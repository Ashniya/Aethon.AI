import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(GSAPSplitText, useGSAP);

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!nameRef.current || !subtitleRef.current || !dotRef.current) return;

      const tl = gsap.timeline();

      // Initial state
      gsap.set(nameRef.current, { opacity: 0 });
      gsap.set(subtitleRef.current, { opacity: 0, y: 20 });
      gsap.set(dotRef.current, { opacity: 0, scale: 0 });
      gsap.set(progressRef.current, { scaleX: 0, transformOrigin: 'left center' });

      // Split the AETHON text into chars
      const aethonEl = nameRef.current.querySelector('.aethon-text') as HTMLElement;
      const aiEl = nameRef.current.querySelector('.ai-text') as HTMLElement;

      if (!aethonEl || !aiEl) return;

      const aethonSplit = new GSAPSplitText(aethonEl, {
        type: 'chars',
        charsClass: 'split-char',
      });

      const aiSplit = new GSAPSplitText(aiEl, {
        type: 'chars',
        charsClass: 'split-char',
      });

      // Reveal container
      tl.to(nameRef.current, { opacity: 1, duration: 0.1 });

      // Animate AETHON chars in
      tl.from(aethonSplit.chars, {
        opacity: 0,
        y: 60,
        rotateX: -90,
        transformOrigin: '50% 50% -30px',
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.055,
      }, '-=0.05');

      // Animate dot
      tl.to(dotRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: 'back.out(1.7)',
      }, '-=0.2');

      // Animate AI chars in
      tl.from(aiSplit.chars, {
        opacity: 0,
        y: 60,
        rotateX: -90,
        transformOrigin: '50% 50% -30px',
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.08,
      }, '-=0.25');

      // Subtitle fade in
      tl.to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      }, '-=0.1');

      // Progress bar
      tl.to(progressRef.current, {
        scaleX: 1,
        duration: 2.2,
        ease: 'power1.inOut',
      }, '+=0.1');

      // Fade out entire screen
      tl.to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          setVisible(false);
          onComplete();
        },
      }, '-=0.1');

      return () => {
        tl.kill();
        try { aethonSplit.revert(); } catch (_) { /* noop */ }
        try { aiSplit.revert(); } catch (_) { /* noop */ }
      };
    },
    { scope: containerRef }
  );

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <div
          ref={containerRef}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, #050f2a 0%, #020812 60%, #000000 100%)',
          }}
        >
          {/* Ambient glow orbs */}
          <div
            style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '600px',
              height: '300px',
              background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '35%',
              left: '50%',
              transform: 'translate(-50%, 50%)',
              width: '400px',
              height: '200px',
              background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Main content */}
          <div className="flex flex-col items-center gap-6 relative z-10">
            {/* Brand name */}
            <div
              ref={nameRef}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                perspective: '800px',
              }}
            >
              <span
                className="aethon-text"
                style={{
                  fontFamily: "'Jura', sans-serif",
                  fontSize: 'clamp(3rem, 8vw, 6rem)',
                  fontWeight: 900,
                  letterSpacing: '0.18em',
                  color: '#ffffff',
                  lineHeight: 1,
                  textShadow: '0 0 40px rgba(255,255,255,0.15), 0 0 80px rgba(59,130,246,0.1)',
                  display: 'inline-block',
                }}
              >
                AETHON
              </span>
              <span
                ref={dotRef}
                style={{
                  fontFamily: 'sans-serif',
                  fontSize: 'clamp(3rem, 8vw, 6rem)',
                  fontWeight: 900,
                  color: '#3b82f6',
                  lineHeight: 1,
                  display: 'inline-block',
                  textShadow: '0 0 20px rgba(59,130,246,0.8), 0 0 40px rgba(59,130,246,0.4)',
                }}
              >
                .
              </span>
              <span
                className="ai-text"
                style={{
                  fontFamily: "'Jura', sans-serif",
                  fontSize: 'clamp(3rem, 8vw, 6rem)',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  color: '#ffffff',
                  lineHeight: 1,
                  textShadow: '0 0 40px rgba(255,255,255,0.15), 0 0 80px rgba(59,130,246,0.1)',
                  display: 'inline-block',
                }}
              >
                AI
              </span>
            </div>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              style={{
                fontFamily: "'Jura', sans-serif",
                fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)',
                fontWeight: 500,
                letterSpacing: '0.35em',
                color: 'rgba(148,163,184,0.7)',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              Autonomous Intelligence · Multi-Agent Research
            </p>

            {/* Progress bar */}
            <div
              style={{
                width: 'clamp(140px, 20vw, 220px)',
                height: '1px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '1px',
                overflow: 'hidden',
                marginTop: '8px',
              }}
            >
              <div
                ref={progressRef}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #1e40af, #3b82f6, #60a5fa)',
                  borderRadius: '1px',
                  boxShadow: '0 0 8px rgba(59,130,246,0.6)',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
