import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, CheckCircle2, AlertTriangle, Bot, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/link-button'
import { APP_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `MCP Server Setup Guide | ${APP_NAME}`,
  description: 'Learn how to connect Outward Sign to Claude using the Model Context Protocol (MCP) for AI-powered parish management.',
}

export default function MCPSetupGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/settings/parish/oauth-settings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to OAuth Settings
          </Link>
          <h1 className="text-3xl font-bold text-foreground">MCP Server Setup Guide</h1>
          <p className="text-muted-foreground mt-2">
            Connect {APP_NAME} to Claude for AI-powered parish management
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Introduction */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">What is MCP?</h2>
          <p className="text-muted-foreground leading-relaxed">
            The <strong>Model Context Protocol (MCP)</strong> is an open standard developed by Anthropic that allows AI assistants like Claude to securely connect to external data sources and tools. By connecting {APP_NAME} to Claude via MCP, you enable Claude to help manage your parish directly through natural conversation.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-lg border border-border bg-card">
              <Bot className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Natural Language</h3>
              <p className="text-sm text-muted-foreground">Ask Claude to look up masses, find people, or manage events using plain English.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <Shield className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Secure Access</h3>
              <p className="text-sm text-muted-foreground">OAuth 2.0 authentication ensures only authorized users can access parish data.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <Zap className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Real-time Data</h3>
              <p className="text-sm text-muted-foreground">Claude works with your live parish data, not outdated snapshots.</p>
            </div>
          </div>
        </section>

        {/* Prerequisites */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Prerequisites</h2>
          <p className="text-muted-foreground">Before you begin, make sure you have:</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
              <span>A <strong>Claude Pro, Team, or Enterprise</strong> subscription (MCP is not available on free plans)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
              <span><strong>Admin access</strong> to your parish in {APP_NAME}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-liturgy-green mt-0.5 flex-shrink-0" />
              <span><strong>OAuth enabled</strong> in your parish settings</span>
            </li>
          </ul>
        </section>

        {/* Step 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
            <h2 className="text-2xl font-semibold text-foreground">Enable OAuth in {APP_NAME}</h2>
          </div>

          <ol className="space-y-4 ml-11">
            <li className="space-y-2">
              <p><strong>Navigate to OAuth Settings</strong></p>
              <p className="text-muted-foreground">Go to <code className="px-2 py-1 bg-muted rounded text-sm">Settings → Parish Settings → OAuth Settings</code></p>
            </li>
            <li className="space-y-2">
              <p><strong>Enable OAuth</strong></p>
              <p className="text-muted-foreground">Toggle the &quot;Enable OAuth&quot; switch to ON</p>
            </li>
            <li className="space-y-2">
              <p><strong>Generate Client Credentials</strong></p>
              <p className="text-muted-foreground">Click &quot;Generate Client Credentials&quot; to create your OAuth client. You&apos;ll receive:</p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li><strong>Client ID</strong> - A unique identifier for your parish</li>
                <li><strong>Client Secret</strong> - A secret key (save this immediately - it&apos;s only shown once!)</li>
              </ul>
            </li>
          </ol>

          <div className="ml-11 p-4 bg-warning/10 border border-warning rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-warning">Important: Save Your Client Secret</p>
                <p className="text-sm text-muted-foreground mt-1">
                  The client secret is only displayed once when generated. Copy it immediately and store it securely. If you lose it, you&apos;ll need to regenerate a new one.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
            <h2 className="text-2xl font-semibold text-foreground">Add MCP Server in Claude</h2>
          </div>

          <ol className="space-y-4 ml-11">
            <li className="space-y-2">
              <p><strong>Open Claude Settings</strong></p>
              <p className="text-muted-foreground">
                Go to <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  claude.ai <ExternalLink className="h-3 w-3" />
                </a> and click your profile icon in the bottom-left corner, then select &quot;Settings&quot;
              </p>
            </li>
            <li className="space-y-2">
              <p><strong>Navigate to Integrations</strong></p>
              <p className="text-muted-foreground">In the settings menu, find and click on &quot;Integrations&quot; in the left sidebar</p>
            </li>
            <li className="space-y-2">
              <p><strong>Add Custom Integration</strong></p>
              <p className="text-muted-foreground">Click &quot;Add More&quot; at the bottom of the integrations list, then select &quot;Add custom integration&quot;</p>
            </li>
            <li className="space-y-2">
              <p><strong>Enter MCP Server URL</strong></p>
              <p className="text-muted-foreground">In the server URL field, enter:</p>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm">
                  https://outwardsign.church/mcp
                </code>
              </div>
            </li>
            <li className="space-y-2">
              <p><strong>Configure Authentication</strong></p>
              <p className="text-muted-foreground">Expand &quot;Advanced settings&quot; and enter your credentials:</p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 mt-2">
                <li><strong>Client ID:</strong> Paste the Client ID from {APP_NAME}</li>
                <li><strong>Client Secret:</strong> Paste the Client Secret you saved earlier</li>
              </ul>
            </li>
            <li className="space-y-2">
              <p><strong>Save the Integration</strong></p>
              <p className="text-muted-foreground">Click &quot;Add&quot; to save the integration</p>
            </li>
          </ol>
        </section>

        {/* Step 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
            <h2 className="text-2xl font-semibold text-foreground">Authorize the Connection</h2>
          </div>

          <ol className="space-y-4 ml-11">
            <li className="space-y-2">
              <p><strong>Start a Conversation</strong></p>
              <p className="text-muted-foreground">Open a new chat in Claude and ask something about your parish, like:</p>
              <div className="mt-2 p-3 bg-muted rounded-lg italic text-muted-foreground">
                &quot;Show me the masses scheduled for this Sunday&quot;
              </div>
            </li>
            <li className="space-y-2">
              <p><strong>Complete OAuth Authorization</strong></p>
              <p className="text-muted-foreground">
                Claude will prompt you to authorize the connection. Click the authorization link, which will redirect you to {APP_NAME} to confirm access.
              </p>
            </li>
            <li className="space-y-2">
              <p><strong>Grant Permissions</strong></p>
              <p className="text-muted-foreground">
                Review the requested permissions and click &quot;Authorize&quot; to grant Claude access to your parish data.
              </p>
            </li>
          </ol>
        </section>

        {/* What You Can Do */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">What Can Claude Do?</h2>
          <p className="text-muted-foreground">Once connected, you can ask Claude to help with many parish management tasks:</p>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-lg border border-border bg-card space-y-3">
              <h3 className="font-semibold">Masses & Events</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>&bull; List upcoming masses</li>
                <li>&bull; View mass schedules by date</li>
                <li>&bull; Check mass role assignments</li>
                <li>&bull; Find liturgical calendar information</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card space-y-3">
              <h3 className="font-semibold">People & Families</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>&bull; Search for parishioners</li>
                <li>&bull; View family information</li>
                <li>&bull; Check group memberships</li>
                <li>&bull; Find contact information</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card space-y-3">
              <h3 className="font-semibold">Sacraments</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>&bull; View upcoming weddings</li>
                <li>&bull; Check baptism schedules</li>
                <li>&bull; Review funeral arrangements</li>
                <li>&bull; Find sacrament preparation status</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card space-y-3">
              <h3 className="font-semibold">Administration</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>&bull; Generate reports</li>
                <li>&bull; Check mass intentions</li>
                <li>&bull; Review petition requests</li>
                <li>&bull; Find available ministers</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Permission Scopes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Understanding Permission Scopes</h2>
          <p className="text-muted-foreground">
            Scopes control what actions Claude can perform with your parish data. Parish admins can configure default scopes and per-user overrides.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Scope</th>
                  <th className="text-left py-3 px-4 font-semibold">Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">read</code></td>
                  <td className="py-3 px-4 text-muted-foreground">View parish data (masses, people, events, etc.)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">write</code></td>
                  <td className="py-3 px-4 text-muted-foreground">Create and update records (add masses, edit people, etc.)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">delete</code></td>
                  <td className="py-3 px-4 text-muted-foreground">Remove records (use with caution)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4"><code className="px-2 py-1 bg-muted rounded text-sm">profile</code></td>
                  <td className="py-3 px-4 text-muted-foreground">Access your user profile information</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Troubleshooting</h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">&quot;Integration not found&quot; error</h3>
              <p className="text-muted-foreground">
                Verify the MCP server URL is correct: <code className="px-2 py-1 bg-muted rounded text-sm">https://outwardsign.church/mcp</code>
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">&quot;Invalid credentials&quot; error</h3>
              <p className="text-muted-foreground">
                Double-check your Client ID and Client Secret. If the secret was lost, regenerate it in {APP_NAME} OAuth Settings and update Claude.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">&quot;OAuth not enabled&quot; error</h3>
              <p className="text-muted-foreground">
                Ensure OAuth is enabled in your parish settings. Go to Settings → Parish Settings → OAuth Settings and toggle &quot;Enable OAuth&quot; to ON.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">&quot;Insufficient permissions&quot; error</h3>
              <p className="text-muted-foreground">
                Your user account may not have the required scopes. Ask your parish admin to grant you appropriate OAuth permissions.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Connection works but Claude can&apos;t find data</h3>
              <p className="text-muted-foreground">
                Make sure you&apos;re asking about data that exists in your parish. Try a simple query first like &quot;List all masses&quot; to verify the connection.
              </p>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Security Best Practices</h2>

          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Keep your Client Secret secure</p>
                <p className="text-sm text-muted-foreground">Never share your client secret publicly or commit it to version control</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Use minimal scopes</p>
                <p className="text-sm text-muted-foreground">Only grant the permissions that are actually needed for your use case</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Review active tokens regularly</p>
                <p className="text-sm text-muted-foreground">Check the Active Tokens section in OAuth Settings and revoke any you don&apos;t recognize</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Regenerate secrets periodically</p>
                <p className="text-sm text-muted-foreground">Consider rotating your client secret every few months for enhanced security</p>
              </div>
            </li>
          </ul>
        </section>

        {/* Help */}
        <section className="p-6 rounded-lg border border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-3">Need Help?</h2>
          <p className="text-muted-foreground mb-4">
            If you&apos;re having trouble setting up the MCP connection, we&apos;re here to help.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/support" variant="outline">
              Contact Support
            </LinkButton>
            <Button asChild variant="outline">
              <a href="https://github.com/fr-mccarty/outwardsign/issues" target="_blank" rel="noopener noreferrer">
                Report an Issue <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </section>

        {/* Back link */}
        <div className="pt-8 border-t border-border">
          <Link href="/settings/parish/oauth-settings" className="inline-flex items-center text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to OAuth Settings
          </Link>
        </div>
      </main>
    </div>
  )
}
