import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return new NextResponse("No file uploaded", { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const uploadDir = join(process.cwd(), "public", "uploads");
        console.log("DEBUG: Upload directory =", uploadDir);

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${uniqueSuffix}-${cleanFileName}`;
        const filePath = join(uploadDir, filename);
        console.log("DEBUG: Writing file to =", filePath);

        await writeFile(filePath, buffer);
        console.log("DEBUG: File written successfully");

        const url = `/uploads/${filename}`;

        return NextResponse.json({
            url,
            filename: file.name,
            mimeType: file.type,
            size: file.size
        });
    } catch (error) {
        console.error("Upload error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
