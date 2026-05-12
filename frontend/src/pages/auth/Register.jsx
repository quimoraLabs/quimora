import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputGroup from "./components/InputField";
import quimoraLogo from "../../assets/quimora.png";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import {
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  KeyRound,
  User,
  Mail,
  ShieldUser,
} from "lucide-react";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }
    const success = await register({ email, username, name, password });
    setIsLoading(false);
    if (success) {
      navigate("/login");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-120 relative z-10 glass rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden mx-auto my-20"
    >
      <div className="flex flex-col items-center mb-8 relative">
        <motion.img
          src={quimoraLogo}
          alt="Quimora Logo"
          className="h-14 md:h-16 object-contain mb-6 filter drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        />

        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight uppercase mb-2">
            BEGIN YOUR <br />
            <span className="text-gradient">JOURNEY HERE.</span>
          </h1>
        </div>
      </div>
      <form className="space-y-4" onSubmit={handleRegister}>
        <InputGroup
          label="CHOOSE YOUR MONIKER..."
          placeholder="QUEST_FINDER"
          icon={<User className="w-4 h-4" />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <InputGroup
          label="IDENTIFY YOURSELF..."
          placeholder="MASTER@QUIMORA.COM"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon={<Mail className="w-4 h-4" />}
        />
        <InputGroup
          label="ESTABLISH CODENAME"
          type="text"
          placeholder="QUEST_MASTER_01"
          value={username}
          icon={<ShieldUser className="w-4 h-4" />}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <InputGroup
          label="UNLOCK THE KNOWLEDGE VAULT..."
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          icon={<KeyRound className="w-4 h-4" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-cyan-400 transition-colors p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        />
        <InputGroup
          label="VERIFY YOUR ACCESS KEY..."
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          icon={<KeyRound className="w-4 h-4" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-cyan-400 transition-colors p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        />

        <p className="text-[10px] text-slate-500 py-2 text-center uppercase tracking-wider">
          By enlisting, you agree to our{" "}
          <span className="text-cyan-400 cursor-pointer">Laws of Conduct</span>{" "}
          and{" "}
          <span className="text-cyan-400 cursor-pointer">Privacy Mantras</span>.
        </p>

        <motion.button
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-14 bg-brand-gradient rounded-xl flex items-center justify-center gap-3 dark:text-white font-bold uppercase tracking-widest text-sm shadow-xl shadow-cyan-500/20 dark:shadow-cyan-500/40 dark:hover:shadow-cyan-500/60 hover:shadow-cyan-500/40 transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? "Validating..." : "Create My Vault"}
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </form>
      <div className="pt-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
            ALREADY A MEMBER?
          </span>
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-xs font-bold text-gradient hover:opacity-80 transition-all uppercase tracking-tight"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-cyan-400" /> RETREAT TO
            ACCESS
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
