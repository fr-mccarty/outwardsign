'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Flower } from 'lucide-react'
import {APP_NAME} from "@/lib/constants";

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center space-x-4 hover:opacity-80 transition-opacity">
            <div className="flex aspect-square size-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flower className="size-7" />
            </div>
            <div className="font-semibold text-2xl text-foreground">{APP_NAME}</div>
          </Link>
        </div>
        <Card className="w-full">
        <CardHeader>
          <CardTitle>Login to Liturgy.Faith</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <FormField
              id="email"
              label="Email"
              inputType="email"
              value={email}
              onChange={setEmail}
              required
            />
            <FormField
              id="password"
              label="Password"
              inputType="password"
              value={password}
              onChange={setPassword}
              required
            />
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-blue-500 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}