import { useEffect, useState } from 'react';

export const Watermark = () => {
  // Screen size ke hisab se dynamic array length taaki pure screen par uniform distribution ho
  const [gridCount, setGridCount] = useState(40);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Ek rough estimation taaki grid puri tarah se fill ho jaye
      const cols = Math.ceil(width / 250);
      const rows = Math.ceil(height / 120);
      setGridCount(cols * rows * 2); // Rotate hone ke baad bacha hua area cover karne ke liye *2
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none touch-none hidden sm:block">
      <div
        className="absolute inset-[-20%] grid gap-x-16 gap-y-24 items-center justify-items-center"
        style={{
          // Pure grid ko ek sath rotate aur scale kar rahe hain
          transform: `rotate(-15deg) scale(${getComputedStyle(document.documentElement).getPropertyValue('--watermark-scale') || 1.1})`,
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          color: 'var(--color-text-muted, #94a3b8)',
          // Agar tailwind opacity variable kaam na kare toh fallback 0.03 (3%) rakha hai
          opacity: 'var(--watermark-opacity, 0.03)', 
        }}
      >
        {Array.from({ length: gridCount }).map((_, i) => (
          <div
            key={i}
            className="text-xs font-medium tracking-widest whitespace-nowrap select-none"
          >
            QUIZZIFY PRO - SECURE TEST SESSION
          </div>
        ))}
      </div>
    </div>
  );
};