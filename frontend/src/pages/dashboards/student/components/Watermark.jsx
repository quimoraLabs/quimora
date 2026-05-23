export const Watermark = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-5 select-none touch-none">
      <div className="absolute inset-0 flex flex-wrap gap-24 items-center justify-center rotate-[-25deg]">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="text-xl font-bold border-2 border-current px-4 py-2 shrink-0"
          >
            QUIZZIFY PRO - SECURE TEST SESSION
          </div>
        ))}
      </div>
    </div>
  );
};
