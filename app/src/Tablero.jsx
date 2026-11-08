import { useEffect, useState } from 'react'
import { obtener } from './api.js'
import { formatoHora, formatoNombre } from './formato.js'
import './tablero.css'

const consultarTablero = () =>
  Promise.all([obtener('/evento'), obtener('/personas'), obtener('/lugares'), obtener('/objetos')])

function Tablero({ onIr }) {
  const [caso, setCaso] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Se ignora la respuesta si la pantalla se desmonto antes de que llegara.
    let activa = true
    consultarTablero()
      .then(([evento, personas, lugares, objetos]) => {
        if (activa) setCaso({ evento, personas, lugares, objetos })
      })
      .catch(err => {
        if (activa) setError(err.message)
      })
    return () => {
      activa = false
    }
  }, [])

  return (
    <main className="tablero pixel-panel">
      <header className="tablero__cabecera">
        <h1>Tablero del caso</h1>
        <nav className="tablero__nav" aria-label="Pantallas del caso">
          <button type="button" className="pixel-btn" onClick={() => onIr('sospechosos')}>
            Sospechosos
          </button>
          <button type="button" className="pixel-btn" onClick={() => onIr('resolver')}>
            Resolver caso
          </button>
          <button type="button" className="pixel-btn pixel-btn--secundario" onClick={() => onIr('inicio')}>
            Inicio
          </button>
        </nav>
      </header>

      {error && (
        <p className="mensaje mensaje--error" role="alert">
          {error}
        </p>
      )}
      {!caso && !error && <p className="tablero__cargando">Consultando a Prolog...</p>}

      {caso && (
        <>
          <section className="tablero__evento" aria-label="Evento central">
            <h2>Evento</h2>
            {caso.evento ? (
              <p>
                <strong>{formatoNombre(caso.evento.nombre)}</strong> en {formatoNombre(caso.evento.lugar)} a las{' '}
                {formatoHora(caso.evento.hora)}
              </p>
            ) : (
              <p>Este caso no tiene un evento central definido.</p>
            )}
          </section>

          <div className="tablero__grid">
            <section className="tablero__bloque">
              <h2>Personas</h2>
              <p className="tablero__ayuda">Seleccione una persona para ver su ficha.</p>
              <ul className="tablero__personas">
                {caso.personas.map(persona => (
                  <li key={persona}>
                    <button
                      type="button"
                      className="pixel-btn pixel-btn--secundario"
                      onClick={() => onIr('persona', persona)}
                    >
                      {formatoNombre(persona)}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="tablero__bloque">
              <h2>Lugares</h2>
              <ul className="tablero__lugares">
                {caso.lugares.map(lugar => (
                  <li key={lugar.nombre}>
                    <span className="tablero__lugar">
                      {formatoNombre(lugar.nombre)}
                      {caso.evento?.lugar === lugar.nombre && <span className="etiqueta">Lugar del evento</span>}
                    </span>
                    <span className="tablero__descripcion">{lugar.descripcion}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="tablero__bloque">
              <h2>Objetos</h2>
              {caso.objetos.length > 0 ? (
                <ul className="tablero__objetos">
                  {caso.objetos.map(objeto => (
                    <li key={objeto} className="etiqueta etiqueta--objeto">
                      {formatoNombre(objeto)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Este caso no tiene objetos registrados.</p>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  )
}

export default Tablero
