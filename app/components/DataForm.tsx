"use client";
import React from "react";

interface DataFormProps {
  readonly form: {
    readonly name: string;
    readonly logoUrl: string;
    readonly description: string;
  };
  readonly editingId: number | null;
  readonly error: string;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onCancel: () => void;
}

export default function DataForm({ form, editingId, error, onChange, onSubmit, onCancel }: DataFormProps) {
  return (
    <form
      className="flex flex-col gap-5 w-full max-w-xs bg-yellow-50 shadow-lg rounded-2xl p-8 border border-yellow-100"
      onSubmit={onSubmit}
    >
      <h2 className="text-2xl font-bold mb-3 text-yellow-700 tracking-tight drop-shadow">{editingId ? "Edit Brand" : "Add Brand"}</h2>
      <label className="flex flex-col gap-1 text-gray-900">
        Name
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={onChange}
          required
          className="border border-yellow-200 bg-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200 text-base shadow-sm text-gray-900 placeholder-gray-400"
          placeholder="Brand Name"
        />
      </label>
      <label className="flex flex-col gap-1 text-gray-900">
        Logo URL
        <input
          name="logoUrl"
          type="url"
          value={form.logoUrl}
          onChange={onChange}
          required
          pattern="https?://.+"
          className="border border-yellow-200 bg-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200 text-base shadow-sm text-gray-900 placeholder-gray-400"
          placeholder="https://example.com/logo.png"
        />
      </label>
      <label className="flex flex-col gap-1 text-gray-900">
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          required
          className="border border-yellow-200 bg-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200 min-h-[60px] text-base shadow-sm text-gray-900 placeholder-gray-400"
          placeholder="Brand Description"
        />
      </label>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          className="bg-yellow-500 text-white text-lg font-semibold px-8 py-2 rounded-full shadow hover:bg-yellow-300 hover:text-yellow-900 transition-colors"
        >
          {editingId ? "Update" : "Add"}
        </button>
        {editingId !== null && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-yellow-200 text-[#7c6a3c] text-lg font-semibold px-8 py-2 rounded-full shadow hover:bg-yellow-200 hover:text-yellow-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
