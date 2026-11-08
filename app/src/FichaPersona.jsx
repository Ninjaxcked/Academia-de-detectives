import { formatoNombre } from './formato.js'
import Pendiente from './Pendiente.jsx'

// Se implementa en el commit "feat(app): ficha de persona".
function FichaPersona({ persona, onIr }) {
  return <Pendiente titulo={`Ficha de ${formatoNombre(persona)}`} onVolver={() => onIr('tablero')} />
}

export default FichaPersona
