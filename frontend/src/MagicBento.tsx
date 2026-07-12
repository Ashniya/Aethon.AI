import { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';
import { Users, Scale, FileSearch, Activity, AlertCircle, TrendingUp } from 'lucide-react';

const DEFAULT_SPOTLIGHT_RADIUS = 320;
const DEFAULT_GLOW_COLOR = '59,130,246';
const MOBILE_BREAKPOINT = 768;

interface CardDef {
  icon: React.ReactNode;
  title: string;
  description: string;
  label: string;
}

const cardData: CardDef[] = [
  { icon: <Users size={22} />, title: 'AI Board Meeting', description: 'Five distinct AI analysts discuss investments before rendering a collective decision.', label: 'Governance' },
  { icon: <Scale size={22} />, title: 'Bull vs Bear Debate', description: 'Autonomous debate between highly optimistic and deeply skeptical agents.', label: 'Analysis' },
  { icon: <FileSearch size={22} />, title: 'Explainable Reasoning', description: 'Detailed SWOT analysis and transparent reasoning backing every investment verdict.', label: 'Clarity' },
  { icon: <Activity size={22} />, title: 'Confidence Score', description: 'Instantly gauge how certain the system is about its final recommendation.', label: 'Metrics' },
  { icon: <AlertCircle size={22} />, title: 'Skeptic Mode', description: 'A dedicated agent whose sole purpose is to actively critique the system\'s own conclusions.', label: 'Critique' },
  { icon: <TrendingUp size={22} />, title: 'Investment DNA', description: 'Understand the core market drivers pushing the recommendation forward.', label: 'Insight' },
];

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number
) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;
  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

interface GlobalSpotlightProps {
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}

const GlobalSpotlight = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}: GlobalSpotlightProps) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 700px; height: 700px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.12) 0%,
        rgba(${glowColor}, 0.06) 20%,
        rgba(${glowColor}, 0.02) 40%,
        transparent 65%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;
      const section = gridRef.current.closest('.bento-section');
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect && e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom;

      const cards = gridRef.current.querySelectorAll<HTMLElement>('.magic-bento-card');
      if (!mouseInside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3 });
        cards.forEach(c => c.style.setProperty('--glow-intensity', '0'));
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDist = Math.max(0, dist);
        minDistance = Math.min(minDistance, effectiveDist);

        let glowIntensity = 0;
        if (effectiveDist <= proximity) glowIntensity = 1;
        else if (effectiveDist <= fadeDistance) glowIntensity = (fadeDistance - effectiveDist) / (fadeDistance - proximity);

        updateCardGlowProperties(card, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, { left: e.clientX, top: e.clientY, duration: 0.1 });

      const targetOpacity =
        minDistance <= proximity ? 0.8
        : minDistance <= fadeDistance ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
        : 0;
      gsap.to(spotlightRef.current, { opacity: targetOpacity, duration: targetOpacity > 0 ? 0.2 : 0.5 });
    };

    const handleMouseLeave = () => {
      gridRef.current?.querySelectorAll<HTMLElement>('.magic-bento-card')
        .forEach(c => c.style.setProperty('--glow-intensity', '0'));
      if (spotlightRef.current) gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

interface MagicBentoProps {
  isDarkMode?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

const MagicBento = ({
  isDarkMode = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = true,
  enableMagnetism = false,
}: MagicBentoProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const shouldDisable = disableAnimations || isMobile;

  const cardBg = isDarkMode ? '#0d1520' : '#1a1a2e';

  const attachCardEvents = useCallback(
    (el: HTMLElement | null) => {
      if (!el || shouldDisable) return;

      const handleMouseEnter = () => {
        if (enableTilt) gsap.to(el, { rotateX: 4, rotateY: 4, duration: 0.3, transformPerspective: 1000 });
      };
      const handleMouseLeave = () => {
        if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, transformPerspective: 1000 });
        if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3 });
      };
      const handleMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        if (enableTilt) {
          gsap.to(el, {
            rotateX: ((y - cy) / cy) * -8,
            rotateY: ((x - cx) / cx) * 8,
            duration: 0.1, transformPerspective: 1000,
          });
        }
        if (enableMagnetism) {
          gsap.to(el, { x: (x - cx) * 0.04, y: (y - cy) * 0.04, duration: 0.3 });
        }
      };
      const handleClick = (e: MouseEvent) => {
        if (!clickEffect) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const maxDist = Math.max(
          Math.hypot(x, y), Math.hypot(x - rect.width, y),
          Math.hypot(x, y - rect.height), Math.hypot(x - rect.width, y - rect.height)
        );
        const ripple = document.createElement('div');
        ripple.style.cssText = `
          position:absolute;width:${maxDist*2}px;height:${maxDist*2}px;
          border-radius:50%;
          background:radial-gradient(circle,rgba(${glowColor},0.35) 0%,rgba(${glowColor},0.15) 30%,transparent 70%);
          left:${x-maxDist}px;top:${y-maxDist}px;
          pointer-events:none;z-index:50;
        `;
        el.appendChild(ripple);
        gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.7, ease: 'power2.out', onComplete: () => ripple.remove() });
      };

      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('click', handleClick);
      return () => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('click', handleClick);
      };
    },
    [shouldDisable, enableTilt, enableMagnetism, clickEffect, glowColor]
  );

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisable}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}
      <div className="card-grid bento-section" ref={gridRef}>
        {cardData.map((card, index) => {
          const baseClass = `magic-bento-card ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''}`;
          return (
            <div
              key={index}
              className={baseClass}
              style={{ backgroundColor: cardBg, '--glow-color': glowColor } as React.CSSProperties}
              ref={el => { attachCardEvents(el); }}
            >
              <div className="magic-bento-card__header">
                <span className="magic-bento-card__label">{card.label}</span>
              </div>
              <div className="magic-bento-card__content">
                <div className="magic-bento-card__icon" style={{ color: `rgba(${glowColor},0.9)` }}>
                  {card.icon}
                </div>
                <h2 className="magic-bento-card__title">{card.title}</h2>
                <p className="magic-bento-card__description">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MagicBento;
