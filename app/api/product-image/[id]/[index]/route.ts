import { getGeneratedProductImageSvg } from "@/lib/api";

interface ProductImageRouteProps {
  params: Promise<{
    id: string;
    index: string;
  }>;
}

export async function GET(_request: Request, { params }: ProductImageRouteProps) {
  const { id, index } = await params;
  const imageIndex = Number(index);
  const svg = Number.isInteger(imageIndex)
    ? getGeneratedProductImageSvg(id, imageIndex)
    : null;

  if (!svg) {
    return new Response("Image not found", { status: 404 });
  }

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
