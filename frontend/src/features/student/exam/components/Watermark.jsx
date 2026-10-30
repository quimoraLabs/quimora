import { useEffect, useState } from 'react';

export const Watermark = () => {
  // Dynamically calculate array length based on viewport size for uniform coverage
  const [gridCount, setGridCount] = useState(40);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Rough estimate to sufficiently populate the grid
      const cols = Math.ceil(width / 250);
      const rows = Math.ceil(height / 120);
      setGridCount(cols * rows * 2); // Double grid size to cover empty corners after rotation
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none touch-none">
      <div
        className="absolute inset-[-20%] grid gap-x-14 gap-y-20 items-center justify-items-center"
        style={{
          transform: `rotate(-15deg) scale(${getComputedStyle(document.documentElement).getPropertyValue('--watermark-scale') || 1.05})`,
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          color: 'var(--color-text-main, #0f172a)',
          opacity: 'var(--watermark-opacity, 0.16)', 
        }}
      >
        {Array.from({ length: gridCount }).map((_, i) => (
          <div
            key={i}
            className="text-2xs font-mono font-bold tracking-widest uppercase whitespace-nowrap select-none"
          >
            QUIMORA PROCTOR • SECURE SESSION
          </div>
        ))}
      </div>
    </div>
  );
};