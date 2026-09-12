"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home", key: "home" },
  { href: "/enhance", label: "Platform", key: "platform" },
  { href: "/#technology", label: "Technology", key: "technology" },
  { href: "/#use-cases", label: "Use cases", key: "use-cases" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(pathname === "/enhance" ? "platform" : "home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (pathname === "/") {
      const sections = ["technology", "use-cases"]
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => Boolean(section));
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (visible) setActive(visible.target.id);
          else if (window.scrollY < 240) setActive("home");
        },
        { rootMargin: "-18% 0px -58%", threshold: [0.1, 0.35, 0.7] },
      );
      sections.forEach((section) => observer.observe(section));
      return () => {
        observer.disconnect();
        window.removeEventListener("scroll", onScroll);
      };
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <div className={`nav-frame ${scrolled ? "nav-frame-scrolled" : ""}`}>
      <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={`nav-link ${active === link.key ? "nav-link-active" : ""}`} onClick={() => setActive(link.key)}>
            {link.label}
          </Link>
        ))}
        <Link href="/enhance" className="nav-cta">Launch workspace <ArrowUpRight data-icon="inline-end" /></Link>
      </nav>
      <button type="button" className="nav-menu-button md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <div className="mobile-nav md:hidden">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => { setActive(link.key); setOpen(false); }} className={`nav-link ${active === link.key ? "nav-link-active" : ""}`}>
              {link.label}
            </Link>
          ))}
          <Link href="/enhance" onClick={() => setOpen(false)} className="nav-cta">Launch workspace <ArrowUpRight data-icon="inline-end" /></Link>
        </div>
      )}
    </div>
  );
}
