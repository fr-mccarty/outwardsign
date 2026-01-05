import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, Layers, Code, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react'
import { LinkButton } from '@/components/link-button'
import { APP_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Template Browser Guide | ${APP_NAME}`,
  description: 'Learn how to use the Template Structure Browser to understand event types, scripts, and placeholder variables.',
}

export default function TemplateBrowserGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/settings/template-browser" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Template Browser
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Template Browser Guide</h1>
          <p className="text-muted-foreground mt-2">
            Understanding event types, scripts, sections, and placeholder variables
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Introduction */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">What is the Template Browser?</h2>
          <p className="text-muted-foreground leading-relaxed">
            The <strong>Template Structure Browser</strong> is a tool for understanding how {APP_NAME} organizes liturgical content. It allows you to explore the hierarchy of event types, scripts, and sections, and see which placeholder variables are available for dynamic content.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-lg border border-border bg-card">
              <Layers className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Event Types</h3>
              <p className="text-sm text-muted-foreground">Browse different types of liturgical events like Masses, Weddings, Funerals, and more.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <FileText className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Scripts</h3>
              <p className="text-sm text-muted-foreground">View the structured templates that define how liturgies are organized and printed.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <Code className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Placeholders</h3>
              <p className="text-sm text-muted-foreground">Discover dynamic variables that insert event-specific data into templates.</p>
            </div>
          </div>
        </section>

        {/* Understanding the Hierarchy */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Understanding the Template Hierarchy</h2>
          <p className="text-muted-foreground">Templates in {APP_NAME} follow a structured hierarchy:</p>

          <div className="p-6 rounded-lg border border-border bg-muted/30 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
              <div>
                <h3 className="font-semibold">Event Type</h3>
                <p className="text-sm text-muted-foreground">The category of liturgical event (e.g., Sunday Mass, Wedding, Funeral)</p>
              </div>
            </div>
            <div className="ml-4 border-l-2 border-border pl-8 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
              <div>
                <h3 className="font-semibold">Script</h3>
                <p className="text-sm text-muted-foreground">A complete template defining the order and content of the liturgy</p>
              </div>
            </div>
            <div className="ml-8 border-l-2 border-border pl-8 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold">Section</h3>
                <p className="text-sm text-muted-foreground">A part of the script (e.g., Introductory Rites, Liturgy of the Word)</p>
              </div>
            </div>
            <div className="ml-12 border-l-2 border-border pl-8 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
              <div>
                <h3 className="font-semibold">Content Block</h3>
                <p className="text-sm text-muted-foreground">Individual elements within a section containing text, readings, or placeholders</p>
              </div>
            </div>
          </div>
        </section>

        {/* Event Types */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Event Types Explained</h2>
          <p className="text-muted-foreground">Event types are categorized by their system type:</p>

          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Mass Liturgy
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Standard Mass celebrations including Sunday Mass, Weekday Mass, Holy Day Mass, and special occasion Masses. These follow the standard Mass structure with proper readings from the lectionary.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Special Liturgy
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sacramental celebrations like Weddings, Funerals, Baptisms, and Quinceañeras. These have unique structures and specific ritual elements not found in regular Masses.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Parish Event
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Non-liturgical parish events like meetings, receptions, and social gatherings. These typically have simpler templates focused on logistics rather than ritual elements.
              </p>
            </div>
          </div>
        </section>

        {/* Scripts and Sections */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Working with Scripts</h2>
          <p className="text-muted-foreground">
            Scripts are the heart of {APP_NAME}&apos;s template system. Each script defines the complete order and content of a liturgical celebration.
          </p>

          <div className="space-y-3 mt-4">
            <h3 className="font-semibold">Common Script Sections</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
                <span><strong>Introductory Rites</strong> - Entrance, Greeting, Penitential Act, Gloria</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
                <span><strong>Liturgy of the Word</strong> - First Reading, Psalm, Second Reading, Gospel, Homily</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
                <span><strong>Liturgy of the Eucharist</strong> - Offertory, Eucharistic Prayer, Communion</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
                <span><strong>Concluding Rites</strong> - Announcements, Blessing, Dismissal</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg mt-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Tip: Customizing Scripts</p>
                <p className="text-sm text-muted-foreground mt-1">
                  While browsing scripts, note which sections and content blocks are available. You can create custom scripts based on these templates to match your parish&apos;s liturgical style.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Placeholder Variables */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Understanding Placeholder Variables</h2>
          <p className="text-muted-foreground">
            Placeholders are special codes that get replaced with actual data when a script is rendered. They allow templates to be reused across different events.
          </p>

          <div className="space-y-4 mt-4">
            <h3 className="font-semibold">Placeholder Syntax</h3>
            <p className="text-muted-foreground">
              Placeholders use double curly braces: <code className="px-2 py-1 bg-muted rounded text-sm">&#123;&#123;placeholder_name&#125;&#125;</code>
            </p>

            <h3 className="font-semibold mt-6">Common Placeholders</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Placeholder</th>
                    <th className="text-left py-3 px-4 font-semibold">Description</th>
                    <th className="text-left py-3 px-4 font-semibold">Example Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">&#123;&#123;event_date&#125;&#125;</code></td>
                    <td className="py-3 px-4 text-muted-foreground">The date of the event</td>
                    <td className="py-3 px-4 text-muted-foreground">January 15, 2025</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">&#123;&#123;event_time&#125;&#125;</code></td>
                    <td className="py-3 px-4 text-muted-foreground">The time of the event</td>
                    <td className="py-3 px-4 text-muted-foreground">10:30 AM</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">&#123;&#123;celebrant&#125;&#125;</code></td>
                    <td className="py-3 px-4 text-muted-foreground">The presiding priest or deacon</td>
                    <td className="py-3 px-4 text-muted-foreground">Fr. John Smith</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">&#123;&#123;liturgical_day&#125;&#125;</code></td>
                    <td className="py-3 px-4 text-muted-foreground">The liturgical celebration name</td>
                    <td className="py-3 px-4 text-muted-foreground">Third Sunday of Ordinary Time</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">&#123;&#123;first_reading&#125;&#125;</code></td>
                    <td className="py-3 px-4 text-muted-foreground">The first reading text</td>
                    <td className="py-3 px-4 text-muted-foreground">[Full reading text]</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">&#123;&#123;gospel&#125;&#125;</code></td>
                    <td className="py-3 px-4 text-muted-foreground">The Gospel reading text</td>
                    <td className="py-3 px-4 text-muted-foreground">[Full Gospel text]</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold mt-6">Special Liturgy Placeholders</h3>
            <p className="text-muted-foreground mb-3">
              Special liturgies like Weddings and Funerals have additional placeholders:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Placeholder</th>
                    <th className="text-left py-3 px-4 font-semibold">Used In</th>
                    <th className="text-left py-3 px-4 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">&#123;&#123;bride_name&#125;&#125;</code></td>
                    <td className="py-3 px-4 text-muted-foreground">Wedding</td>
                    <td className="py-3 px-4 text-muted-foreground">Full name of the bride</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">&#123;&#123;groom_name&#125;&#125;</code></td>
                    <td className="py-3 px-4 text-muted-foreground">Wedding</td>
                    <td className="py-3 px-4 text-muted-foreground">Full name of the groom</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">&#123;&#123;deceased_name&#125;&#125;</code></td>
                    <td className="py-3 px-4 text-muted-foreground">Funeral</td>
                    <td className="py-3 px-4 text-muted-foreground">Name of the deceased</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">&#123;&#123;child_name&#125;&#125;</code></td>
                    <td className="py-3 px-4 text-muted-foreground">Baptism</td>
                    <td className="py-3 px-4 text-muted-foreground">Name of the child being baptized</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">&#123;&#123;quinceañera_name&#125;&#125;</code></td>
                    <td className="py-3 px-4 text-muted-foreground">Quinceañera</td>
                    <td className="py-3 px-4 text-muted-foreground">Name of the young woman</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Troubleshooting Placeholder Issues</h2>
          <p className="text-muted-foreground">
            If placeholders aren&apos;t being replaced correctly, use the Template Browser to diagnose the issue:
          </p>

          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <h3 className="font-semibold">Placeholder shows as raw text</h3>
              </div>
              <p className="text-muted-foreground ml-8">
                The placeholder name may be misspelled or the data source may not be connected. Use the Template Browser to verify the exact placeholder name and ensure the corresponding data exists in the event.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <h3 className="font-semibold">Placeholder shows as empty</h3>
              </div>
              <p className="text-muted-foreground ml-8">
                The placeholder is recognized but the data is missing. Check that the required field has been filled in on the event (e.g., celebrant assigned, readings selected).
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <h3 className="font-semibold">Wrong data displayed</h3>
              </div>
              <p className="text-muted-foreground ml-8">
                Verify you&apos;re using the correct placeholder for the context. Some placeholders are event-type specific and won&apos;t work in other templates.
              </p>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Best Practices</h2>

          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Preview before printing</p>
                <p className="text-sm text-muted-foreground">Always preview rendered scripts to catch placeholder issues before printing</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Use consistent naming</p>
                <p className="text-sm text-muted-foreground">When creating custom templates, follow the existing naming conventions for placeholders</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Test with sample data</p>
                <p className="text-sm text-muted-foreground">Create a test event to verify all placeholders work correctly before using in production</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Document custom placeholders</p>
                <p className="text-sm text-muted-foreground">If you add custom placeholders, document what data they require</p>
              </div>
            </li>
          </ul>
        </section>

        {/* Help */}
        <section className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-3">Need Help?</h2>
          <p className="text-muted-foreground mb-4">
            Having trouble with templates or placeholders? We&apos;re here to help.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/support" variant="outline">
              Contact Support
            </LinkButton>
            <LinkButton href="/settings/template-browser" variant="default">
              Open Template Browser
            </LinkButton>
          </div>
        </section>

        {/* Back link */}
        <div className="pt-8 border-t border-border">
          <Link href="/settings/template-browser" className="inline-flex items-center text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Template Browser
          </Link>
        </div>
      </main>
    </div>
  )
}
