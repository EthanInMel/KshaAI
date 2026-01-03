'use client';

import { motion } from 'framer-motion';

export function PageContainer({ children, title, action }: { children: React.ReactNode; title: string; action?: React.ReactNode }) {
    return (
        <main className="flex-1 min-w-0 relative">
            {/* Background Ambient Light */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto p-8 lg:p-12">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-end justify-between mb-12"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight mb-2 text-glow">{title}</h1>
                        <div className="h-1 w-20 bg-gradient-to-r from-primary to-transparent rounded-full" />
                    </div>
                    {action}
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {children}
                </motion.div>
            </div>
        </main>
    );
}
