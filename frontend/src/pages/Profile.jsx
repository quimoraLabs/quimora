import { useEffect, useState } from "react";
import useAuthStore from "../features/auth/store/authStore";
import useUserStore from "../features/user/store/userStore";
import useStudentQuizStore from "../features/student/exam/store/useStudentQuizStore";
import useInstructorDashboard from "../features/instructor/dashboard/store/useInstructorDashboard";
import { useAdminStore } from "../features/admin/store/useAdminStore";
import InterestOnboardingModal from "../features/student/components/InterestOnboardingModal";
import {
  User,
  Mail,
  Shield,
  Award,
  Sparkles,
  Camera,
  Pencil,
  Save,
  X,
  Key,
  CheckCircle2,
  Lock,
  RefreshCw,
  Zap,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Activity,
  Users,
  GraduationCap,
  Building,
  Clock,
  Globe,
  Coins,
  Lightbulb,
  ExternalLink,
  Plus,
  Trash2,
  Calendar,
  Check,
  Compass,
} from "lucide-react";
import toast from "react-hot-toast";

// Custom Brand Icons
const GithubIcon = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function ProfilePage() {
  const {
    user,
    getProfile,
    changePassword,
    requestSendOTP,
    verifyOTPAndChangePassword,
    loading: authLoading,
  } = useAuthStore();
  const { updateUser, uploadAvatar } = useUserStore();

  const studentDashboard = useStudentQuizStore((state) => state.dashboardStats);
  const fetchStudentStats = useStudentQuizStore((state) => state.fetchDashboardStats);

  const instructorDashboard = useInstructorDashboard((state) => state.dashboardStats);
  const fetchInstructorStats = useInstructorDashboard((state) => state.fetchDashboardStats);

  const adminStats = useAdminStore((state) => state.stats);
  const fetchAdminStats = useAdminStore((state) => state.fetchStats);

  // Active tab: "overview" | "edit" | "analytics" | "security"
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);

  // Security tab modes: "otp" | "direct"
  const [securityMode, setSecurityMode] = useState("otp");

  // Direct Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [directNewPassword, setDirectNewPassword] = useState("");
  const [directConfirmPassword, setDirectConfirmPassword] = useState("");

  // OTP Reset Form States
  const [otpStep, setOtpStep] = useState(1); // 1: Send OTP, 2: Verify & Reset
  const [otpCode, setOtpCode] = useState("");
  const [otpNewPassword, setOtpNewPassword] = useState("");
  const [otpConfirmPassword, setOtpConfirmPassword] = useState("");

  // Comprehensive Profile Form Data (covers all v3 student/instructor fields)
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    headline: "",
    bio: "",
    department: "",
    college: "",
    semester: "",
    organization: "",
    officeHours: "",
    githubUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
    expertise: [],
  });

  const [newExpertiseInput, setNewExpertiseInput] = useState("");

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  // Sync edit form with latest user data & role-specific profile
  useEffect(() => {
    if (user) {
      const p = user.profile || {};
      setEditForm({
        name: user.name || "",
        username: user.username || "",
        headline: p.headline || "",
        bio: p.bio || "",
        department: p.department || "",
        college: p.college || "",
        semester: p.semester || "",
        organization: p.organization || "",
        officeHours: p.officeHours || "",
        githubUrl: p.githubUrl || "",
        linkedinUrl: p.linkedinUrl || "",
        websiteUrl: p.websiteUrl || "",
        expertise: Array.isArray(p.expertise) ? [...p.expertise] : ["General"],
      });
    }
  }, [user]);

  // Lazy fetch role-specific stats ONLY when Analytics tab is opened
  useEffect(() => {
    if (user && activeTab === "analytics") {
      if (user.role === "user") {
        fetchStudentStats();
      } else if (user.role === "instructor") {
        fetchInstructorStats();
      } else if (user.role === "admin") {
        fetchAdminStats();
      }
    }
  }, [user, activeTab, fetchStudentStats, fetchInstructorStats, fetchAdminStats]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      await uploadAvatar(user._id || user.id, file);
      await getProfile();
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Full Profile Update Handler
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();

    if (!editForm.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!editForm.username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setSavingProfile(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        username: editForm.username.trim(),
        headline: editForm.headline.trim(),
        bio: editForm.bio.trim(),
        department: editForm.department.trim(),
        githubUrl: editForm.githubUrl.trim(),
        linkedinUrl: editForm.linkedinUrl.trim(),
        websiteUrl: editForm.websiteUrl.trim(),
      };

      if (user.role === "user") {
        payload.college = editForm.college.trim();
        payload.semester = editForm.semester.trim();
      } else if (user.role === "instructor") {
        payload.organization = editForm.organization.trim();
        payload.officeHours = editForm.officeHours.trim();
        payload.expertise = editForm.expertise.filter((item) => item.trim() !== "");
      }

      await updateUser(user._id || user.id, payload);
      await getProfile();
      setActiveTab("overview");
    } catch (err) {
      console.error("Profile save error:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddExpertise = () => {
    const trimmed = newExpertiseInput.trim();
    if (!trimmed) return;
    if (editForm.expertise.includes(trimmed)) {
      toast.error("Expertise already added");
      return;
    }
    setEditForm((prev) => ({
      ...prev,
      expertise: [...prev.expertise, trimmed],
    }));
    setNewExpertiseInput("");
  };

  const handleRemoveExpertise = (tagToRemove) => {
    setEditForm((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((t) => t !== tagToRemove),
    }));
  };

  // 1. Direct Password Change Handler
  const handleDirectPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (directNewPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (directNewPassword !== directConfirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    const success = await changePassword(currentPassword, directNewPassword);
    if (success) {
      setCurrentPassword("");
      setDirectNewPassword("");
      setDirectConfirmPassword("");
    }
  };

  // 2. OTP Reset Handlers
  const handleRequestOTP = async () => {
    if (!user?.email) return;
    const sent = await requestSendOTP(user.email);
    if (sent) {
      setOtpStep(2);
      toast.success("OTP sent to your registered email!");
    }
  };

  const handleOTPPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code");
      return;
    }
    if (otpNewPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (otpNewPassword !== otpConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const success = await verifyOTPAndChangePassword({
      email: user.email,
      otpCode,
      newPassword: otpNewPassword,
    });

    if (success) {
      setOtpStep(1);
      setOtpCode("");
      setOtpNewPassword("");
      setOtpConfirmPassword("");
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading profile data...</p>
        </div>
      </div>
    );
  }

  const role = user.role || "user";
  const profile = user.profile || {};

  const getRoleBadgeColor = (r) => {
    switch (r) {
      case "admin":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "instructor":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
    }
  };

  const getRoleIcon = (r) => {
    switch (r) {
      case "admin":
        return <ShieldCheck className="w-4 h-4 text-rose-500" />;
      case "instructor":
        return <Award className="w-4 h-4 text-amber-500" />;
      default:
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRoleLabel = (r) => {
    switch (r) {
      case "admin":
        return "System Administrator";
      case "instructor":
        return "Faculty Instructor";
      default:
        return "Student Scholar";
    }
  };

  // Standard platform badges showcase
  const defaultBadges = [
    {
      id: "pioneer",
      title: "Platform Pioneer",
      desc: "Joined Quimora Learning Platform",
      icon: "🚀",
      unlocked: true,
    },
    {
      id: "starter",
      title: "Quiz Starter",
      desc: "Completed first quiz assessment",
      icon: "🎯",
      unlocked: (profile.totalAttempts || 0) > 0,
    },
    {
      id: "mastermind",
      title: "High Achiever",
      desc: "Scored 80%+ on any assessment",
      icon: "🧠",
      unlocked: (studentDashboard?.averageScore || 0) >= 80,
    },
    {
      id: "explorer",
      title: "Elective Explorer",
      desc: "Calibrated 3+ learning interests",
      icon: "🌟",
      unlocked: (profile.interests?.length || 0) >= 3,
    },
    {
      id: "coin_hoarder",
      title: "Coin Collector",
      desc: "Reached 100+ Quimora coins",
      icon: "🪙",
      unlocked: (profile.coinsBalance || 0) >= 100,
    },
    {
      id: "hint_wizard",
      title: "Knowledge Seeker",
      desc: "Utilized smart hint tokens",
      icon: "💡",
      unlocked: (profile.hintTokens || 0) > 0,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-white pb-20 transition-colors duration-300 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/10">
      
      {/* 1. DYNAMIC HIGH-TECH COVER BANNER */}
      <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden bg-linear-to-r from-blue-950 via-indigo-950 to-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f615_1px,transparent_1px),linear-gradient(to_bottom,#3b82f615_1px,transparent_1px)] bg-size-[28px_28px]" />
        <div className="absolute -top-32 -left-32 w-lg h-128 bg-blue-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-lg h-128 bg-indigo-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-50 dark:from-[#0b0f19] via-transparent to-transparent opacity-95" />

        {/* Top Status & Controls */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
          <div className="hidden sm:flex items-center gap-2 bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full text-xs font-semibold text-white shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Profile Live • V3 Engine</span>
          </div>
          <button
            onClick={() => getProfile()}
            className="p-3 bg-white/10 dark:bg-black/40 backdrop-blur-md hover:bg-white/20 border border-white/15 rounded-full text-white transition-all hover:rotate-180 duration-500 shadow-lg cursor-pointer"
            title="Refresh Profile Data"
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </div>

      {/* 2. PROFILE HERO CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="relative -mt-24 sm:-mt-28 mb-8 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8 text-center md:text-left">
          
          {/* Avatar with Glow & Upload Camera */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-2 bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-[2.8rem] blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-[2.5rem] bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden">
              <img
                src={
                  user?.avatar?.url ||
                  `https://api.dicebear.com/9.x/identicon/svg?seed=${user?.username}`
                }
                className="w-full h-full object-cover"
                alt={user?.name}
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
              )}
              <label className="absolute bottom-2 right-2 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-600/40 hover:scale-110 active:scale-95 transition-all cursor-pointer">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* User Identity Details & Role Chips */}
          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {user.name}
              </h1>
              <div
                className={`px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${getRoleBadgeColor(
                  role
                )}`}
              >
                {getRoleIcon(role)}
                <span>{getRoleLabel(role)}</span>
              </div>
            </div>

            {/* Headline */}
            <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300 max-w-2xl">
              {profile.headline ? (
                <span>{profile.headline}</span>
              ) : (
                <button
                  onClick={() => setActiveTab("edit")}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center md:justify-start gap-1.5 font-medium cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Add a professional headline (e.g., Computer Science Undergrad)</span>
                </button>
              )}
            </p>

            {/* Username, Email, Social Link Chips */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                <Sparkles size={15} />
                @{user.username}
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <Mail size={15} className="text-slate-400" />
                {user.email}
              </span>

              {/* Social Quick Icons */}
              {(profile.githubUrl || profile.linkedinUrl || profile.websiteUrl) && (
                <>
                  <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                  <div className="flex items-center gap-2">
                    {profile.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        title="GitHub Profile"
                      >
                        <GithubIcon size={15} />
                      </a>
                    )}
                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        title="LinkedIn Profile"
                      >
                        <LinkedinIcon size={15} />
                      </a>
                    )}
                    {profile.websiteUrl && (
                      <a
                        href={profile.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        title="Website / Portfolio"
                      >
                        <Globe size={15} />
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Action Button & Gamification Cards on Hero */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab(activeTab === "edit" ? "overview" : "edit")}
              className="px-6 py-3 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Pencil size={16} />
              <span>{activeTab === "edit" ? "View Overview" : "Edit Profile"}</span>
            </button>

            {/* Quick Wallet / Status Pill */}
            {role === "user" && (
              <div className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-2xl shadow-sm text-xs font-bold">
                <span className="flex items-center gap-1.5 text-amber-500">
                  <Coins size={15} />
                  <span>{profile.coinsBalance ?? 100} Coins</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="flex items-center gap-1.5 text-indigo-500">
                  <Lightbulb size={15} />
                  <span>{profile.hintTokens ?? 3} Hints</span>
                </span>
              </div>
            )}

            {role === "instructor" && (
              <div className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-2xl shadow-sm text-xs font-bold">
                <span className="flex items-center gap-1.5 text-amber-500">
                  <Award size={15} />
                  <span>Rating: {profile.rating ?? 5.0}★</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="flex items-center gap-1.5 text-blue-500">
                  <BookOpen size={15} />
                  <span>{instructorDashboard?.totalQuizzes || profile.totalQuizzes || 0} Quizzes</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3. MODERN TAB NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 mb-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5"
            }`}
          >
            <User size={18} />
            <span>Profile Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("edit")}
            className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "edit"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5"
            }`}
          >
            <Pencil size={18} />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "analytics"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5"
            }`}
          >
            <Activity size={18} />
            <span>Performance & Stats</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "security"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5"
            }`}
          >
            <Shield size={18} />
            <span>Security & Password</span>
          </button>
        </div>

        {/* 4. TAB CONTENTS */}
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Top Grid: About Bio + Academic / Institutional info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Bio & Headline Card (2 Columns Wide on large screens) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-7 rounded-3xl shadow-sm hover:border-blue-500/30 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
                        <User size={22} />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                          About & Biography
                        </h3>
                        <p className="text-xs text-slate-400">Personal summary and background</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("edit")}
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition cursor-pointer"
                      title="Edit Bio"
                    >
                      <Pencil size={17} />
                    </button>
                  </div>

                  {profile.headline && (
                    <div className="mb-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Professional Headline
                      </p>
                      <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                        {profile.headline}
                      </p>
                    </div>
                  )}

                  <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {profile.bio ? (
                      profile.bio
                    ) : (
                      <p className="italic text-slate-400">
                        No biography added yet. Click &ldquo;Edit Profile&rdquo; to introduce yourself to instructors and peers.
                      </p>
                    )}
                  </div>
                </div>

                {/* Social Links Row inside Bio card */}
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">
                    Online Presence:
                  </span>
                  {profile.githubUrl ? (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition border border-transparent"
                    >
                      <GithubIcon size={14} />
                      <span>GitHub</span>
                      <ExternalLink size={12} className="opacity-60" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">No GitHub linked</span>
                  )}

                  {profile.linkedinUrl ? (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition border border-transparent"
                    >
                      <LinkedinIcon size={14} />
                      <span>LinkedIn</span>
                      <ExternalLink size={12} className="opacity-60" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">• No LinkedIn linked</span>
                  )}

                  {profile.websiteUrl && (
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition border border-transparent"
                    >
                      <Globe size={14} />
                      <span>Portfolio</span>
                      <ExternalLink size={12} className="opacity-60" />
                    </a>
                  )}
                </div>
              </div>

              {/* Academic / Institutional Details Card (1 Column Wide) */}
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-7 rounded-3xl shadow-sm hover:border-blue-500/30 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
                        {role === "instructor" ? <Building size={22} /> : <GraduationCap size={22} />}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                          {role === "instructor" ? "Faculty Affiliation" : "Academic Credentials"}
                        </h3>
                        <p className="text-xs text-slate-400">Institution & program details</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("edit")}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition cursor-pointer"
                      title="Edit Academic Details"
                    >
                      <Pencil size={17} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* College or Organization */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {role === "instructor" ? "Organization / University" : "College / Institute"}
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Building size={16} className="text-indigo-500" />
                        {role === "instructor"
                          ? profile.organization || "Not Specified"
                          : profile.college || "Not Specified"}
                      </p>
                    </div>

                    {/* Department */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Department / Branch
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <GraduationCap size={16} className="text-blue-500" />
                        {profile.department || "Not Specified"}
                      </p>
                    </div>

                    {/* Semester or Office Hours */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {role === "instructor" ? "Office Hours" : "Current Semester"}
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {role === "instructor" ? (
                          <>
                            <Clock size={16} className="text-amber-500" />
                            {profile.officeHours || "Not Specified"}
                          </>
                        ) : (
                          <>
                            <Calendar size={16} className="text-emerald-500" />
                            {profile.semester || "Not Specified"}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>Status: Verified Member</span>
                  <span className="font-semibold text-emerald-500">Active</span>
                </div>
              </div>

            </div>

            {/* Mid Grid: Electives/Interests OR Expertise Card */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-7 rounded-3xl shadow-sm hover:border-blue-500/30 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
                    <Compass size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {role === "instructor" ? "Areas of Academic Expertise" : "Selected Learning Interests & Electives"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {role === "instructor"
                        ? "Topics and fields you teach and create quizzes for"
                        : "Curriculum electives calibrating your adaptive questions"}
                    </p>
                  </div>
                </div>

                {role === "user" ? (
                  <button
                    onClick={() => setIsInterestModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
                  >
                    <Pencil size={14} />
                    <span>Manage Electives ({profile.interests?.length || 0}/10)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab("edit")}
                    className="px-4 py-2 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
                  >
                    <Pencil size={14} />
                    <span>Edit Expertise</span>
                  </button>
                )}
              </div>

              {role === "user" ? (
                <div className="flex flex-wrap gap-2.5">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.map((interest) => (
                      <div
                        key={interest._id || interest.id || interest.name}
                        className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-white/10 flex items-center gap-2 hover:border-purple-500 transition"
                      >
                        <Sparkles size={14} className="text-purple-500" />
                        <span>{interest.name || interest}</span>
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        No electives selected yet.
                      </p>
                      <button
                        onClick={() => setIsInterestModalOpen(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/20 cursor-pointer"
                      >
                        Choose Learning Topics Now
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {profile.expertise && profile.expertise.length > 0 ? (
                    profile.expertise.map((tag, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20 flex items-center gap-2"
                      >
                        <Award size={14} />
                        <span>{tag}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No areas of expertise listed.</p>
                  )}
                </div>
              )}
            </div>

            {/* Badges & Achievements Showcase */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-7 rounded-3xl shadow-sm hover:border-blue-500/30 transition">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400">
                    <Award size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Achievements & Earned Badges
                    </h3>
                    <p className="text-xs text-slate-400">Milestones verified on Quimora ledger</p>
                  </div>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
                  {defaultBadges.filter((b) => b.unlocked).length} / {defaultBadges.length} Unlocked
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {defaultBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      badge.unlocked
                        ? "bg-slate-50 dark:bg-slate-800/60 border-amber-500/30 shadow-sm"
                        : "bg-slate-100/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-white/5 opacity-60"
                    }`}
                  >
                    <div
                      className={`text-2xl p-2.5 rounded-2xl shrink-0 ${
                        badge.unlocked
                          ? "bg-amber-500/15 border border-amber-500/30 shadow-inner"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      {badge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {badge.title}
                        </p>
                        {badge.unlocked ? (
                          <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                            <Check size={11} /> Unlocked
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Lock size={10} /> Locked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                        {badge.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom System & Account Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 w-fit mb-3">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Account Verification
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active & Authenticated
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400 w-fit mb-3">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Role Authority
                </p>
                <p className="text-slate-900 dark:text-white font-bold text-base capitalize flex items-center gap-2">
                  {role} Level
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold">
                    V3 Standard
                  </span>
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400 w-fit mb-3">
                  <Key size={20} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Security Layer
                </p>
                <p className="text-slate-900 dark:text-white font-bold text-base">
                  Encrypted Session
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: EDIT PROFILE FORM */}
        {activeTab === "edit" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 sm:p-10 rounded-3xl shadow-xl">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
                    <Pencil size={26} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      Edit Profile Information
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Update your identity, biography, academic credentials, and social links.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Cancel and close"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-8">
                
                {/* Section 1: Basic Identity */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <User size={16} />
                    <span>Basic Identity</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-blue-500 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Username <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        placeholder="your_username"
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      value={editForm.headline}
                      onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                      placeholder={
                        role === "instructor"
                          ? "Senior AI Lecturer & Full Stack Researcher"
                          : "Computer Science Undergrad | Aspiring Software Engineer"
                      }
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      About & Bio
                    </label>
                    <textarea
                      rows={3}
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Share your background, passions, and what you are learning or teaching..."
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-blue-500 transition resize-none"
                    />
                  </div>
                </div>

                {/* Section 2: Role-Specific Academic / Professional Details */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    {role === "instructor" ? <Building size={16} /> : <GraduationCap size={16} />}
                    <span>{role === "instructor" ? "Faculty & Institutional Info" : "Academic Credentials"}</span>
                  </h3>

                  {role === "user" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          College / University
                        </label>
                        <input
                          type="text"
                          value={editForm.college}
                          onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                          placeholder="e.g. IIT Delhi / Stanford"
                          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-indigo-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Department / Branch
                        </label>
                        <input
                          type="text"
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          placeholder="e.g. Computer Science"
                          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-indigo-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Current Semester
                        </label>
                        <input
                          type="text"
                          value={editForm.semester}
                          onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                          placeholder="e.g. 6th Semester"
                          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-indigo-500 transition"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Organization / University
                        </label>
                        <input
                          type="text"
                          value={editForm.organization}
                          onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                          placeholder="e.g. Quimora University"
                          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-indigo-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Department
                        </label>
                        <input
                          type="text"
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          placeholder="e.g. Information Technology"
                          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-indigo-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Office Hours
                        </label>
                        <input
                          type="text"
                          value={editForm.officeHours}
                          onChange={(e) => setEditForm({ ...editForm, officeHours: e.target.value })}
                          placeholder="e.g. Mon-Wed 3:00 PM - 5:00 PM"
                          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-indigo-500 transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* Instructor Expertise Tag Editor */}
                  {role === "instructor" && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Areas of Expertise
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newExpertiseInput}
                          onChange={(e) => setNewExpertiseInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddExpertise();
                            }
                          }}
                          placeholder="e.g. Distributed Systems, Neural Networks"
                          className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-xl outline-none border border-slate-300 dark:border-white/10 focus:border-amber-500 text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddExpertise}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition cursor-pointer"
                        >
                          Add Tag
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editForm.expertise.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20 flex items-center gap-1.5"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveExpertise(tag)}
                              className="hover:text-rose-500 transition cursor-pointer"
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Social & Web Presence */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                    <Globe size={16} />
                    <span>Social & Web Presence</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <GithubIcon size={13} />
                        <span>GitHub URL</span>
                      </label>
                      <input
                        type="url"
                        value={editForm.githubUrl}
                        onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                        placeholder="https://github.com/username"
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-cyan-500 transition text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <LinkedinIcon size={13} />
                        <span>LinkedIn URL</span>
                      </label>
                      <input
                        type="url"
                        value={editForm.linkedinUrl}
                        onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-cyan-500 transition text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <Globe size={13} />
                        <span>Portfolio / Website</span>
                      </label>
                      <input
                        type="url"
                        value={editForm.websiteUrl}
                        onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                        placeholder="https://yourportfolio.com"
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-cyan-500 transition text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full sm:flex-1 py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {savingProfile ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Save All Profile Changes</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="w-full sm:w-auto px-8 py-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* TAB 3: ANALYTICS & STATS */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Stat Card 1 */}
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm hover:border-blue-500/30 transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {role === "admin"
                      ? "Total Platform Users"
                      : role === "instructor"
                      ? "Quizzes Created"
                      : "Quizzes Attempted"}
                  </span>
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                    {role === "admin" ? <Users size={20} /> : <BookOpen size={20} />}
                  </div>
                </div>
                <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {role === "admin"
                    ? adminStats?.totalUsers || 0
                    : role === "instructor"
                    ? instructorDashboard?.totalQuizzes || 0
                    : studentDashboard?.totalAttempts || 0}
                </p>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <TrendingUp size={14} className="text-emerald-500" />
                  <span>Recorded on ledger</span>
                </p>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm hover:border-blue-500/30 transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {role === "admin"
                      ? "Total Platform Quizzes"
                      : role === "instructor"
                      ? "Total Students Taught"
                      : "Average Score"}
                  </span>
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                    <Award size={20} />
                  </div>
                </div>
                <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {role === "admin"
                    ? adminStats?.totalQuizzes || 0
                    : role === "instructor"
                    ? instructorDashboard?.totalStudents || 0
                    : `${studentDashboard?.averageScore || 0}%`}
                </p>
                <p className="text-xs text-slate-400 mt-2">Overall Performance Metric</p>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm hover:border-blue-500/30 transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    System Health & Calibration
                  </span>
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                    <Activity size={20} />
                  </div>
                </div>
                <p className="text-4xl font-extrabold text-emerald-500">100%</p>
                <p className="text-xs text-slate-400 mt-2">Account Operational Status</p>
              </div>

              {/* Stat Card 4 */}
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm hover:border-blue-500/30 transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Badge Level Tier
                  </span>
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                    <Sparkles size={20} />
                  </div>
                </div>
                <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {role === "admin" ? "Grandmaster" : role === "instructor" ? "Professor" : "Scholar"}
                </p>
                <p className="text-xs text-amber-500 font-semibold mt-2">Tier Verified</p>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & PASSWORD MANAGEMENT */}
        {activeTab === "security" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-md">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-5 mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
                    <Key size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Password & Security Settings
                    </h3>
                    <p className="text-xs text-slate-400">
                      {securityMode === "direct"
                        ? "Change your password directly using your current password."
                        : "Reset your password via Email OTP code."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => setSecurityMode("otp")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    securityMode === "otp"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Reset via Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => setSecurityMode("direct")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    securityMode === "direct"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Direct Password Change
                </button>
              </div>

              {securityMode === "direct" && (
                <form onSubmit={handleDirectPasswordSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={directNewPassword}
                      onChange={(e) => setDirectNewPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={directConfirmPassword}
                      onChange={(e) => setDirectConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {authLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Key size={18} />
                        <span>Update Password Now</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {securityMode === "otp" && (
                <div>
                  {otpStep === 1 ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Registered Email Address
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleRequestOTP}
                        disabled={authLoading}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {authLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Mail size={18} />
                            <span>Send Password Reset OTP</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleOTPPasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          6-Digit OTP Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center tracking-widest text-lg rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Minimum 6 characters"
                          value={otpNewPassword}
                          onChange={(e) => setOtpNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Re-enter new password"
                          value={otpConfirmPassword}
                          onChange={(e) => setOtpConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl outline-none border border-slate-300 dark:border-white/10 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setOtpStep(1)}
                          className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {authLoading ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : (
                            <span>Verify & Reset Password</span>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* Student Interest Management Modal */}
      {role === "user" && (
        <InterestOnboardingModal
          isOpen={isInterestModalOpen}
          initialSelectedIds={profile.interests?.map((i) => i._id || i.id || i) || []}
          onClose={() => setIsInterestModalOpen(false)}
          onComplete={async () => {
            setIsInterestModalOpen(false);
            await getProfile();
          }}
        />
      )}

    </div>
  );
}
