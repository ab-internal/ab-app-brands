"use client";
import React from "react";

// Generic field definition for form rendering
export interface FieldDef<T> {
  name: keyof T;
  label: string;
  type: "text" | "number" | "textarea" | "password" | "email" | "url";
  placeholder?: string;
  required?: boolean;
}

interface DataFormProps<T> {
  readonly form: T;
  readonly fieldDefs: readonly FieldDef<T>[];
  readonly editingId: number | string | null;
  readonly error: string;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onCancel: () => void;
}

export function DataForm<T>({ form, fieldDefs, editingId, error, onChange, onSubmit, onCancel }: DataFormProps<T>) {
  return (
    <form
      className="flex flex-col gap-5 w-full max-w-xs bg-yellow-50 shadow-lg rounded-2xl p-8 border border-yellow-100"
      onSubmit={onSubmit}
    >
      <h2 className="text-2xl font-bold mb-3 text-yellow-700 tracking-tight drop-shadow">{editingId ? "Edit" : "Add"}</h2>
      {fieldDefs.map((field) => (
        <label key={String(field.name)} className="flex flex-col gap-1 text-gray-900">
          {field.label}
          {field.type === "textarea" ? (
            <textarea
              name={String(field.name)}
              value={String(form[field.name] ?? "")}
              onChange={onChange}
              required={field.required}
              placeholder={field.placeholder}
              className="border border-yellow-200 bg-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200 text-base shadow-sm text-gray-900 placeholder-gray-400"
            />
          ) : (
            <input
              name={String(field.name)}
              type={field.type}
              value={String(form[field.name] ?? "")}
              onChange={onChange}
              required={field.required}
              placeholder={field.placeholder}
              className="border border-yellow-200 bg-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-200 text-base shadow-sm text-gray-900 placeholder-gray-400"
            />
          )}
        </label>
      ))}
      {error && <div className="text-red-600 font-medium">{error}</div>}
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-xl shadow">
          {editingId ? "Save" : "Add"}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-xl shadow">
          Cancel
        </button>
      </div>
    </form>
  );
}
