"use client";

import BrandManager from "./components/BrandManager";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { useState } from "react";

export default function Home() {
  const [theme, setTheme] = useState("");
  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 sm:px-8 gap-16 font-sans ${theme}`}
     style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>

      <div className="w-full flex justify-end mb-4">
        <ThemeSwitcher onChange={setTheme} />
      </div>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[var(--color-accent)] drop-shadow-sm">Brand Manager</h1>
        <BrandManager theme={theme} />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <span className="text-xs text-[var(--color-accent)]">v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
      </footer>
    </div>
  );
}

