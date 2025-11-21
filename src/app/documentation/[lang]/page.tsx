import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, Sparkles, ArrowRight } from 'lucide-react'
import { DOCUMENTATION_HOME_LABELS } from '@/lib/constants'

interface DocumentationHomeProps {
  params: Promise<{ lang: string }>
}

export default async function DocumentationHome({ params }: DocumentationHomeProps) {
  const { lang } = await params as { lang: 'en' | 'es' }
  const t = DOCUMENTATION_HOME_LABELS[lang]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">{t.title}</h1>
        <p className="text-lg text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Quick Start Cards */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Link href={`/documentation/${lang}/getting-started/introduction`}>
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle>{t.gettingStarted.title}</CardTitle>
              <CardDescription>{t.gettingStarted.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-between">
                {t.gettingStarted.button}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/documentation/${lang}/user-guides/staff-guide`}>
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle>{t.userGuides.title}</CardTitle>
              <CardDescription>{t.userGuides.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-between">
                {t.userGuides.button}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/documentation/${lang}/features/weddings`}>
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle>{t.features.title}</CardTitle>
              <CardDescription>{t.features.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-between">
                {t.features.button}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Popular Topics */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground mb-4">{t.popularTopics}</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {t.topics.map((topic, index) => (
            <Link key={index} href={topic.href}>
              <div className="p-4 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  <span className="text-sm text-foreground">{topic.title}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
