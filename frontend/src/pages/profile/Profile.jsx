import { useEffect, useState } from "react";
import useAuthStore from "../../store/authStore";
import useUserStore from "../../store/userStore";
import {
  Pencil,
  Save,
  X,
  Camera,
  Hexagon,
  Sparkles,
} from "lucide-react";

const DataNode = ({
  label,
  fieldName,
  value,
  isEditing,
  formData,
  setFormData,
  onSave,
  onCancel,
  onEdit,
}) => {
  return (
    <div className="relative group bg-slate-50 dark:bg-neutral-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 p-5 rounded-3xl hover:border-blue-500/50 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500 mb-2">
            {label}
          </p>
          {isEditing ? (
            <input
              className="w-full bg-transparent text-slate-900 dark:text-white font-bold text-lg outline-none border-b border-blue-500 animate-pulse"
              value={formData[fieldName]}
              onChange={(e) =>
                setFormData({ ...formData, [fieldName]: e.target.value })
              }
              autoFocus
            />
          ) : (
            <p className="text-slate-900 dark:text-white font-bold text-lg truncate pr-8">
              {value}
            </p>
          )}
        </div>

        <div className="absolute top-5 right-5">
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => onSave(fieldName)}
                className="text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform"
              >
                <Save size={18} />
              </button>
              <button
                onClick={onCancel}
                className="text-red-600 dark:text-red-400 hover:scale-110 transition-transform"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onEdit(fieldName)}
              className="text-slate-400 dark:text-white/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all"
            >
              <Pencil size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ProfileCard() {
  const user = useAuthStore((state) => state.user);

  const { getProfile } = useAuthStore();

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const updateUser = useUserStore((state) => state.updateUser);
  const [editingField, setEditingField] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
  });

  const handleEdit = (field) => setEditingField(field);
  const handleCancel = () => setEditingField(null);

  const handleSave = async (field) => {
    console.log(`Updating ${field} to:`, formData[field]);
    // Place your API call or store update logic here.
    await updateUser(user.id, { [field]: formData[field] });
    await getProfile(); // Refresh the profile.
    setEditingField(null);
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white selection:bg-blue-500/30 font-sans transition-colors duration-300 pb-2 rounded-2xl">
      {/* 1. COVER SECTION */}
      <div className="relative h-72 w-full overflow-hidden rounded-t-2xl">
        <img
          src={
            "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1000"
          }
          className="w-full h-full object-cover opacity-60 dark:opacity-40 scale-105 dark:hidden"
          alt="Cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-50 dark:from-[#080808] via-transparent to-slate-50/40 dark:to-[#080808]/40" />
      </div>

      {/* 2. PROFILE CORE */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative -mt-24 mb-12 flex flex-col md:flex-row items-end gap-8">
          {/* Avatar with Tech-Ring */}
          <div className="relative">
            <div className="absolute -inset-4 bg-blue-600/20 rounded-[3rem] blur-2xl animate-pulse" />
            <div className="relative dark:bg-[#080808] rounded-[3rem] border  border-slate-300 dark:border-white/10 shadow-2xl">
              <img
                src={user.avatar.url}
                className="w-44 h-44 rounded-[2.5rem] object-cover  dark:bg-neutral-900"
                alt="Avatar"
              />
              <button className="absolute -bottom-2 -right-2 p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-600/40 hover:scale-110 active:scale-95 transition-all">
                <Camera size={22} className="text-white" />
              </button>
            </div>
          </div>

          <div className="flex-1 pb-6">
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-none text-slate-900 dark:text-white">
                {user.name}
              </h1>
              <div className="bg-blue-600/10 border border-blue-600/20 px-4 py-1.5 rounded-2xl flex items-center gap-2">
                <Hexagon
                  size={14}
                  className="text-blue-600 dark:text-blue-500 fill-blue-600/20"
                />
                <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest">
                  {user.role}
                </span>
              </div>
            </div>
            <p className="text-slate-500 dark:text-white/40 font-bold flex items-center gap-2 tracking-wide">
              <Sparkles
                size={16}
                className="text-blue-500 dark:text-blue-400"
              />
              {user.username}{" "}
            </p>
          </div>
        </div>

        {/* 3. DATA GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <DataNode
            label="Neural Designation"
            fieldName="name"
            value={user.name}
            isEditing={editingField === "name"}
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onCancel={handleCancel}
            onEdit={handleEdit}
          />
          <DataNode
            label="Grid Pointer"
            fieldName="username"
            value={`@${user.username}`}
            isEditing={editingField === "username"}
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onCancel={handleCancel}
            onEdit={handleEdit}
          />
          <DataNode
            label="Uplink Frequency"
            fieldName="email"
            value={user.email}
            isEditing={editingField === "email"}
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onCancel={handleCancel}
            onEdit={handleEdit}
          />
        </div>

      </div>

    </div>
  );
}
    