import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getDefaultTenantContext } from "@/lib/default-tenant";
import { requireApiPermission } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

// Configuración Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function hasSupportedImageSignature(buffer: Buffer, type: string) {
  if (type === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === "image/png") return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === "image/webp") return buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const unauthorized = await requireApiPermission("product.create"); if (unauthorized) return unauthorized;
    const { businessId, membershipId, userId } = await getDefaultTenantContext();
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: "Solo se permiten imágenes JPEG, PNG o WEBP." }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no puede superar 5 MB." }, { status: 400 });
    }

    // Convertimos el archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (!hasSupportedImageSignature(buffer, file.type)) {
      return NextResponse.json({ error: "El archivo no contiene una imagen válida." }, { status: 400 });
    }

    // Subimos a Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `business/${businessId}/products`, resource_type: "image", allowed_formats: ["jpg", "jpeg", "png", "webp"] },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });
    await writeAuditLog(prisma, { businessId, actorUserId: userId, actorMembershipId: membershipId, action: "product.image.upload", entityType: "Upload", metadata: { mimeType: file.type, size: file.size } });

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ error: "No fue posible cargar la imagen." }, { status: 500 });
  }
}
