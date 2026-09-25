import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing on websites, lead generation, and construction marketing.",
};

export default function BlogPage() {
  const posts = getPosts();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-serif text-5xl">Blog</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Drafts and published pieces for Turn Media and IMKAT Homes.
      </p>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="block py-6">
              <p className="text-xs tracking-[0.14em] text-muted uppercase">{post.brand}</p>
              <h2 className="mt-2 text-2xl">{post.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
