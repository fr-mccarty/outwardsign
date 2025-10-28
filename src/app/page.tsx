import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Plus,
  FileText,
  Sparkles,
  Church,
  Flower,
  Heart,
  BookOpen,
  Menu,
  Calendar,
  Music,
  ClipboardList,
  Printer
} from "lucide-react"
import {APP_NAME} from "@/lib/constants";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Flower className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">{APP_NAME}</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How it Works
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="flex justify-center mb-6">
          <Badge variant="secondary" className="px-4 py-2">
            <Church className="h-4 w-4 mr-2" />
            For Catholic Communities
          </Badge>
        </div>
        <h1 className="text-5xl font-bold tracking-tight">
          Complete Liturgical
          <span className="text-primary block">Management Platform</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Everything you need for liturgical planning, worship aids, ministry coordination, and
          community support - all in one sacred space designed for Catholic parishes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/signup">
              <Plus className="h-5 w-5 mr-2" />
              Get Started Today
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <Link href="#features">
              <BookOpen className="h-5 w-5 mr-2" />
              Explore Features
            </Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Complete Liturgical Management Suite</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From petitions to musical planning, ministry coordination to worship aids -
            everything your parish needs for seamless liturgical celebrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                Smart Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Input your community context and watch as traditional Catholic petitions
                are automatically generated with proper liturgical language and structure.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Sacrament celebrations</li>
                <li>• Memorial prayers</li>
                <li>• Healing intentions</li>
                <li>• Special requests</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                Multi-Language Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Serve diverse communities with petitions in multiple languages,
                each maintaining authentic liturgical traditions and proper formatting.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">English</Badge>
                <Badge variant="outline">Spanish</Badge>
                <Badge variant="outline">French</Badge>
                <Badge variant="outline">Latin</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                Liturgy Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Plan complete liturgical celebrations with prayer selection,
                preface choices, and reading coordination all in one place.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Prayer selection</li>
                <li>• Preface options</li>
                <li>• Reading coordination</li>
                <li>• Liturgical calendar</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                Worship Aids
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Generate complete worship aids and follow-along guides for your
                community, including newcomer-friendly explanations.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Complete worship aids</li>
                <li>• Newcomer guides</li>
                <li>• Multi-language support</li>
                <li>• Print-ready formats</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                Musical Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Coordinate musical selections and communicate with musicians
                for seamless liturgical celebrations.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Song selection</li>
                <li>• Musician coordination</li>
                <li>• Service planning</li>
                <li>• Sheet music library</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                Liturgical Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Integrated liturgical calendar with feast days, special readings,
                and planning tools for the entire church year.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Church year calendar</li>
                <li>• Feast day planning</li>
                <li>• Special readings</li>
                <li>• Event coordination</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Feature Highlight */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 border-2 border-primary/20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary text-primary-foreground rounded-xl">
                  <Printer className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold">Professional Print Layouts</h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Create beautiful, print-ready documents for your liturgical celebrations.
                Our specialized print layouts ensure professional typography and proper liturgical formatting.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Individual readings with pericopes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Complete reading collections</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Petitions with liturgical responses</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Combined readings and petitions</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border">
                <div className="text-center space-y-3">
                  <div className="text-sm text-muted-foreground font-medium">Print Options</div>
                  <div className="space-y-2">
                    <div className="bg-muted/50 rounded-lg p-3 text-left">
                      <div className="font-medium text-sm">Readings Only</div>
                      <div className="text-xs text-muted-foreground">Clean liturgical format</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-left">
                      <div className="font-medium text-sm">Petitions Only</div>
                      <div className="text-xs text-muted-foreground">With responses included</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-left">
                      <div className="font-medium text-sm">Combined Service</div>
                      <div className="text-xs text-muted-foreground">Complete celebration</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/signup">
                    <Printer className="h-4 w-4 mr-2" />
                    Try Print Features
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Streamlined Liturgical Management</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From initial planning to final execution, our platform guides you
            through every aspect of liturgical preparation and community coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Plan & Coordinate</h3>
              <p className="text-muted-foreground">
                Access all liturgical tools in one place - from petitions and readings
                to musical selections and minister coordination.
              </p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Generate & Customize</h3>
              <p className="text-muted-foreground">
                Create worship aids, follow-along guides, and all liturgical content
                with intelligent tools that understand Catholic traditions.
              </p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Execute Seamlessly</h3>
              <p className="text-muted-foreground">
                Use integrated calendar and communication tools to ensure every
                liturgical celebration runs smoothly from start to finish.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Example Output */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Everything You Need in One Platform</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how our integrated approach brings together all aspects of liturgical management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Smart Petitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-medium mb-2">Generated Petition Example:</p>
                <div className="text-muted-foreground">
                  For all bishops, may the Holy Spirit protect and guide them...<br/>
                  For those who are praying for healing, especially Maria Santos...<br/>
                  <span className="text-xs italic">+ 5 more intentions</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Liturgical Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-medium mb-2">Upcoming Events:</p>
                <div className="space-y-1 text-muted-foreground">
                  <div>Dec 25 - Christmas Day (Solemn)</div>
                  <div>Jan 1 - Mary, Mother of God</div>
                  <div>Jan 6 - Epiphany</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted/50 rounded-2xl p-12 text-center space-y-6">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Ready to Transform Your Liturgical Management?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join parishes worldwide who are creating more meaningful liturgical experiences
            with our comprehensive liturgical management platform.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/signup">
              <Heart className="h-5 w-5 mr-2" />
              Start Free Today
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <Link href="/login">
              <Church className="h-5 w-5 mr-2" />
              Sign In
            </Link>
          </Button>
        </div>
      </div>
      </div>
    </div>
  )
}
