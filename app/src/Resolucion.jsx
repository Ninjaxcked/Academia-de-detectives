import { useEffect, useState } from 'react'
import { obtener } from './api.js'
import { formatoHora, formatoNombre } from './formato.js'
import './resolucion.css'

// Un punto del reporte; los numeros siguen la lista que pide el enunciado.
function Punto({ numero, titulo, children }) {
  return (
    <section className="punto">
      <h3>
        <span className="punto__numero">{numero}</span>
        {titulo}
      </h3>
      {children}
    </section>
  )
}

function Expediente({ reporte, lugarEvento, onIr }) {
  const { persona, evidencias, movimientos, accesos, coartadas, contradicciones, explicaciones, valida } = reporte
  const ordenados = [...movimientos].sort((a, b) => a.hora - b.hora)

  return (
    <article className="expediente">
      <header className="expediente__cabecera">
        <h2>Expediente: {formatoNombre(persona)}</h2>
        <span className={`sello ${valida ? 'sello--valida' : 'sello--invalida'}`}>
          {valida ? 'Solución válida' : 'No validada'}
        </span>
      </header>

      <div className="expediente__puntos">
        <Punto numero="1" titulo="Persona responsable">
          <p>{formatoNombre(persona)}</p>
          <button type="button" className="pixel-btn pixel-btn--secundario" onClick={() => onIr('persona', persona)}>
            Ver ficha
          </button>
        </Punto>

        <Punto numero="2" titulo="Evidencias relacionadas">
          {evidencias.length > 0 ? (
            <ul>
              {evidencias.map(({ evidencia, lugar, hora }) => (
                <li key={evidencia}>
                  {formatoNombre(evidencia)} en {formatoNombre(lugar)} a las {formatoHora(hora)}
                </li>
              ))}
            </ul>
          ) : (
            <p>Ninguna.</p>
          )}
        </Punto>

        <Punto numero="3" titulo="Ubicación y movimientos">
          {ordenados.length > 0 ? (
            <ul>
              {ordenados.map(({ lugar, hora }) => (
                <li key={`${lugar}-${hora}`} className="expediente__movimiento">
                  <span className="expediente__hora">{formatoHora(hora)}</span>
                  {formatoNombre(lugar)}
                  {lugar === lugarEvento && <span className="etiqueta">Lugar del evento</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p>Sin movimientos registrados.</p>
          )}
        </Punto>

        <Punto numero="4" titulo="Accesos relevantes">
          {accesos.length > 0 ? (
            <ul className="expediente__accesos">
              {accesos.map(lugar => (
                <li key={lugar} className="etiqueta etiqueta--objeto">
                  {formatoNombre(lugar)}
                </li>
              ))}
            </ul>
          ) : (
            <p>Ninguno.</p>
          )}
        </Punto>

        <Punto numero="5" titulo="Coartadas y contradicciones">
          <ul>
            {coartadas.map(({ lugar, hora }) => (
              <li key={`c-${lugar}-${hora}`} className="expediente__coartada">
                Coartada: dice estar en {formatoNombre(lugar)} a las {formatoHora(hora)}, sin contradicciones.
              </li>
            ))}
            {contradicciones.map(c => (
              <li key={`k-${c.lugar_testimonio}-${c.hora_testimonio}-${c.lugar_registro}`} className="expediente__contradiccion">
                Contradicción: dijo estar en {formatoNombre(c.lugar_testimonio)} a las {formatoHora(c.hora_testimonio)}, pero
                el registro indica {formatoNombre(c.lugar_registro)} a las {formatoHora(c.hora_registro)}.
              </li>
            ))}
            {coartadas.length === 0 && contradicciones.length === 0 && <li>Sin coartadas ni contradicciones.</li>}
          </ul>
        </Punto>

        <Punto numero="6" titulo="Justificación lógica">
          <ul className="expediente__justificacion">
            {explicaciones.map(explicacion => (
              <li key={explicacion}>{explicacion}</li>
            ))}
          </ul>
        </Punto>
      </div>
    </article>
  )
}

function Resolucion({ onIr }) {
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Se ignora la respuesta si la pantalla se desmonto antes de que llegara.
    let activa = true
    obtener('/resolver_caso')
      .then(datos => {
        if (activa) setResultado(datos)
      })
      .catch(err => {
        if (activa) setError(err.message)
      })
    return () => {
      activa = false
    }
  }, [])

  const evento = resultado?.evento

  return (
    <main className="resolucion pixel-panel">
      <header className="resolucion__cabecera">
        <h1>Resolver caso</h1>
        <button type="button" className="pixel-btn pixel-btn--secundario" onClick={() => onIr('tablero')}>
          Volver al tablero
        </button>
      </header>

      {error && (
        <p className="mensaje mensaje--error" role="alert">
          {error}
        </p>
      )}
      {!resultado && !error && <p className="resolucion__cargando">Prolog está resolviendo el caso...</p>}

      {resultado && !evento && <p className="mensaje mensaje--error">El caso no tiene un evento central definido.</p>}

      {evento && (
        <>
          <section className="resolucion__conclusion" aria-live="polite">
            <p>
              Evento: <strong>{formatoNombre(evento.nombre)}</strong> en {formatoNombre(evento.lugar)} a las{' '}
              {formatoHora(evento.hora)}
            </p>
            {resultado.responsables.length > 0 ? (
              <p>
                Posibles responsables:{' '}
                <strong>{resultado.responsables.map(r => formatoNombre(r.persona)).join(', ')}</strong>
              </p>
            ) : (
              <p>Ninguna persona cumple las reglas para ser responsable del caso.</p>
            )}
          </section>

          {resultado.responsables.map(reporte => (
            <Expediente key={reporte.persona} reporte={reporte} lugarEvento={evento.lugar} onIr={onIr} />
          ))}
        </>
      )}
    </main>
  )
}

export default Resolucion
