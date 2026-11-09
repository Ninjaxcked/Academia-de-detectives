// Pruebas del puente Node -> Prolog. Solo usan node:test y node:assert,
// que vienen con Node. Se ejecutan con `npm test` dentro de server/.
import assert from 'node:assert/strict'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { consultar } from '../prolog.js'
import { validarHechos } from '../validacion.js'

const directorio = path.dirname(fileURLToPath(import.meta.url))
const GALERIA = path.join(directorio, '..', 'ejemplos', 'caso_galeria.pl')

describe('caso original (hechos.pl)', () => {
  it('lista las personas del caso', async () => {
    const personas = await consultar('personas')
    assert.deepEqual(personas, ['ana', 'bruno', 'carla', 'diego', 'elena'])
  })

  it('bruno es el unico posible responsable', async () => {
    assert.deepEqual(await consultar('posibles_responsables'), ['bruno'])
  })

  it('bruno tiene contradiccion y elena no es sospechosa', async () => {
    const contradiccion = await consultar('tiene_contradiccion', ['bruno'])
    assert.equal(contradiccion.resultado, true)
    const sospechosa = await consultar('posible_sospechoso', ['elena'])
    assert.equal(sospechosa.resultado, false)
  })

  it('resolver_caso marca la solucion de bruno como valida', async () => {
    const { evento, responsables } = await consultar('resolver_caso')
    assert.equal(evento.lugar, 'bodega')
    assert.equal(responsables.length, 1)
    assert.equal(responsables[0].persona, 'bruno')
    assert.equal(responsables[0].valida, true)
  })

  it('responde 404 si la persona no existe', async () => {
    await assert.rejects(consultar('explicaciones', ['nadie']), err => {
      assert.equal(err.estado, 404)
      assert.match(err.message, /Persona no encontrada/)
      return true
    })
  })
})

describe('caso de la galeria (ejemplos/caso_galeria.pl)', () => {
  it('los posibles responsables son fabian y hector', async () => {
    assert.deepEqual(await consultar('posibles_responsables', [], GALERIA), ['fabian', 'hector'])
  })

  it('fabian entra a la galeria gracias a la tarjeta', async () => {
    const acceso = await consultar('tiene_acceso', ['fabian', 'galeria'], GALERIA)
    assert.equal(acceso.resultado, true)
  })

  it('gabriela tiene coartada y no es sospechosa', async () => {
    const coartada = await consultar('tiene_coartada', ['gabriela'], GALERIA)
    assert.equal(coartada.resultado, true)
    const sospechosa = await consultar('posible_sospechoso', ['gabriela'], GALERIA)
    assert.equal(sospechosa.resultado, false)
  })
})

describe('validarHechos', () => {
  it('acepta un archivo que solo tiene hechos', () => {
    assert.doesNotThrow(() => validarHechos('persona(ana).\nlugar(sala, "Sala").\n'))
  })

  it('rechaza directivas que ejecutan codigo', () => {
    assert.throws(() => validarHechos(':- shell("del *").\npersona(ana).'), /solo puede contener hechos/)
  })

  it('rechaza reglas', () => {
    assert.throws(() => validarHechos('sospechoso(X) :- persona(X).'), /solo puede contener hechos/)
  })
})
