'use client'

import { useState } from 'react'
import { generateMagicLink } from '@/lib/parishioner-auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail } from 'lucide-react'

export function MagicLinkLoginForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // TODO: Get parish ID from subdomain or URL parameter
  // For now, hardcode a default parish ID (should be dynamic in production)
  const PARISH_ID = '00000000-0000-0000-0000-000000000000' // Replace with actual logic

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const result = await generateMagicLink(email.trim(), PARISH_ID)

    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      setEmail('')
    } else {
      setMessage({ type: 'error', text: result.message })
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10"
          />
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Magic Link'}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        We&apos;ll send a magic link to your email to access your parishioner portal.
      </p>
    </form>
  )
}
