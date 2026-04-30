import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "./components/InputField";
import PrimaryButton from "./components/Button";
import quimoraLogo from "../../assets/quimora.png";
import useAuthStore from "../../store/authStore";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success) {
      navigate("/profile");
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div 
      className="bg-cover w-full bg-center min-h-screen"
      style={{ backgroundImage: 'url(https://res.cloudinary.com/dkt1t22qc/image/upload/v1742357451/Prestataires_Documents/cynbxx4vxvgv2wrpakiq.jpg)' }}
    >
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-8">
          
          {/* Logo */}
          <img
            src={quimoraLogo}
            alt="TyBot Logo"
            className="cursor-pointer w-[50%]"
          />

          {/* Form Card */}
          <div 
            className="w-80 rounded-[20px] bg-white p-8 dark:bg-neutral-800 dark:border-neutral-700 border border-slate-200" 
            style={{ boxShadow: '1px 3px 4px #00000057' }}
          >
            <h1 
              className="mb-6 text-center text-3xl font-bold text-black dark:text-gray-300 " 
              style={{ textShadow: '0px 3px 5px #00000063' }}
            >
              Welcome Back !
            </h1>

            <form className="space-y-4" onSubmit={handleLogin}>
              <FormInput
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FormInput
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              <div className="pt-1">
                <span className="ml-1 cursor-pointer text-[10px] text-[#228CE0] hover:underline">
                  Forget Password?
                </span>
              </div>

              <PrimaryButton type="submit" className="mt-2">
                Sign In
              </PrimaryButton>
            </form>

            <div className="mt-6 text-center text-sm text-[#969696]">
              Don't have an account?{' '}
              <span className="cursor-pointer font-medium text-[#7337FF] hover:underline" onClick={handleRegisterRedirect}>
                Sign up
              </span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default LoginPage;