export const SYSTEM_ANNOUNCEMENT_TEMPLATES = {
  english: {
    weekly_bulletin: {
      title: "Weekly Bulletin Announcement",
      text: `Dear Parish Family,

We invite you to join us for this week's liturgical celebration. Please review the following important announcements:

• Mass times: [Insert times]
• Special collections: [Insert details]
• Upcoming events: [Insert events]

May God bless you and your families.

In Christ,
Parish Staff`
    },
    special_event: {
      title: "Special Event Announcement", 
      text: `Join us for a special celebration!

Event: [Event Name]
Date: [Date]
Time: [Time] 
Location: [Location]

All parishioners and their families are warmly invited to attend. Light refreshments will be provided.

For more information, please contact the parish office.

Peace and blessings,
Parish Community`
    }
  },
  spanish: {
    weekly_bulletin: {
      title: "Anuncio del Boletín Semanal",
      text: `Querida Familia Parroquial,

Los invitamos a acompañarnos en la celebración litúrgica de esta semana. Por favor revisen los siguientes anuncios importantes:

• Horarios de Misa: [Insertar horarios]
• Colectas especiales: [Insertar detalles]
• Próximos eventos: [Insertar eventos]

Que Dios los bendiga a ustedes y sus familias.

En Cristo,
Personal Parroquial`
    },
    special_event: {
      title: "Anuncio de Evento Especial",
      text: `¡Acompáñanos en una celebración especial!

Evento: [Nombre del Evento]
Fecha: [Fecha]
Hora: [Hora]
Lugar: [Lugar]

Todos los feligreses y sus familias están cordialmente invitados a asistir. Se servirán refrigerios ligeros.

Para más información, por favor contacten la oficina parroquial.

Paz y bendiciones,
Comunidad Parroquial`
    }
  }
} as const

export type TemplateLanguage = keyof typeof SYSTEM_ANNOUNCEMENT_TEMPLATES
export type TemplateType = keyof typeof SYSTEM_ANNOUNCEMENT_TEMPLATES.english