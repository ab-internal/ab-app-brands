"use client";

import { DataManager, FieldDefinition } from "./DataManager";
import { Brand } from "./types";

const brandFieldDefs: FieldDefinition<Brand>[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "logoUrl", label: "Logo URL", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea", required: true },
];

const brandApi = {
  fetch: async () => {
    const res = await fetch("/api/brands-proxy");
    if (!res.ok) throw new Error("Failed to fetch brands");
    return res.json();
  },
  create: async (brand: Partial<Brand>) => {
    const res = await fetch("/api/brand-dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  ...brand,
  id: brand.id ?? Date.now().toString(),
  operation: "create"
}),
    });
    if (!res.ok) throw new Error("Failed to create brand");
    return res.json();
  },
  update: async (id: React.Key, brand: Partial<Brand>) => {
    const res = await fetch("/api/brand-dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...brand, operation: "edit" }),
    });
    if (!res.ok) throw new Error("Failed to update brand");
    return res.json();
  },
  delete: async (id: React.Key) => {
    const res = await fetch("/api/brand-dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, operation: "delete" }),
    });
    if (!res.ok) throw new Error("Failed to delete brand");
  },
};

export default function BrandManager() {
  return (
    <DataManager<Brand>
      entityName="Brand"
      fields={brandFieldDefs}
      api={brandApi}
      getRowId={(brand) => brand.id}
      initialForm={() => ({ name: "", logoUrl: "", description: "" })}
    />
  );
}