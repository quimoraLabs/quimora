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
    // Pura page screen fitting aur variable backgrounds ke sath
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
      >
        {/* Futuristic background glow particles inside the card */}
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-brand-start/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-brand-end/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center mb-6 relative z-10">
          <motion.img
            src={quimoraLogo}
            alt="Quimora Logo"
            className="h-14 object-contain mb-4 filter drop-shadow-[0_0_12px_rgba(34,211,238,0.25)]"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          />

          <div className="text-center">
            <h1 className="auth-title">
              BEGIN YOUR <br />
              <span className="bg-linear-to-r from-brand-start via-brand-mid to-brand-end bg-clip-text text-transparent font-extrabold">
                JOURNEY HERE.
              </span>
            </h1>
          </div>
        </div>

        <form className="space-y-4 relative z-10" onSubmit={handleRegister}>
          <InputGroup
            label="CHOOSE YOUR MONIKER..."
            placeholder="QUEST_FINDER"
            icon={<User className="auth-icon" />}
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
            icon={<Mail className="auth-icon" />}
          />
          <InputGroup
            label="ESTABLISH CODENAME"
            type="text"
            placeholder="QUEST_MASTER_01"
            value={username}
            icon={<ShieldUser className="auth-icon" />}
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
            icon={<KeyRound className="auth-icon" />}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted hover:text-brand-start transition-colors p-1"
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
            icon={<KeyRound className="auth-icon" />}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted hover:text-brand-start transition-colors p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
          />

          <p className="text-[10px] text-muted py-1 text-center uppercase tracking-wider leading-relaxed">
            By enlisting, you agree to our{" "}
            <span className="text-brand-mid font-bold cursor-pointer hover:text-brand-end transition-colors">Laws of Conduct</span>{" "}
            and{" "}
            <span className="text-brand-mid font-bold cursor-pointer hover:text-brand-end transition-colors">Privacy Mantras</span>.
          </p>

          {/* Button setup: solid color styles tailored for light and dark with custom Tailwind v4 dynamic gradients */}
          <motion.button
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="auth-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Validating..." : "Create My Vault"}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        <div className="pt-5 mt-2 border-t border-soft flex flex-col items-center relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted font-bold uppercase tracking-[0.15em]">
              ALREADY A MEMBER?
            </span>
            <Link
              to="/login"
              className="auth-link flex items-center gap-1 uppercase tracking-wider"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> RETREAT TO ACCESS
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;