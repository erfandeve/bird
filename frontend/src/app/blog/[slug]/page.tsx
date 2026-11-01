import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/layout/JsonLd";
import { getPost, getPosts } from "@/lib/catalog";
import { faDate, faNum } from "@/lib/format";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

// محتوای کامل برای سئو مهم‌تر از ناوبری آنی با اسکلت خالی است
export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.date, url: `/blog/${slug}` },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <div className="wrap">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          inLanguage: "fa-IR",
          publisher: { "@type": "Organization", name: site.name, url: site.url },
          mainEntityOfPage: `${site.url}/blog/${post.slug}`,
        }}
      />
      <Breadcrumbs items={[{ href: "/blog", label: "راهنمای نگهداری" }, { label: post.title }]} />
      <article className="mx-auto max-w-[70ch] pt-2">
        <h1 className="font-display text-5xl leading-tight font-bold text-olive-900">{post.title}</h1>
        <p className="mt-3 text-sm text-olive-700">
          <time dateTime={post.date}>{faDate(post.date)}</time> · مطالعه در {faNum(post.readMinutes)} دقیقه
        </p>
        <div className="prose-fa mt-6">
          {post.body.map((section, i) => (
            <section key={i}>
              {section.heading && <h2>{section.heading}</h2>}
              {section.paragraphs.map((text) => <p key={text}>{text}</p>)}
            </section>
          ))}
        </div>
        <Link href="/shop" className="btn btn-primary mt-4">دیدن محصولات</Link>
      </article>
    </div>
  );
}
