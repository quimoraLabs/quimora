import { useState } from "react";
import useAuthStore from "../../store/authStore";
import useUserStore from "../../store/userStore";
import { Pencil, Save, X, Trash2 } from "lucide-react";
import DeleteConfirmModal from "../../shared/DeleteModal";

export default function Card() {
  const user = useAuthStore((state) => state.user);

  const {getProfile} = useAuthStore();
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const updateUser = useUserStore((state) => state.updateUser);
  const [editingField, setEditingField] = useState(null); 

  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
  });
 

  const handleEdit = (field) => setEditingField(field);
  const handleCancel = () => setEditingField(null);

  
  const handleSave =async  (field) => {
    console.log(`Updating ${field} to:`, formData[field]);
    // Yahan aap apna API call ya store update logic likh sakte hain
    await updateUser(user._id, { [field]: formData[field] });
    await getProfile(); // Profile ko refresh karne ke liye
    setEditingField(null);
  };

  const renderField = (label, fieldName, value) => {
    const isEditing = editingField === fieldName;

    return (
      <div className="py-4 border-b border-slate-100 dark:border-neutral-800 last:border-0">
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
          {label}
        </label>
        <div className="flex items-center justify-between gap-4">
          {isEditing ? (
            <input
              type="text"
              className="w-full bg-slate-50 border border-blue-500 rounded px-2 py-1 text-sm focus:outline-none dark:bg-neutral-800 dark:text-white"
              value={formData[fieldName]}
              onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
              autoFocus
            />
          ) : (
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {value || "Not Set"}
            </p>
          )}

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button onClick={() => handleSave(fieldName)} className="text-green-600 hover:text-green-700">
                  <Save size={18} />
                </button>
                <button onClick={handleCancel} className="text-slate-400 hover:text-slate-500">
                  <X size={18} />
                </button>
              </>
            ) : (
              <button onClick={() => handleEdit(fieldName)} className="text-blue-500 hover:text-blue-600">
                <Pencil size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden dark:bg-neutral-900 dark:border-neutral-800">
      
      {/* Header Profile Section */}
      <div className="bg-slate-50 dark:bg-neutral-700 p-6 flex items-center gap-4 border-b border-slate-200 dark:border-neutral-700">
        <div className="relative group">
          <img
            src={user?.avatar || "https://readymadeui.com/Imagination.webp"}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
            alt="User"
          />
          <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Pencil size={14} className="text-white" />
          </button>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h2>
          <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded dark:bg-blue-900/30 dark:text-blue-400">
            {user?.role || "Member"}
          </span>
        </div>
      </div>

      {/* Editable Fields Section */}
      <div className="p-6">
        {renderField("Full Name", "name", formData.name)}
        {renderField("Username", "username", formData.username)}
        {renderField("Email Address", "email", formData.email)}

        {/* Danger Zone */}
        <div className="mt-8 pt-6 border-t border-red-100 dark:border-red-900/20">
          <h4 className="text-sm font-bold text-red-600 mb-4">Danger Zone</h4>
          <button 
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold text-sm hover:bg-red-600 hover:text-white transition-all duration-200 dark:bg-red-900/10 dark:border-red-900/30 dark:hover:bg-red-600"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 size={16} />
            Deactivate Account
          </button>
          <p className="mt-2 text-[11px] text-slate-400 text-center">
            Once you deactivate, your profile data will be hidden.
          </p>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <DeleteConfirmModal
          type="account"
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={() => {  
            console.log("Account deactivated");
            // Yahan aap apna account deactivation logic likh sakte hain
          }}
        />
      )}
    </div>
  );
}