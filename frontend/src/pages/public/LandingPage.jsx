import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import Topics from "./components/Topics";
import Why from "./components/Why";

const topics = [
  {
    title: "JavaScript",
    quizzes: "24 Quizzes",
    level: "Beginner",
    color:
      "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-300",
  },
  {
    title: "React",
    quizzes: "18 Quizzes",
    level: "Intermediate",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
  },
  {
    title: "Node.js",
    quizzes: "20 Quizzes",
    level: "Intermediate",
    color:
      "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-300",
  },
];

function LandingPage() {

  return (
    <main className="bg-white dark:bg-slate-950 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}

      {/* HERO */}
      <HeroSection />

      {/* HOW IT WORKS */}
      <HowItWorks/>

      {/* TOPICS */}
      <Topics topics={topics} />

      {/* WHY */}
      <Why />
    </main>
  );
}

export default LandingPage;
