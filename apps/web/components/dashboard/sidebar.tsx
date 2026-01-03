"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useI18n } from "../../lib/i18n-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Database,
  Zap,
  TrendingUp,
  Compass,
  Settings,
  Menu,
  X,
  BarChart3,
  HelpCircle,
  ChevronRight,
} from "lucide-react"
import { useState, useEffect } from "react"

export function DashboardSidebar() {
  const { t } = useI18n()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(true)
    }
  }, [isMobile])

  const menuItems = [
    { label: t("common.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("common.sources"), href: "/dashboard/sources", icon: Database },
    { label: t("common.streams"), href: "/dashboard/streams", icon: Zap },
    { label: t("common.backtests"), href: "/dashboard/backtests", icon: TrendingUp },
    { label: t("common.settings"), href: "/dashboard/settings", icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") return true
    if (href !== "/dashboard" && pathname.startsWith(href)) return true
    return false
  }

  if (!mounted) return null

  const NavItem = ({ item, active }: { item: (typeof menuItems)[0]; active: boolean }) => {
    const Icon = item.icon
    return (
      <Link
        href={item.href}
        onClick={() => isMobile && setIsOpen(false)}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
      >
        <Icon className="w-[18px] h-[18px] flex-shrink-0" />
        {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
        {active && !collapsed && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary-foreground"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </Link>
    )
  }

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-card border border-border shadow-lg"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </motion.button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -280,
          width: collapsed && !isMobile ? 72 : 260,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed md:static h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-40"
      >
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-lg">K</span>
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-lg tracking-tight"
              >
                KshaAI
              </motion.span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-0.5">
            {menuItems.map((item) => (
              <NavItem key={item.href} item={item} active={isActive(item.href)} />
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          {!collapsed ? (
            <div className="p-3 rounded-xl bg-primary/10 group cursor-pointer hover:bg-primary/15 transition-colors">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <HelpCircle className="w-4 h-4" />
                {t("dashboard.need_help")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.check_docs")}</p>
            </div>
          ) : (
            <button className="w-full p-2.5 rounded-lg hover:bg-muted transition-colors flex justify-center">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
            </button>
          )}

          {/* Collapse toggle */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex w-full mt-2 p-2 rounded-lg hover:bg-muted transition-colors items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? "" : "rotate-180"}`} />
            </button>
          )}
        </div>
      </motion.aside>
    </>
  )
}
