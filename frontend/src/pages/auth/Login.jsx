import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputGroup from "./components/InputField";
import quimoraLogo from "../../assets/quimora.png";
import useAuthStore from "../../store/authStore";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, KeyRound, Lock, User } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login({ email, password });
    setIsLoading(false);
    if (success) {
      navigate("/");
    }
  };

  return (
    // Body ke center me container ko proper layout dene ke liye fixed width & alignment
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
      >
        {/* Subtle decorative glow elements inside the container */}
        <div className="auth-subtitle" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-brand-end/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center mb-8 relative z-10">
          <motion.img
            src={quimoraLogo}
            alt="Quimora Logo"
            className="h-14 object-contain mb-4 filter drop-shadow-[0_0_12px_rgba(34,211,238,0.25)]"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          />

          <div className="text-center">
            {/* Tailwind v4 text color variables applied */}
            <h1 className="auth-title text-2xl font-extrabold leading-tight">
              WELCOME BACK, <br />
              <span className="bg-linear-to-r from-brand-start via-brand-mid to-brand-end bg-clip-text text-transparent font-extrabold">
                QUESTION MASTER.
              </span>
            </h1>

            <motion.div
              className="mt-4 flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Profile/Lock avatar wrapper fixed for solid containment */}
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-elevated border border-soft flex items-center justify-center shadow-inner group">
                  <Eye className="w-7 h-7 text-brand-mid transition-transform group-hover:scale-110" />
                  <div className="absolute -bottom-1 -right-1 bg-surface border border-main rounded-md p-1 shadow-sm">
                    <Lock className="w-2.5 h-2.5 text-brand-end" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div className="space-y-4">
            <InputGroup
              label="IDENTIFY YOURSELF..."
              placeholder="MASTER@QUIMORA.COM"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<User className="w-4 h-4 text-muted" />}
            />

            <InputGroup
              label="UNLOCK THE KNOWLEDGE VAULT..."
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<KeyRound className="w-4 h-4 text-muted" />}
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

            <div className="flex justify-end">
              <Link
                to="/auth/forget-password"
                className="auth-link text-xs font-semibold text-brand-mid hover:text-brand-end transition-colors"
              >
                Forgot Passcode?
              </Link>
            </div>
          </div>

          {/* Button is now solid in light mode and glowing in dark mode */}
          <motion.button
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            disabled={isLoading}
            className="auth-btn-primary"
          >
            {isLoading ? "Validating..." : "Ascend to the Arena"}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        <div className="pt-6 mt-2 border-t border-soft flex flex-col items-center relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted font-bold uppercase tracking-[0.15em]">
              NO CLEARANCE YET?
            </span>
            <Link
              to="/register"
              className="flex items-center gap-1 text-xs font-extrabold text-brand-mid hover:text-brand-end transition-colors uppercase tracking-wider"
            >
              ENLIST NOW <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
