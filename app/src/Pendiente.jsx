// Pantalla provisional para las vistas que aun no se implementan.
function Pendiente({ titulo, onVolver }) {
  return (
    <main className="pixel-panel pendiente">
      <h2>{titulo}</h2>
      <p>Pendiente: esta pantalla todavía no está implementada.</p>
      <button type="button" className="pixel-btn" onClick={onVolver}>
        Volver al tablero
      </button>
    </main>
  )
}

export default Pendiente
