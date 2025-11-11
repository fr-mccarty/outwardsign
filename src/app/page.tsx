'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
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
  Github,
  Languages,
  Sun,
  Moon
} from "lucide-react"
import { APP_NAME, APP_TAGLINE, GITHUB_URL, HomeLanguage, DEFAULT_HOME_LANGUAGE } from "@/lib/constants"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { TestingBanner } from "@/components/testing-banner"

// Translations for the homepage
const translations = {
  en: {
    nav: {
      features: "Features",
      sacraments: "Sacraments",
      howItWorks: "How it Works",
      login: "Login",
      getStarted: "Get Started"
    },
    hero: {
      forCatholicParishes: "For Catholic Parishes",
      freeOpenSource: "Free & Open Source",
      title: "Plan, Communicate, and Celebrate",
      titleHighlight: "Sacraments & Sacramentals with Excellence",
      subtitle: "The Sacraments and Sacramentals are the core activity of your parish. Stop juggling scattered documents, endless email chains, and last-minute scrambling. Prepare beautiful celebrations.",
      getStartedFree: "Get Started Free",
      seeHowItWorks: "See How It Works",
      disclaimer: "Free forever • No credit card required • Open source",
      problemStatement: "An outward sign instituted by Christ to give grace.",
      problemDescription: "This is the traditional Catholic definition of a sacrament. From weddings to funerals, baptisms to quinceañeras—with clear communication and proper preparation, you create moments of profound spiritual significance for individuals and the entire community."
    },
    features: {
      sectionTitle: "Everything You Need in One Place",
      sectionSubtitle: "From initial planning to the printed script in the sacristy—manage every aspect of sacrament and sacramental preparation with clarity and care.",
      sacramentManagement: {
        title: "Complete Sacrament & Sacramental Management",
        description: "Manage weddings, funerals, baptisms, presentations, and quinceañeras with dedicated workflows for each celebration type.",
        features: [
          "Custom forms for each sacrament type",
          "Track participants and family details",
          "Organize readings and liturgical elements"
        ]
      },
      scriptGeneration: {
        title: "Professional Script Generation",
        description: "Automatically generate beautiful, properly formatted liturgical scripts with readings, prayers, and all celebration details.",
        features: [
          "Complete liturgy scripts",
          "Readings with pericope references",
          "Customizable templates"
        ]
      },
      printExport: {
        title: "Print & Export Ready",
        description: "Export to PDF or Word for printing. Have beautifully formatted scripts ready in a binder for the presider to take to the sacristy.",
        features: [
          "One-click PDF generation",
          "Editable Word documents",
          "Professional typography"
        ]
      },
      calendar: {
        title: "Calendar Integration",
        description: "View all sacramental events in one calendar. Export to .ics feeds for seamless scheduling across your parish systems.",
        features: [
          "Unified parish calendar view",
          "Liturgical calendar integration",
          ".ics export for external calendars"
        ]
      },
      multilingual: {
        title: "Multilingual Support",
        description: "Serve diverse parish communities with built-in language management for all liturgical content and celebrations.",
        features: [
          "English and Spanish supported",
          "Bilingual script generation",
          "Language-specific templates"
        ]
      },
      freeOpenSource: {
        title: "Completely Free & Open Source",
        description: "Built for the Catholic community. Every parish deserves access to excellent sacrament preparation tools, regardless of budget. No subscriptions, no hidden fees, no limitations—ever.",
        noCost: {
          title: "No Cost",
          description: "Use all features free forever"
        },
        openSource: {
          title: "Open Source",
          description: "Transparent, community-driven code"
        },
        forAllParishes: {
          title: "For All Parishes",
          description: "Small or large, rural or urban"
        }
      }
    },
    sacraments: {
      sectionTitle: "Manage Every Sacrament & Sacramental",
      sectionSubtitle: "Dedicated workflows for each type of sacrament and sacramental your parish celebrates.",
      catechismQuote: "The sacraments are efficacious signs of grace, instituted by Christ and entrusted to the Church, by which divine life is dispensed to us.",
      catechismReference: "— Catechism of the Catholic Church (CCC 1131)",
      weddings: {
        title: "Weddings",
        description: "Bride, groom, ceremony planning, and celebration details"
      },
      funerals: {
        title: "Funerals",
        description: "Memorial planning, family support, and liturgy preparation"
      },
      baptisms: {
        title: "Baptisms",
        description: "Preparation classes, godparent tracking, celebration"
      },
      quinceaneras: {
        title: "Quinceañeras",
        description: "Cultural celebration planning and liturgical preparation"
      },
      presentations: {
        title: "Presentations",
        description: "Latino tradition celebrations and family coordination"
      }
    },
    howItWorks: {
      sectionTitle: "From Planning to Celebration",
      sectionSubtitle: "A simple, three-step process that takes you from initial planning to a beautifully prepared celebration.",
      step1: {
        title: "Plan Your Event",
        description: "Create the event, add participants, select readings and prayers. Build a complete celebration from start to finish."
      },
      step2: {
        title: "Prepare the Liturgy",
        description: "Select readings, add prayers, customize the celebration. The system generates a complete, properly formatted liturgical script."
      },
      step3: {
        title: "Print & Celebrate",
        description: "Export to PDF or Word, print the script, place it in a binder—ready for the presider to pick up and celebrate with confidence."
      }
    },
    printFeature: {
      title: "Ready for the Sacristy",
      description: "Being fully prepared means having the summary and script printed and ready in a binder for the priest, deacon, or church leader to confidently celebrate each sacrament and sacramental.",
      professionalTypography: {
        title: "Professional Typography",
        description: "Properly formatted for easy reading during liturgy"
      },
      completeScripts: {
        title: "Complete Scripts",
        description: "All readings, prayers, and celebration elements included"
      },
      exportOptions: {
        title: "Export Options",
        description: "PDF for printing, Word for editing and customization"
      },
      exampleExport: "Example Script",
      weddingCeremony: "Wedding Ceremony",
      firstReading: "First Reading",
      gospel: "Gospel",
      lector: "Lector",
      wordOfTheLord: "The word of the Lord.",
      thanksBe: "Thanks be to God.",
      fullScriptContinues: "+ Full script continues...",
      downloadPdf: "Download PDF",
      downloadWord: "Download Word"
    },
    whoItsFor: {
      sectionTitle: "Built for Parish Leaders",
      sectionSubtitle: "Designed with input from priests, deacons, and parish staff who understand the importance of beautiful, well-prepared celebrations of sacraments and sacramentals.",
      priestsDeacons: {
        title: "Priests & Deacons",
        description: "Celebrate confidently with complete, print-ready scripts"
      },
      pastoralAssociates: {
        title: "Pastoral Associates",
        description: "Coordinate families and staff throughout preparation"
      },
      liturgicalDirectors: {
        title: "Liturgical Directors",
        description: "Manage all parish liturgies from one platform"
      }
    },
    gettingStarted: {
      title: "Ready to Get Started?",
      subtitle: "Join parishes across the country making sacrament preparation simple and beautiful. Here's how easy it is:",
      step1: {
        title: "Create Your Account",
        description: "Sign up with your email. No credit card needed, ever.",
        time: "2 minutes"
      },
      step2: {
        title: "Set Up Your Parish",
        description: "Add your parish name and basic information.",
        time: "5 minutes"
      },
      step3: {
        title: "Create Your First Event",
        description: "Follow the simple form to plan a wedding, funeral, or baptism.",
        time: "20 minutes"
      },
      step4: {
        title: "Print & Celebrate",
        description: "Export a beautiful script, print it, and you're ready for the celebration.",
        time: "2 minutes"
      },
      totalTime: "Total: 30 minutes from signup to your first printed script",
      ctaButton: "Start Now - It's Free"
    },
    finalCTA: {
      title: "Beautiful Celebrations Are Evangelization",
      subtitle: "Join parishes who are creating moments of profound spiritual significance through careful preparation, clear communication, and beautiful celebrations of these outward signs instituted by Christ to give grace.",
      getStartedFree: "Get Started Free",
      signInToYourParish: "Sign In to Your Parish",
      disclaimer: "100% Free Forever • No Credit Card • No Hidden Fees • Open Source"
    },
    footer: {
      madeWith: "Made with care for Catholic parishes",
      freeForever: "Free Forever",
      openSource: "Open Source",
      viewOnGithub: "View on GitHub",
      license: "Licensed under MIT • Community-driven development"
    }
  },
  es: {
    nav: {
      features: "Características",
      sacraments: "Sacramentos",
      howItWorks: "Cómo Funciona",
      login: "Iniciar Sesión",
      getStarted: "Comenzar"
    },
    hero: {
      forCatholicParishes: "Para Parroquias Católicas",
      freeOpenSource: "Gratis y de Código Abierto",
      title: "Planifica, Comunica y Celebra",
      titleHighlight: "Sacramentos y Sacramentales con Excelencia",
      subtitle: "Los Sacramentos y Sacramentales son la actividad central de tu parroquia. Deja de hacer malabarismos con documentos dispersos, cadenas interminables de correos electrónicos y preparativos de último minuto. Prepara celebraciones hermosas.",
      getStartedFree: "Comenzar Gratis",
      seeHowItWorks: "Ver Cómo Funciona",
      disclaimer: "Gratis para siempre • No se requiere tarjeta de crédito • Código abierto",
      problemStatement: "Un signo visible instituido por Cristo para dar la gracia.",
      problemDescription: "Esta es la definición católica tradicional de un sacramento. Desde bodas hasta funerales, bautismos hasta quinceañeras—con comunicación clara y preparación adecuada, creas momentos de profundo significado espiritual para los individuos y toda la comunidad."
    },
    features: {
      sectionTitle: "Todo lo que Necesitas en un Solo Lugar",
      sectionSubtitle: "Desde la planificación inicial hasta el guion impreso en la sacristía—gestiona cada aspecto de la preparación de sacramentos y sacramentales con claridad y cuidado.",
      sacramentManagement: {
        title: "Gestión Completa de Sacramentos y Sacramentales",
        description: "Gestiona bodas, funerales, bautismos, presentaciones y quinceañeras con flujos de trabajo dedicados para cada tipo de celebración.",
        features: [
          "Formularios personalizados para cada tipo de sacramento",
          "Seguimiento de participantes y detalles familiares",
          "Organización de lecturas y elementos litúrgicos"
        ]
      },
      scriptGeneration: {
        title: "Generación Profesional de Guiones",
        description: "Genera automáticamente guiones litúrgicos hermosos y correctamente formateados con lecturas, oraciones y todos los detalles de la celebración.",
        features: [
          "Guiones litúrgicos completos",
          "Lecturas con referencias de perícopas",
          "Plantillas personalizables"
        ]
      },
      printExport: {
        title: "Listo para Imprimir y Exportar",
        description: "Exporta a PDF o Word para imprimir. Ten guiones bellamente formateados listos en una carpeta para que el presidente los lleve a la sacristía.",
        features: [
          "Generación de PDF con un clic",
          "Documentos Word editables",
          "Tipografía profesional"
        ]
      },
      calendar: {
        title: "Integración de Calendario",
        description: "Visualiza todos los eventos sacramentales en un solo calendario. Exporta a feeds .ics para una programación perfecta en todos los sistemas de tu parroquia.",
        features: [
          "Vista unificada del calendario parroquial",
          "Integración del calendario litúrgico",
          "Exportación .ics para calendarios externos"
        ]
      },
      multilingual: {
        title: "Soporte Multilingüe",
        description: "Sirve a comunidades parroquiales diversas con gestión integrada de idiomas para todo el contenido litúrgico y celebraciones.",
        features: [
          "Inglés y español disponibles",
          "Generación de guiones bilingües",
          "Plantillas específicas por idioma"
        ]
      },
      freeOpenSource: {
        title: "Completamente Gratis y de Código Abierto",
        description: "Construido para la comunidad católica. Cada parroquia merece acceso a excelentes herramientas de preparación sacramental, independientemente del presupuesto. Sin suscripciones, sin tarifas ocultas, sin limitaciones—nunca.",
        noCost: {
          title: "Sin Costo",
          description: "Usa todas las funciones gratis para siempre"
        },
        openSource: {
          title: "Código Abierto",
          description: "Código transparente e impulsado por la comunidad"
        },
        forAllParishes: {
          title: "Para Todas las Parroquias",
          description: "Pequeñas o grandes, rurales o urbanas"
        }
      }
    },
    sacraments: {
      sectionTitle: "Gestiona Cada Sacramento y Sacramental",
      sectionSubtitle: "Flujos de trabajo dedicados para cada tipo de sacramento y sacramental que tu parroquia celebra.",
      catechismQuote: "Los sacramentos son signos eficaces de la gracia, instituidos por Cristo y confiados a la Iglesia, por los cuales nos es dispensada la vida divina.",
      catechismReference: "— Catecismo de la Iglesia Católica (CIC 1131)",
      weddings: {
        title: "Bodas",
        description: "Novia, novio, planificación de ceremonia y detalles de celebración"
      },
      funerals: {
        title: "Funerales",
        description: "Planificación de memorial, apoyo familiar y preparación litúrgica"
      },
      baptisms: {
        title: "Bautismos",
        description: "Clases de preparación, seguimiento de padrinos, celebración"
      },
      quinceaneras: {
        title: "Quinceañeras",
        description: "Planificación de celebración cultural y preparación litúrgica"
      },
      presentations: {
        title: "Presentaciones",
        description: "Celebraciones de tradición latina y coordinación familiar"
      }
    },
    howItWorks: {
      sectionTitle: "Desde la Planificación hasta la Celebración",
      sectionSubtitle: "Un proceso simple de tres pasos que te lleva desde la planificación inicial hasta una celebración bellamente preparada.",
      step1: {
        title: "Planifica tu Evento",
        description: "Crea el evento, añade participantes, selecciona lecturas y oraciones. Construye una celebración completa de principio a fin."
      },
      step2: {
        title: "Prepara la Liturgia",
        description: "Selecciona lecturas, añade oraciones, personaliza la celebración. El sistema genera un guion litúrgico completo y correctamente formateado."
      },
      step3: {
        title: "Imprime y Celebra",
        description: "Exporta a PDF o Word, imprime el guion, colócalo en una carpeta—listo para que el presidente lo recoja y celebre con confianza."
      }
    },
    printFeature: {
      title: "Listo para la Sacristía",
      description: "Estar completamente preparado significa tener el resumen y el guion impresos y listos en una carpeta para que el sacerdote, diácono o líder de la iglesia celebre con confianza cada sacramento y sacramental.",
      professionalTypography: {
        title: "Tipografía Profesional",
        description: "Correctamente formateado para lectura fácil durante la liturgia"
      },
      completeScripts: {
        title: "Guiones Completos",
        description: "Todas las lecturas, oraciones y elementos de celebración incluidos"
      },
      exportOptions: {
        title: "Opciones de Exportación",
        description: "PDF para imprimir, Word para editar y personalizar"
      },
      exampleExport: "Ejemplo de Guion",
      weddingCeremony: "Ceremonia de Boda",
      firstReading: "Primera Lectura",
      gospel: "Evangelio",
      lector: "Lector",
      wordOfTheLord: "Palabra de Dios.",
      thanksBe: "Te alabamos, Señor.",
      fullScriptContinues: "+ El guion completo continúa...",
      downloadPdf: "Descargar PDF",
      downloadWord: "Descargar Word"
    },
    whoItsFor: {
      sectionTitle: "Construido para Líderes Parroquiales",
      sectionSubtitle: "Diseñado con el aporte de sacerdotes, diáconos y personal parroquial que comprenden la importancia de celebraciones hermosas y bien preparadas de sacramentos y sacramentales.",
      priestsDeacons: {
        title: "Sacerdotes y Diáconos",
        description: "Celebra con confianza con guiones completos y listos para imprimir"
      },
      pastoralAssociates: {
        title: "Asociados Pastorales",
        description: "Coordina familias y personal durante toda la preparación"
      },
      liturgicalDirectors: {
        title: "Directores Litúrgicos",
        description: "Gestiona todas las liturgias parroquiales desde una plataforma"
      }
    },
    gettingStarted: {
      title: "¿Listo para Comenzar?",
      subtitle: "Únete a parroquias en todo el país que hacen que la preparación sacramental sea simple y hermosa. Así de fácil es:",
      step1: {
        title: "Crea tu Cuenta",
        description: "Regístrate con tu correo electrónico. No necesitas tarjeta de crédito, nunca.",
        time: "2 minutos"
      },
      step2: {
        title: "Configura tu Parroquia",
        description: "Añade el nombre de tu parroquia e información básica.",
        time: "5 minutos"
      },
      step3: {
        title: "Crea tu Primer Evento",
        description: "Sigue el formulario simple para planificar una boda, funeral o bautismo.",
        time: "20 minutos"
      },
      step4: {
        title: "Imprime y Celebra",
        description: "Exporta un guion hermoso, imprímelo y estás listo para la celebración.",
        time: "2 minutos"
      },
      totalTime: "Total: 30 minutos desde el registro hasta tu primer guion impreso",
      ctaButton: "Comenzar Ahora - Es Gratis"
    },
    finalCTA: {
      title: "Las Celebraciones Hermosas Son Evangelización",
      subtitle: "Únete a las parroquias que están creando momentos de profundo significado espiritual a través de una preparación cuidadosa, comunicación clara y celebraciones hermosas de estos signos visibles instituidos por Cristo para dar la gracia.",
      getStartedFree: "Comenzar Gratis",
      signInToYourParish: "Inicia Sesión en tu Parroquia",
      disclaimer: "100% Gratis Para Siempre • Sin Tarjeta de Crédito • Sin Tarifas Ocultas • Código Abierto"
    },
    footer: {
      madeWith: "Hecho con cuidado para parroquias católicas",
      freeForever: "Gratis Para Siempre",
      openSource: "Código Abierto",
      viewOnGithub: "Ver en GitHub",
      license: "Licenciado bajo MIT • Desarrollo impulsado por la comunidad"
    }
  }
}

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState<HomeLanguage>(DEFAULT_HOME_LANGUAGE)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = translations[language]

  // Read language from URL on mount
  useEffect(() => {
    setMounted(true)
    const langParam = searchParams.get('lang')
    if (langParam === 'en' || langParam === 'es') {
      setLanguage(langParam)
    }
  }, [searchParams])

  // Update language and URL
  const handleLanguageChange = (newLang: HomeLanguage) => {
    setLanguage(newLang)
    const params = new URLSearchParams(searchParams.toString())
    params.set('lang', newLang)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Flower className="h-8 w-8 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xl font-bold">{APP_NAME}</span>
                  <span className="text-xs text-muted-foreground">{APP_TAGLINE}</span>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                {t.nav.features}
              </Link>
              <Link href="#sacraments" className="text-muted-foreground hover:text-foreground transition-colors">
                {t.nav.sacraments}
              </Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                {t.nav.howItWorks}
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hidden lg:block p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {mounted && theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-foreground" />
                ) : (
                  <Moon className="h-4 w-4 text-foreground" />
                )}
              </button>

              {/* Language Selector */}
              <div className="hidden lg:flex items-center gap-2 border border-border rounded-lg p-1">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    language === 'en'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('es')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    language === 'es'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ES
                </button>
              </div>

              <Button asChild variant="ghost" className="hidden md:inline-flex">
                <Link href="/login">{t.nav.login}</Link>
              </Button>
              <Button asChild className="hidden md:inline-flex">
                <Link href="/signup">{t.nav.getStarted}</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] p-6">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Flower className="h-6 w-6 text-primary" />
              {APP_NAME}
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-6 mt-8">
            {/* Navigation Links */}
            <nav className="flex flex-col gap-4">
              <Link
                href="#features"
                className="text-lg text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.features}
              </Link>
              <Link
                href="#sacraments"
                className="text-lg text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.sacraments}
              </Link>
              <Link
                href="#how-it-works"
                className="text-lg text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.howItWorks}
              </Link>
            </nav>

            <Separator />

            {/* Theme Picker */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">Theme</div>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
              </div>
            </div>

            <Separator />

            {/* Language Picker */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">Language</div>
              <div className="flex gap-2">
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    handleLanguageChange('en')
                  }}
                >
                  <Languages className="h-4 w-4 mr-2" />
                  English
                </Button>
                <Button
                  variant={language === 'es' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    handleLanguageChange('es')
                  }}
                >
                  <Languages className="h-4 w-4 mr-2" />
                  Español
                </Button>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">{t.nav.login}</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/signup">{t.nav.getStarted}</Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Testing Banner */}
      <TestingBanner />

      {/* Main Content */}
      <div>
        {/* Hero & Features Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-20">
        {/* Hero Section */}
        <div className="text-center space-y-8 py-12 md:py-20">
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Church className="h-4 w-4 mr-2" />
              {t.hero.forCatholicParishes}
            </Badge>
            <Badge variant="default" className="px-4 py-2 text-sm">
              <Heart className="h-4 w-4 mr-2" />
              {t.hero.freeOpenSource}
            </Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            {t.hero.title}
            <span className="text-primary block mt-2">{t.hero.titleHighlight}</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button asChild size="lg" className="text-lg px-8 h-12">
              <Link href="/signup">
                <Heart className="h-5 w-5 mr-2" />
                {t.hero.getStartedFree}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 h-12">
              <Link href="#how-it-works">
                {t.hero.seeHowItWorks}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            {t.hero.disclaimer}
          </p>

          {/* Problem Statement Banner */}
          <div className="max-w-4xl mx-auto pt-12">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{t.hero.problemStatement}</span>
                  {" "}{t.hero.problemDescription}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Features Section */}
        <div id="features" className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">{t.features.sectionTitle}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.features.sectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sacrament Management */}
            <Card className="bg-card text-card-foreground hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Church className="h-6 w-6 text-primary" />
                  </div>
                  {t.features.sacramentManagement.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {t.features.sacramentManagement.description}
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  {t.features.sacramentManagement.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Script Generation */}
            <Card className="bg-card text-card-foreground hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  {t.features.scriptGeneration.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {t.features.scriptGeneration.description}
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  {t.features.scriptGeneration.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Print & Export */}
            <Card className="bg-card text-card-foreground hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Printer className="h-6 w-6 text-primary" />
                  </div>
                  {t.features.printExport.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {t.features.printExport.description}
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  {t.features.printExport.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Calendar Integration */}
            <Card className="bg-card text-card-foreground hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  {t.features.calendar.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {t.features.calendar.description}
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  {t.features.calendar.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Multilingual */}
            <Card className="bg-card text-card-foreground hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  {t.features.multilingual.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {t.features.multilingual.description}
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  {t.features.multilingual.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Free & Open Source Highlight Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 border-2 border-primary/20 mt-8">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Heart className="h-8 w-8 text-primary" />
                <h3 className="text-2xl md:text-3xl font-bold">{t.features.freeOpenSource.title}</h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t.features.freeOpenSource.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div className="font-medium">{t.features.freeOpenSource.noCost.title}</div>
                  <div className="text-sm text-muted-foreground">{t.features.freeOpenSource.noCost.description}</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div className="font-medium">{t.features.freeOpenSource.openSource.title}</div>
                  <div className="text-sm text-muted-foreground">{t.features.freeOpenSource.openSource.description}</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div className="font-medium">{t.features.freeOpenSource.forAllParishes.title}</div>
                  <div className="text-sm text-muted-foreground">{t.features.freeOpenSource.forAllParishes.description}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>

        {/* Sacraments & Sacramentals Showcase - Full Width */}
        <div id="sacraments" className="bg-secondary text-secondary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">{t.sacraments.sectionTitle}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t.sacraments.sectionSubtitle}
              </p>
            </div>

          {/* Catechism Quote Banner */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <p className="text-lg italic text-muted-foreground leading-relaxed text-center">
                  "{t.sacraments.catechismQuote}"
                </p>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  {t.sacraments.catechismReference}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-card text-card-foreground text-center hover:shadow-lg transition-all hover:border-primary/20 border">
              <CardContent className="pt-8 pb-8">
                <VenusAndMars className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t.sacraments.weddings.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.sacraments.weddings.description}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground text-center hover:shadow-lg transition-all hover:border-primary/20 border">
              <CardContent className="pt-8 pb-8">
                <Cross className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t.sacraments.funerals.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.sacraments.funerals.description}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground text-center hover:shadow-lg transition-all hover:border-primary/20 border">
              <CardContent className="pt-8 pb-8">
                <Droplet className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t.sacraments.baptisms.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.sacraments.baptisms.description}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground text-center hover:shadow-lg transition-all hover:border-primary/20 border">
              <CardContent className="pt-8 pb-8">
                <BookHeart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t.sacraments.quinceaneras.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.sacraments.quinceaneras.description}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground text-center hover:shadow-lg transition-all hover:border-primary/20 border">
              <CardContent className="pt-8 pb-8">
                <HandHeartIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t.sacraments.presentations.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.sacraments.presentations.description}
                </p>
              </CardContent>
            </Card>
          </div>
            </div>
          </div>
        </div>

        {/* How It Works & Print Feature Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="space-y-20">
        {/* How It Works */}
        <div id="how-it-works" className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">{t.howItWorks.sectionTitle}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.howItWorks.sectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="bg-primary text-primary-foreground rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                1
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">{t.howItWorks.step1.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t.howItWorks.step1.description}
                </p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-primary text-primary-foreground rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                2
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">{t.howItWorks.step2.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t.howItWorks.step2.description}
                </p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-primary text-primary-foreground rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                3
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">{t.howItWorks.step3.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t.howItWorks.step3.description}
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
                  <h3 className="text-3xl font-bold">{t.printFeature.title}</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t.printFeature.description}
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{t.printFeature.professionalTypography.title}</div>
                      <div className="text-sm text-muted-foreground">{t.printFeature.professionalTypography.description}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{t.printFeature.completeScripts.title}</div>
                      <div className="text-sm text-muted-foreground">{t.printFeature.completeScripts.description}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{t.printFeature.exportOptions.title}</div>
                      <div className="text-sm text-muted-foreground">{t.printFeature.exportOptions.description}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card text-card-foreground rounded-xl p-6 shadow-xl border space-y-4">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t.printFeature.exampleExport}</div>
                <div className="bg-background rounded-lg p-8 space-y-6 border border-border">
                  {/* Event Title */}
                  <div className="text-center space-y-1">
                    <div className="font-bold text-lg text-foreground">{t.printFeature.weddingCeremony}</div>
                    <div className="text-sm text-muted-foreground">October 12, 2025 • 2:00 PM</div>
                  </div>

                  {/* First Reading */}
                  <div className="space-y-1 pt-4">
                    <div className="text-right font-bold text-sm text-destructive">
                      {t.printFeature.firstReading}
                    </div>
                    <div className="text-right italic text-xs text-destructive">
                      1 Corinthians 13:4-8a
                    </div>
                    <div className="text-right text-xs text-destructive">
                      {t.printFeature.lector}: Sarah Johnson
                    </div>
                    <div className="pt-2 text-sm leading-relaxed text-foreground">
                      Love is patient, love is kind. It is not jealous, it is not pompous, it is not inflated, it is not rude...
                    </div>
                    <div className="pt-1 italic text-sm text-muted-foreground">
                      {t.printFeature.wordOfTheLord}
                    </div>
                    <div className="pt-1 text-sm text-foreground">
                      <span className="font-bold">People: </span>
                      <span className="italic text-muted-foreground">{t.printFeature.thanksBe}</span>
                    </div>
                  </div>

                  {/* Gospel */}
                  <div className="space-y-1 pt-4">
                    <div className="text-right font-bold text-sm text-destructive">
                      {t.printFeature.gospel}
                    </div>
                    <div className="text-right italic text-xs text-destructive">
                      John 15:9-12
                    </div>
                    <div className="pt-2 text-sm leading-relaxed text-foreground">
                      As the Father loves me, so I also love you. Remain in my love...
                    </div>
                  </div>

                  {/* Continuation indicator */}
                  <div className="text-center pt-2 border-t border-border">
                    <div className="text-xs text-muted-foreground">{t.printFeature.fullScriptContinues}</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    {t.printFeature.downloadPdf}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    {t.printFeature.downloadWord}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>

        {/* Who It's For - Full Width */}
        <div className="bg-secondary text-secondary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">{t.whoItsFor.sectionTitle}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t.whoItsFor.sectionSubtitle}
              </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-card text-card-foreground text-center border">
              <CardContent className="pt-8 pb-8">
                <Church className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{t.whoItsFor.priestsDeacons.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.whoItsFor.priestsDeacons.description}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground text-center border">
              <CardContent className="pt-8 pb-8">
                <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{t.whoItsFor.pastoralAssociates.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.whoItsFor.pastoralAssociates.description}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground text-center border">
              <CardContent className="pt-8 pb-8">
                <FileText className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{t.whoItsFor.liturgicalDirectors.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.whoItsFor.liturgicalDirectors.description}
                </p>
              </CardContent>
            </Card>
          </div>
            </div>
          </div>
        </div>

        {/* Getting Started Section - Full Width */}
        <div className="bg-secondary text-secondary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">{t.gettingStarted.title}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t.gettingStarted.subtitle}
              </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Step 1 */}
            <Card className="bg-card text-card-foreground border relative">
              <CardContent className="pt-8 pb-6">
                <div className="absolute -top-4 left-6 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg">
                  1
                </div>
                <div className="mt-4 space-y-3">
                  <h3 className="font-semibold text-lg">{t.gettingStarted.step1.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.gettingStarted.step1.description}
                  </p>
                  <div className="pt-2">
                    <Badge variant="secondary" className="text-xs">
                      {t.gettingStarted.step1.time}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="bg-card text-card-foreground border relative">
              <CardContent className="pt-8 pb-6">
                <div className="absolute -top-4 left-6 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg">
                  2
                </div>
                <div className="mt-4 space-y-3">
                  <h3 className="font-semibold text-lg">{t.gettingStarted.step2.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.gettingStarted.step2.description}
                  </p>
                  <div className="pt-2">
                    <Badge variant="secondary" className="text-xs">
                      {t.gettingStarted.step2.time}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="bg-card text-card-foreground border relative">
              <CardContent className="pt-8 pb-6">
                <div className="absolute -top-4 left-6 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg">
                  3
                </div>
                <div className="mt-4 space-y-3">
                  <h3 className="font-semibold text-lg">{t.gettingStarted.step3.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.gettingStarted.step3.description}
                  </p>
                  <div className="pt-2">
                    <Badge variant="secondary" className="text-xs">
                      {t.gettingStarted.step3.time}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="bg-card text-card-foreground border relative">
              <CardContent className="pt-8 pb-6">
                <div className="absolute -top-4 left-6 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg">
                  4
                </div>
                <div className="mt-4 space-y-3">
                  <h3 className="font-semibold text-lg">{t.gettingStarted.step4.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.gettingStarted.step4.description}
                  </p>
                  <div className="pt-2">
                    <Badge variant="secondary" className="text-xs">
                      {t.gettingStarted.step4.time}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-y-6">
            <p className="text-lg font-medium text-muted-foreground">
              {t.gettingStarted.totalTime}
            </p>
            <Button asChild size="lg" className="text-lg px-8 h-12">
              <Link href="/signup">
                <ArrowRight className="h-5 w-5 mr-2" />
                {t.gettingStarted.ctaButton}
              </Link>
            </Button>
          </div>
            </div>
          </div>
        </div>

        {/* Final CTA Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-card text-card-foreground border-2 border-primary/20 rounded-2xl p-12 md:p-16 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {t.finalCTA.title}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t.finalCTA.subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 h-12">
              <Link href="/signup">
                <Church className="h-5 w-5 mr-2" />
                {t.finalCTA.getStartedFree}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 h-12">
              <Link href="/login">
                {t.finalCTA.signInToYourParish}
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground pt-4 font-medium">
            {t.finalCTA.disclaimer}
          </p>
        </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                <span className="font-semibold text-foreground">{APP_NAME}</span> • <span className="italic">{APP_TAGLINE}</span> • {t.footer.madeWith}
              </p>
              <p className="mb-3">outwardsign.church</p>
              <div className="flex items-center justify-center gap-4 text-xs">
                <Badge variant="outline" className="gap-1">
                  <Heart className="h-3 w-3" />
                  {t.footer.freeForever}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Globe className="h-3 w-3" />
                  {t.footer.openSource}
                </Badge>
                <Badge variant="outline" className="gap-1" asChild>
                  <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:bg-accent">
                    <Github className="h-3 w-3" />
                    {t.footer.viewOnGithub}
                  </a>
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {t.footer.license}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  )
}
