import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, name, logoUrl, description } = body;

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    return NextResponse.json({ error: "Missing GitHub token" }, { status: 500 });
  }

  const response = await fetch(
    "https://api.github.com/repos/ab-internal/ab-app-brands/actions/workflows/brands-api.yml/dispatches",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: "develop",
        inputs: { 
          id: String(id), 
          name, 
          logoUrl, 
          description, 
          operation: body.operation 
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();

    return NextResponse.json({
      error: err
    }, { 
      status: response.status 
    });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const githubTokenLength = process.env.GITHUB_TOKEN?.length ?? 0;
  return NextResponse.json({ githubTokenLength });
}

