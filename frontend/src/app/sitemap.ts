import type { MetadataRoute } from "next";
import { getSlugs } from "@/lib/catalog";
import { infoPages } from "@/lib/data/content";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getSlugs();
  const paths = [
    "",
    "/shop",
    "/blog",
    "/faq",
    "/contact",
    ...slugs.category.map((slug) => `/category/${slug}`),
    ...slugs.bird.map((slug) => `/bird/${slug}`),
    ...slugs.product.map((slug) => `/product/${slug}`),
    ...slugs.blog.map((slug) => `/blog/${slug}`),
    ...Object.keys(infoPages).map((key) => `/${key}`),
  ];
  return paths.map((path) => ({ url: `${site.url}${path}` }));
}
