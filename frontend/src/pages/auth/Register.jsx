import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "./components/InputField";
import PrimaryButton from "./components/Button";
import quimoraLogo from "../../assets/quimora.png";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const success = await register({ email, username, name, password });
    if (success) {
      navigate("/profile");
    }
  };

  const handleSignInClick = () => {
    navigate("/login");
  }

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
            className="w-96 rounded-[20px] bg-white p-8" 
            style={{ boxShadow: '1px 3px 4px #00000057' }}
          >
            <h1 
              className="mb-6 text-center text-3xl font-bold text-black" 
              style={{ textShadow: '0px 3px 5px #00000063' }}
            >
              Create an Account
            </h1>

            <form className="space-y-4" onSubmit={handleRegister}>
              <FormInput
                type="name"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <FormInput
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FormInput
                type="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <FormInput
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FormInput
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <PrimaryButton type="submit" className="mt-2">
                Create Account
              </PrimaryButton>
            </form>

            <div className="mt-6 text-center text-sm text-[#969696]">
              Already have an account?{' '}
              <span className="cursor-pointer font-medium text-[#7337FF] hover:underline" onClick={handleSignInClick}>
                Sign in
              </span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;