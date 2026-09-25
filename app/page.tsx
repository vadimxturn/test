import Link from "next/link";
import { getPosts } from "@/lib/posts";

const services = [
  {
    title: "Websites",
    copy: "Custom sites on Next.js, built to load fast, read clearly, and turn visitors into inquiries.",
  },
  {
    title: "Search",
    copy: "Pages structured for the terms your customers already use, with technical SEO baked in.",
  },
  {
    title: "Campaigns",
    copy: "Google and social campaigns aimed at leads, not vanity traffic.",
  },
];

export default function Home() {
  const posts = getPosts().slice(0, 3);

  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <p className="text-sm font-medium tracking-[0.16em] text-accent uppercase">
            Sacramento web design
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight tracking-tight sm:text-6xl">
            Websites that turn attention into customers.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Turn Media designs and builds marketing sites for local businesses. This project is the
            Next.js, TypeScript, and Tailwind foundation, ready to deploy on Vercel.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/blog" className="rounded-full bg-accent px-5 py-3 text-sm text-accent-ink">
              Read the blog
            </Link>
            <a
              href="https://turnxmedia.com"
              className="rounded-full border border-line px-5 py-3 text-sm"
            >
              Visit turnxmedia.com
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-3">
          {services.map((service) => (
            <div key={service.title}>
              <h2 className="font-serif text-2xl">{service.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{service.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl">From the blog</h2>
            <Link href="/blog" className="text-sm text-muted hover:text-foreground">
              All posts
            </Link>
          </div>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="block py-6">
                  <p className="text-xs tracking-[0.14em] text-muted uppercase">{post.brand}</p>
                  <h3 className="mt-2 text-xl">{post.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{post.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
