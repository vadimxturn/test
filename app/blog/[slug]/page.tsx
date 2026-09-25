import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts, renderMarkdown } from "@/lib/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return {};
  }

  return {
    title: post.seoTitle,
    description: post.description,
    keywords: post.keywords,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    notFound();
  }

  const html = await renderMarkdown(post.body);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/blog" className="text-sm text-muted hover:text-foreground">
        Back to blog
      </Link>
      <p className="mt-8 text-xs tracking-[0.14em] text-muted uppercase">{post.brand}</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{post.title}</h1>
      <p className="mt-4 text-lg leading-8 text-muted">{post.description}</p>
      <div className="prose prose-neutral mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
