export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Turn Media · Sacramento</p>
        <a href="https://turnxmedia.com" className="hover:text-foreground">
          turnxmedia.com
        </a>
      </div>
    </footer>
  );
}
