import { useEffect, useState } from 'react'
import { obtener } from './api.js'
import { formatoHora, formatoNombre } from './formato.js'
import './ficha.css'

// Reune las consultas de Prolog sobre una persona. Los accesos se consultan
// lugar por lugar con tiene_acceso/2; un lugar que falle no detiene la ficha.
async function consultarFicha(persona) {
  const base = `/personas/${encodeURIComponent(persona)}`
  const [movimientos, coartada, contradiccion, sospechoso, explicaciones, lugares, evento] = await Promise.all([
    obtener(`${base}/movimientos`),
    obtener(`${base}/coartada`),
    obtener(`${base}/contradiccion`),
    obtener(`${base}/sospechoso`),
    obtener(`${base}/explicaciones`),
    obtener('/lugares'),
    obtener('/evento'),
  ])
  const accesos = await Promise.allSettled(
    lugares.map(lugar => obtener(`${base}/acceso/${encodeURIComponent(lugar.nombre)}`)),
  )

  return {
    movimientos: [...movimientos].sort((a, b) => a.hora - b.hora),
    coartada: coartada.resultado,
    contradiccion: contradiccion.resultado,
    sospechoso: sospechoso.resultado,
    explicaciones,
    accesos: lugares
      .filter((_, i) => accesos[i].status === 'fulfilled' && accesos[i].value.resultado)
      .map(lugar => lugar.nombre),
    lugarEvento: evento?.lugar ?? null,
  }
}

function Indicador({ predicado, titulo, activo, tono }) {
  return (
    <div className={`indicador ${activo ? `indicador--${tono}` : ''}`}>
      <span className="indicador__titulo">{titulo}</span>
      <span className="indicador__valor">{activo ? 'Sí' : 'No'}</span>
      <code className="indicador__predicado">{predicado}</code>
    </div>
  )
}

function FichaPersona({ persona, onIr }) {
  const [ficha, setFicha] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Se ignora la respuesta si la pantalla se desmonto antes de que llegara.
    let activa = true
    consultarFicha(persona)
      .then(datos => {
        if (activa) setFicha(datos)
      })
      .catch(err => {
        if (activa) setError(err.message)
      })
    return () => {
      activa = false
    }
  }, [persona])

  return (
    <main className="ficha pixel-panel">
      <header className="ficha__cabecera">
        <h1>Ficha de {formatoNombre(persona)}</h1>
        <button type="button" className="pixel-btn pixel-btn--secundario" onClick={() => onIr('tablero')}>
          Volver al tablero
        </button>
      </header>

      {error && (
        <p className="mensaje mensaje--error" role="alert">
          {error}
        </p>
      )}
      {!ficha && !error && <p className="ficha__cargando">Consultando a Prolog...</p>}

      {ficha && (
        <>
          <section className="ficha__indicadores" aria-label="Resultado de las reglas">
            <Indicador predicado="posible_sospechoso/1" titulo="Sospechoso" activo={ficha.sospechoso} tono="peligro" />
            <Indicador
              predicado="tiene_contradiccion/1"
              titulo="Contradicción"
              activo={ficha.contradiccion}
              tono="peligro"
            />
            <Indicador predicado="tiene_coartada/1" titulo="Coartada" activo={ficha.coartada} tono="exito" />
          </section>

          <div className="ficha__grid">
            <section className="ficha__bloque">
              <h2>Movimientos</h2>
              {ficha.movimientos.length > 0 ? (
                <ol className="ficha__movimientos">
                  {ficha.movimientos.map(({ lugar, hora }) => (
                    <li key={`${lugar}-${hora}`}>
                      <span className="ficha__hora">{formatoHora(hora)}</span>
                      {formatoNombre(lugar)}
                      {lugar === ficha.lugarEvento && <span className="etiqueta">Lugar del evento</span>}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No hay movimientos registrados.</p>
              )}
            </section>

            <section className="ficha__bloque">
              <h2>Accesos</h2>
              {ficha.accesos.length > 0 ? (
                <ul className="ficha__accesos">
                  {ficha.accesos.map(lugar => (
                    <li key={lugar} className={`etiqueta etiqueta--objeto ${lugar === ficha.lugarEvento ? 'ficha__acceso-evento' : ''}`}>
                      {formatoNombre(lugar)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No tiene acceso a ningún lugar.</p>
              )}
            </section>
          </div>

          <section className="ficha__bloque">
            <h2>Explicaciones</h2>
            {ficha.explicaciones.length > 0 ? (
              <ul className="ficha__explicaciones">
                {ficha.explicaciones.map(explicacion => (
                  <li key={explicacion}>{explicacion}</li>
                ))}
              </ul>
            ) : (
              <p>Prolog no encontró explicaciones para esta persona.</p>
            )}
          </section>
        </>
      )}
    </main>
  )
}

export default FichaPersona
