/**
 * Converts DB Role to UI Display Label
 * @param {string} role - DB Role ('user', 'instructor', 'admin')
 * @returns {string} - UI Label ('Student', 'Instructor', 'Admin')
 */
export const getRoleDisplayName = (role) => {
  if (!role) return "Student";

  const roleMap = {
    user: "Student",
    instructor: "Instructor",
    admin: "Admin",
  };

  return roleMap[role.toLowerCase()] || "Student";
};
