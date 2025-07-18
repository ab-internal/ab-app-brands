"use client";
import Image from "next/image";

export interface DataTableProps<T extends Record<string, unknown>> {
  readonly items: T[];
  readonly loading: boolean;
  readonly deletingIds: readonly React.Key[];
  readonly onEdit: (id: React.Key) => void;
  readonly onDelete: (id: React.Key) => void;
  readonly getRowId: (item: T) => React.Key;
}

export function DataTable<T extends Record<string, unknown>>({ items, loading, deletingIds, onEdit, onDelete, getRowId }: DataTableProps<T>) {
  const keys: (keyof T)[] = items.length > 0 ? Object.keys(items[0]) as (keyof T)[] : [];

  return (
    <div className="flex-1 relative">
      {/* Spinner overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-50 bg-opacity-80 z-10 rounded-2xl">
          <div className="w-12 h-12 border-4 border-yellow-200 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {/** Dynamically generate table headings and cells from the first item in items */}
      {/* keys definition moved above return */}
      <table className="w-full bg-yellow-50 shadow-lg rounded-2xl overflow-hidden border border-yellow-100">
        <thead>
          <tr className="bg-yellow-100">
            {keys.map((key: keyof T) => (
              <th key={String(key)} className="p-3 text-left font-semibold text-yellow-700">
                {String(key).charAt(0).toUpperCase() + String(key).slice(1)}
              </th>
            ))}
            <th className="p-3 text-left font-semibold text-yellow-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={keys.length + 1} className="text-center p-6 text-yellow-700 font-medium">
                No items yet.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={getRowId(item)} className="relative hover:bg-yellow-100 transition-colors">
                {keys.map(
                  (key: keyof T) => {
                    let cellClass = "p-3 border-b border-yellow-100 ";
                    if (key === "name") cellClass += "font-bold text-yellow-800 ";
                    else if (key === "description") cellClass += "text-yellow-900 ";
                    else cellClass += "text-yellow-700 ";
                    let cellContent: React.ReactNode;
                    if (key === "logoUrl") {
                      cellContent = (
                        <Image src={typeof item[key] === "string" ? item[key] : ""} alt={typeof item["name"] === "string" ? item["name"] : ""} width={32} height={32} className="h-8 w-8 object-contain rounded" />
                      );
                    } else if (typeof item[key] === "string" || typeof item[key] === "number") {
                      cellContent = String(item[key]);
                    } else {
                      cellContent = "";
                    }
                    return (
                      <td key={String(key)} className={cellClass}>
                        {cellContent}
                      </td>
                    );
                  }
                )}
                <td className="p-3 border-b border-yellow-100 flex gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 font-semibold rounded shadow-sm transition-colors"
                    onClick={() => onEdit(getRowId(item))}
                    disabled={deletingIds.includes(getRowId(item))}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white font-semibold rounded shadow-sm transition-colors"
                    onClick={() => onDelete(getRowId(item))}
                    disabled={deletingIds.includes(getRowId(item))}
                  >
                    {deletingIds.includes(getRowId(item)) ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-yellow-50 bg-opacity-60 z-10 rounded-full">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </span>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
