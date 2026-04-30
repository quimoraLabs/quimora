// import React from 'react'

import { Link } from "react-router-dom"

const HeroSection = () => {
  return (
   <section className="text-center px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
          Test Your Skills <br />
          <span className="text-blue-600">with Smart Quizzes</span>
        </h2>

        <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Practice coding, aptitude, and interview questions in a simple and effective way.
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <Link
            to="/quiz"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Start Quiz
          </Link>

          {/* <Link
            to="/login"
            className="px-6 py-2.5 border border-slate-300 rounded-xl font-semibold hover:bg-slate-100 dark:border-neutral-700 dark:hover:bg-neutral-800 transition"
          >
            Login
          </Link> */}
        </div>
      </section>
  )
}

export default HeroSection