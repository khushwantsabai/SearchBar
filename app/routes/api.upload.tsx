import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getOrCreateShop } from "../models/shop.server";
import prisma from "../db.server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shopData = await getOrCreateShop(session.shop);

  // 1. Plan eligibility check
  if (shopData.activePlan !== "ADVANCED") {
    return new Response(
      JSON.stringify({
        error: "Image upload is an exclusive feature of the Advanced Plan. Please upgrade to unlock custom images.",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return new Response(JSON.stringify({ error: "No image file provided." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. MIME type validation
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimeTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: "Invalid file type. Allowed formats: JPEG, PNG, WebP, GIF.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. File size validation (Max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({
          error: "File size exceeds 2MB limit. Please upload an image under 2MB.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Generate safe unique filename
    const ext = path.extname(file.name) || ".jpg";
    const storageKey = `${crypto.randomUUID()}${ext}`;

    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, storageKey);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${storageKey}`;

    // 5. Save record in database
    const asset = await prisma.uploadedAsset.create({
      data: {
        shopId: shopData.shop?.id || "",
        storageKey,
        publicUrl,
        contentType: file.type,
        fileSize: file.size,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        assetId: asset.id,
        publicUrl,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Failed to process image upload." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
