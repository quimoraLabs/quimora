import { useEffect, useState } from "react";
import {
  Trophy,
  BarChart3,
  Target,
  Moon,
  Sun,
  Menu,
} from "lucide-react";

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
    color:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
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
  const [darkMode, setDarkMode] = useState(false);

  // useEffect(() => {
  //   const savedTheme = localStorage.getItem("theme");

  //   if (savedTheme === "dark") {
  //     setDarkMode(true);
  //     document.documentElement.classList.add("dark");
  //   }
  // }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);

    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-gray-900 dark:text-white transition-colors duration-300">
      {/* NAVBAR */}
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">
            Quimora
          </h1>

          <nav className="hidden md:flex gap-10 text-gray-700 dark:text-gray-300 font-medium">
            <a href="#">Home</a>
            <a href="#">Explore</a>
            <a href="#">How it Works</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* DARK MODE BUTTON */}
            <button
              onClick={toggleDarkMode}
              className="w-11 h-11 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="hidden md:flex gap-4">
              <button className="px-5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl">
                Login
              </button>

              <button className="px-5 py-2 bg-primary text-white rounded-xl">
                Sign Up
              </button>
            </div>

            <button className="md:hidden">
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-14 items-center">
        {/* LEFT */}
        <div>
          <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            Test Your Skills. Unlock Your Potential.
          </span>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mt-8">
            Test your skills.
            <br />
            Learn where you{" "}
            <span className="text-primary">stand.</span>
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-lg mt-6 leading-8">
            Quimora is a skill testing platform with topic-wise
            quizzes, real-world difficulty levels and instant
            results.
          </p>

          <div className="flex gap-4 mt-10">
            <button className="bg-primary hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold transition">
              Start Test
            </button>

            <button className="border border-gray-300 dark:border-slate-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 dark:hover:bg-slate-900 transition">
              Browse Topics
            </button>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="relative">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <div className="bg-yellow-400 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-black">
                  JS
                </div>

                <h2 className="text-3xl font-bold mt-4">
                  JavaScript Basics
                </h2>
              </div>

              <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300 px-4 py-2 rounded-full text-sm">
                Intermediate
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                ["10", "Questions"],
                ["12", "Minutes"],
                ["80%", "Pass Score"],
              ].map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-slate-700 rounded-2xl p-5 text-center"
                >
                  <h3 className="text-2xl font-bold">
                    {item[0]}
                  </h3>

                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {item[1]}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-5 mt-10">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-primary"></div>

                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full flex-1"></div>
                </div>
              ))}
            </div>

            <button className="w-full bg-primary hover:bg-indigo-600 text-white py-4 rounded-2xl mt-10 font-semibold transition">
              Start Quiz
            </button>
          </div>

          <div className="absolute -top-5 -right-5 bg-primary text-white p-4 rounded-2xl shadow-lg">
            <Trophy />
          </div>

          <div className="absolute -bottom-5 right-0 bg-green-500 text-white p-4 rounded-2xl shadow-lg">
            <BarChart3 />
          </div>
        </div>
      </section>

      {/* TOPICS */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold">
              Popular Topics
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mt-4">
              Choose a topic and start testing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {topics.map((topic, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 hover:shadow-2xl transition"
              >
                <div className="w-14 h-14 bg-gray-100 dark:bg-slate-800 rounded-2xl"></div>

                <h3 className="text-2xl font-semibold mt-6">
                  {topic.title}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {topic.quizzes}
                </p>

                <span
                  className={`inline-block mt-5 px-4 py-2 rounded-full text-sm font-medium ${topic.color}`}
                >
                  {topic.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center">
            Why Quimora?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              "Skill Focused",
              "Instant Feedback",
              "Track Progress",
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Target className="text-primary" />
                </div>

                <h3 className="text-2xl font-semibold mt-6">
                  {item}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 mt-4">
                  Improve through quizzes and analytics.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-primary">
              Quimora
            </h2>

            <p className="text-gray-400 mt-5">
              Test your skills. Learn. Grow every day.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-xl">
              Quick Links
            </h3>

            <ul className="space-y-3 mt-5 text-gray-400">
              <li>Home</li>
              <li>Explore</li>
              <li>About</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-xl">
              Resources
            </h3>

            <ul className="space-y-3 mt-5 text-gray-400">
              <li>Blog</li>
              <li>Help Center</li>
              <li>Privacy Policy</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-xl">
              Newsletter
            </h3>

            <div className="flex mt-5">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-xl bg-slate-900 border border-slate-700 outline-none"
              />

              <button className="bg-primary px-5 rounded-r-xl">
                →
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;