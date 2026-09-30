import { useId, useMemo, useState, type ReactNode } from 'react'
import { useContent, useMediaQuery } from '../../hooks'
import { Pieza3D } from '../../three/Pieza3D'
import { useEscena3d } from '../../three/estado3d'
// Snapshot de las tiendas que la geometría de la órbita dibuja (slug + año del anillo). Es la verdad de lo que
// se ve; el nombre, el estado y el rol salen siempre del registro.
import datosOrbita from '../../three/piezas/camaras/orbita-tiendas.datos.json'
import type { Skin } from '../gallery'

/**
 * Vista alternativa de la sección Years (solo con `?3d=1`): la órbita de tiendas del estudio obsidiana.
 * Un anillo de titanio por año, una cuenta por tienda REAL del registro, y la perla violeta sobre la cuenta
 * elegida. La lista HTML es la representación accesible y táctil: pasar el puntero, enfocar o tocar un elemento
 * mueve la perla a su cuenta (un único estado gobierna lista y pieza, así nunca discrepan).
 *
 * Solo tiendas: la órbita no representa roles, productos ni proyectos propios (el gráfico sí) y la interfaz lo dice.
 * Este módulo se carga en diferido desde Years.tsx solo cuando el 3D está activo; sin `?3d=1` no se descarga.
 */

interface Textos {
  grupo: string
  grafico: string
  orbita: string
  alcance: string
  anillos: { exterior: string; medio: string; interior: string }
  elegida: string
  lista: string
  alt: string
  fija: string
  ayuda: string
  ayudaFina: string
}

const TEXTOS: Record<string, Textos> = {
  es: {
    grupo: 'Vista del recorrido',
    grafico: 'Gráfico',
    orbita: 'Órbita',
    alcance: 'La órbita cubre solo tiendas Shopify: un anillo por año de construcción ({dentro} al centro, {fuera} en el borde) y una cuenta por tienda. El gráfico suma además roles, productos y proyectos propios.',
    anillos: { exterior: 'anillo exterior', medio: 'anillo medio', interior: 'anillo interior' },
    elegida: 'Tienda elegida',
    lista: 'Tiendas de la órbita, por año',
    alt: 'Órbita de tiendas Shopify: un anillo de titanio por año, una cuenta de obsidiana por tienda y una perla violeta sobre la tienda elegida en la lista.',
    fija: 'Imagen fija: en este dispositivo el modelo 3D no se activa (movimiento reducido o equipo modesto), así que la perla no sigue tu elección. La lista sí funciona.',
    ayuda: 'Toca una tienda para llevar la perla a su cuenta.',
    ayudaFina: 'Pasa el puntero, enfoca o toca una tienda para llevar la perla a su cuenta.',
  },
  en: {
    grupo: 'Career view',
    grafico: 'Chart',
    orbita: 'Orbit',
    alcance: 'The orbit covers Shopify stores only: one ring per build year ({dentro} in the middle, {fuera} on the edge) and one bead per store. The chart also counts roles, products and side projects.',
    anillos: { exterior: 'outer ring', medio: 'middle ring', interior: 'inner ring' },
    elegida: 'Selected store',
    lista: 'Stores in the orbit, by year',
    alt: 'Orbit of Shopify stores: a titanium ring per year, an obsidian bead per store and a violet pearl on the store picked in the list.',
    fija: 'Still image: the 3D model does not activate on this device (reduced motion or a modest machine), so the pearl does not follow your pick. The list still works.',
    ayuda: 'Tap a store to move the pearl to its bead.',
    ayudaFina: 'Hover, focus or tap a store to move the pearl to its bead.',
  },
  ja: {
    grupo: '表示の切り替え',
    grafico: 'グラフ',
    orbita: '軌道',
    alcance: '軌道が表すのはShopifyストアだけです。構築した年ごとに1つのリング(中心が{dentro}年、外側が{fuera}年)、ストアごとに1つの玉。グラフにはこのほか、役職・プロダクト・個人プロジェクトも含まれます。',
    anillos: { exterior: '外側のリング', medio: '中間のリング', interior: '内側のリング' },
    elegida: '選択中のストア',
    lista: '軌道のストア(年別)',
    alt: 'Shopifyストアの軌道。年ごとのチタンのリング、ストアごとの黒曜石の玉、リストで選んだストアの上の紫の真珠。',
    fija: '静止画:この端末では3Dモデルが有効にならないため(視覚効果の軽減設定または端末性能)、真珠は選択に追従しません。リストは使えます。',
    ayuda: 'ストアをタップすると、真珠がその玉に移ります。',
    ayudaFina: 'ストアにポインターを合わせる、フォーカスする、またはタップすると、真珠がその玉に移ります。',
  },
}

/** La perla del póster reposa aquí (RESALTADO_DEFECTO de la gemela); es también la selección inicial del DOM. */
const INICIAL = 'the-gummy-box'

interface Props {
  skin: Skin
  /** La vista de siempre (el gráfico de la skin): se pinta tal cual mientras esta vista no esté elegida. */
  grafico: ReactNode
}

export default function YearsOrbita({ skin, grafico }: Props) {
  const { strings, registry, formatPeriod, locale } = useContent()
  const t = TEXTOS[locale] ?? TEXTOS.en
  const panelId = useId()
  const [vista, setVista] = useState<'grafico' | 'orbita'>('grafico')
  // El diseño por ancho se decide aquí (como en el resto de la sección) y no con utilidades `md:` nuevas: así el CSS
  // global queda byte a byte igual con el 3D apagado.
  const ancho = useMediaQuery('(min-width: 768px)', true)
  // Puntero fino y pantalla ancha: parallax y anillos girando. Móvil/táctil: pose fija del póster + lista que selecciona.
  const fino = useMediaQuery('(min-width: 768px) and (hover: hover) and (pointer: fine)', false)
  const { fase } = useEscena3d()

  // Cada cuenta = una tienda real del registro. Los años de los anillos salen del snapshot de la geometría.
  const { grupos, anios, porSlug } = useMemo(() => {
    const anioDe = new Map(datosOrbita.stores.map((s) => [s.slug, s.year]))
    const tiendas = registry.stores.filter((s) => anioDe.has(s.slug))
    if (import.meta.env.DEV && tiendas.length !== registry.stores.length) {
      console.warn('[YearsOrbita] el registro tiene tiendas que la órbita no dibuja: regenerar el activo p2-orbita-tiendas', registry.stores.filter((s) => !anioDe.has(s.slug)).map((s) => s.slug))
    }
    const anios = [...new Set(tiendas.map((s) => anioDe.get(s.slug)!))].sort((a, b) => b - a)
    const grupos = anios.map((anio) => ({
      anio,
      items: tiendas.filter((s) => anioDe.get(s.slug) === anio).sort((a, b) => (a.status === b.status ? 0 : a.status === 'live' ? -1 : 1)),
    }))
    return { grupos, anios, porSlug: new Map(tiendas.map((s) => [s.slug, s])) }
  }, [registry])

  const [elegida, setElegida] = useState(() => (porSlug.has(INICIAL) ? INICIAL : (grupos[0]?.items[0]?.slug ?? INICIAL)))
  const tienda = porSlug.get(elegida)

  // La obsidiana y el titanio se leen sobre claro: en superficies oscuras la pieza va sobre una placa de estudio
  // (degradado neutro claro, sin color de tema para no competir con el acento) con el radio propio de la skin.
  const placa = skin.dark ? `border ${skin.line} ${skin.frame === 'apple' || skin.frame === 'neo' ? 'rounded-[18px]' : ''}` : ''
  const placaEstilo = skin.dark ? { background: 'radial-gradient(120% 100% at 50% 38%, #f6f6f8 0%, #dcdce1 100%)' } : undefined
  const altoToque = ancho ? 36 : 44 // 44 px de objetivo táctil en móvil
  const label = `text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`
  const dot = (s: { status: string }) => (s.status === 'live' ? 'bg-[#34c759]' : 'bg-[#ff9f0a]')
  const anilloDe = (i: number) => (i === 0 ? t.anillos.exterior : i === anios.length - 1 ? t.anillos.interior : t.anillos.medio)
  const alcance = t.alcance.replace('{dentro}', String(anios[anios.length - 1] ?? '')).replace('{fuera}', String(anios[0] ?? ''))

  const toggle = (id: 'grafico' | 'orbita', texto: string) => (
    <button
      key={id}
      type="button"
      aria-pressed={vista === id}
      aria-controls={panelId}
      onClick={() => setVista(id)}
      style={{ minHeight: altoToque }}
      className={`press ${vista === id ? skin.chipOn : skin.chip}`}
    >
      {texto}
    </button>
  )

  return (
    <div>
      <div role="group" aria-label={t.grupo} className="mb-5 flex flex-wrap gap-2">
        {toggle('grafico', t.grafico)}
        {toggle('orbita', t.orbita)}
      </div>

      <div id={panelId}>
        {vista === 'grafico' ? (
          grafico
        ) : (
          <div className="mb-10 md:mb-14">
            <p className={`mb-6 max-w-2xl text-sm leading-relaxed ${skin.muted}`}>{alcance}</p>
            <div className="grid gap-6 md:grid-cols-12 md:items-center md:gap-10">
              <div className="md:col-span-7">
                <Pieza3D
                  slug="orbita-tiendas"
                  seleccionado={elegida}
                  interactiva={fino}
                  animar={fino}
                  sizes="(min-width: 768px) 700px, 100vw"
                  alt={t.alt}
                  style={placaEstilo}
                  className={`w-full ${ancho ? '' : 'max-w-xl'} ${placa}`}
                />
                {/* Sin 3D (movimiento reducido, equipo modesto…) la perla del póster no se mueve: se dice junto a la imagen. */}
                {fase === 'degradada' && <p className={`${skin.muted} mt-3 text-xs leading-relaxed`}>{t.fija}</p>}
              </div>
              <div className="min-w-0 md:col-span-5">
                {tienda && (
                  <div className={`border-t pb-6 pt-4 ${skin.line}`} style={{ minHeight: '8.5rem' }} data-orbita-elegida={tienda.slug}>
                    <p className={label}>{t.elegida}</p>
                    <p className={`${skin.title} mt-1 text-2xl leading-tight md:text-3xl`}>{tienda.name}</p>
                    <p className={`${skin.muted} mt-1 text-sm`}>
                      <span aria-hidden="true" className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${dot(tienda)}`} />
                      {tienda.status === 'live' ? strings.badges.live : strings.badges.dev} · {strings.badges.roles[tienda.role]} · {formatPeriod(tienda.timeline.start, tienda.timeline.end)}
                    </p>
                  </div>
                )}
                <div role="group" aria-label={t.lista} className="space-y-6">
                  {grupos.map((g, i) => (
                    <div key={g.anio}>
                      <p className={label}>
                        {g.anio} · {anilloDe(i)}
                      </p>
                      {/* Móvil: un carril horizontal por anillo (todo cabe en una pantalla junto a la pieza); escritorio: se envuelve. */}
                      <ul aria-label={`${g.anio} · ${anilloDe(i)}`} className={`mt-2 flex gap-2 ${ancho ? 'flex-wrap' : '-mx-4 overflow-x-auto px-4 no-scrollbar'}`}>
                        {g.items.map((s) => {
                          const on = s.slug === elegida
                          const elegir = () => setElegida(s.slug)
                          return (
                            <li key={s.slug} className="shrink-0">
                              <button
                                type="button"
                                data-orbita-tienda={s.slug}
                                aria-current={on ? 'true' : undefined}
                                // Sin `sr-only` dentro del carril: un hijo absoluto se escapa del scroll y ensancha la página en móvil.
                                aria-label={`${s.name} · ${s.status === 'live' ? strings.badges.live : strings.badges.dev}`}
                                onPointerEnter={(e) => e.pointerType !== 'touch' && elegir()}
                                onFocus={elegir}
                                onClick={elegir}
                                style={{ minHeight: altoToque }}
                                className={`press inline-flex items-center gap-2 ${on ? skin.chipOn : skin.chip}`}
                              >
                                <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dot(s)}`} />
                                <span>{s.name}</span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
                {fase !== 'degradada' && <p className={`${skin.muted} mt-5 text-xs leading-relaxed`}>{fino ? t.ayudaFina : t.ayuda}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
