'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html suppressHydrationWarning>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
                    <h2 className="text-4xl font-bold mb-4">Something went wrong!</h2>
                    <p className="mb-8">{error.message || "An unexpected error occurred"}</p>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                    >
                        Try again
                    </button>
                    {/* Fallback navigation */}
                    <a
                        href="/"
                        className="mt-4 text-sm text-muted-foreground hover:text-primary transition"
                    >
                        Return Home
                    </a>
                </div>
            </body>
        </html>
    )
}
