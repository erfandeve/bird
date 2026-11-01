import Link from "next/link";
import { faNum } from "@/lib/format";
import type { Post } from "@/lib/types";

export function PostCard({ post, large = false }: { post: Post; large?: boolean }) {
  return (
    <article className="border-t border-olive-300 pt-4">
      <h3 className={`font-display leading-tight font-semibold text-olive-900 ${large ? "text-4xl" : "text-[1.75rem]"}`}>
        <Link href={`/blog/${post.slug}`} className="hover:text-olive-600">{post.title}</Link>
      </h3>
      <p className="mt-2 leading-7 text-olive-800">{post.excerpt}</p>
      <p className="mt-2 text-xs text-olive-700">مطالعه در {faNum(post.readMinutes)} دقیقه</p>
    </article>
  );
}
