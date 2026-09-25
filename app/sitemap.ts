import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts().map((post) => ({
    url: `https://turnxmedia.com/blog/${post.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: "https://turnxmedia.com", changeFrequency: "weekly", priority: 1 },
    { url: "https://turnxmedia.com/blog", changeFrequency: "weekly", priority: 0.8 },
    ...posts,
  ];
}
