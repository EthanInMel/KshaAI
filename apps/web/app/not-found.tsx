

import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <h2 className="text-4xl font-bold mb-4">404 - Not Found</h2>
            <p className="mb-8">Could not find requested resource</p>
            <a
                href="/"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
                Return Home
            </a>
        </div>
    )
}
