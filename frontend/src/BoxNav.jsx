import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './BoxNav.css';

const BoxNav = ({
  items,
  activeId,
  onSelect,
  className = '',
  ease = 'power3.easeOut',
  isDarkMode = true
}) => {
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const box = circle.parentElement;
        const rect = box.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = box.querySelector('.box-label');
        const white = box.querySelector('.box-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 1.2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 0.6, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 50), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 0.6, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();
    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease]);

  const handleEnter = i => {
    if (items[i].id === activeId) return; // don't animate hover for active tab
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = i => {
    if (items[i].id === activeId) return;
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  // Reset hover state if a tab becomes active while hovered
  useEffect(() => {
    const activeIndex = items.findIndex(item => item.id === activeId);
    if (activeIndex !== -1 && tlRefs.current[activeIndex]) {
       const tl = tlRefs.current[activeIndex];
       activeTweenRefs.current[activeIndex]?.kill();
       tl.progress(0);
    }
  }, [activeId, items]);

  return (
    <div className={`box-nav-container ${className}`}>
      <nav className="box-nav" aria-label="Primary">
        <div className="box-nav-items">
          <ul className="box-list" role="menubar">
            {items.map((item, i) => {
              const Icon = item.Icon;
              return (
                <li key={item.id} role="none">
                  <div
                    role="menuitem"
                    className={`box-item ${activeId === item.id ? 'is-active' : ''} ${!isDarkMode ? 'light-mode' : ''}`}
                    onClick={() => onSelect(item.id)}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={el => { circleRefs.current[i] = el; }}
                    />
                    <span className="label-stack">
                      <span className="box-label">
                        {Icon && <Icon size={15} />}
                        {item.label}
                      </span>
                      <span className="box-label-hover" aria-hidden="true">
                        {Icon && <Icon size={15} />}
                        {item.label}
                      </span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default BoxNav;
