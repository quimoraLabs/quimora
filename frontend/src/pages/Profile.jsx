import { useEffect, useState } from "react";
import useAuthStore from "../features/auth/store/authStore";
import useUserStore from "../features/user/store/userStore";
import useStudentQuizStore from "../features/student/exam/store/useStudentQuizStore";
import useInstructorDashboard from "../features/instructor/dashboard/store/useInstructorDashboard";
import { useAdminStore } from "../features/admin/store/useAdminStore";
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
} from "lucide-react";
import toast from "react-hot-toast";

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

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "analytics" | "security"
  const [editingField, setEditingField] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
  });

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
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

  const handleEdit = (field) => setEditingField(field);
  const handleCancel = () => {
    setEditingField(null);
    setFormData({
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
    });
  };

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

  const handleSave = async (field) => {
    if (!formData[field] || formData[field].trim() === "") {
      toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} cannot be empty`);
      return;
    }
    await updateUser(user._id || user.id, { [field]: formData[field] });
    await getProfile();
    setEditingField(null);
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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "instructor":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <ShieldCheck className="w-4 h-4 text-rose-500" />;
      case "instructor":
        return <Award className="w-4 h-4 text-amber-500" />;
      default:
        return <Zap className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-white pb-16 transition-colors duration-300 rounded-3xl overflow-hidden shadow-xl border border-slate-200/60 dark:border-white/10">
      
      {/* 1. DYNAMIC HIGH-TECH COVER BANNER */}
      <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#0b0f19] via-transparent to-transparent opacity-90" />

        <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
          <div className="hidden sm:flex items-center gap-2 bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>System Active</span>
          </div>
          <button
            onClick={() => getProfile()}
            className="p-2.5 bg-white/10 dark:bg-black/30 backdrop-blur-md hover:bg-white/20 border border-white/10 rounded-full text-white transition-all hover:rotate-180 duration-500 cursor-pointer"
            title="Refresh Profile Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* 2. PROFILE HERO CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="relative -mt-24 sm:-mt-28 mb-8 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8 text-center md:text-left">
          
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.8rem] blur-xl opacity-70 group-hover:opacity-100 transition duration-500" />
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

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {user.name}
              </h1>
              <div
                className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {getRoleIcon(user.role)}
                <span>{user.role}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                <Sparkles size={15} />
                @{user.username}
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <Mail size={15} className="text-slate-400" />
                {user.email}
              </span>
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="relative group bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
                    <User size={20} />
                  </div>
                  {editingField === "name" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave("name")}
                        className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl hover:bg-emerald-500/20 transition cursor-pointer"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 bg-rose-500/10 text-rose-600 rounded-xl hover:bg-rose-500/20 transition cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit("name")}
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition cursor-pointer"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Full Name
                </p>
                {editingField === "name" ? (
                  <input
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg px-3 py-1.5 rounded-xl outline-none border border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    autoFocus
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-bold text-lg truncate">
                    {user.name}
                  </p>
                )}
              </div>

              <div className="relative group bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
                    <Sparkles size={20} />
                  </div>
                  {editingField === "username" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave("username")}
                        className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl hover:bg-emerald-500/20 transition cursor-pointer"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 bg-rose-500/10 text-rose-600 rounded-xl hover:bg-rose-500/20 transition cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit("username")}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition cursor-pointer"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Username
                </p>
                {editingField === "username" ? (
                  <input
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg px-3 py-1.5 rounded-xl outline-none border border-indigo-500"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    autoFocus
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-bold text-lg truncate">
                    @{user.username}
                  </p>
                )}
              </div>

              <div className="relative group bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
                    <Mail size={20} />
                  </div>
                  {editingField === "email" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave("email")}
                        className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl hover:bg-emerald-500/20 transition cursor-pointer"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 bg-rose-500/10 text-rose-600 rounded-xl hover:bg-rose-500/20 transition cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit("email")}
                      className="p-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl transition cursor-pointer"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Email Address
                </p>
                {editingField === "email" ? (
                  <input
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg px-3 py-1.5 rounded-xl outline-none border border-purple-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    autoFocus
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-bold text-lg truncate">
                    {user.email}
                  </p>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400 w-fit mb-3">
                  <Shield size={20} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Role Permission
                </p>
                <p className="text-slate-900 dark:text-white font-bold text-lg capitalize flex items-center gap-2">
                  {user.role}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-semibold">
                    System Level
                  </span>
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 w-fit mb-3">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Account Status
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active & Verified
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
                <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-600 dark:text-rose-400 w-fit mb-3">
                  <Lock size={20} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Security Authentication
                </p>
                <p className="text-slate-900 dark:text-white font-bold text-lg">
                  JWT Password Auth
                </p>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS & STATS */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Stat Card 1 */}
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {user.role === "admin"
                      ? "Total Platform Users"
                      : user.role === "instructor"
                      ? "Quizzes Created"
                      : "Quizzes Attempted"}
                  </span>
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                    {user.role === "admin" ? <Users size={20} /> : <BookOpen size={20} />}
                  </div>
                </div>
                <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {user.role === "admin"
                    ? adminStats?.totalUsers || 0
                    : user.role === "instructor"
                    ? instructorDashboard?.totalQuizzes || 0
                    : studentDashboard?.totalAttempts || 0}
                </p>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <TrendingUp size={14} className="text-emerald-500" />
                  <span>Recorded in database</span>
                </p>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {user.role === "admin"
                      ? "Total Platform Quizzes"
                      : user.role === "instructor"
                      ? "Total Students Taught"
                      : "Average Score"}
                  </span>
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                    <Award size={20} />
                  </div>
                </div>
                <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {user.role === "admin"
                    ? adminStats?.totalQuizzes || 0
                    : user.role === "instructor"
                    ? instructorDashboard?.totalStudents || 0
                    : `${studentDashboard?.averageScore || 0}%`}
                </p>
                <p className="text-xs text-slate-400 mt-2">Overall Performance Metric</p>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    System Status
                  </span>
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                    <Activity size={20} />
                  </div>
                </div>
                <p className="text-4xl font-extrabold text-emerald-500">100%</p>
                <p className="text-xs text-slate-400 mt-2">Account Operational Status</p>
              </div>

              {/* Stat Card 4 */}
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Badges Earned
                  </span>
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                    <Sparkles size={20} />
                  </div>
                </div>
                <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {user.role === "admin" ? "Master" : user.role === "instructor" ? "Pro" : "Scholar"}
                </p>
                <p className="text-xs text-amber-500 font-semibold mt-2">Level Verified</p>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & PASSWORD MANAGEMENT */}
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
    </div>
  );
}
