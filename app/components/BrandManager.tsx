"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState
} from "react";

import { FieldDef, DataForm } from "./DataForm";
import DataTable from "./DataTable";
import { Brand } from "./types";

const brandFieldDefs: FieldDef<Omit<Brand, "id">>[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "logoUrl", label: "Logo URL", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea", required: true },
];

async function fetchBrandsJSON(): Promise<Brand[]> {
  let url: string;
  if (process.env.NEXT_STATIC_OUTPUT === 'true') {
    url = `https://raw.githubusercontent.com/ab-internal/ab-app-brands/develop/data/brands.json?ts=${Date.now()}`;
  } else {
    url = "/api/brands-proxy";
  }
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch brands.json");
  const data = await response.json();
  if (Array.isArray(data)) return data;
  throw new Error("brands.json is not an array");
}

export default function BrandManager() {
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState<Omit<Brand, "id">>({ name: "", logoUrl: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  useEffect(() => {
    fetchBrandsJSON()
      .then(setBrands)
      .catch((err) => console.error("Error loading brands.json:", err))
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({ name: "", logoUrl: "", description: "" });
    setEditingId(null);
    setError("");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.logoUrl.trim() || !validateUrl(form.logoUrl)) return setError("Valid Logo URL is required.");
    if (!form.description.trim()) return setError("Description is required.");

    if (editingId !== null) {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/brand-dispatch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...form, operation: "edit" }),
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        await fetchBrandsJSON().then(setBrands);
        resetForm();
      } catch (err) {
        setError("Failed to persist brand edit to GitHub. See console for details.");
        console.error("API error:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      setError("");
      const newBrand = { ...form, id: Date.now() };
      try {
        const response = await fetch("/api/brand-dispatch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newBrand, operation: "create" }),
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        await fetchBrands();
        resetForm();
      } catch (err) {
        setError("Failed to persist brand to GitHub. See console for details.");
        console.error("API error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (id: number) => {
    const brand = brands.find((b) => b.id === id);
    if (brand) {
      setForm({ name: brand.name, logoUrl: brand.logoUrl, description: brand.description });
      setEditingId(id);
      setError("");
    }
  };

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const brands = await fetchBrandsJSON();
      setBrands(brands);
    } catch (err) {
      console.error("Error loading brands.json:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingIds((prev) => [...prev, id]);
    setError("");
    try {
      const response = await fetch("/api/brand-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, operation: "delete" }),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      await fetchBrands();
      if (editingId === id) resetForm();
    } catch (err) {
      setError("Failed to delete brand. See console for details.");
      console.error("API error:", err);
    } finally {
      setDeletingIds((prev) => prev.filter((delId) => delId !== id));
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto gap-8 items-start justify-center">
      <DataForm
        form={form}
        fieldDefs={brandFieldDefs}
        editingId={editingId}
        error={error}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />
      <DataTable
        brands={brands}
        loading={loading}
        deletingIds={deletingIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}