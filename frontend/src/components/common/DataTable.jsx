import { Eye, Pencil, Trash2, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ConfirmationModal } from "./ConfirmModal";
import ModalWrapper from "./ModalWrapper";

const DataTable = ({
  headers = [],
  data = [],
  renderRow,
  isView = false,
  isEdit = false,
  isDelete = false,
  type = "quiz",
  onDelete,
  onEditClick,
  renderViewDetails,
}) => {
  const navigate = useNavigate();
  const showActions = isView || isEdit || isDelete;

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const handleViewAction = (item, id) => {
    if (type === "quiz") {
      navigate(`/instructor/quizzes/${id}`);
    } else {
      setSelectedItemId(id);
      if (onEditClick) onEditClick(item);
      setViewModalOpen(true);
    }
  };

  const handleEditOpen = (item) => {
    const id = item._id || item.id;
    setSelectedItemId(id);
    if (onEditClick) onEditClick(item);
    // setUpdateModalOpen(true);
  };

  const handleDeleteTrigger = (id) => {
    setSelectedItemId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (onDelete && selectedItemId) {
      await onDelete(selectedItemId);
    }
    setDeleteModalOpen(false);
    setSelectedItemId(null);
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-main bg-surface shadow-sm">
      <table className="w-full table-auto border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-main bg-main/50 text-muted font-display text-xs uppercase tracking-wider">
            {headers.map((header, idx) => (
              <th key={idx} className="px-6 py-4 font-semibold">
                {header}
              </th>
            ))}
            {showActions && (
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-main text-main">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length + (showActions ? 1 : 0)}
                className="px-6 py-10 text-center text-muted"
              >
                No records found.
              </td>
            </tr>
          ) : (
            data.map((item, idx) => {
              const itemId = item._id || item.id || idx;

              return (
                <tr key={itemId} className="hover:bg-main/20 transition-colors">
                  {renderRow(item)}

                  {showActions && (
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {/* Desktop Action Icons */}
                      <div className="hidden sm:flex items-center justify-end gap-3">
                        {isView && (
                          <button
                            type="button"
                            onClick={() => handleViewAction(item, itemId)}
                            className="p-1.5 rounded-md hover:bg-main text-muted hover:text-brand-primary transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        )}

                        {isEdit && (
                          <button
                            type="button"
                            onClick={() => handleEditOpen(item)}
                            className="p-1.5 rounded-md hover:bg-main text-muted hover:text-brand-primary transition-colors"
                            title="Edit Item"
                          >
                            <Pencil size={18} />
                          </button>
                        )}

                        {isDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTrigger(itemId)}
                            className="p-1.5 rounded-md hover:bg-main text-muted hover:text-red-500 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      {/* Mobile Actions */}
                      <div className="sm:hidden relative inline-block text-left">
                        <Menu>
                          <MenuButton className="p-1.5 rounded-md hover:bg-main text-muted transition-colors">
                            <MoreVertical size={18} />
                          </MenuButton>

                          <MenuItems
                            anchor="bottom end"
                            className="z-50 rounded-xl border border-main bg-surface p-1 shadow-lg focus:outline-none min-w-32"
                          >
                            {isView && (
                              <MenuItem>
                                {({ focus }) => (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleViewAction(item, itemId)
                                    }
                                    className={`${
                                      focus ? "bg-main/50" : ""
                                    } group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-main`}
                                  >
                                    <Eye size={14} /> View
                                  </button>
                                )}
                              </MenuItem>
                            )}

                            {isEdit && (
                              <MenuItem>
                                {({ focus }) => (
                                  <button
                                    type="button"
                                    onClick={() => handleEditOpen(item)}
                                    className={`${
                                      focus ? "bg-main/50" : ""
                                    } group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-main`}
                                  >
                                    <Pencil size={14} /> Edit
                                  </button>
                                )}
                              </MenuItem>
                            )}

                            {isDelete && (
                              <MenuItem>
                                {({ focus }) => (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTrigger(itemId)}
                                    className={`${
                                      focus
                                        ? "bg-main/50 text-red-500"
                                        : "text-red-500"
                                    } group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs`}
                                  >
                                    <Trash2 size={14} /> Delete
                                  </button>
                                )}
                              </MenuItem>
                            )}
                          </MenuItems>
                        </Menu>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* View Modal */}
      {viewModalOpen && (
        <ModalWrapper
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`View ${type === "quiz" ? "Quiz" : "Question"} Details`}
        >
          {renderViewDetails && renderViewDetails()}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setViewModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Delete Modal - Only triggers on Delete icon click */}
      {deleteModalOpen && (
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedItemId(null);
          }}
          onConfirm={handleDeleteConfirm}
          title={`Are you sure you want to delete this ${type}?`}
          variant="danger"
          confirmLabel={"Delete"}
        />
      )}
    </div>
  );
};

export default DataTable;
