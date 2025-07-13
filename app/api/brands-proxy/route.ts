import { NextResponse } from "next/server";

import * as git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import fs from "fs/promises";
import path from "path";

export async function GET() {

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    console.log("[brands-proxy] Warning: GITHUB_TOKEN not found; cloning public repo unauthenticated.");
  }

  const tmpDir      = "/tmp/brands-proxy";
  const repoUrl     = "https://github.com/ab-internal/ab-app-brands.git";
  const branch      = "develop";
  const filePath    = "data/brands.json";

  await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  await fs.mkdir(tmpDir, { recursive: true });

  await git.clone({
    fs,
    http,
    dir: tmpDir,
    url: repoUrl,
    ref: branch,
    singleBranch: true,
    depth: 1,
    onAuth: GITHUB_TOKEN ? () => (
      { username: GITHUB_TOKEN, password: "x-oauth-basic" }
    ) : undefined,
    noTags: true,
  });

  let brands;
  try {
    const brandsRaw = await fs.readFile(path.join(tmpDir, filePath), "utf8");
    brands = JSON.parse(brandsRaw);
  } catch (err) {
    console.error("Error parsing brands.json from isomorphic-git:", err);
    return NextResponse.json({
      error: "brands.json not found or invalid (isomorphic-git)" 
    }, { 
      status: 500 
    });
  }

  return new NextResponse(JSON.stringify(brands), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    }
  });
}
