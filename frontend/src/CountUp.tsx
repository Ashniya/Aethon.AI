import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function CountUp({ value, isCurrency = false, suffix = '' }: { value: number, isCurrency?: boolean, suffix?: string }) {
  const [hasStarted, setHasStarted] = useState(false);
  const springValue = useSpring(0, {
    stiffness: 40,
    damping: 15,
    mass: 1
  });
  
  useEffect(() => {
    // Brief delay so we don't start counting while the tab is still animating in
    const timer = setTimeout(() => {
      setHasStarted(true);
      springValue.set(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, springValue]);

  const display = useTransform(springValue, (current) => {
    if (!hasStarted) return isCurrency ? `$0${suffix}` : `0${suffix}`;
    const rounded = Math.round(current);
    if (isCurrency) {
      return `$${rounded.toLocaleString()}${suffix}`;
    }
    return `${rounded.toString()}${suffix}`;
  });

  return <motion.span>{display}</motion.span>;
}
