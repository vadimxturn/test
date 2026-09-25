import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-sm font-semibold tracking-[0.18em] uppercase">
          Turn Media
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <a
            href="https://turnxmedia.com"
            className="rounded-full bg-foreground px-4 py-2 text-background"
          >
            Start a project
          </a>
        </nav>
      </div>
    </header>
  );
}
