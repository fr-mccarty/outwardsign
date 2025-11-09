import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Church,
  Flower,
  Heart,
  Users,
  FileText,
  Printer,
  Calendar,
  Globe,
  CheckCircle2,
  ArrowRight,
  Menu,
  Cross,
  Droplet,
  BookHeart,
  HandHeartIcon,
  VenusAndMars,
  Github
} from "lucide-react"
import { APP_NAME, GITHUB_URL } from "@/lib/constants"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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
              <Link href="#sacraments" className="text-muted-foreground hover:text-foreground transition-colors">
                Sacraments
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
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-8 py-12 md:py-20">
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Church className="h-4 w-4 mr-2" />
              For Catholic Parishes
            </Badge>
            <Badge variant="default" className="px-4 py-2 text-sm bg-primary">
              <Heart className="h-4 w-4 mr-2" />
              Free & Open Source
            </Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            Plan, Communicate, and Celebrate
            <span className="text-primary block mt-2">Sacraments & Sacramentals with Excellence</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The Sacraments and Sacramentals are the core activity of your parish. Stop juggling scattered documents,
            endless email chains, and last-minute scrambling. Prepare beautiful celebrations—together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button asChild size="lg" className="text-lg px-8 h-12">
              <Link href="/signup">
                <Heart className="h-5 w-5 mr-2" />
                Get Started Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 h-12">
              <Link href="#how-it-works">
                See How It Works
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            Free forever • No credit card required • Open source
          </p>

          {/* Problem Statement Banner */}
          <div className="max-w-4xl mx-auto pt-12">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Every sacrament and sacramental celebration deserves excellence.</span>
                  {" "}From weddings to funerals, baptisms to quinceañeras—when parish staff, presiders, and families
                  work together with clear communication and proper preparation, you create moments of profound
                  spiritual significance for individuals and the entire community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Features Section */}
        <div id="features" className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Everything You Need in One Place</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From initial planning to the printed script in the sacristy—manage every aspect
              of sacrament and sacramental preparation with clarity and care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sacrament Management */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Church className="h-6 w-6 text-primary" />
                  </div>
                  Complete Sacrament & Sacramental Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage weddings, funerals, baptisms, presentations, and quinceañeras
                  with dedicated workflows for each celebration type.
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Custom forms for each sacrament type</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Track participants and family details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Organize readings and liturgical elements</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Collaboration */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  Staff & Family Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Work together seamlessly with presiders, parish staff, and families
                  throughout the entire preparation process.
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Parish directory with role management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Shared access to event details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Clear communication channels</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Script Generation */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  Professional Script Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Automatically generate beautiful, properly formatted liturgical scripts
                  with readings, prayers, and all celebration details.
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Complete liturgy scripts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Readings with pericope references</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Customizable templates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Print & Export */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Printer className="h-6 w-6 text-primary" />
                  </div>
                  Print & Export Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Export to PDF or Word for printing. Have beautifully formatted scripts
                  ready in a binder for the presider to take to the sacristy.
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>One-click PDF generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Editable Word documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Professional typography</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Calendar Integration */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  Calendar Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View all sacramental events in one calendar. Export to .ics feeds
                  for seamless scheduling across your parish systems.
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Unified parish calendar view</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Liturgical calendar integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>.ics export for external calendars</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Multilingual */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  Multilingual Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Serve diverse parish communities with built-in language management
                  for all liturgical content and celebrations.
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>English and Spanish supported</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Bilingual script generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Language-specific templates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Free & Open Source Highlight Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 border-2 border-primary/20 mt-8">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Heart className="h-8 w-8 text-primary" />
                <h3 className="text-2xl md:text-3xl font-bold">Completely Free & Open Source</h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Built for the Catholic community. Every parish deserves access to excellent sacrament preparation tools,
                regardless of budget. No subscriptions, no hidden fees, no limitations—ever.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div className="font-medium">No Cost</div>
                  <div className="text-sm text-muted-foreground">Use all features free forever</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div className="font-medium">Open Source</div>
                  <div className="text-sm text-muted-foreground">Transparent, community-driven code</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div className="font-medium">For All Parishes</div>
                  <div className="text-sm text-muted-foreground">Small or large, rural or urban</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sacraments & Sacramentals Showcase */}
        <div id="sacraments" className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Manage Every Sacrament & Sacramental</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dedicated workflows for each type of sacrament and sacramental your parish celebrates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="text-center hover:shadow-lg transition-all hover:border-primary/20 border-2">
              <CardContent className="pt-8 pb-8">
                <VenusAndMars className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Weddings</h3>
                <p className="text-sm text-muted-foreground">
                  Bride, groom, ceremony planning, and celebration details
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover:border-primary/20 border-2">
              <CardContent className="pt-8 pb-8">
                <Cross className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Funerals</h3>
                <p className="text-sm text-muted-foreground">
                  Memorial planning, family support, and liturgy preparation
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover:border-primary/20 border-2">
              <CardContent className="pt-8 pb-8">
                <Droplet className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Baptisms</h3>
                <p className="text-sm text-muted-foreground">
                  Preparation classes, godparent tracking, celebration
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover:border-primary/20 border-2">
              <CardContent className="pt-8 pb-8">
                <BookHeart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Quinceañeras</h3>
                <p className="text-sm text-muted-foreground">
                  Cultural celebration planning and liturgical preparation
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover:border-primary/20 border-2">
              <CardContent className="pt-8 pb-8">
                <HandHeartIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Presentations</h3>
                <p className="text-sm text-muted-foreground">
                  Latino tradition celebrations and family coordination
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">From Planning to Celebration</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, three-step process that takes you from initial planning
              to a beautifully prepared celebration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="bg-primary text-primary-foreground rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                1
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Plan Together</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create the event, add participants, assign roles.
                  Parish staff and families collaborate in real-time with shared access.
                </p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-primary text-primary-foreground rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                2
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Prepare the Liturgy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Select readings, add prayers, customize the celebration.
                  The system generates a complete, properly formatted liturgical script.
                </p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-primary text-primary-foreground rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                3
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Print & Celebrate</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Export to PDF or Word, print the script, place it in a binder—
                  ready for the presider to pick up and celebrate with confidence.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Print Feature Highlight */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-8 md:p-12 border-2 border-primary/20">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary text-primary-foreground rounded-xl shadow-lg">
                    <Printer className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-bold">Ready for the Sacristy</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Being fully prepared means having the summary and script printed and ready
                  in a binder for the priest, deacon, or church leader to confidently celebrate
                  each sacrament and sacramental.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Professional Typography</div>
                      <div className="text-sm text-muted-foreground">Properly formatted for easy reading during liturgy</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Complete Scripts</div>
                      <div className="text-sm text-muted-foreground">All readings, prayers, and celebration elements included</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Export Options</div>
                      <div className="text-sm text-muted-foreground">PDF for printing, Word for editing and customization</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-xl border-2 space-y-4">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Example Export</div>
                <div className="bg-muted/50 rounded-lg p-6 space-y-3 font-mono text-sm">
                  <div className="font-bold text-base">Wedding Ceremony</div>
                  <div className="text-muted-foreground">October 12, 2025 • 2:00 PM</div>
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="text-xs text-muted-foreground">First Reading</div>
                    <div className="text-sm">1 Corinthians 13:4-8a</div>
                    <div className="text-xs italic text-muted-foreground">Love is patient, love is kind...</div>
                  </div>
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="text-xs text-muted-foreground">Gospel</div>
                    <div className="text-sm">John 15:9-12</div>
                    <div className="text-xs italic text-muted-foreground">As the Father loves me...</div>
                  </div>
                  <div className="text-center pt-2">
                    <div className="text-xs text-muted-foreground">+ Full script continues...</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Word
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Who It's For */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Built for Parish Leaders</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed with input from priests, deacons, and parish staff who understand
              the importance of beautiful, well-prepared celebrations of sacraments and sacramentals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-2">
              <CardContent className="pt-8 pb-8">
                <Church className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Priests & Deacons</h3>
                <p className="text-sm text-muted-foreground">
                  Celebrate confidently with complete, print-ready scripts
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2">
              <CardContent className="pt-8 pb-8">
                <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Pastoral Associates</h3>
                <p className="text-sm text-muted-foreground">
                  Coordinate families and staff throughout preparation
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2">
              <CardContent className="pt-8 pb-8">
                <FileText className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Liturgical Directors</h3>
                <p className="text-sm text-muted-foreground">
                  Manage all parish liturgies from one platform
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2">
              <CardContent className="pt-8 pb-8">
                <Heart className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Parish Staff</h3>
                <p className="text-sm text-muted-foreground">
                  Collaborate seamlessly across the entire team
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-12 md:p-16 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Transform Your Sacrament & Sacramental Preparation
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
              Join parishes who are creating moments of profound spiritual significance
              through careful preparation, clear communication, and beautiful celebrations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 h-12">
              <Link href="/signup">
                <Church className="h-5 w-5 mr-2" />
                Get Started Free
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 h-12 bg-background text-foreground hover:bg-background/90">
              <Link href="/login">
                Sign In to Your Parish
              </Link>
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/80 pt-4 font-medium">
            100% Free Forever • No Credit Card • No Hidden Fees • Open Source
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                <span className="font-semibold text-foreground">{APP_NAME}</span> • Made with care for Catholic parishes
              </p>
              <p className="mb-3">outwardsign.church</p>
              <div className="flex items-center justify-center gap-4 text-xs">
                <Badge variant="outline" className="gap-1">
                  <Heart className="h-3 w-3" />
                  Free Forever
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Globe className="h-3 w-3" />
                  Open Source
                </Badge>
                <Badge variant="outline" className="gap-1" asChild>
                  <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:bg-accent">
                    <Github className="h-3 w-3" />
                    View on GitHub
                  </a>
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Licensed under MIT • Community-driven development
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
