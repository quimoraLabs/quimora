import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {  Eye, Edit3, Trash2, Copy, MoreHorizontal } from "lucide-react";

function ActionMenu({ quiz, onEdit, onDelete }) {
  return (
    <Menu as="div" className="relative">
      <MenuButton
        aria-label={`Actions for ${quiz.title}`}
        className="rounded-lg border border-transparent p-2 text-muted transition hover:border-main hover:bg-main hover:text-main focus:outline-none focus:ring-2 focus:ring-brand-mid/30"
      >
        <MoreHorizontal size={18} />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        className="z-30 mt-2 w-44 origin-top-right rounded-xl border border-main bg-surface p-1.5 shadow-card outline-none"
      >
        <MenuItem>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-main transition data-focus:bg-main"
          >
            <Eye size={16} className="text-muted" />
            View quiz
          </button>
        </MenuItem>

        <MenuItem>
          <button
            type="button"
            onClick={() => onEdit(quiz)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-main transition data-focus:bg-main"
          >
            <Edit3 size={16} className="text-muted" />
            Edit quiz
          </button>
        </MenuItem>

        <MenuItem>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-main transition data-focus:bg-main"
          >
            <Copy size={16} className="text-muted" />
            Duplicate
          </button>
        </MenuItem>

        <div className="my-1 border-t border-main" />

        <MenuItem>
          <button
            type="button"
            onClick={() => onDelete(quiz)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition data-focus:bg-red-500/10"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}

export default ActionMenu;