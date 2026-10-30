import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExamTimer } from "../features/student/exam/components/ExamTimer";

describe("ExamTimer Component UI Test", () => {
  it("renders correctly with normal time (> 3 mins) with LEFT status", () => {
    render(<ExamTimer timer={600} />); // 10 minutes
    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("LEFT")).toBeInTheDocument();
  });

  it("renders LOW status badge and amber warning when timer <= 180s", () => {
    render(<ExamTimer timer={150} />); // 2 mins 30s
    expect(screen.getByText("02:30")).toBeInTheDocument();
    expect(screen.getByText("LOW")).toBeInTheDocument();
  });

  it("renders URGENT status badge and critical warning when timer <= 60s", () => {
    render(<ExamTimer timer={45} />); // 45 seconds
    expect(screen.getByText("00:45")).toBeInTheDocument();
    expect(screen.getByText("URGENT")).toBeInTheDocument();
  });

  it("formats single-digit seconds correctly with leading zeroes", () => {
    render(<ExamTimer timer={65} />); // 1 min 05s
    expect(screen.getByText("01:05")).toBeInTheDocument();
  });
});
