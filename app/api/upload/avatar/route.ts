import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
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

        // Sanitize filename: remove special chars and spaces
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `avatar-${user.id}-${Date.now()}-${cleanFileName}`;

        const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");

        console.log("DEBUG: Avatar upload started for user:", user.id);
        console.log("DEBUG: Target filename:", filename);

        try {
            await mkdir(uploadDir, { recursive: true });
            console.log("DEBUG: Created/verified upload directory:", uploadDir);
        } catch (dirError) {
            console.error("DEBUG: Failed to create upload directory:", dirError);
            throw dirError;
        }

        const filePath = path.join(uploadDir, filename);
        console.log("DEBUG: Writing avatar to:", filePath);

        await writeFile(filePath, buffer);
        console.log("DEBUG: File written successfully");

        const avatarUrl = `/uploads/avatars/${filename}`;

        // Update user profile in DB
        await prisma.user.update({
            where: { id: user.id },
            data: { avatar: avatarUrl },
        });

        console.log("DEBUG: User profile updated with avatar URL:", avatarUrl);

        return NextResponse.json({ success: true, avatarUrl });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
