import { NextResponse } from "next/server";
import { getDownloadUrl } from "@vercel/blob";

const BLOB_URL =
  "https://w3tefip0msacfu96.private.blob.vercel-storage.com/tutorial.mov";

export async function GET() {
  try {
    const downloadUrl = await getDownloadUrl(BLOB_URL, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.redirect(downloadUrl);
  } catch {
    return NextResponse.json(
      { error: "Video unavailable" },
      { status: 500 }
    );
  }
}
