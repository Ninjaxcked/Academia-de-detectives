% Caso de prueba: robo en la galeria a las 21:30.
% Ventana del evento: 21:15 a 21:45 (margen de 15 minutos).
%
% Resultados esperados:
%   posibles_responsables(L)  ->  L = [fabian, hector]
%     - fabian: entra a la galeria con la tarjeta_galeria, que esta en el
%       taller (al que si tiene acceso); estuvo en la galeria a las 21:25 y
%       no tiene coartada -> sospechoso por oportunidad.
%     - hector: no tiene acceso a la galeria, pero estuvo alli a las 21:35,
%       el guante hallado le corresponde y dijo estar en la cafeteria a las
%       21:35 -> sospechoso por inconsistencia.
%   tiene_coartada(P)         ->  P = gabriela
%     - tiene acceso a la galeria y la bufanda hallada alli le corresponde,
%       pero su testimonio (recepcion, 21:30) no se contradice: queda libre.
%   tiene_contradiccion(P)    ->  P = hector ; P = irene
%     - irene dijo estar en la cafeteria a las 22:00, pero el registro la
%       ubica en el deposito; no tiene relacion con el evento.
%   julio no tiene ninguna relacion con el evento.

% Personas
persona(fabian).
persona(gabriela).
persona(hector).
persona(irene).
persona(julio).
% Lugares
lugar(recepcion, "Recepcion de la galeria.").
lugar(galeria, "Sala principal de exposicion.").
lugar(taller, "Taller de montaje de obras.").
lugar(cafeteria, "Cafeteria del edificio.").
lugar(deposito, "Deposito de marcos y embalajes.").
% Objetos
objeto(tarjeta_galeria).
objeto(linterna).
objeto(catalogo).
% Ubicacion de los objetos
ubicado(tarjeta_galeria, taller).
ubicado(linterna, deposito).
ubicado(catalogo, recepcion).
% Accesos
acceso(fabian, taller).
acceso(gabriela, galeria).
acceso(gabriela, recepcion).
acceso(hector, cafeteria).
acceso(irene, deposito).
acceso(irene, cafeteria).
acceso(julio, recepcion).
% Acceso mediante objetos
accesoPorObjeto(galeria, tarjeta_galeria).
% Registro de presencia
estuvo(fabian, taller, 2100).
estuvo(fabian, galeria, 2125).
estuvo(gabriela, galeria, 2050).
estuvo(gabriela, recepcion, 2128).
estuvo(hector, cafeteria, 2110).
estuvo(hector, galeria, 2135).
estuvo(irene, deposito, 2200).
estuvo(julio, recepcion, 2000).
% Evento
evento(robo, galeria, 2130).
% Evidencias
evidencia(guante, galeria, 2130).
evidencia(bufanda, galeria, 2000).
% Relacion entre evidencia y persona
corresponde(guante, hector).
corresponde(bufanda, gabriela).
% Testimonios
testimonio(hector, cafeteria, 2135).
testimonio(gabriela, recepcion, 2130).
testimonio(irene, cafeteria, 2200).
