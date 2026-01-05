import { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  Settings,
  Church,
  Users,
  Calendar,
  BookOpen,
  FileText,
  Tag,
  Clock,
  Shield,
  Globe,
  Key,
  Activity,
  Palette,
  List,
  Heart,
  Layers,
  User
} from 'lucide-react'
import { LinkButton } from '@/components/link-button'
import { APP_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Settings Guide | ${APP_NAME}`,
  description: 'Complete guide to configuring and customizing Outward Sign for your parish.',
}

export default function SettingsGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/settings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Settings Guide</h1>
          <p className="text-muted-foreground mt-2">
            Complete guide to configuring {APP_NAME} for your parish
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">

        {/* Quick Navigation */}
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="#parish" className="p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-center">
            <Church className="h-5 w-5 mx-auto mb-1 text-primary" />
            <span className="text-sm font-medium">Parish</span>
          </a>
          <a href="#users" className="p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <span className="text-sm font-medium">Users</span>
          </a>
          <a href="#mass" className="p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-center">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
            <span className="text-sm font-medium">Mass</span>
          </a>
          <a href="#content" className="p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-center">
            <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
            <span className="text-sm font-medium">Content</span>
          </a>
        </nav>

        {/* Parish Settings */}
        <section id="parish" className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Church className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Parish Settings</h2>
          </div>

          <div className="grid gap-4">
            {/* General Settings */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">General Settings</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure basic parish information including name, address, and contact details.
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <strong>Timezone:</strong> Set your parish&apos;s timezone for accurate event scheduling
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <strong>Primary Language:</strong> Default language for communications
                    </li>
                    <li className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      <strong>Branding:</strong> Upload logo and customize appearance
                    </li>
                  </ul>
                  <div className="mt-3">
                    <Link href="/settings/parish/general" className="text-sm text-primary hover:underline">
                      Go to General Settings →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* OAuth/MCP Settings */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">OAuth & MCP Integration</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect external AI assistants like Claude to your parish data using OAuth 2.0 and MCP.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <li>• Generate OAuth client credentials</li>
                    <li>• Configure MCP server connection in Claude Desktop</li>
                    <li>• Manage authorized applications</li>
                  </ul>
                  <div className="mt-3 flex gap-3">
                    <Link href="/settings/parish/oauth-settings" className="text-sm text-primary hover:underline">
                      OAuth Settings →
                    </Link>
                    <Link href="/docs/mcp-setup" className="text-sm text-primary hover:underline">
                      MCP Setup Guide →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* API Keys */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">API Keys</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate API keys for programmatic access to your parish data. Useful for custom integrations.
                  </p>
                  <div className="mt-3">
                    <Link href="/settings/parish/api-keys" className="text-sm text-primary hover:underline">
                      Manage API Keys →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Activity Log</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    View a chronological log of all changes made to your parish data, including who made them.
                  </p>
                  <div className="mt-3">
                    <Link href="/settings/parish/activity-log" className="text-sm text-primary hover:underline">
                      View Activity Log →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Parishioner Portal */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Parishioner Portal</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage parishioner portal access and active sessions. Send magic link emails and revoke access as needed.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <li>• View all portal-enabled parishioners</li>
                    <li>• Monitor active sessions</li>
                    <li>• Send login links and revoke access</li>
                  </ul>
                  <div className="mt-3">
                    <Link href="/settings/parish/parishioner-portal" className="text-sm text-primary hover:underline">
                      Manage Parishioner Portal →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* User Management */}
        <section id="users" className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">User Management</h2>
          </div>

          <div className="grid gap-4">
            {/* Staff Users */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Staff & Administrators</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage staff accounts and their permissions. Invite new users and assign roles.
                  </p>
                  <div className="mt-3 p-3 rounded bg-muted/50">
                    <p className="text-sm font-medium mb-2">Available Roles:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li><strong>Admin:</strong> Full access to all features and settings</li>
                      <li><strong>Staff:</strong> Can manage events, people, and content</li>
                      <li><strong>Ministry Leader:</strong> Limited access based on assigned ministries</li>
                    </ul>
                  </div>
                  <div className="mt-3">
                    <Link href="/settings/parish/users" className="text-sm text-primary hover:underline">
                      Manage Users →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Settings */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Your Account Settings</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Update your personal profile, change password, and manage your authorized applications.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <Link href="/settings/user" className="text-sm text-primary hover:underline">
                      Account Settings →
                    </Link>
                    <Link href="/settings/user/authorized-apps" className="text-sm text-primary hover:underline">
                      Authorized Apps →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mass & Liturgy Settings */}
        <section id="mass" className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Mass & Liturgy</h2>
          </div>

          <div className="grid gap-4">
            {/* Mass Schedules */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Mass Schedules</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set up your weekly Mass schedule with recurring times. These become the default times for new Masses.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <li>• Create multiple schedule templates (e.g., Regular, Holiday)</li>
                    <li>• Set day, time, and location for each Mass</li>
                    <li>• Configure special Mass times (vigil, bilingual)</li>
                  </ul>
                  <div className="mt-3">
                    <Link href="/settings/mass-schedules" className="text-sm text-primary hover:underline">
                      Manage Schedules →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mass Configuration */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Mass Configuration</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure default settings for Mass liturgies including templates and petition settings.
                  </p>
                  <div className="mt-3">
                    <Link href="/settings/mass-configuration" className="text-sm text-primary hover:underline">
                      Configure Mass →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mass Intentions */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Mass Intention Settings</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure stipend amounts, quick-select values, and default settings for Mass intentions.
                  </p>
                  <div className="mt-3">
                    <Link href="/settings/parish/mass-intentions" className="text-sm text-primary hover:underline">
                      Mass Intention Settings →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Petition Templates */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Petition Templates</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create reusable petition templates for different occasions. Templates support English, Spanish, or bilingual.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <Link href="/settings/petitions" className="text-sm text-primary hover:underline">
                      All Templates →
                    </Link>
                    <Link href="/settings/parish/petitions" className="text-sm text-primary hover:underline">
                      Default Settings →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content & Templates */}
        <section id="content" className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Content & Templates</h2>
          </div>

          <div className="grid gap-4">
            {/* Content Library */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Content Library</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Store and organize liturgical content like readings, prayers, and hymn lyrics. Tag content for easy searching.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <li>• Create content blocks with formatted text</li>
                    <li>• Add tags for organization (e.g., &quot;Easter&quot;, &quot;First Reading&quot;)</li>
                    <li>• Insert content into Mass liturgies and scripts</li>
                  </ul>
                  <div className="mt-3">
                    <Link href="/settings/content-library" className="text-sm text-primary hover:underline">
                      Browse Content Library →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Browser */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <Layers className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Template Browser</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Explore the template structure for different event types. See available scripts, sections, and placeholder variables.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <Link href="/settings/template-browser" className="text-sm text-primary hover:underline">
                      Open Template Browser →
                    </Link>
                    <Link href="/docs/template-browser" className="text-sm text-primary hover:underline">
                      Template Guide →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Tags */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Category Tags</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create and manage tags for organizing content library items. Tags help filter and find content quickly.
                  </p>
                  <div className="mt-3">
                    <Link href="/settings/category-tags" className="text-sm text-primary hover:underline">
                      Manage Tags →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Lists */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <List className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Custom Lists</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create custom dropdown lists for event forms. Useful for parish-specific options not covered by defaults.
                  </p>
                  <div className="mt-3">
                    <Link href="/settings/custom-lists" className="text-sm text-primary hover:underline">
                      Manage Custom Lists →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Event Types */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Event Configuration</h2>
          </div>

          <div className="grid gap-4">
            {/* Event Presets */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Event Presets</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create presets with pre-filled values for common event scenarios. Speed up event creation with one-click presets.
                  </p>
                  <div className="mt-3">
                    <Link href="/settings/event-presets" className="text-sm text-primary hover:underline">
                      Manage Presets →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Liturgies */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Special Liturgy Types</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure event types for special liturgies like Weddings, Funerals, Baptisms, etc. Each type has its own scripts and fields.
                  </p>
                  <div className="mt-3">
                    <Link href="/settings/special-liturgies" className="text-sm text-primary hover:underline">
                      Manage Liturgy Types →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Parish Events */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Parish Event Types</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure event types for general parish events like meetings, classes, and social events.
                  </p>
                  <div className="mt-3">
                    <Link href="/settings/parish-events" className="text-sm text-primary hover:underline">
                      Manage Event Types →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Documentation */}
        <section className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-4">Related Documentation</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/docs/ai-assistant" className="p-3 rounded-lg border border-border hover:bg-accent transition-colors">
              <h3 className="font-medium">AI Assistant Guide</h3>
              <p className="text-sm text-muted-foreground">Learn how to use the AI chat for parish management</p>
            </Link>
            <Link href="/docs/parishioner-portal" className="p-3 rounded-lg border border-border hover:bg-accent transition-colors">
              <h3 className="font-medium">Parishioner Portal</h3>
              <p className="text-sm text-muted-foreground">Guide for parishioners using the self-service portal</p>
            </Link>
            <Link href="/docs/mcp-setup" className="p-3 rounded-lg border border-border hover:bg-accent transition-colors">
              <h3 className="font-medium">MCP Setup Guide</h3>
              <p className="text-sm text-muted-foreground">Connect Claude Desktop to your parish data</p>
            </Link>
            <Link href="/docs/template-browser" className="p-3 rounded-lg border border-border hover:bg-accent transition-colors">
              <h3 className="font-medium">Template Browser Guide</h3>
              <p className="text-sm text-muted-foreground">Understanding scripts, sections, and placeholders</p>
            </Link>
          </div>
        </section>

        {/* Need Help */}
        <section className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-3">Need Help?</h2>
          <p className="text-muted-foreground mb-4">
            Can&apos;t find what you&apos;re looking for? We&apos;re here to help.
          </p>
          <LinkButton href="/support" variant="outline">
            Contact Support
          </LinkButton>
        </section>

        {/* Back link */}
        <div className="pt-8 border-t border-border">
          <Link href="/settings" className="inline-flex items-center text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
        </div>
      </main>
    </div>
  )
}
