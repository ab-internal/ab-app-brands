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
    <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto gap-8 items-start justify-center">
      {/* Form */}
      <form
        className="flex flex-col gap-5 w-full max-w-xs bg-yellow-50 shadow-lg rounded-2xl p-8 border border-yellow-100"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-3 text-yellow-700 tracking-tight drop-shadow">{editingId ? "Edit Brand" : "Add Brand"}</h2>
        <label className="flex flex-col gap-1 text-gray-900">
          Name
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
              onClick={resetForm}
              className="bg-yellow-200 text-[#7c6a3c] text-lg font-semibold px-8 py-2 rounded-full shadow hover:bg-yellow-200 hover:text-yellow-700 transition-colors"
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
                      onClick={() => handleEdit(brand.id)}
                      className="bg-[#ffe082] text-[#7c6a3c] font-semibold px-5 py-1.5 rounded-full shadow hover:bg-yellow-200 hover:text-yellow-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(brand.id)}
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
    </div>
  );
}
