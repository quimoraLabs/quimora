import { Mail } from "lucide-react"
import { motion } from "motion/react"

const ContactUs = () => {
  return (
    <motion.div 
  initial={{ opacity: 0 }} 
  animate={{ opacity: 1 }}
  className="grid grid-cols-1 md:grid-cols-2 gap-12"
>
  {/* Left Side: Info & Socials */}
  <div className="space-y-6">
    <h2 className="text-3xl font-bold uppercase">Reach Out</h2>
    <p className="text-gray-400">I'm always open to discussing new projects or creative ideas.</p>
    <div className="flex items-center space-x-4">
      <Mail className="text-amber-500" />
      <span>contact@quimora.com</span>
    </div>
  </div>

  {/* Right Side: Form */}
  <form className="space-y-4 bg-zinc-900/50 p-8 rounded-3xl border border-white/5">
    <input type="text" placeholder="Your Name" className="w-full bg-black/20 border border-white/10 p-4 rounded-xl focus:border-amber-500 outline-none" />
    <textarea placeholder="How can we help?" className="w-full bg-black/20 border border-white/10 p-4 rounded-xl h-32"></textarea>
    <button className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all">
      Send Message
    </button>
  </form>
</motion.div>
  )
}

export default ContactUs