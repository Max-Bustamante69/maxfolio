import { useLanguage } from '../../context/LanguageContext'
import type { ObraKind, Viewport, Vista } from '../data'

// Etiquetas de interfaz de la dirección A (es y en). El japonés cae a inglés hasta que Max elija dirección;
// los textos del registro (obras, cargos, FAQ, hero) ya vienen en los tres idiomas desde useV5().
const es = {
  saltar: 'Saltar al contenido',
  nav: { aria: 'Principal', inicio: 'Inicio', obra: 'Obra', trayectoria: 'Trayectoria', contacto: 'Contacto', cv: 'CV' },
  bb: 'Acciones',
  oferta: 'Oferta',
  idioma: 'Idioma',
  medellin: 'Medellín',
  hero: { cta: 'Pedir revisión', gratis: 'Gratis, 20 minutos.' },
  tipos: { store: 'Tienda', product: 'Producto', role: 'Entregable', personal: 'Personal' } satisfies Record<ObraKind, string>,
  tec: { bundles: 'Combos', quiz: 'Quiz', subscriptions: 'Suscripciones', reviews: 'Reseñas', migration: 'Migración', islands: 'Islas React', tracking: 'Tracking', i18n: 'Idiomas y monedas' } as Record<string, string>,
  libro: {
    titulo: 'Libro de entregas',
    construidas: (n: string) => `${n} tiendas construidas`,
    cols: { num: 'Nº', obra: 'Obra', rubro: 'Rubro', anio: 'Año', rol: 'Rol', periodo: 'Periodo 22–26' },
    verTodo: 'Ver el índice completo',
    vacio: 'Ninguna obra con esos filtros',
    pista: 'Cada fila se abre aquí mismo',
  },
  indice: {
    h1: 'El libro de obra', filtrar: 'Filtrar', tipo: 'Tipo', anio: 'Año', rol: 'Rol', tec: 'Tecnología', orden: 'Orden', ordenAnio: 'Año', ordenNombre: 'Nombre', limpiar: 'Limpiar todo',
    mostrando: (n: number) => `Mostrando ${n}`, filtros: (n: number) => (n === 1 ? '1 filtro' : `${n} filtros`), ver: (n: number) => `Ver ${n} ${n === 1 ? 'obra' : 'obras'}`,
  },
  panel: { abrirFicha: 'Abrir ficha', verTienda: 'Ver la tienda', verSitio: 'Ver el sitio', sinCaptura: 'Sin captura', cerrar: 'Cerrar' },
  datos: {
    rubro: 'Rubro', rol: 'Rol', anio: 'Año', construccion: 'Obra', pila: 'Pila', git: 'Git', lighthouse: 'Lighthouse', hechos: 'Hechos',
    commits: 'commits', secciones: 'secciones', primerCommit: 'primer commit',
    gitNota: (f: string) => `del repo de la tienda, a ${f}`,
    movil: 'Móvil', escritorio: 'Escritorio', rend: 'Rendimiento', acc: 'Accesibilidad', seo: 'SEO',
    lhNota: (f: string) => `medición local del ${f}, mejor de 3`,
  },
  ficha: {
    libro: 'Libro', no: (n: number) => `Nº ${n}`, home: 'Home', pdp: 'PDP', escritorio: 'Escritorio', movil: 'Móvil', anterior: 'Anterior', siguiente: 'Siguiente', vista: 'Vista', dispositivo: 'Dispositivo',
    noExiste: 'Esa obra no está en el libro', volver: 'Volver al libro', cierre: 'Tu tienda, la siguiente fila', vecinos: 'Otras obras',
    ejemploEn: (tienda: string) => `Ejemplo en ${tienda}`,
    // El texto alternativo dice qué se ve (la obra, la vista y el dispositivo); un producto se ve en una tienda, no en un «home».
    alt: (nombre: string, vista: Vista, vp: Viewport, tienda?: string) =>
      `Captura de ${nombre}${tienda ? ` en ${tienda}` : ''}${tienda ? '' : vista === 'home' ? ', página de inicio' : ', página de producto'}, ${vp === 'desktop' ? 'escritorio' : 'móvil'}`,
  },
  roles: { h1: 'El libro de roles', hoy: 'Hoy', segunCv: (p: string) => `Según el CV de Max, ${p}`, entregables: 'Entregables' },
  contacto: {
    canales: 'Canales directos', correo: 'Correo', copiado: 'Copiado', whatsapp: 'WhatsApp', linkedin: 'LinkedIn', llamadas: 'Llamadas',
    waTexto: 'Hola Max, quiero la revisión gratis de 20 minutos de mi tienda: ',
    urlTienda: 'URL de mi tienda:',
    elegir: 'Elegir',
    vias: 'Tres formas de empezar',
    form: { titulo: 'Escríbeme aquí', motivo: 'Motivo', correo: 'Tu correo', correoEjemplo: 'nombre@tutienda.com', mensaje: 'Mensaje', enviar: 'Enviar', enviando: 'Enviando', ok: 'Recibido. Te respondo por correo.', error: 'No se pudo enviar. Se abrió tu correo con el mensaje listo.' },
    presets: {
      revision: 'Quiero la revisión gratis de 20 minutos de mi tienda.',
      proyecto: 'Quiero construir un proyecto. Esto es lo que tengo en mente: ',
      continuo: 'Busco quien mantenga la ingeniería de mi tienda. Hoy tenemos: ',
      empleo: 'Te escribo por una vacante: ',
    },
    faq: 'Preguntas frecuentes',
  },
}

const en: typeof es = {
  saltar: 'Skip to content',
  nav: { aria: 'Main', inicio: 'Home', obra: 'Work', trayectoria: 'Career', contacto: 'Contact', cv: 'CV' },
  bb: 'Actions',
  oferta: 'Offer',
  idioma: 'Language',
  medellin: 'Medellín',
  hero: { cta: 'Get a review', gratis: 'Free, 20 minutes.' },
  tipos: { store: 'Store', product: 'Product', role: 'Deliverable', personal: 'Personal' },
  tec: { bundles: 'Bundles', quiz: 'Quiz', subscriptions: 'Subscriptions', reviews: 'Reviews', migration: 'Migration', islands: 'React islands', tracking: 'Tracking', i18n: 'Languages and currencies' },
  libro: {
    titulo: 'Delivery ledger',
    construidas: (n: string) => `${n} stores built`,
    cols: { num: 'No.', obra: 'Work', rubro: 'Industry', anio: 'Year', rol: 'Role', periodo: 'Period 22–26' },
    verTodo: 'See the full index',
    vacio: 'No work matches these filters',
    pista: 'Each row opens right here',
  },
  indice: {
    h1: 'The book of work', filtrar: 'Filter', tipo: 'Type', anio: 'Year', rol: 'Role', tec: 'Technology', orden: 'Sort', ordenAnio: 'Year', ordenNombre: 'Name', limpiar: 'Clear all',
    mostrando: (n: number) => `Showing ${n}`, filtros: (n: number) => (n === 1 ? '1 filter' : `${n} filters`), ver: (n: number) => `See ${n} ${n === 1 ? 'work' : 'works'}`,
  },
  panel: { abrirFicha: 'Open the sheet', verTienda: 'See the store', verSitio: 'See the site', sinCaptura: 'No capture', cerrar: 'Close' },
  datos: {
    rubro: 'Industry', rol: 'Role', anio: 'Year', construccion: 'Build', pila: 'Stack', git: 'Git', lighthouse: 'Lighthouse', hechos: 'Facts',
    commits: 'commits', secciones: 'sections', primerCommit: 'first commit',
    gitNota: (f: string) => `from the store repo, as of ${f}`,
    movil: 'Mobile', escritorio: 'Desktop', rend: 'Performance', acc: 'Accessibility', seo: 'SEO',
    lhNota: (f: string) => `local measurement on ${f}, best of 3`,
  },
  ficha: {
    libro: 'Book', no: (n: number) => `No. ${n}`, home: 'Home', pdp: 'PDP', escritorio: 'Desktop', movil: 'Mobile', anterior: 'Previous', siguiente: 'Next', vista: 'View', dispositivo: 'Device',
    noExiste: 'That work is not in the book', volver: 'Back to the book', cierre: 'Your store, the next row', vecinos: 'Other works',
    ejemploEn: (tienda: string) => `Example on ${tienda}`,
    alt: (nombre: string, vista: Vista, vp: Viewport, tienda?: string) =>
      `Screenshot of ${nombre}${tienda ? ` on ${tienda}` : ''}${tienda ? '' : vista === 'home' ? ', home page' : ', product page'}, ${vp === 'desktop' ? 'desktop' : 'mobile'}`,
  },
  roles: { h1: 'The book of roles', hoy: 'Today', segunCv: (p: string) => `According to Max's CV, ${p}`, entregables: 'Deliverables' },
  contacto: {
    canales: 'Direct channels', correo: 'Email', copiado: 'Copied', whatsapp: 'WhatsApp', linkedin: 'LinkedIn', llamadas: 'Calls',
    waTexto: "Hi Max, I'd like the free 20-minute review of my store: ",
    urlTienda: 'My store URL:',
    elegir: 'Choose',
    vias: 'Three ways to start',
    form: { titulo: 'Write to me here', motivo: 'Reason', correo: 'Your email', correoEjemplo: 'name@yourstore.com', mensaje: 'Message', enviar: 'Send', enviando: 'Sending', ok: 'Received. I will reply by email.', error: 'It could not be sent. Your email app opened with the message ready.' },
    presets: {
      revision: 'I want the free 20-minute review of my store.',
      proyecto: 'I want to build a project. Here is what I have in mind: ',
      continuo: 'I am looking for someone to maintain my store engineering. Today we have: ',
      empleo: 'I am writing about an opening: ',
    },
    faq: 'Frequently asked questions',
  },
}

const COPY = { es, en }
export type Copy = typeof es

/** Etiquetas de la dirección A en el idioma activo (ja cae a en). */
export function useCopy(): Copy {
  const { locale } = useLanguage()
  return COPY[locale === 'es' ? 'es' : 'en']
}
