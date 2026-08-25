import { Search, Plus } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

/**
 * QuizHeaderBar Component
 * Adaptive header styled with theme tokens for seamless light/dark mode support.
 */
export default function QuizHeaderBar({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  onOpenCreateModal,
  totalQuizzes = 0,
}) {
  const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Published", value: "published" },
    { label: "Draft", value: "draft" },
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent font-sans">
            Instructor Workspace
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-main font-display sm:text-3xl">
              Quizzes
            </h1>
            <span className="rounded-full bg-elevated px-2.5 py-0.5 text-xs font-medium text-main border border-main">
              {totalQuizzes} Total
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted">
            Create, organize, and publish assessments for your learners.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus size={18} />
          Create quiz
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-main shadow-card backdrop-blur-sm">
        {/* Search Input Box */}
        <div className="relative w-full sm:w-80">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search quizzes by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-elevated pl-10 pr-4 py-2 text-sm text-main placeholder-text-muted border border-main focus:border-accent focus:outline-none transition-all"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="w-full sm:w-auto flex justify-end">
          <Menu
            as="div"
            className="relative inline-block text-left w-full sm:w-48"
          >
            <MenuButton className="inline-flex w-full justify-between items-center rounded-xl bg-elevated px-4 py-2 text-sm font-medium text-main border border-main hover:border-accent focus:outline-none transition-all cursor-pointer">
              <span>
                Status:{" "}
                <strong className="capitalize text-accent">
                  {selectedStatus}
                </strong>
              </span>
              <span className="ml-2 text-muted">▾</span>
            </MenuButton>

            <MenuItems
              transition
              className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-xl bg-surface border border-main p-1.5 shadow-card ring-1 ring-black/5 focus:outline-none transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value}>
                  {({ focus }) => (
                    <button
                      type="button"
                      onClick={() => setSelectedStatus(option.value)}
                      className={`${
                        focus ? "bg-elevated text-main" : "text-muted"
                      } ${
                        selectedStatus === option.value
                          ? "font-semibold text-accent"
                          : ""
                      } group flex w-full items-center rounded-lg px-3 py-2 text-xs transition-colors cursor-pointer`}
                    >
                      {option.label}
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
      </div>
    </div>
  );
}
