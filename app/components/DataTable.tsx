"use client";
import Image from "next/image";

interface Brand {
  id: number;
  name: string;
  logoUrl: string;
  description: string;
}

interface DataTableProps {
  brands: Brand[];
  loading: boolean;
  deletingIds: number[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function DataTable({ brands, loading, deletingIds, onEdit, onDelete }: DataTableProps) {
  return (
    <div className="flex-1 relative">
      {/* Spinner overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-50 bg-opacity-80 z-10 rounded-2xl">
          <div className="w-12 h-12 border-4 border-yellow-200 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <table className="w-full bg-yellow-50 shadow-lg rounded-2xl overflow-hidden border border-yellow-100">
        <thead>
          <tr className="bg-yellow-100">
            <th className="p-3 text-left font-semibold text-yellow-700">Logo</th>
            <th className="p-3 text-left font-semibold text-yellow-700">Name</th>
            <th className="p-3 text-left font-semibold text-yellow-700">Description</th>
            <th className="p-3 text-left font-semibold text-yellow-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {brands.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-6 text-yellow-700 font-medium">
                No brands yet.
              </td>
            </tr>
          ) : (
            brands.map((brand) => (
              <tr key={brand.id} className="relative hover:bg-yellow-100 transition-colors">
                <td className="p-3 border-b border-yellow-100">
                  <Image src={brand.logoUrl} alt={brand.name} width={32} height={32} className="h-8 w-8 object-contain rounded" />
                </td>
                <td className="p-3 border-b border-yellow-100 font-bold text-[#7c6a3c]">{brand.name}</td>
                <td className="p-3 border-b border-yellow-100 text-amber-900">{brand.description}</td>
                <td className="p-3 border-b border-yellow-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => onEdit(brand.id)}
                    className="bg-[#ffe082] text-[#7c6a3c] font-semibold px-5 py-1.5 rounded-full shadow hover:bg-yellow-200 hover:text-yellow-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(brand.id)}
                    className="bg-orange-500 text-white font-semibold px-5 py-1.5 rounded-full shadow hover:bg-orange-200 relative transition-colors"
                    disabled={deletingIds.includes(brand.id)}
                  >
                    {deletingIds.includes(brand.id) ? (
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
