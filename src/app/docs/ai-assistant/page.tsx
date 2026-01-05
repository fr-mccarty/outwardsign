import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, Shield, Users, Calendar, BookOpen, Search, CheckCircle2, XCircle } from 'lucide-react'
import { LinkButton } from '@/components/link-button'
import { APP_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `AI Assistant Guide | ${APP_NAME}`,
  description: 'Learn how to use the AI-powered chat assistant to manage your parish with natural language.',
}

export default function AIAssistantGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/chat" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Link>
          <h1 className="text-3xl font-bold text-foreground">AI Assistant Guide</h1>
          <p className="text-muted-foreground mt-2">
            Using the AI-powered chat to manage your parish with natural language
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Introduction */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">What is the AI Assistant?</h2>
          <p className="text-muted-foreground leading-relaxed">
            The AI Assistant is a conversational interface that lets you manage your parish using natural language. Instead of navigating through menus and forms, simply tell the assistant what you need and it will help you accomplish the task.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-lg border border-border bg-card">
              <MessageSquare className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Natural Conversation</h3>
              <p className="text-sm text-muted-foreground">Ask questions and give commands in plain English - no special syntax needed.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <Search className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Smart Search</h3>
              <p className="text-sm text-muted-foreground">Find people, events, and data quickly with fuzzy matching and context awareness.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <Shield className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Permission-Aware</h3>
              <p className="text-sm text-muted-foreground">The assistant only shows actions you&apos;re authorized to perform based on your role.</p>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Getting Started</h2>
          <p className="text-muted-foreground">Access the AI Assistant from the main navigation:</p>

          <ol className="space-y-4 ml-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
              <div>
                <p className="font-medium">Click &quot;Chat&quot; in the sidebar</p>
                <p className="text-sm text-muted-foreground">The chat icon is located in the main navigation on the left side of the screen.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
              <div>
                <p className="font-medium">Type your request</p>
                <p className="text-sm text-muted-foreground">Enter what you want to do or find in the message box at the bottom of the screen.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
              <div>
                <p className="font-medium">Review and confirm</p>
                <p className="text-sm text-muted-foreground">The assistant will show results or ask for confirmation before making changes.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Permissions by Role */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Permissions by Role</h2>
          <p className="text-muted-foreground">
            What the AI Assistant can do depends on your role in the parish. Here&apos;s a detailed breakdown:
          </p>

          {/* Admin Permissions */}
          <div className="mt-6 p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Administrator</h3>
                <p className="text-sm text-muted-foreground">Full access to all parish data and operations</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-liturgy-green flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  What Admins Can Do
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-liturgy-green mt-1">•</span>
                    <span>View, create, edit, and delete all records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-liturgy-green mt-1">•</span>
                    <span>Manage people, families, and groups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-liturgy-green mt-1">•</span>
                    <span>Schedule and modify masses and events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-liturgy-green mt-1">•</span>
                    <span>Assign ministers and roles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-liturgy-green mt-1">•</span>
                    <span>Manage mass intentions and offerings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-liturgy-green mt-1">•</span>
                    <span>Configure parish settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-liturgy-green mt-1">•</span>
                    <span>Access developer tools (in development mode)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-liturgy-green mt-1">•</span>
                    <span>Search documentation</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Example Commands</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-muted rounded text-sm italic">&quot;Show me all masses this weekend&quot;</div>
                  <div className="p-2 bg-muted rounded text-sm italic">&quot;Find John Smith&apos;s contact info&quot;</div>
                  <div className="p-2 bg-muted rounded text-sm italic">&quot;Who is scheduled to lector on Sunday?&quot;</div>
                  <div className="p-2 bg-muted rounded text-sm italic">&quot;Add a new family named Garcia&quot;</div>
                  <div className="p-2 bg-muted rounded text-sm italic">&quot;Delete the cancelled mass on Dec 25&quot;</div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Permissions */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Staff</h3>
                <p className="text-sm text-muted-foreground">Access to most operations except administrative functions</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-liturgy-green flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  What Staff Can Do
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-liturgy-green mt-1">•</span>
                    <span>View all parish data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-liturgy-green mt-1">•</span>
                    <span>Create and edit people, families, and groups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-liturgy-green mt-1">•</span>
                    <span>Schedule masses and events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-liturgy-green mt-1">•</span>
                    <span>Assign ministers to masses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-liturgy-green mt-1">•</span>
                    <span>Manage mass intentions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-liturgy-green mt-1">•</span>
                    <span>Delete records (soft delete)</span>
                  </li>
                </ul>

                <h4 className="font-medium text-destructive flex items-center gap-2 mt-4">
                  <XCircle className="h-4 w-4" />
                  Staff Cannot
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>Modify parish settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>Access developer tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>Manage user permissions</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Example Commands</h4>
                <div className="space-y-2">
                  <div className="p-2 bg-muted rounded text-sm italic">&quot;List all lectors available on Sunday&quot;</div>
                  <div className="p-2 bg-muted rounded text-sm italic">&quot;Create a new person: Maria Lopez&quot;</div>
                  <div className="p-2 bg-muted rounded text-sm italic">&quot;Schedule a funeral for next Tuesday&quot;</div>
                  <div className="p-2 bg-muted rounded text-sm italic">&quot;Show upcoming baptisms&quot;</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What You Can Ask */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">What You Can Ask</h2>
          <p className="text-muted-foreground">
            Here are examples of tasks organized by category:
          </p>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {/* People & Families */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                People & Families
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>&bull; &quot;Find all people named Smith&quot;</li>
                <li>&bull; &quot;Show me the Johnson family&quot;</li>
                <li>&bull; &quot;Who are our registered lectors?&quot;</li>
                <li>&bull; &quot;Add a new parishioner&quot;</li>
                <li>&bull; &quot;Update John&apos;s phone number&quot;</li>
              </ul>
            </div>

            {/* Masses & Events */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                Masses & Events
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>&bull; &quot;What masses are this Sunday?&quot;</li>
                <li>&bull; &quot;Show upcoming weddings&quot;</li>
                <li>&bull; &quot;Who is celebrating the 10am Mass?&quot;</li>
                <li>&bull; &quot;Schedule a funeral Mass&quot;</li>
                <li>&bull; &quot;List all events next week&quot;</li>
              </ul>
            </div>

            {/* Ministry */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                Ministry & Roles
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>&bull; &quot;Who is assigned to Sunday 10am?&quot;</li>
                <li>&bull; &quot;Find available EMHCs for Saturday&quot;</li>
                <li>&bull; &quot;Show the choir members&quot;</li>
                <li>&bull; &quot;Assign Maria as lector for Sunday&quot;</li>
              </ul>
            </div>

            {/* Search & Reports */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                Search & Reports
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>&bull; &quot;Search for Maria in our database&quot;</li>
                <li>&bull; &quot;How many masses did we have last month?&quot;</li>
                <li>&bull; &quot;Show me the liturgical calendar&quot;</li>
                <li>&bull; &quot;Find all unfilled ministry positions&quot;</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Confirmation & Safety */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Confirmation & Safety</h2>
          <p className="text-muted-foreground">
            The AI Assistant is designed with safety in mind:
          </p>

          <div className="space-y-4 mt-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Confirmation for Destructive Actions</p>
                <p className="text-sm text-muted-foreground">
                  Before deleting any record, the assistant will ask you to confirm the action. Simply type &quot;yes&quot; or &quot;confirm&quot; to proceed.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Soft Delete</p>
                <p className="text-sm text-muted-foreground">
                  Records are never permanently deleted. They are marked as deleted and can be restored if needed.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Audit Trail</p>
                <p className="text-sm text-muted-foreground">
                  All changes made through the AI Assistant are logged with your user information for accountability.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Permission Enforcement</p>
                <p className="text-sm text-muted-foreground">
                  The assistant will refuse to perform actions outside your role&apos;s permissions and explain why.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Tips for Best Results</h2>

          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
              <div>
                <p className="font-medium">Be specific</p>
                <p className="text-sm text-muted-foreground">
                  &quot;Find John Smith from the choir&quot; is better than &quot;find John&quot; if there are multiple Johns.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
              <div>
                <p className="font-medium">Use natural dates</p>
                <p className="text-sm text-muted-foreground">
                  Say &quot;next Sunday&quot; or &quot;this weekend&quot; instead of specific dates when convenient.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
              <div>
                <p className="font-medium">Ask follow-up questions</p>
                <p className="text-sm text-muted-foreground">
                  After getting search results, you can ask more about specific items: &quot;Tell me more about the 10am Mass&quot;
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
              <div>
                <p className="font-medium">State your intent clearly</p>
                <p className="text-sm text-muted-foreground">
                  Say &quot;I want to schedule a new Mass&quot; rather than just &quot;Mass on Sunday&quot; so the assistant knows to create, not search.
                </p>
              </div>
            </li>
          </ul>
        </section>

        {/* Help */}
        <section className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-3">Need Help?</h2>
          <p className="text-muted-foreground mb-4">
            If you&apos;re having trouble with the AI Assistant, try asking it directly: &quot;What can you help me with?&quot;
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/support" variant="outline">
              Contact Support
            </LinkButton>
            <LinkButton href="/chat" variant="default">
              Open AI Assistant
            </LinkButton>
          </div>
        </section>

        {/* Back link */}
        <div className="pt-8 border-t border-border">
          <Link href="/chat" className="inline-flex items-center text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Link>
        </div>
      </main>
    </div>
  )
}
