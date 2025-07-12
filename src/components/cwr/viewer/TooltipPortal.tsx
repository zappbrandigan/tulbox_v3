import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  children: React.ReactNode;
  position: { x: number; y: number };
};

const TooltipPortal = ({ children, position }: Props) => {
  const [mounted, setMounted] = useState(false);
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      setTooltipHeight(rect.height);
    }
  }, [children, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className="relative bg-white text-black text-sm rounded px-2 py-1 z-[1000] max-h-20 max-w-xs pointer-events-none"
      style={{
        top: position.y - tooltipHeight - 8,
        left: position.x,
        position: 'fixed',
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export default TooltipPortal;
