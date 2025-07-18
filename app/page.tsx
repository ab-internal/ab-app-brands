"use client";

import BrandManager from "./BrandManager";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fdf6e3] py-12 px-4 sm:px-8 gap-16 font-sans">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[#3b2f1e] drop-shadow-sm">Brand Manager</h1>
        <BrandManager />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <span className="text-xs text-gray-500">v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
      </footer>
    </div>
  );
}

