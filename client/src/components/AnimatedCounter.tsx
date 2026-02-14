import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  inView?: boolean;
}

export default function AnimatedCounter({ 
  value, 
  suffix = "", 
  prefix = "", 
  duration = 2000,
  inView = true 
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
    
    return () => {
      startTimestamp = null;
    };
  }, [value, duration, inView]);

  return (
    <span className="tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
}
