import { useEffect, useState } from 'react'
import { obtener } from './api.js'
import { formatoNombre } from './formato.js'
import './sospechosos.css'

// Pide a Prolog los posibles responsables y, para cada uno, sus explicaciones.
async function consultarSospechosos() {
  const personas = await obtener('/posibles_responsables')
  const explicaciones = await Promise.all(personas.map(p => obtener(`/personas/${p}/explicaciones`)))
  return personas.map((persona, i) => ({ persona, explicaciones: explicaciones[i] }))
}

function Sospechosos({ onIr }) {
  const [sospechosos, setSospechosos] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Se ignora la respuesta si la pantalla se desmonto antes de que llegara.
    let activa = true
    consultarSospechosos()
      .then(datos => {
        if (activa) setSospechosos(datos)
      })
      .catch(err => {
        if (activa) setError(err.message)
      })
    return () => {
      activa = false
    }
  }, [])

  return (
    <main className="sospechosos pixel-panel">
      <header className="sospechosos__cabecera">
        <h1>Sospechosos</h1>
        <button type="button" className="pixel-btn pixel-btn--secundario" onClick={() => onIr('tablero')}>
          Volver al tablero
        </button>
      </header>

      {error && (
        <p className="mensaje mensaje--error" role="alert">
          {error}
        </p>
      )}
      {!sospechosos && !error && <p className="sospechosos__cargando">Consultando a Prolog...</p>}

      {sospechosos?.length === 0 && (
        <p className="mensaje">Ninguna persona cumple las reglas para ser sospechosa.</p>
      )}

      {sospechosos?.length > 0 && (
        <ul className="sospechosos__lista">
          {sospechosos.map(({ persona, explicaciones }) => (
            <li key={persona} className="sospechoso">
              <header className="sospechoso__cabecera">
                <h2>{formatoNombre(persona)}</h2>
                <button type="button" className="pixel-btn" onClick={() => onIr('persona', persona)}>
                  Ver ficha
                </button>
              </header>
              <ul className="sospechoso__explicaciones">
                {explicaciones.map(explicacion => (
                  <li key={explicacion}>{explicacion}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default Sospechosos
