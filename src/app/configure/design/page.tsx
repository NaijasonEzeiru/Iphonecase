import { db } from "@/db";
import { notFound } from "next/navigation";
import DesignConfigurator from "./DesignConfigurator";
import { configuration } from "@/db/schema";
import { eq } from "drizzle-orm";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const { id } = searchParams;

  if (!id || typeof id !== "string") {
    return notFound();
  }

  const config = await db.query.configuration.findFirst({
    where: eq(configuration.id, id),
  });

  if (!config) {
    return notFound();
  }

  const { imageUrl, width, height } = config;

  return (
    <DesignConfigurator
      configId={config.id}
      imageDimensions={{ width, height }}
      imageUrl={imageUrl}
    />
  );
};

export default Page;
