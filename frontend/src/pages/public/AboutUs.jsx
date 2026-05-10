import { motion } from "motion/react";
import { Rocket, Heart, Coffee, Sparkles, Brain, Award } from "lucide-react";

export default function About() {
  return (
    <div className="space-y-12 pb-24 px-12 pt-6">
      <header className="space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-amber-500 to-quimora-orange p-4 mb-6 shadow-lg shadow-amber-900/20">
          <Sparkles className="text-white w-full h-full" />
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
          THE JOURNEY BEHIND{" "}
          <span className="neon-text uppercase">QUIMORA</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl font-light">
          From bugs to brilliance: A story of grit, curiosity, and a lot of
          caffeine.
        </p>
      </header>

      <div className="relative border-l border-white/5 ml-4 pl-10 space-y-16 py-4">
        <JourneyStep
          icon={<Rocket className="text-orange-500" />}
          title="The Spark and the Struggle"
          content="Every great project starts with an idea, but mine started with a massive lesson. It all began with a project called SkillUp. I wanted to create the ultimate learning platform, but I made the classic developer mistake—overcomplicating things. By mixing heavy courses with quizzes, the project became a playground for bugs that seemed impossible to fix."
        />

        <JourneyStep
          icon={<Heart className="text-amber-500" />}
          title="The 'Breakup' and the Comeback"
          content="After a failed attempt at a Budget Dashboard and a brief 'breakup' with my projects to focus on problem-solving and React, I felt lost. But the itch to build something unique never went away. I wanted to create a quiz app that was different—something fast, accessible, and user-friendly."
        />

        <JourneyStep
          icon={<Sparkles className="text-amber-400" />}
          title="Finding the 'Mora' Magic"
          content="Naming the app was a battle of its own. I wanted something unique, something that sounded like it had a soul. Drawing inspiration from the movie Kashmora, I played with words until Quimora was born. With a little brainstorming with AI, the name clicked, and the vision became clear."
        />

        <JourneyStep
          icon={<Coffee className="text-orange-700" />}
          title="Built with Grit"
          content="The road to building Quimora wasn’t easy. I spent days confused between 'User' and 'Teacher' roles in the backend, wrestled with authMiddleware that refused to cooperate, and dealt with tokens that just wouldn't expire! But through every late-night debugging session, Quimora took shape."
        />

        <JourneyStep
          icon={<Award className="text-amber-300" />}
          title="Why Quimora?"
          content="Quimora is more than just a quiz app; it’s a comeback story. It’s built for the curious minds who want to test their skills without the friction of traditional platforms. Whether you are an instructor sharing knowledge or a student sharpening your brain, Quimora is designed to be seamless, smart, and fun."
        />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-zinc-900/40 border border-white/5 rounded-3xl p-12 text-center space-y-8 backdrop-blur-xl"
      >
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
          <Brain className="text-amber-500" size={40} />
        </div>
        <h2 className="text-3xl font-display font-bold uppercase tracking-tight">
          Ready to be part of the story?
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
          Thank you for being a part of my story. Let’s keep learning, one quiz
          at a time!
        </p>
        <button className="px-12 py-5 bg-white text-black rounded-full font-bold uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl shadow-amber-900/10">
          Start Your Journey
        </button>
      </motion.section>
    </div>
  );
}

function JourneyStep({ icon, title, content }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className="absolute -left-12.75 top-6 w-5 h-5 rounded-full bg-quimora-dark border-2 border-amber-500/20 flex items-center justify-center z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      </div>

      <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-2xl hover:bg-zinc-800/40 transition-all group">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:text-amber-500 transition-colors">
            {icon}
          </div>
          <h3 className="text-2xl font-display font-bold tracking-tight uppercase">
            {title}
          </h3>
        </div>
        <p className="text-gray-400 leading-relaxed text-lg font-light italic opacity-80">
          "{content}"
        </p>
      </div>
    </motion.div>
  );
}
