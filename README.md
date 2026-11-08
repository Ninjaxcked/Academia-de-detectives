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
swipl api.pl resolver_caso
swipl api.pl explicaciones bruno
```

## Predicados suprimidos

Según las indicaciones del curso, no se implementan `estuvo_en_intervalo/4`, `evidencias_de/2`, `descartar/1` ni `investigar/1`.
