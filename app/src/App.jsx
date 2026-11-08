import { useState } from 'react'
import FichaPersona from './FichaPersona.jsx'
import Inicio from './inicio.jsx'
import Resolucion from './Resolucion.jsx'
import Sospechosos from './Sospechosos.jsx'
import Tablero from './Tablero.jsx'

function App() {
  const [pantalla, setPantalla] = useState('inicio')
  const [persona, setPersona] = useState(null)

  // Cambia de pantalla; la ficha de persona recibe ademas el nombre de la persona.
  const ir = (destino, nombrePersona = null) => {
    setPersona(nombrePersona)
    setPantalla(destino)
  }

  switch (pantalla) {
    case 'tablero':
      return <Tablero onIr={ir} />
    case 'persona':
      return <FichaPersona persona={persona} onIr={ir} />
    case 'sospechosos':
      return <Sospechosos onIr={ir} />
    case 'resolver':
      return <Resolucion onIr={ir} />
    default:
      return <Inicio onIniciar={() => ir('tablero')} />
  }
}

export default App
