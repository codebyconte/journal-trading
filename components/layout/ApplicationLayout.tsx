"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Calculator,
  Eye,
  ListOrdered,
  BarChart3,
  BookOpen,
  Settings,
  Shield,
  Library,
  Zap,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  Navbar,
  NavbarSection,
  NavbarSpacer,
} from "@/components/catalyst/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from "@/components/catalyst/sidebar";
import { SidebarLayout } from "@/components/catalyst/sidebar-layout";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Mon prochain progrès", icon: LayoutDashboard },
  { href: "/trades", label: "Mes trades", icon: ListOrdered },
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/risk", label: "Gestion du risque", icon: Calculator },
  { href: "/performance", label: "Capital & résultats", icon: TrendingUp },
  { href: "/analytics", label: "Analyses", icon: BarChart3 },
  { href: "/journal", label: "Journal de marché", icon: BookOpen },
  { href: "/progress", label: "Ma progression", icon: Target },
  { href: "/protocol", label: "Laboratoire", icon: Shield },
  { href: "/sources", label: "Sources & références", icon: Library },
  { href: "/settings", label: "Paramètres", icon: Settings },
] as const;

function getSession() {
  const h = new Date().getUTCHours();
  if (h >= 13 && h < 16)
    return {
      label: "LDN/NY · indicatif",
      color: "text-emerald-400",
      dot: "bg-emerald-400",
    };
  if (h >= 13 && h < 22)
    return {
      label: "NY · indicatif",
      color: "text-indigo-400",
      dot: "bg-indigo-400",
    };
  if (h >= 7 && h < 16)
    return {
      label: "LDN · indicatif",
      color: "text-emerald-400",
      dot: "bg-emerald-400",
    };
  if (h >= 0 && h < 9)
    return { label: "Asie", color: "text-amber-400", dot: "bg-amber-400" };
  return { label: "Hors session", color: "text-zinc-400", dot: "bg-zinc-600" };
}

interface ApplicationLayoutProps {
  children: React.ReactNode;
  currentCapital?: number;
}

export function ApplicationLayout({
  children,
  currentCapital,
}: ApplicationLayoutProps) {
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [session, setSession] = useState({
    label: "Horaires indicatifs UTC",
    color: "text-zinc-400",
    dot: "bg-zinc-600",
  });

  useEffect(() => {
    const tick = () => {
      setTime(
        new Intl.DateTimeFormat("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      );
      setSession(getSession());
    };
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);

  const sidebarContent = (
    <Sidebar className="bg-zinc-950 ring-1 ring-white/10 lg:bg-zinc-950">
      <SidebarHeader>
        <SidebarItem href="/">
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-600">
            <Zap
              data-slot="icon"
              className="size-4 fill-white text-white"
              aria-hidden="true"
            />
          </span>
          <SidebarLabel>
            <span className="block font-bold" translate="no">
              TradingLog
            </span>
            <span className="block text-[10px] font-normal tracking-wide text-zinc-400">
              RECHERCHE & PROGRESSION
            </span>
          </SidebarLabel>
        </SidebarItem>
      </SidebarHeader>

      <SidebarBody>
        {[
          { title: "Progresser", paths: ["/", "/progress"] },
          {
            title: "Observer & décider",
            paths: ["/journal", "/watchlist", "/trades", "/risk"],
          },
          {
            title: "Mesurer & rechercher",
            paths: ["/analytics", "/performance", "/protocol", "/sources"],
          },
          { title: "Mon espace privé", paths: ["/settings"] },
        ].map((group) => (
          <SidebarSection key={group.title}>
            <SidebarHeading>{group.title}</SidebarHeading>
            {group.paths
              .map((path) => navItems.find((n) => n.href === path)!)
              .map(({ href, label, icon: Icon }) => (
                <SidebarItem key={href} href={href} current={pathname === href}>
                  <Icon
                    data-slot="icon"
                    className="size-5"
                    strokeWidth={1.75}
                  />
                  <SidebarLabel>{label}</SidebarLabel>
                </SidebarItem>
              ))}
          </SidebarSection>
        ))}

        {currentCapital != null && (
          <SidebarSection className="max-lg:hidden">
            <SidebarHeading>Capital</SidebarHeading>
            <div className="rounded-lg bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
              <p className="font-mono text-base font-bold tabular-nums text-white">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(currentCapital)}
              </p>
            </div>
          </SidebarSection>
        )}

        <SidebarSpacer />

        <SidebarSection>
          <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-4">
            <p className="text-xs font-medium text-emerald-300">
              Observer. Tester. Progresser.
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Aucun avantage n’est présumé.
              <br />
              Tes données construisent la méthode.
            </p>
          </div>
        </SidebarSection>
      </SidebarBody>

      <SidebarFooter className="max-lg:hidden">
        <div className="flex items-center gap-2 px-2 text-xs text-zinc-400">
          <TrendingUp
            data-slot="icon"
            className="size-3.5 text-emerald-400"
            aria-hidden="true"
          />
          <span className="italic">La discipline se construit.</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <div className="flex items-center gap-2 py-2 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-600">
              <Zap
                data-slot="icon"
                className="size-4 fill-white text-white"
                aria-hidden="true"
              />
            </span>
            <span
              className="font-bold text-zinc-950 dark:text-white"
              translate="no"
            >
              TradingLog
            </span>
          </div>
          <NavbarSpacer />
          <NavbarSection>
            {currentCapital != null && (
              <span className="font-mono text-sm font-semibold tabular-nums text-zinc-950 dark:text-white">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(currentCapital)}
              </span>
            )}
          </NavbarSection>
        </Navbar>
      }
      sidebar={sidebarContent}
    >
      {process.env.NEXT_PUBLIC_JOURNAL_TEST === "true" && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200"
        >
          Environnement de test — exemples fictifs, séparés de ton journal
          personnel.
        </div>
      )}
      {children}
    </SidebarLayout>
  );
}
