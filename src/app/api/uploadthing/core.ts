import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
import sharp from "sharp";
import { db } from "@/db";
import { configuration } from "@/db/schema";
import { eq } from "drizzle-orm";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .input(z.object({ configId: z.string().optional() }))
    .middleware(async ({ input }) => {
      return { input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { configId } = metadata.input;

      const res = await fetch(file.url);
      const buffer = await res.arrayBuffer();

      const imgMetadata = await sharp(buffer).metadata();
      const { width, height } = imgMetadata;

      if (!configId) {
        const [newConfiguration] = await db
          .insert(configuration)
          .values({
            imageUrl: file.url,
            height: height || 500,
            width: width || 500,
          })
          .returning();

        return { configId: newConfiguration.id };
      } else {
        const [updatedConfiguration] = await db
          .update(configuration)
          .set({
            croppedImageUrl: file.url,
          })
          .where(eq(configuration.id, configId))
          .returning();

        if (!updatedConfiguration) {
          throw new Error(`Configuration with id ${configId} not found`);
        }

        return { configId: updatedConfiguration.id };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
