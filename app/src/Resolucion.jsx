import Pendiente from './Pendiente.jsx'

// Se implementa en el commit "feat(app): pantalla resolver caso con el reporte completo".
function Resolucion({ onIr }) {
  return <Pendiente titulo="Resolver caso" onVolver={() => onIr('tablero')} />
}

export default Resolucion
