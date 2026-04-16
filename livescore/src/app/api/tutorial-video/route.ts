import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

const BLOB_URL =
  "https://w3tefip0msacfu96.private.blob.vercel-storage.com/tutorial.mov";

export async function GET() {
  try {
    const result = await get(BLOB_URL, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!result) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", result.blob.contentType || "video/quicktime");
    if (result.blob.size) {
      headers.set("Content-Length", String(result.blob.size));
    }
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(result.stream, { status: 200, headers });
  } catch {
    return NextResponse.json(
      { error: "Video unavailable" },
      { status: 500 }
    );
  }
}
