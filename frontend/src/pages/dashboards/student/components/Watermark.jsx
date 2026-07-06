export const Watermark = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none touch-none hidden sm:block">
      <div
        className="absolute inset-0 flex flex-wrap gap-8 items-center justify-center"
        style={{
          transform: `rotate(-22deg) scale(${getComputedStyle(document.documentElement).getPropertyValue('--watermark-scale') || 1})`,
          color: 'var(--color-text-muted)',
          opacity: `var(--watermark-opacity)`,
        }}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="text-sm font-semibold px-3 py-1 shrink-0 tracking-wider"
            style={{
              whiteSpace: 'nowrap',
              borderRadius: 6,
            }}
          >
            QUIZZIFY PRO - SECURE TEST SESSION
          </div>
        ))}
      </div>
    </div>
  );
};
