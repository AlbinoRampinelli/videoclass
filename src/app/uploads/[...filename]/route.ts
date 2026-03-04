import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { join, extname } from "path";
import { Readable } from "stream";

export const runtime = "nodejs";

const MIME_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  const { filename } = await params;
  const filePath = join(process.cwd(), "public", "uploads", ...filename);

  let stat: ReturnType<typeof statSync>;
  try {
    stat = statSync(filePath);
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ext = extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const fileSize = stat.size;
  const rangeHeader = req.headers.get("range");

  if (rangeHeader) {
    const parts = rangeHeader.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const stream = createReadStream(filePath, { start, end });
    const webStream = Readable.toWeb(stream) as ReadableStream;

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunkSize),
        "Content-Type": contentType,
      },
    });
  }

  const stream = createReadStream(filePath);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Length": String(fileSize),
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
    },
  });
}
