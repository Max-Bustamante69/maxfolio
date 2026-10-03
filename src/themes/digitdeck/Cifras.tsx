// La banda de cifras del vivo, con su fuente: seis cifras del CV (cada una atribuida al cargo y al periodo de donde sale), la de las
// tiendas y la de las pruebas cuentan al entrar. Nada se calcula aquí: todo sale de useV5().cifras.
import { useV5 } from '../data'
import { Contador, Titulo, Valor, formatoCifra } from './piezas'

/** «20+» y «800+» cuentan de 0 al valor; las demás (rangos y flechas) se muestran tal cual. */
const ENTERO = /^(\d+)\+$/

export default function Cifras() {
  const { cifras, strings, locale } = useV5()
  const b = strings.sections.statBand
  return (
    <section className="dd-cifras dd-seccion" aria-labelledby="dd-cifras-t">
      <header className="dd-cifras__cab">
        <Titulo id="dd-cifras-t" className="dd-h2" lineas={[b.label]} />
        <p className="dd-micro" data-in>{b.asOf}</p>
      </header>
      <ul className="dd-cifras__lista">
        {cifras.map((c) => {
          const v = formatoCifra(c.valor, locale)
          const n = ENTERO.exec(v)
          return (
            <li key={c.id} className="dd-cifra" data-in="fila">
              <p className="dd-cifra__valor">
                {n ? <Contador hasta={Number(n[1])} sufijo="+" /> : <Valor v={v} />}
              </p>
              <p className="dd-cifra__etiqueta">{c.etiqueta}</p>
              <p className="dd-micro dd-cifra__fuente">
                <span>{b.sourceLabel}</span> · {c.fuente}
              </p>
            </li>
          )
        })}
      </ul>
      <p className="dd-micro dd-nota-pie" data-in>{b.note}</p>
    </section>
  )
}
