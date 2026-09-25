import fs from "fs";
import path from "path";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");
const NOTES_HEADING = /^## (Internal Linking|Image Suggestions|Word Count)/m;

export type Post = {
  slug: string;
  seoTitle: string;
  title: string;
  description: string;
  keywords: string[];
  brand: "Turn Media" | "IMKAT Homes";
  body: string;
};

function readField(source: string, label: string): string | undefined {
  const match = source.match(new RegExp(`\\*\\*${label}[^*]*\\*\\*\\s*\\n([^\\n]+)`));
  return match?.[1].trim();
}

function parsePost(filename: string, source: string): Post {
  const heading = source.match(/^# (.+)$/m);
  const slugField = source.match(/\*\*Slug:\*\*\s*\/?([^/\s]+)\/?/);
  const target = source.match(/\*\*Target Keywords?:\*\*\s*(.+)/);
  const secondary = source.match(/\*\*Secondary Keywords:\*\*\s*(.+)/);
  const titleStart = source.search(/^# /m);
  let body = titleStart >= 0 ? source.slice(titleStart).replace(/^# .+\n+/, "") : source;
  const notesAt = body.search(NOTES_HEADING);
  if (notesAt >= 0) {
    body = body.slice(0, notesAt).trim();
  }

  const keywords = [target?.[1], secondary?.[1]]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(",").map((keyword) => keyword.trim()))
    .filter(Boolean);

  return {
    slug: slugField?.[1] ?? filename.replace(/\.md$/, ""),
    seoTitle: readField(source, "SEO Title") ?? heading?.[1] ?? filename,
    title: heading?.[1]?.trim() ?? filename,
    description: readField(source, "Meta Description") ?? "",
    keywords,
    brand: filename.startsWith("imkat") ? "IMKAT Homes" : "Turn Media",
    body: body.trim(),
  };
}

export function getPosts(): Post[] {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => parsePost(filename, fs.readFileSync(path.join(CONTENT_DIR, filename), "utf8")))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((post) => post.slug === slug);
}

export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await remark().use(remarkGfm).use(remarkHtml).process(markdown);
  return String(file);
}
