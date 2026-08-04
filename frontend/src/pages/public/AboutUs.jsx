
import { motion } from "motion/react";
import { Rocket, Heart, Coffee, Sparkles, Brain, Award, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function About() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen py-16 px-6 sm:px-12 lg:px-20 overflow-hidden max-w-7xl mx-auto space-y-20">
      {/* Ambient Background Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-start opacity-15 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-brand-end opacity-15 blur-[130px] rounded-full pointer-events-none" />

      {/* Header Section */}
      <header className="relative space-y-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-16 h-16 rounded-2xl bg-accent p-4 mb-6 shadow-card flex items-center justify-center text-white"
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-['Space_Grotesk'] leading-tight text-main tracking-tight"
        >
          THE JOURNEY BEHIND{" "}
          <span className="text-transparent bg-clip-text bg-accent uppercase">
            QUIMORA
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted text-lg sm:text-xl max-w-2xl font-light leading-relaxed"
        >
          From bugs to brilliance: A story of grit, curiosity, and a lot of
          caffeine.
        </motion.p>
      </header>

      {/* Timeline Steps */}
      <div className="relative border-l-2 border-soft ml-4 sm:ml-6 pl-8 sm:pl-12 space-y-12 py-4">
        <JourneyStep
          icon={<Rocket className="w-6 h-6 text-accent" />}
          title="The Spark and the Struggle"
          content="Every great project starts with an idea, but mine started with a massive lesson. It all began with a project called SkillUp. I wanted to create the ultimate learning platform, but I made the classic developer mistake—overcomplicating things. By mixing heavy courses with quizzes, the project became a playground for bugs that seemed impossible to fix."
        />

        <JourneyStep
          icon={<Heart className="w-6 h-6 text-accent" />}
          title="The 'Breakup' and the Comeback"
          content="After a failed attempt at a Budget Dashboard and a brief 'breakup' with my projects to focus on problem-solving and React, I felt lost. But the itch to build something unique never went away. I wanted to create a quiz app that was different—something fast, accessible, and user-friendly."
        />

        <JourneyStep
          icon={<Sparkles className="w-6 h-6 text-accent" />}
          title="Finding the 'Mora' Magic"
          content="Naming the app was a battle of its own. I wanted something unique, something that sounded like it had a soul. Drawing inspiration from the movie Kashmora, I played with words until Quimora was born. With a little brainstorming with AI, the name clicked, and the vision became clear."
        />

        <JourneyStep
          icon={<Coffee className="w-6 h-6 text-accent" />}
          title="Built with Grit"
          content="The road to building Quimora wasn’t easy. I spent days confused between 'User' and 'Teacher' roles in the backend, wrestled with authMiddleware that refused to cooperate, and dealt with tokens that just wouldn't expire! But through every late-night debugging session, Quimora took shape."
        />

        <JourneyStep
          icon={<Award className="w-6 h-6 text-accent" />}
          title="Why Quimora?"
          content="Quimora is more than just a quiz app; it’s a comeback story. It’s built for the curious minds who want to test their skills without the friction of traditional platforms. Whether you are an instructor sharing knowledge or a student sharpening your brain, Quimora is designed to be seamless, smart, and fun."
        />
      </div>

      {/* Call To Action Card */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative bg-surface border border-main rounded-3xl p-8 sm:p-14 text-center space-y-8 shadow-card overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent opacity-10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-20 h-20 bg-elevated rounded-2xl flex items-center justify-center mx-auto mb-4 border border-soft shadow-sm">
          <Brain className="text-accent" size={40} />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] uppercase tracking-tight text-main">
            Ready to be part of the story?
          </h2>
          <p className="text-muted max-w-xl mx-auto leading-relaxed text-base sm:text-lg">
            Thank you for being a part of my story. Let’s keep learning, one quiz
            at a time!
          </p>
        </div>

        <button className="px-10 py-4 bg-accent text-white rounded-xl font-bold uppercase tracking-wider flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl hover:opacity-95 transition-all"
        onClick={() => navigate("/login")}
        >
          <span>Start Your Journey</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.section>
    </div>
  );
}

function JourneyStep({ icon, title, content }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative group"
    >
      {/* Timeline Node Indicator */}
      <div className="absolute -left-10.25 sm:-left-14.25 top-6 w-6 h-6 rounded-full bg-surface border-2 border-main flex items-center justify-center z-10 group-hover:border-accent transition-colors duration-300">
        <div className="w-2 h-2 rounded-full bg-brand-mid animate-pulse" />
      </div>

      {/* Step Card */}
      <div className="bg-surface border border-main p-6 sm:p-8 rounded-2xl shadow-card hover:border-accent/40 transition-all duration-300">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-elevated text-main group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-sm shrink-0">
            {icon}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] tracking-tight uppercase text-main">
            {title}
          </h3>
        </div>
        <p className="text-muted leading-relaxed text-base sm:text-lg font-normal">
          {content}
        </p>
      </div>
    </motion.div>
  );
}