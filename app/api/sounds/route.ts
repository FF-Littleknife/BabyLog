import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const AUDIO_EXTENSIONS = new Set([".mp3", ".m4a", ".wav", ".ogg", ".aac"]);

function titleFromFilename(filename: string) {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/^\d+\s*[-_—–]\s*/, "");
}

export async function GET() {
  const soundsDir = path.join(process.cwd(), "public", "sounds");

  try {
    if (!fs.existsSync(soundsDir)) {
      return NextResponse.json(
        { sounds: [] },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const files = fs
      .readdirSync(soundsDir)
      .filter((filename) => {
        const ext = path.extname(filename).toLowerCase();
        return AUDIO_EXTENSIONS.has(ext);
      })
      .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

    const sounds = files.map((filename) => ({
      id: filename,
      title: titleFromFilename(filename),
      src: `/sounds/${encodeURIComponent(filename)}`,
    }));

    return NextResponse.json(
      { sounds },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { sounds: [] },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}