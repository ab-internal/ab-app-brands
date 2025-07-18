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
    <div className="flex-1 relative bg-[var(--global-color-bg)] text-[var(--global-color-text)]">
      {/* Spinner overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--global-color-bg)] bg-opacity-80 z-10 rounded-2xl">
          <div className="w-12 h-12 border-4 border-yellow-200 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {/** Dynamically generate table headings and cells from the first item in items */}
      {/* keys definition moved above return */}
      <table className="w-full bg-[var(--global-color-bg)] shadow-lg rounded-2xl overflow-hidden border border-[var(--global-color-border)]">
        <thead>
          <tr className="bg-[var(--global-color-border)]">
            {keys.map((key: keyof T) => (
              <th key={String(key)} className="p-3 text-left font-semibold text-[var(--global-color-accent)]">
                {String(key).charAt(0).toUpperCase() + String(key).slice(1)}
              </th>
            ))}
            <th className="p-3 text-left font-semibold text-[var(--global-color-accent)]">Actions</th>
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
              <tr key={getRowId(item)} className="relative hover:bg-[var(--global-color-border)] transition-colors">
                {keys.map(
                  (key: keyof T) => {
                    let cellClass = "p-3 border-b border-[var(--global-color-border)] ";
                    if (key === "name") cellClass += "font-bold text-[var(--global-color-accent)] ";
                    else if (key === "description") cellClass += "text-[var(--global-color-text)] ";
                    else cellClass += "text-[var(--global-color-text)] ";
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
                <td className="p-3 border-b border-[var(--global-color-border)] flex gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-[var(--global-color-border)] hover:brightness-90 text-[var(--global-color-accent)] font-semibold rounded shadow-sm transition-colors focus:ring-[var(--global-color-accent)]"
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
