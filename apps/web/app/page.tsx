"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../lib/use-auth"
import { LandingHeader } from "../components/landing/header"
import { HeroSection } from "../components/landing/hero-section"
import { FeaturesSection } from "../components/landing/features-section"
import { UseCasesSection } from "../components/landing/use-cases-section"
import { WorkflowSection } from "../components/landing/workflow-section"
import { FooterSection } from "../components/landing/footer-section"
import { AnimatedBackground } from "../components/landing/animated-background"
import { Loader2 } from "lucide-react"

export default function LandingPage() {
    const router = useRouter()
    const { isAuthenticated, loading } = useAuth()

    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.push("/dashboard")
        }
    }, [isAuthenticated, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground text-sm">Loading...</p>
                </div>
            </div>
        )
    }

    if (isAuthenticated) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            <AnimatedBackground />
            <div className="relative z-10">
                <LandingHeader />
                <main>
                    <HeroSection />
                    <FeaturesSection />
                    <UseCasesSection />
                    <WorkflowSection />
                </main>
                <FooterSection />
            </div>
        </div>
    )
}
