"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "../../lib/i18n-context"
import { motion } from "framer-motion"
import { Loader2, ArrowRight } from "lucide-react"
import { login } from "../../lib/api"

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../components/ui/card"

export default function LoginPage() {
    const { t } = useI18n()
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await login(email, password)
            localStorage.setItem('token', response.token)
            localStorage.setItem('user', JSON.stringify(response.user))
            window.location.href = '/dashboard'
        } catch (err: any) {
            setError(err.message || t('login.error'))
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-4"
            >
                <Card className="border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <CardHeader className="text-center space-y-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-12 h-12 bg-primary rounded-xl mx-auto mb-4 flex items-center justify-center"
                        >
                            <span className="text-primary-foreground font-bold text-xl">K</span>
                        </motion.div>
                        <CardTitle className="text-2xl font-bold tracking-tight">{t('login.title')}</CardTitle>
                        <CardDescription>
                            {t('login.subtitle')}
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg text-center font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('login.email_placeholder')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@ksha.local"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    className="bg-background/50 border-white/10 focus:bg-background transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">{t('login.password_placeholder')}</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    className="bg-background/50 border-white/10 focus:bg-background transition-colors"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <>
                                        {t('login.submit')}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
                <div className="text-center mt-8 text-sm text-muted-foreground opacity-60">
                    Open Source Data Engine
                </div>
            </motion.div>
        </div>
    )
}
