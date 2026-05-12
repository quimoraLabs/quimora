import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputGroup from "./components/InputField";
// import PrimaryButton from "./components/Button";
import quimoraLogo from "../../assets/quimora.png";
import useAuthStore from "../../store/authStore";
import {  motion } from "motion/react";
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

  // const handleRegisterRedirect = () => {
  //   navigate("/register");
  // };

  return (
    
      <motion.div

        className="w-full flex justify-center my-25 bg-linear-to-r from-cyan-400 to-blue-600 bg-clip-text"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-120 relative z-10 glass rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden"
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
                WELCOME BACK, <br />
                <span className="text-gradient">QUESTION MASTER.</span>
              </h1>

              <motion.div
                className="mt-4 flex justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    <Eye className="w-8 h-8 text-cyan-400" />
                    <div className="absolute bottom-3 right-3 bg-zinc-900 border border-white/10 rounded-md p-1">
                      <Lock className="w-2.5 h-2.5 text-blue-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <InputGroup
                label="IDENTIFY YOURSELF..."
                placeholder="MASTER@QUIMORA.COM"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<User className="w-4 h-4" />}
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

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-cyan-400 hover:text-blue-400 transition-colors font-semibold uppercase tracking-wider"
                >
                  Forgot Passcode?
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full h-14 dark:bg-brand-gradient rounded-xl flex items-center   justify-center gap-3 dark:text-white font-bold uppercase tracking-widest text-sm shadow-xl shadow-cyan-500/20 dark:shadow-cyan-500/40 hover:shadow-cyan-500/40 
              dark:hover:shadow-cyan-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Validating..." : "Ascend to the Arena"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>
          <div className="pt-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                NO CLEARANCE YET?
              </span>
              <Link
                to="/register"
                className="flex items-center gap-1.5 text-xs font-bold text-gradient hover:opacity-80 transition-all uppercase tracking-tight"
              >
                ENLIST NOW <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
  );
};

export default LoginPage;
