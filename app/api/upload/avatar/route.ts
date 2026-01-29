import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Updated import

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Create a unique filename: user-id-timestamp.ext
        const filename = `avatar-${user.id}-${Date.now()}${path.extname(file.name)}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);

        const avatarUrl = `/uploads/avatars/${filename}`;

        // Update user profile in DB
        await prisma.user.update({
            where: { id: user.id },
            data: { avatar: avatarUrl },
        });

        return NextResponse.json({ success: true, avatarUrl });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
