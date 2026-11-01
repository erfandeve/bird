import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { infoPages } from "@/lib/data/content";

type Props = { params: Promise<{ info: string }> };

export const generateStaticParams = () => Object.keys(infoPages).map((info) => ({ info }));

// محتوای کامل برای سئو مهم‌تر از ناوبری آنی با اسکلت خالی است
export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { info } = await params;
  const page = infoPages[info];
  if (!page) return {};
  return { title: page.title, description: page.description, alternates: { canonical: `/${info}` } };
}

export default async function InfoPage({ params }: Props) {
  const { info } = await params;
  const page = infoPages[info];
  if (!page) notFound();
  return (
    <div className="wrap">
      <Breadcrumbs items={[{ label: page.title }]} />
      <h1 className="font-display text-5xl font-bold text-olive-900 md:text-6xl">{page.title}</h1>
      <div className="prose-fa mt-5">
        {page.sections.map((section, i) => (
          <section key={i}>
            {section.heading && <h2>{section.heading}</h2>}
            {section.paragraphs.map((text) => <p key={text}>{text}</p>)}
          </section>
        ))}
      </div>
    </div>
  );
}
