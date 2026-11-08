import Pendiente from './Pendiente.jsx'

// Se implementa en el commit "feat(app): pantalla de sospechosos con explicaciones".
function Sospechosos({ onIr }) {
  return <Pendiente titulo="Sospechosos" onVolver={() => onIr('tablero')} />
}

export default Sospechosos
