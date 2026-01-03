"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile } from './api'

export function useAuth() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            setLoading(false)
            return
        }

        try {
            // Validate token by fetching profile
            const profile = await getProfile()
            setUser(profile)
        } catch (error) {
            // Token is invalid or expired, clear it
            console.warn('Auth validation failed:', error)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        router.push('/login')
    }

    return {
        user,
        loading,
        isAuthenticated: !!user,
        logout,
        checkAuth,
    }
}
