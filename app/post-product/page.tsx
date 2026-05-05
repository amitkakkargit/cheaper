import type { Metadata } from "next";
import PostProductForm from "@/components/PostProductForm";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Post a Product",
  description:
    "Create a local product listing on Cheaper with price, condition, category, seller, and pickup location details.",
  path: "/post-product",
  robotsIndex: false,
});

export default function PostProductPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Post a Product", path: "/post-product" },
        ])}
      />
      <PostProductForm />
    </>
  );
}
