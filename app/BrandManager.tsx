"use client";
import React, { useState } from "react";

interface Brand {
  id: number;
  name: string;
  logoUrl: string;
  description: string;
}

export default function BrandManager() {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    fetch("https://raw.githubusercontent.com/ab-internal/ab-app-brands/refs/heads/develop/data/brands.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch brands.json");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setBrands(data);
      })
      .catch((err) => {
        console.error("Error loading brands.json:", err);
      })
      .finally(() => setLoading(false));
  }, []);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState<Omit<Brand, "id">>({
    name: "",
    logoUrl: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const resetForm = () => {
    setForm({ name: "", logoUrl: "", description: "" });
    setEditingId(null);
    setError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.logoUrl.trim() || !validateUrl(form.logoUrl)) {
      setError("Valid Logo URL is required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }
    if (editingId !== null) {
      setBrands((prev) =>
        prev.map((b) => (b.id === editingId ? { ...b, ...form } : b))
      );
      resetForm();
    } else {
      setLoading(true);
      setError("");
      const newBrand = { ...form, id: Date.now() };
      try {
        const res = await fetch("/api/brand-dispatch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: newBrand.id,
            name: newBrand.name,
            logoUrl: newBrand.logoUrl,
            description: newBrand.description,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(`API error: ${res.status} ${JSON.stringify(err)}`);
        }
        setBrands((prev) => [...prev, newBrand]);
        resetForm();
      } catch (err: any) {
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

  const handleDelete = (id: number) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    if (editingId === id) resetForm();
  };

  return (
    <div className="flex w-full max-w-5xl mx-auto gap-8">
      {/* Form */}
      <form
        className="flex flex-col gap-4 w-full max-w-xs bg-white dark:bg-gray-800 shadow p-6 rounded"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-semibold mb-2">{editingId ? "Edit Brand" : "Add Brand"}</h2>
        <label className="flex flex-col gap-1">
          Name
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            className="border px-2 py-1 rounded"
            placeholder="Brand Name"
          />
        </label>
        <label className="flex flex-col gap-1">
          Logo URL
          <input
            name="logoUrl"
            type="url"
            value={form.logoUrl}
            onChange={handleChange}
            required
            pattern="https?://.+"
            className="border px-2 py-1 rounded"
            placeholder="https://example.com/logo.png"
          />
        </label>
        <label className="flex flex-col gap-1">
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="border px-2 py-1 rounded min-h-[60px]"
            placeholder="Brand Description"
          />
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            {editingId ? "Update" : "Add"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      {/* Table */}
      <div className="flex-1 relative">
        {/* Spinner overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <table className="w-full bg-white dark:bg-gray-800 shadow rounded">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="p-2 text-left">Logo</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  No brands yet.
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id}>
                  <td className="p-2 border-b">
                    <img src={brand.logoUrl} alt={brand.name} className="h-8 w-8 object-contain" />
                  </td>
                  <td className="p-2 border-b font-semibold">{brand.name}</td>
                  <td className="p-2 border-b">{brand.description}</td>
                  <td className="p-2 border-b flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(brand.id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(brand.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
