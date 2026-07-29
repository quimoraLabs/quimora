import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmationModal } from "./ConfirmModal";
import ModalWrapper from "./ModalWrapper";

const DataTable = ({
  headers = [],
  data = [],
  renderRow,
  isView = false,
  isEdit = false,
  isDelete = false, // Function prop to handle status change for items (like quizzes)
  type = "quiz",
  onDelete,
  onUpdate,
  onEditClick,          // Triggers when edit button is clicked, passes row item data to parent form
  renderUpdateForm,     // Function prop to render the specific dynamic form safely
  renderViewDetails,    // Function prop to render view layout if needed for modal view types
  loading = false,
}) => {
  const navigate = useNavigate();
  const showActions = isView || isEdit || isDelete;

  // Internal structural states managed strictly by DataTable
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const handleViewAction = (item, id) => {
    if (type === "quiz") {
      // Direct navigation logic for quizzes dashboard
      navigate(`/instructor/quizzes/${id}`);
    } else {
      // Trigger modal overlay display for other generic types (like question parameters)
      setSelectedItemId(id);
      
      if (onEditClick) onEditClick(item);
      setViewModalOpen(true);
    }
  };

  const handleEditOpen = (item) => {
    const id = item._id || item.id;
    setSelectedItemId(id);
    
    // Developer Hook: Alerts parent to pre-fill their local primitive input fields
    if (onEditClick) {
      onEditClick(item);
    }
    setUpdateModalOpen(true);
  };

  const handleEditClose = () => {
    setUpdateModalOpen(false);
    setSelectedItemId(null);
  };

  const handleUpdateSubmit = async () => {
    if (onUpdate && selectedItemId) {
      // Parent handles the dispatch payload, component handles structural modal close workflow
      await onUpdate(selectedItemId);
      handleEditClose();
    }
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
      <table className="w-full min-w-150 border-collapse text-left text-sm">
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
                      <div className="flex items-center justify-end gap-3">
                        {/* 1. View Detail Feature */}
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

                        {/* 2. Edit Feature */}
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

                        {/* 3. Delete Feature */}
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
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* --- REUSABLE MODAL LAYERS CONTROLLED BY INTERNAL STATES --- */}

      {/* Edit Trigger Overlays */}
      {updateModalOpen && (
        <ModalWrapper
          isOpen={updateModalOpen}
          onClose={handleEditClose}
          title={`Update ${type === "quiz" ? "Quiz" : "Question"} Details`}
        >
          {/* Injecting functional form dynamically cleanly inside container */}
          {renderUpdateForm && renderUpdateForm()}
          
          <div className="flex justify-between gap-3 mt-4">
            <button
              onClick={handleEditClose}
              className="px-4 py-2 text-sm font-semibold text-text-muted hover:bg-main rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateSubmit}
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary/90 rounded-xl shadow-sm transition-colors"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Generic Standalone Data Views overlay */}
      {viewModalOpen && (
        <ModalWrapper
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`View ${type === "quiz" ? "Quiz" : "Question"} Details`}
        >
          {renderViewDetails && renderViewDetails()}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setViewModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Structured Confirmation overlays */}
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