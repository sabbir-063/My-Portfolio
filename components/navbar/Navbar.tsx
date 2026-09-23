"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AppIcon from "@/components/ui/AppIcon";
import NavLogo from "./NavLogo";
import { navLinks, contactLink, type NavLink } from "./navLinks";
import { useActiveSection } from "./useActiveSection";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  onThemeToggle: (e: React.MouseEvent) => void;
  isDark: boolean;
}

function sectionId(href: string): string {
  return href.split("#")[1] ?? "";
}

export default function Navbar({ onThemeToggle, isDark }: NavbarProps) {
  const active = useActiveSection();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile nav on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, link: NavLink) => {
      const id = sectionId(link.href);
      if (!id || !isHome) return; // let browser navigate to /#hash on other pages
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        history.pushState(null, "", `#${id}`);
      }
      setMobileOpen(false);
    },
    [isHome]
  );

  function isActiveLink(link: NavLink): boolean {
    if (!isHome) return link.isPage ? pathname === link.href : false;
    return active === sectionId(link.href);
  }

  const allLinks = [...navLinks, contactLink];

  const linkClass = (link: NavLink) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-full transition-all group text-[11px] font-semibold uppercase tracking-tight whitespace-nowrap ${
      isActiveLink(link)
        ? "bg-black/[0.06] dark:bg-white/5 text-primary"
        : "text-on-surface-variant hover:bg-black/[0.06] dark:hover:bg-white/5 hover:text-primary"
    }`;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-6 left-0 right-0 z-[60] px-6 md:px-16 lg:px-24"
    >
      <div className="max-w-6xl mx-auto">
        <nav
          className={`glass-panel rounded-full px-5 py-2.5 flex items-center justify-between text-sm font-headline transition-shadow duration-300 ${
            scrolled ? "shadow-[0_4px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]" : ""
          }`}
          style={{ backdropFilter: "blur(56px)", WebkitBackdropFilter: "blur(56px)" }}
        >
          <NavLogo />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {allLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleClick(e, link)}
                className={linkClass(link)}
              >
                <AppIcon name={link.icon} className="text-[18px] shrink-0 group-hover:text-glow" />
                <span className="hidden lg:inline">{link.label}</span>
              </a>
            ))}
          </div>

          {/* Right: theme toggle + mobile burger */}
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-full text-on-surface-variant hover:bg-black/[0.06] dark:hover:bg-white/5 transition-all"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <AppIcon name={mobileOpen ? "close" : "menu"} className="text-[20px]" />
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 glass-panel rounded-2xl px-3 py-3 flex flex-col gap-1"
              style={{ backdropFilter: "blur(56px)", WebkitBackdropFilter: "blur(56px)" }}
            >
              {allLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[11px] font-semibold uppercase tracking-tight ${
                    isActiveLink(link)
                      ? "bg-black/[0.06] dark:bg-white/5 text-primary"
                      : "text-on-surface-variant hover:bg-black/[0.06] dark:hover:bg-white/5 hover:text-primary"
                  }`}
                >
                  <AppIcon name={link.icon} className="text-[18px] shrink-0" />
                  {link.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
