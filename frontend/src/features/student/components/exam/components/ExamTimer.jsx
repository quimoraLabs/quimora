// src/features/quiz/components/ExamTimer.jsx
import { useState } from "react";

export function ExamTimer({ timer }) {
  const [timerPosition, setTimerPosition] = useState("center");
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="absolute top-6 left-0 right-0 px-4">
      <div
        className={`flex ${timerPosition === "left" ? "justify-start" : timerPosition === "right" ? "justify-end" : "justify-center"}`}
      >
        <div className="flex items-center gap-3 px-5 py-3 bg-surface/80 backdrop-blur-sm border border-soft rounded-full shadow-card">
          <div className="font-mono text-3xl md:text-4xl font-extrabold tabular-nums text-accent">
            {minutes.toString().padStart(2, "0")}:
            {seconds.toString().padStart(2, "0")}
          </div>
          <div className="text-xs text-muted uppercase tracking-widest font-semibold">
            Time
          </div>
        </div>

        <div className="ml-4 flex items-center gap-1">
          {["left", "center", "right"].map((pos) => (
            <button
              key={pos}
              onClick={() => setTimerPosition(pos)}
              className={`w-6 h-6 rounded-full border border-soft ${timerPosition === pos ? "bg-accent" : "bg-surface"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
