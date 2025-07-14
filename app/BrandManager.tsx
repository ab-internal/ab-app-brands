"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect, 
  useState 
} from "react";

import Image from "next/image";

interface Brand {
  id          : number;
  name        : string;
  logoUrl     : string;
  description : string;
}

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
  const [brands, setBrands]   = useState<Brand[]>([]);

  useEffect(() => {
    
    fetchBrandsJSON()
      .then(setBrands)
      .catch((err) => {
        console.error("Error loading brands.json:", err);
      })
      .finally(() => setLoading(false));

  }, []);

  const [form, setForm] = useState<Omit<Brand, "id">>({
    name: "",
    logoUrl: "",
    description: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError]         = useState<string>("");

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
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/brand-dispatch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingId,
            name: form.name,
            logoUrl: form.logoUrl,
            description: form.description,
            operation: "edit"
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(`API error: ${response.status} ${JSON.stringify(err)}`);
        }
        await fetchBrandsJSON().then(setBrands);
        resetForm();
      } catch (err: unknown) {
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: newBrand.id,
            name: newBrand.name,
            logoUrl: newBrand.logoUrl,
            description: newBrand.description,
            operation: "create"
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(`API error: ${response.status} ${JSON.stringify(err)}`);
        }
        await fetchBrands();
        resetForm();

      } catch (err: unknown) {
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

  const [deletingIds, setDeletingIds] = useState<number[]>([]);

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

      if (!response.ok) {
        const err = await response.json();
        throw new Error(`API error: ${response.status} ${JSON.stringify(err)}`);
      }

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
    <div className="flex w-full max-w-5xl mx-auto gap-8">
      {/* Form */}
      <form
        className="flex flex-col gap-4 w-full max-w-xs bg-white dark:bg-gray-800 shadow p-6 rounded"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-semibold mb-2">{editingId ? "Edit Brand" : "Add Brand"}</h2>
        <label className="flex flex-col gap-1">
          Name <input
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
          Logo URL <input
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
          Description <textarea
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
                <tr key={brand.id} className="relative">
                  <td className="p-2 border-b">
                    <Image src={brand.logoUrl} alt={brand.name} width={32} height={32} className="h-8 w-8 object-contain" />
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
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 relative"
                      disabled={deletingIds.includes(brand.id)}
                    >
                      {deletingIds.includes(brand.id) ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
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
    </div>
  );
}
