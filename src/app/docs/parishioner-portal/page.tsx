import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, User, Calendar, Users, MessageSquare, Bell, MapPin, BookOpen, CheckCircle2, XCircle, Shield, Mail } from 'lucide-react'
import { LinkButton } from '@/components/link-button'
import { APP_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Parishioner Portal Guide | ${APP_NAME}`,
  description: 'Learn how to use the Parishioner Portal to view your schedule, manage your profile, and stay connected with your parish.',
}

export default function ParishionerPortalGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Parishioner Portal Guide</h1>
          <p className="text-muted-foreground mt-2">
            Your personal gateway to stay connected with your parish
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Introduction */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">What is the Parishioner Portal?</h2>
          <p className="text-muted-foreground leading-relaxed">
            The <strong>Parishioner Portal</strong> is a self-service area where registered parishioners can view their ministry schedules, update contact information, see upcoming parish events, and communicate with the parish through an AI-powered chat assistant.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-lg border border-border bg-card">
              <Calendar className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Your Schedule</h3>
              <p className="text-sm text-muted-foreground">See your upcoming ministry assignments and commitments all in one place.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <User className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Your Profile</h3>
              <p className="text-sm text-muted-foreground">Keep your contact information up-to-date so the parish can reach you.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <MessageSquare className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">Ask questions and get help through a friendly chat interface.</p>
            </div>
          </div>
        </section>

        {/* Accessing the Portal */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Accessing the Portal</h2>
          <p className="text-muted-foreground">The Parishioner Portal uses passwordless login for security and convenience:</p>

          <ol className="space-y-4 ml-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
              <div>
                <p className="font-medium">Go to the Portal Login Page</p>
                <p className="text-sm text-muted-foreground">Visit your parish&apos;s parishioner portal URL (e.g., outwardsign.church/parishioner/st-marys/login)</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
              <div>
                <p className="font-medium">Enter Your Email</p>
                <p className="text-sm text-muted-foreground">Enter the email address on file with your parish. This must match what the parish has in their records.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Check Your Email
                </p>
                <p className="text-sm text-muted-foreground">You&apos;ll receive a magic link that logs you in securely - no password needed!</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
              <div>
                <p className="font-medium">Click the Link</p>
                <p className="text-sm text-muted-foreground">Click the link in your email to be automatically logged in. The link expires after 1 hour for security.</p>
              </div>
            </li>
          </ol>

          <div className="p-4 bg-muted/50 rounded-lg mt-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> If you don&apos;t receive the email, check your spam folder. If your email isn&apos;t recognized, contact your parish office to update your records.
            </p>
          </div>
        </section>

        {/* What You Can Do */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">What You Can Do</h2>
          <p className="text-muted-foreground">
            The Parishioner Portal gives you access to your personal parish information:
          </p>

          {/* Calendar Tab */}
          <div className="mt-6 p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Calendar</h3>
                <p className="text-sm text-muted-foreground">View your schedule and parish events</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-liturgy-green mt-0.5 flex-shrink-0" />
                <span>See your upcoming ministry assignments (lector, EMHC, usher, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-liturgy-green mt-0.5 flex-shrink-0" />
                <span>View all public parish events</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-liturgy-green mt-0.5 flex-shrink-0" />
                <span>Check Mass times for any day</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-liturgy-green mt-0.5 flex-shrink-0" />
                <span>See event locations and details</span>
              </li>
            </ul>
          </div>

          {/* Chat Tab */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">AI Chat Assistant</h3>
                <p className="text-sm text-muted-foreground">Get help through natural conversation</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Ask the AI assistant questions like:</p>
            <div className="grid md:grid-cols-2 gap-2">
              <div className="p-2 bg-muted rounded text-sm italic">&quot;When am I scheduled to lector?&quot;</div>
              <div className="p-2 bg-muted rounded text-sm italic">&quot;What&apos;s on the calendar this weekend?&quot;</div>
              <div className="p-2 bg-muted rounded text-sm italic">&quot;What groups can I join?&quot;</div>
              <div className="p-2 bg-muted rounded text-sm italic">&quot;Update my phone number to...&quot;</div>
              <div className="p-2 bg-muted rounded text-sm italic">&quot;What&apos;s the church address?&quot;</div>
              <div className="p-2 bg-muted rounded text-sm italic">&quot;Show me my family members&quot;</div>
            </div>
          </div>

          {/* Notifications Tab */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Bell className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Notifications</h3>
                <p className="text-sm text-muted-foreground">Stay informed about parish updates</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-liturgy-green mt-0.5 flex-shrink-0" />
                <span>Receive reminders about upcoming assignments</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-liturgy-green mt-0.5 flex-shrink-0" />
                <span>Get notifications about schedule changes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-liturgy-green mt-0.5 flex-shrink-0" />
                <span>See announcements from your parish</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Permissions */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Your Permissions</h2>
          <p className="text-muted-foreground">
            As a parishioner, you have self-service access to your own information:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-3">
              <h3 className="font-medium text-liturgy-green flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                You Can
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-liturgy-green mt-1">•</span>
                  <span><strong>View</strong> your ministry schedule and assignments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-liturgy-green mt-1">•</span>
                  <span><strong>View</strong> public parish events and Mass times</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-liturgy-green mt-1">•</span>
                  <span><strong>View</strong> your profile and family information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-liturgy-green mt-1">•</span>
                  <span><strong>Update</strong> your phone number, email, and address</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-liturgy-green mt-1">•</span>
                  <span><strong>View</strong> groups and ministries you belong to</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-liturgy-green mt-1">•</span>
                  <span><strong>Join</strong> or <strong>leave</strong> groups (if allowed)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-liturgy-green mt-1">•</span>
                  <span><strong>View</strong> liturgical calendar and readings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-liturgy-green mt-1">•</span>
                  <span><strong>View</strong> parish locations and contact info</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-destructive flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                You Cannot
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>View other parishioners&apos; private information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>Modify your own ministry assignments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>Access administrative parish settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>Create or edit parish events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>View private parish data or reports</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg mt-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Privacy Protection</p>
                <p className="text-sm text-muted-foreground mt-1">
                  The portal only shows your personal information and public parish data. You cannot see other parishioners&apos; contact details, schedules, or private information.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Managing Your Profile */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Managing Your Profile</h2>
          <p className="text-muted-foreground">
            Keep your information up-to-date so the parish can reach you:
          </p>

          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-2">What You Can Update</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Phone Number</strong> - Your primary contact number</li>
                <li><strong>Email Address</strong> - Where you receive parish communications</li>
                <li><strong>Street Address</strong> - Your mailing address</li>
                <li><strong>City, State, Zip</strong> - Full address details</li>
                <li><strong>Preferred Language</strong> - English or Spanish for communications</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-2">How to Update</h3>
              <p className="text-sm text-muted-foreground mb-3">Use the AI Chat assistant:</p>
              <div className="space-y-2">
                <div className="p-2 bg-muted rounded text-sm italic">&quot;Update my phone number to 555-123-4567&quot;</div>
                <div className="p-2 bg-muted rounded text-sm italic">&quot;Change my email to newemail@example.com&quot;</div>
                <div className="p-2 bg-muted rounded text-sm italic">&quot;Set my preferred language to Spanish&quot;</div>
              </div>
            </div>
          </div>
        </section>

        {/* Groups & Ministries */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Groups & Ministries</h2>
          <p className="text-muted-foreground">
            View your group memberships and explore other ministries to join:
          </p>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <Users className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Your Ministries</h3>
              <p className="text-sm text-muted-foreground">
                See all groups you&apos;re a member of, your role in each, and when you joined.
              </p>
              <div className="mt-3 p-2 bg-muted rounded text-sm italic">&quot;What groups am I in?&quot;</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <BookOpen className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Available Groups</h3>
              <p className="text-sm text-muted-foreground">
                Discover new ministries and groups you can join to get more involved.
              </p>
              <div className="mt-3 p-2 bg-muted rounded text-sm italic">&quot;What groups can I join?&quot;</div>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <h3 className="font-semibold">Joining or Leaving Groups</h3>
            <p className="text-sm text-muted-foreground">
              You can join or leave groups through the chat assistant:
            </p>
            <div className="grid md:grid-cols-2 gap-2">
              <div className="p-2 bg-muted rounded text-sm italic">&quot;Join the choir&quot;</div>
              <div className="p-2 bg-muted rounded text-sm italic">&quot;Leave the usher group&quot;</div>
            </div>
          </div>
        </section>

        {/* Parish Information */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Parish Information</h2>
          <p className="text-muted-foreground">
            Access key parish information anytime:
          </p>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <MapPin className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Locations</h3>
              <p className="text-sm text-muted-foreground">
                Find addresses and contact information for parish buildings.
              </p>
              <div className="mt-3 p-2 bg-muted rounded text-sm italic">&quot;What&apos;s the church address?&quot;</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <Calendar className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Mass Times</h3>
              <p className="text-sm text-muted-foreground">
                Check the regular Mass schedule for any day of the week.
              </p>
              <div className="mt-3 p-2 bg-muted rounded text-sm italic">&quot;What time is Mass on Sunday?&quot;</div>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Troubleshooting</h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">&quot;Email not recognized&quot; error</h3>
              <p className="text-muted-foreground">
                Your email must match exactly what the parish has on file. Contact your parish office to verify or update your email address in their records.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Didn&apos;t receive the login email</h3>
              <p className="text-muted-foreground">
                Check your spam/junk folder. The email comes from {APP_NAME}. If you still don&apos;t see it, try requesting a new link after a few minutes.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Login link expired</h3>
              <p className="text-muted-foreground">
                Magic links expire after 1 hour for security. Simply go back to the login page and request a new link.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Can&apos;t see my schedule</h3>
              <p className="text-muted-foreground">
                You&apos;ll only see assignments if you&apos;ve been scheduled by the parish. If you believe you should have assignments but don&apos;t see them, contact your ministry coordinator.
              </p>
            </div>
          </div>
        </section>

        {/* Help */}
        <section className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-3">Need Help?</h2>
          <p className="text-muted-foreground mb-4">
            If you&apos;re having trouble with the Parishioner Portal, contact your parish office for assistance.
          </p>
          <LinkButton href="/support" variant="outline">
            Contact Support
          </LinkButton>
        </section>

        {/* Back link */}
        <div className="pt-8 border-t border-border">
          <Link href="/" className="inline-flex items-center text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
