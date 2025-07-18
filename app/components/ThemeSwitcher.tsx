import { useState } from "react";

const THEMES = [
  { value: "", label: "Default" },
  { value: "theme-financial", label: "Financial" },
  { value: "theme-orders", label: "Orders" },
  { value: "theme-logistics", label: "Logistics" },
  { value: "theme-product", label: "Product" },
  { value: "theme-master-data", label: "Master Data" },
  { value: "theme-sales", label: "Sales" },
  { value: "theme-billing", label: "Billing" },
  { value: "theme-marketing", label: "Marketing" },
];

interface ThemeSwitcherProps {
  readonly onChange?: (theme: string) => void;
}

export function ThemeSwitcher({ onChange }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState("");

  function handleThemeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setTheme(e.target.value);
    document.documentElement.className = e.target.value;
    if (onChange) onChange(e.target.value);
  }

  return (
    <select
      value={theme}
      onChange={handleThemeChange}
      className="p-2 rounded border bg-[var(--color-bg)] text-[var(--color-text)]"
      aria-label="Switch theme"
    >
      {THEMES.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
