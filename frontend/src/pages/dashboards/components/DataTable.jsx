// import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

const DataTable = ({
  headers = [],       // Array of strings: ["Title", "Questions", "Actions"]
  data = [],          // Array of objects representing rows
  renderRow,          // Function to render columns for a specific item
  isView = false,     // Condition to show Eye icon
  isEdit = false,     // Condition to show Pencil icon
  isDelete = false,   // Condition to show Trash icon
  onView,             // Click handler functions
  onEdit,
  onDelete,
}) => {
  
  // Show actions column if at least one action flag is true
  const showActions = isView || isEdit || isDelete;
  console.log(data);
  
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-main bg-surface shadow-sm">
      <table className="w-full min-w-150 border-collapse text-left text-sm">
        
        {/* Table Header Structure */}
        <thead>
          <tr className="border-b border-main bg-main/50 text-muted font-display text-xs uppercase tracking-wider">
            {headers.map((header, idx) => (
              <th key={idx} className="px-6 py-4 font-semibold">
                {header}
              </th>
            ))}
            {showActions && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
          </tr>
        </thead>

        {/* Table Body Content Loop */}
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
            data?.map((item, idx) => (
              <tr key={item._id || idx} className="hover:bg-main/20 transition-colors">
                
                {/* Dynamically Inject Row Columns through Parent Callback */}
                {renderRow(item)}

                {/* Inline Action Triggers Grouping */}
                {showActions && (
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      
                      {/* 1. View Action Trigger */}
                      {isView && (
                        <button
                          type="button"
                          onClick={() => onView && onView(item)}
                          className="p-1.5 rounded-md hover:bg-main text-muted hover:text-brand-primary transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      )}

                      {/* 2. Edit Action Trigger */}
                      {isEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit && onEdit(item)}
                          className="p-1.5 rounded-md hover:bg-main text-muted hover:text-green-500 transition-colors"
                          title="Edit Item"
                        >
                          <Pencil size={18} />
                        </button>
                      )}

                      {/* 3. Delete Action Trigger */}
                      {isDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete && onDelete(item)}
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
            ))
          )}
        </tbody>

      </table>
    </div>
  );
};

export default DataTable;