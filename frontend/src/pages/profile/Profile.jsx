import useAuthStore from "../../store/authStore";

export default function Card() {
    const user = useAuthStore((state) => state.user);
    console.log("User in Profile:", user);
  return (
    <div className="grid items-start bg-white border border-slate-200 shadow-sm w-full max-w-sm rounded-lg mx-auto mt-6 overflow-hidden sm:grid-cols-2 sm:max-w-2xl dark:bg-neutral-800 dark:border-neutral-700">
      <div className="aspect-square w-full bg-gray-50 dark:bg-neutral-700">
        <img
          src={user.avatar || "https://readymadeui.com/Imagination.webp"}
          className="w-full h-full object-cover"
          alt="Card image"
        />
      </div>

      <div className="p-4 sm:p-6">
        <h3 className="text-slate-900 text-base font-semibold dark:text-slate-50">
          {user.name || "Web design template"}
        </h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-slate-400">
            {user.username }
        </p>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-slate-400">
            {user.email }
        </p>
        <a
          href="#"
          className="flex flex-wrap items-center gap-4 bg-white border border-slate-300 max-w-xs p-1.5 rounded-md mt-6 dark:bg-neutral-700 dark:border-neutral-600"
        >
          <img
            src={user.avatar || "https://readymadeui.com/Imagination.webp"} 
            className="w-10 h-10 rounded-full"
            alt="user avatar"
          />
          <div>
            <p className="text-sm text-slate-900 font-semibold dark:text-slate-50">
              {user.name || "John Doe"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
              {user.role === "admin" ? "Admin" : "Marketing coordinator"}
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}
