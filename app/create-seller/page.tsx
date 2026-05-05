import type { Metadata } from "next";
import CreateSellerForm from "@/components/CreateSellerForm";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Create a Seller Profile",
  description:
    "Create a Cheaper seller profile with local pickup details, seller bio, and profile image for trusted local listings.",
  path: "/create-seller",
  robotsIndex: false,
});

export default function CreateSellerPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Create a Seller Profile", path: "/create-seller" },
        ])}
      />
      <CreateSellerForm />
    </>
  );
}
