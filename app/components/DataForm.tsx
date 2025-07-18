"use client";
import React from "react";

import { FieldDefinition } from "./DataManager";

interface DataFormProps<T> {
  readonly form: Partial<T>;
  readonly fields: readonly FieldDefinition<T>[];
  readonly editingId: number | string | null;
  readonly error: string;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onCancel: () => void;
}

export function DataForm<T>({ form, fields, editingId, error, onChange, onSubmit, onCancel }: DataFormProps<T>) {
  return (
    <form
      className="flex flex-col gap-5 w-full max-w-xs bg-[var(--global-color-bg)] shadow-lg rounded-2xl p-8 border border-[var(--global-color-border)]"
      onSubmit={onSubmit}
    >
      <h2 className="text-2xl font-bold mb-3 text-[var(--global-color-accent)] tracking-tight drop-shadow">{editingId ? "Edit" : "Add"}</h2>
      {fields.map((field) => (
        <label key={String(field.name)} className="flex flex-col gap-1 text-[var(--global-color-text)]">
          {field.label}
          {field.type === "textarea" ? (
            <textarea
              name={String(field.name)}
              value={String(form[field.name] ?? "")}
              onChange={onChange}
              required={field.required}
              placeholder={field.placeholder}
              className="border border-[var(--global-color-border)] bg-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--global-color-accent)] text-base shadow-sm text-[var(--global-color-text)] placeholder-gray-400"
            />
          ) : (
            <input
              name={String(field.name)}
              type={field.type}
              value={String(form[field.name] ?? "")}
              onChange={onChange}
              required={field.required}
              placeholder={field.placeholder}
              className="border border-[var(--global-color-border)] bg-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--global-color-accent)] text-base shadow-sm text-[var(--global-color-text)] placeholder-gray-400"
            />
          )}
        </label>
      ))}
      {error && <div className="text-red-600 font-medium">{error}</div>}
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-[var(--global-color-accent)] hover:brightness-90 text-[var(--global-color-bg)] font-semibold px-4 py-2 rounded-xl shadow">
          {editingId ? "Save" : "Add"}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-xl shadow">
          Cancel
        </button>
      </div>
    </form>
  );
}
