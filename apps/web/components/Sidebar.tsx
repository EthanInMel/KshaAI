'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Radio, Zap, Activity, Settings, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Radio, label: 'Sources', href: '/sources' },
    { icon: Zap, label: 'Streams', href: '/streams' },
    { icon: Activity, label: 'Logs', href: '/logs' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-72 h-screen sticky top-0 border-r border-white/[0.05] bg-background/50 backdrop-blur-xl flex flex-col z-50">
            {/* Brand */}
            <div className="p-8 pb-10">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
                        <Box className="w-6 h-6 text-white" />
                        <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">ksha</h1>
                        <p className="text-xs text-gray-500 font-medium tracking-wide">INTELLIGENCE</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="block relative group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary/10 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <div className={clsx(
                                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                isActive ? "text-white" : "text-gray-400 group-hover:text-white group-hover:bg-white/[0.02]"
                            )}>
                                <item.icon className={clsx(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-300"
                                )} />
                                <span className="font-medium tracking-wide">{item.label}</span>

                                {isActive && (
                                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 mt-auto">
                <div className="glass-panel rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px]">
                        <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-xs font-bold">
                            AU
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">Admin User</p>
                        <p className="text-xs text-gray-500 truncate">admin@ksha.ai</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
