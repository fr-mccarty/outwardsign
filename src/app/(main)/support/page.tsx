import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { Mail, MessageSquare, Clock, Camera } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SupportPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Support" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PageContainer
        title="Support"
        description="Get help with Outward Sign"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <ContentCard>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Contact Us</h3>
                <p className="text-muted-foreground mb-3">
                  Have a question, feedback, or need help? Reach out to us directly.
                </p>
                <a
                  href="mailto:fr.josh@lolekproductions.org"
                  className="text-primary hover:underline font-medium"
                >
                  fr.josh@lolekproductions.org
                </a>
              </div>
            </div>
          </ContentCard>

          <ContentCard>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Tips for Getting Help</h3>
                <p className="text-muted-foreground mb-3">
                  To help us assist you quickly, please be as specific as possible when reaching out.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Camera className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Include screenshots</strong> - A picture helps us understand the issue quickly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Describe the steps</strong> - What were you doing when the issue occurred?</span>
                  </li>
                </ul>
              </div>
            </div>
          </ContentCard>

          <ContentCard>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Response Time</h3>
                <p className="text-muted-foreground">
                  Our team is small but passionate about serving the Church. We aim to respond within <strong>48 hours</strong>. Thank you for your patience!
                </p>
              </div>
            </div>
          </ContentCard>
        </div>
      </PageContainer>
    </>
  )
}
