import { db } from "@/db";
import { notFound } from "next/navigation";
import DesignPreview from "./DesignPreview";
import { eq } from "drizzle-orm";
import { configuration } from "@/db/schema";

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

  console.log({ config });

  if (!config) {
    return notFound();
  }

  return <DesignPreview configuration={config} />;
};

export default Page;
