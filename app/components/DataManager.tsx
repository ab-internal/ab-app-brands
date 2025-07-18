"use client";
import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { DataForm } from "./DataForm";
import { DataTable } from "./DataTable";

export type FieldDefinition<T> = {
  name: keyof T;
  label: string;
  type?: "number" | "text" | "textarea" | "password" | "email" | "url";
  required?: boolean;
  placeholder?: string;
};

export interface DataManagerProps<T extends Record<string, unknown>> {
  readonly entityName: string;
  readonly fields: readonly FieldDefinition<T>[];
  readonly api: {
    fetch: () => Promise<T[]>;
    create: (item: Partial<T>) => Promise<T>;
    update: (id: React.Key, item: Partial<T>) => Promise<T>;
    delete: (id: React.Key) => Promise<void>;
  };
  readonly getRowId: (item: T) => React.Key;
  readonly initialForm: () => Partial<T>;
}

export function DataManager<T extends Record<string, unknown>>({
  entityName,
  fields,
  api,
  getRowId,
  initialForm,
}: DataManagerProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [form, setForm] = useState<Partial<T>>(initialForm());
  const [editingId, setEditingId] = useState<React.Key | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<React.Key[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.fetch()
      .then(setItems)
      .catch(() => setError(`Failed to load ${entityName.toLowerCase()}s.`))
      .finally(() => setLoading(false));
  }, [api, entityName]);

  const resetForm = () => {
    setForm(initialForm());
    setEditingId(null);
    setError("");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Simple required validation
    for (const field of fields) {
      if (field.required && !(form[field.name] as string)?.trim()) {
        setError(`${field.label} is required.`);
        return;
      }
    }
    setLoading(true);
    setError("");
    try {
      if (editingId !== null) {
        await api.update(editingId, form);
      } else {
        await api.create(form);
      }
      const freshItems = await api.fetch();
      setItems(freshItems);
      resetForm();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to save ${entityName.toLowerCase()}: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: React.Key) => {
    // Ensure editingId is string | number | null
    if (typeof id === "bigint") {
      setEditingId(id.toString());
    } else {
      setEditingId(id);
    }
    const item = items.find((i) => getRowId(i) === id);
    if (item) {
      setForm(item);
      setError("");
    }
  };

  const handleDelete = async (id: React.Key) => {
    setDeletingIds((prev) => [...prev, id]);
    setError("");
    try {
      await api.delete(id);
      const freshItems = await api.fetch();
      setItems(freshItems);
      if (editingId === id) resetForm();
    } catch {
      setError(`Failed to delete ${entityName.toLowerCase()}.`);
    } finally {
      setDeletingIds((prev) => prev.filter((d) => d !== id));
    }
  };

  return (
    <div className="flex gap-8 items-start min-h-[500px]">
      <div>
        <DataForm<T>
          form={form}
          fields={fields}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          editingId={typeof editingId === "bigint" ? editingId.toString() : editingId}
          error={error}
        />
      </div>
      <div className="flex-1">
        <DataTable<T>
          items={items}
          loading={loading}
          deletingIds={deletingIds}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getRowId={getRowId}
        />
      </div>
    </div>
  );
}
