import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Languages } from 'lucide-react'

export default function DocumentationLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Outward Sign Documentation</h1>
              <p className="text-sm text-muted-foreground">Sacrament and Sacramental Management</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Welcome to the Documentation</h2>
            <p className="text-lg text-muted-foreground">
              Learn how to plan, communicate, and celebrate sacraments in your Catholic parish
            </p>
          </div>

          {/* Language Selection */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Link href="/documentation/en">
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Languages className="h-6 w-6 text-primary" />
                    <CardTitle>English Documentation</CardTitle>
                  </div>
                  <CardDescription>
                    Read the documentation in English
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Continue in English →
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/documentation/es">
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Languages className="h-6 w-6 text-primary" />
                    <CardTitle>Documentación en Español</CardTitle>
                  </div>
                  <CardDescription>
                    Lea la documentación en español
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Continuar en Español →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">Quick Links</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/documentation/en/getting-started/introduction">
                <Card className="cursor-pointer transition-all hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">Getting Started</CardTitle>
                    <CardDescription className="text-sm">
                      New to Outward Sign? Start here
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/documentation/en/user-guides/staff-guide">
                <Card className="cursor-pointer transition-all hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">User Guides</CardTitle>
                    <CardDescription className="text-sm">
                      Learn by role: Admin, Staff, Parishioner
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/documentation/en/features/weddings">
                <Card className="cursor-pointer transition-all hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">Features</CardTitle>
                    <CardDescription className="text-sm">
                      Explore weddings, funerals, masses, and more
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Contact your parish administrator or visit{' '}
              <a href="https://outwardsign.church" className="text-primary hover:underline">
                outwardsign.church
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
