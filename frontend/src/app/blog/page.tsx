import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PostCard } from "@/components/home/PostCard";
import { getPosts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "راهنمای نگهداری پرنده",
  description: "مقاله‌های کاربردی دربارهٔ تغذیه، قفس و سرگرمی پرندگان خانگی.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <div className="wrap">
      <Breadcrumbs items={[{ label: "راهنمای نگهداری" }]} />
      <h1 className="mb-8 font-display text-5xl font-bold text-olive-900 md:text-6xl">راهنمای نگهداری</h1>
      <div className="grid gap-8 md:grid-cols-2">
        {posts.map((post) => <PostCard key={post.slug} post={post} large />)}
      </div>
    </div>
  );
}
