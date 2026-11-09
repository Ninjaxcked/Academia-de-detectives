# Academia de Detectives

Sistema de investigación lógica para el Proyecto Programado 3 de IC-4700 Lenguajes de Programación (TEC).

Un caso (personas, lugares, objetos, accesos, movimientos, evidencias, testimonios y un evento central) se describe con hechos en Prolog. Las reglas en Prolog deducen coartadas, contradicciones, posibles sospechosos y la resolución del caso. La interfaz en React, con estilo pixel, solo envía los datos del usuario y muestra lo que responde Prolog.

```
React (app/)  --GET/POST-->  Express (server/)  --swipl api.pl-->  Prolog (server/componentes/)
```

## Requisitos

- [SWI-Prolog](https://www.swi-prolog.org/download/stable) 9 o superior, con `swipl` en el PATH.
  Si no está en el PATH, defina la variable `SWIPL` con la ruta completa al ejecutable.
- [Node.js](https://nodejs.org/) 22 o superior.

## Instalación y ejecución

Desde la carpeta raíz del proyecto:

```
npm run instalar
npm run dev
```

- `npm run instalar` instala las dependencias de la raíz, de `server/` y de `app/`.
- `npm run dev` levanta el servidor (http://127.0.0.1:3001) y la interfaz (http://localhost:5173) al mismo tiempo.

Abra http://localhost:5173 en el navegador.

También se pueden levantar por separado, cada uno en su terminal:

```
cd server && npm start
cd app && npm run dev
```

## Cambiar el caso

Hay dos formas de usar otro archivo de hechos:

1. **Reemplazar el archivo** `server/componentes/hechos.pl` y reiniciar el servidor.
2. **Desde la interfaz**, con el botón "Cargar archivo" de la pantalla de inicio. El archivo se valida antes de activarse y "Caso original" vuelve al `hechos.pl` original.

El archivo de hechos solo puede contener hechos con los predicados del enunciado: `persona/1`, `lugar/2`, `objeto/1`, `ubicado/2`, `acceso/2`, `accesoPorObjeto/2`, `estuvo/3`, `evento/3`, `evidencia/3`, `corresponde/2` y `testimonio/3`. Las horas van en formato `HHMM` (por ejemplo `1955`). Si falta algún predicado, las consultas responden que no hay datos, sin error.

## Pantallas

| Pantalla | Qué muestra |
|---|---|
| Inicio | Caso activo y carga de otro archivo de hechos |
| Tablero del caso | Evento, personas, lugares y objetos |
| Ficha de persona | Indicadores de sospecha, contradicción y coartada, movimientos, accesos y explicaciones |
| Sospechosos | Posibles responsables con sus explicaciones |
| Resolver caso | Reporte de cada responsable con los 6 puntos que pide el enunciado y si la solución es válida |

## Estructura

```
app/                  Interfaz en React + Vite
  src/api.js          Cliente de la API (fetch a /api)
  src/*.jsx           Pantallas
server/               Puente en Node.js + Express
  index.js            Rutas GET/POST
  prolog.js           Ejecuta swipl api.pl <accion> <args>
  validacion.js       Validación de nombres, consultas y archivos de hechos
  componentes/
    hechos.pl         Hechos del caso (se reemplaza en la revisión)
    predicados.pl     Reglas de investigación
    api.pl            Punto de entrada para el servidor; responde en JSON
```

Toda la lógica del juego está en Prolog y no usa librerías adicionales. El JSON se escribe a mano con `format/2`. El servidor no evalúa texto del usuario como código: los argumentos llegan a Prolog como átomos por `argv`.

## API

Todas las rutas responden JSON. Si algo falla, la respuesta es `{ "error": "..." }`, con código 400 (consulta no válida) o 404 (persona no encontrada).

| Método | Ruta | Predicado de Prolog |
|---|---|---|
| GET | `/api/personas` | `persona/1` |
| GET | `/api/lugares` | `lugar/2` |
| GET | `/api/objetos` | `objeto/1` |
| GET | `/api/evento` | `evento/3` |
| GET | `/api/posibles_responsables` | `posibles_responsables/1` |
| GET | `/api/resolver_caso` | `resolver_caso` (mediante `reporte/2`) |
| GET | `/api/personas/:persona/movimientos` | `estuvo/3` |
| GET | `/api/personas/:persona/explicaciones` | `explicaciones/2` |
| GET | `/api/personas/:persona/coartada` | `tiene_coartada/1` |
| GET | `/api/personas/:persona/contradiccion` | `tiene_contradiccion/1` |
| GET | `/api/personas/:persona/sospechoso` | `posible_sospechoso/1` |
| GET | `/api/personas/:persona/acceso/:lugar` | `tiene_acceso/2` |
| GET | `/api/caso` | Caso activo (original o cargado) |
| POST | `/api/consulta` | Consulta genérica: `{ "predicado": "tiene_coartada", "args": ["ana"] }` |
| POST | `/api/caso` | Carga un archivo de hechos: `{ "nombre": "caso.pl", "contenido": "..." }` |
| POST | `/api/caso/original` | Vuelve al `hechos.pl` original |

Los nombres de personas y lugares deben ser átomos en minúscula (`ana`, `llave_maestra`).

## Consultar Prolog directamente

Sin el servidor, desde `server/componentes/`:

```
swipl predicados.pl
?- resolver_caso.
?- posibles_responsables(L).
?- explicaciones(bruno, E).
```

O la misma salida JSON que usa el servidor:

```

# Justificación de las reglas de investigación

Este documento explica cada regla de `server/componentes/predicados.pl` y por qué se definió así. Los ejemplos usan el caso original (`server/componentes/hechos.pl`): una **desaparición en la bodega a las 20:00**.

## Manejo de horas

Las horas se guardan como `HHMM` (por ejemplo `1955`). Para comparar horas, `hora_a_minutos/2` las convierte a minutos desde la medianoche (`1955` → `1195`).

**Por qué:** restar en formato `HHMM` da resultados incorrectos. Por ejemplo, `2005 - 1955 = 50`, cuando en realidad la diferencia es de 10 minutos. En minutos la resta siempre es correcta.

## Ventana del evento (±15 minutos)

```prolog
margen_evento(15).
en_ventana_evento(Hora) :- ... abs(Minutos - MinutosEvento) =< Margen.
```

Una hora es relevante si está a 15 minutos o menos de la hora del evento central. En el caso original eso va de 19:45 a 20:15.

**Por qué:** un hecho no ocurre en un instante exacto. Alguien que llegó a la bodega 10 minutos antes pudo prepararlo, y alguien que estuvo 5 minutos después pudo estar terminándolo. Un margen de 15 minutos cubre ese tiempo sin incluir movimientos que no tienen relación (por ejemplo, ana en la entrada a las 19:00). El margen está en un solo hecho, `margen_evento/1`, así que se puede ajustar sin tocar las reglas.

## Mismo momento (±5 minutos)

```prolog
margen_mismo_momento(5).
mismo_momento(Hora1, Hora2) :- ... abs(Minutos1 - Minutos2) =< Margen.
```

Dos registros cuentan como el mismo momento si los separan 5 minutos o menos.

**Por qué:** los testimonios son aproximados ("estaba ahí como a las 7:55"). Exigir la misma hora exacta haría casi imposible encontrar una contradicción. Con 5 minutos no alcanza para cambiar de lugar dentro del edificio, así que estar en dos lugares distintos dentro de ese margen es una inconsistencia real. Es más estricto que la ventana del evento porque aquí se compara una declaración con un registro, no se mide la cercanía al hecho.

## Acceso: `puede_obtener/2` y `tiene_acceso/2`

```prolog
puede_obtener(Persona, Objeto) :- ubicado(Objeto, Lugar), acceso(Persona, Lugar).
puede_obtener(Persona, Objeto) :- corresponde(Objeto, Persona).

tiene_acceso(Persona, Lugar) :- acceso(Persona, Lugar).
tiene_acceso(Persona, Lugar) :-
    accesoPorObjeto(Lugar, Objeto), puede_obtener(Persona, Objeto), \+ acceso(Persona, Lugar).
```

- Una persona **tiene acceso** a un lugar si está autorizada directamente (`acceso/2`) o si puede conseguir el objeto que abre ese lugar (`accesoPorObjeto/2`).
- Puede **obtener** un objeto si este está en un lugar al que ella entra, o si el objeto le corresponde.

**Por qué:** el enunciado distingue el acceso directo del acceso por objeto. Una llave guardada en un cuarto al que alguien sí entra le da, en la práctica, acceso al lugar que esa llave abre. El `\+ acceso(...)` de la segunda cláusula evita que la misma persona aparezca dos veces cuando tiene los dos tipos de acceso.

En el caso de la galería (`server/ejemplos/caso_galeria.pl`), fabian solo tiene acceso al taller. Pero allí está la `tarjeta_galeria`, y la galería se abre con esa tarjeta, así que `tiene_acceso(fabian, galeria)` es verdadero.

## Coartada: `tiene_coartada/1`

```prolog
tiene_coartada(Persona) :-
    testimonio(Persona, Lugar, Hora), en_ventana_evento(Hora),
    evento(_, LugarEvento, _), Lugar \= LugarEvento,
    \+ testimonio_contradicho(Persona, Lugar, Hora).
```

Una persona tiene coartada si cumple estas tres condiciones:
1. Su testimonio la ubica en un lugar **distinto** al del evento.
2. El testimonio es **durante la ventana** del evento.
3. **Ningún registro** de `estuvo/3` lo contradice (`testimonio_contradicho/3`).

**Por qué:** una coartada sirve solo si cubre el momento del hecho. Un testimonio de las 19:30 no dice nada sobre las 20:00. Además, si los registros desmienten la declaración, ya no es una coartada sino una mentira. Por ejemplo, ana declara estar en la biblioteca a las 19:30, fuera de la ventana, así que no tiene coartada.

## Contradicción: `tiene_contradiccion/1`

```prolog
testimonio_contradicho(Persona, Lugar, Hora) :-
    estuvo(Persona, OtroLugar, HoraRegistro), OtroLugar \= Lugar, mismo_momento(Hora, HoraRegistro).
tiene_contradiccion(Persona) :- testimonio(Persona, Lugar, Hora), testimonio_contradicho(Persona, Lugar, Hora).
```

Hay contradicción cuando la persona dice que estaba en un lugar, pero un registro la ubica en otro en el mismo momento (±5 min).

**Por qué:** los registros de presencia (`estuvo/3`) son datos objetivos y el testimonio es la versión de la persona. Si no coinciden, la persona mintió o se equivocó, y eso es un indicio que hay que investigar.

- **bruno** dice que estaba en la entrada a las 19:55, pero el registro lo ubica en la bodega a las 19:50. Hay 5 minutos de diferencia y son lugares distintos, así que hay contradicción.
- **carla** dice que estaba en la biblioteca a las 19:55, pero el registro la ubica en el laboratorio a las 19:55. También hay contradicción.

## Vínculo con el evento: `vinculado_al_evento/1`

Una persona está vinculada al evento si:
- estuvo en el lugar del evento **durante su ventana**, o
- le corresponde una **evidencia** hallada en el lugar del evento.

**Por qué:** una contradicción o un acceso por sí solos no ligan a alguien con el hecho. Hace falta algo que la relacione con el lugar y el momento: su presencia registrada o una prueba física.

## Posible sospechoso: los dos caminos

```prolog
% Por oportunidad
cumple_sospecha(P) :- evento(_, L, _), tiene_acceso(P, L), vinculado_al_evento(P), \+ tiene_coartada(P).
% Por inconsistencia
cumple_sospecha(P) :- vinculado_al_evento(P), tiene_contradiccion(P).

posible_sospechoso(P) :- persona(P), once(cumple_sospecha(P)).
```

1. **Por oportunidad:** podía entrar al lugar del evento, está vinculada a él y no tiene coartada. Son los tres elementos clásicos de una investigación: medio (acceso), ocasión (vínculo) y ausencia de una explicación que la descarte.
2. **Por inconsistencia:** está vinculada al evento y mintió en su testimonio. Este camino no exige acceso autorizado, porque alguien pudo entrar sin permiso. En ese caso, la mentira junto con la presencia en el lugar es suficiente para sospechar.

`once/1` evita que una persona que cumple los dos caminos aparezca dos veces. `posibles_responsables/1` reúne con `findall/3` a todas las personas que cumplen.

### Ejemplo: por qué bruno es sospechoso y carla no

| | bruno | carla |
|---|---|---|
| Acceso a la bodega | Sí (`acceso(bruno, bodega)`) | No (no tiene acceso ni objeto que la abra) |
| Vínculo con el evento | Sí: estuvo en la bodega a las 19:50 y la huella y la llave le corresponden | No: nunca estuvo en la bodega y no tiene evidencias allí |
| Coartada | No: su testimonio está contradicho | No |
| Contradicción | Sí | Sí |
| **Resultado** | **Sospechoso por los dos caminos** | **No es sospechosa** |

Carla mintió sobre dónde estaba, pero nada la liga con la bodega. Su contradicción no tiene relación con el evento, por eso no basta para hacerla sospechosa.

## Solución válida: `solucion_valida/1`

```prolog
solucion_valida(P) :-
    posible_sospechoso(P), evento(_, L, _),
    once((tiene_acceso(P, L) ; estuvo(P, L, _))), \+ tiene_coartada(P).
```

Una solución es válida si la persona:
1. sigue siendo sospechosa,
2. pudo físicamente llegar al lugar (tenía acceso o hay un registro de que estuvo allí), y
3. no tiene coartada.

**Por qué:** es una comprobación final de coherencia. No basta con que una persona levante sospechas: la acusación tiene que ser físicamente posible y no puede chocar con una coartada. Bruno cumple las tres condiciones, así que su solución es válida.

## Explicaciones: `explicaciones/2`

Cada cláusula de `explicacion/2` revisa un hecho concreto y genera una frase. Con backtracking se obtienen todas las explicaciones de una persona.

**En contra:**
- tiene acceso autorizado al lugar del evento;
- puede entrar gracias a un objeto;
- estuvo en el lugar durante la ventana del evento;
- le corresponde una evidencia;
- su testimonio está contradicho;
- la conclusión de sospecha, por oportunidad o por inconsistencia.

**A favor:**
- su testimonio la aleja del lugar sin contradicciones (posible coartada);
- no tiene acceso al lugar del evento, no estuvo allí durante la ventana y no tiene evidencias allí;
- un registro la ubica en otro lugar durante la ventana del evento.

**Por qué:** el enunciado pide justificar la conclusión. Las explicaciones salen de los mismos hechos que usan las reglas, así que cada sospecha (o cada descarte) se puede rastrear hasta los datos del caso. Por ejemplo, `explicaciones(elena, E)` solo devuelve explicaciones a favor: no tiene acceso a la bodega, no estuvo allí y no tiene evidencias.

## Resolución del caso: `reporte/2` y `resolver_caso/0`

`reporte/2` reúne, para cada responsable, los 6 puntos que pide el enunciado: persona, evidencias, movimientos, accesos, coartadas o contradicciones, y justificación (las explicaciones). Agrega además si la solución es válida. `resolver_caso/0` imprime ese reporte para cada posible responsable. Si el caso no tiene evento, lo indica en lugar de fallar.

## Predicados suprimidos

Según las indicaciones del curso, **no** se implementan:
- `estuvo_en_intervalo/4`
- `evidencias_de/2`
- `descartar/1`
- `investigar/1`

Las explicaciones a favor cumplen el papel de "argumentos para descartar", pero solo como explicaciones. No existe un predicado `descartar/1`.

swipl api.pl resolver_caso
swipl api.pl explicaciones bruno
```

## Predicados suprimidos

Según las indicaciones del curso, no se implementan `estuvo_en_intervalo/4`, `evidencias_de/2`, `descartar/1` ni `investigar/1`.
