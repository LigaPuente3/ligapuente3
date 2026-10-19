# Reglas y decisiones de la liga

> **Implementado (0.5.0-alpha):** torneos, inscripción, requisito opcional del servidor de Discord, logros, **divisiones, sorteo de grupos, liguilla de todos contra todos, resultados (el ganador informa; los moderadores corrigen o marcan «No jugado») y clasificación con desempates**. **Pendiente:** eliminatorias y ascensos/descensos automáticos.

Decisiones de diseño de los torneos (fase 2 en adelante). Es una **versión alfa**: las reglas pueden cambiar en cada edición, así que lo configurable debe poder ajustarse por torneo. Mantener al día en cada PR que toque torneos.

## Torneo (edición de la liga)
- Cada edición es un torneo (p. ej. «VI Liga Puente 3») con fecha de inicio, enlace a sus **bases** y un **plazo** para jugar los partidos de la liguilla.
- Formato de juego: **Premier**. Partidas **al mejor de 3** (Bo3). Se juega sin límite de tiempo, así que no se esperan empates 1-1.
- Pueden jugar todos los roles, también los administradores (puede cambiar).

## Inscripción
- Hay que haber entrado con Discord. **Pertenencia al servidor de Discord de puente3**: se exigirá si se configura el ID del servidor en una variable de entorno; vacía = no se exige (para pruebas).
- Preguntas del formulario (sustituye al formulario de Google):
  - Nombre en Discord: sale del inicio de sesión (no se pregunta).
  - ¿Participaste en la edición anterior? → Sí / No, primera vez / No, jugué ediciones anteriores.
  - Si es la primera vez: ¿has ganado un PQ / Sector / Regional? → Sí / No.
  - ¿Das permiso para que tus partidas puedan retransmitirse (YouTube de puente3 u otros creadores, siempre preguntando antes)? → Sí / No.
  - Ciudad y país (obligatorios). **Solo los ven los administradores**, para saber desde dónde se juega.
  - Aceptación de las bases (obligatoria).
- **No se pide correo electrónico** (con Discord no hace falta; RGPD: datos mínimos). Los avisos, por Discord.
- **Ventana de inscripción** (pendiente, siguiente PR): cada torneo tendrá fecha y hora de apertura y de cierre. **Administradores y moderadores** podrán cerrarla antes. Con el torneo **«En juego»** la inscripción está **siempre cerrada**; las altas tardías las hace un administrador (inscribiendo a un usuario que ya haya entrado en la web).

## Divisiones
- Por orden: **Legendaria (L)**, **Rara (R)**, **Infrecuente (U)**, **Común (C)**. La Común es la más baja.
- **N**: división nueva de significado pendiente; nombre provisional «Nueva». **Se omite en esta prueba.**
- Las asigna un administrador. Quien jugó la edición anterior va a la división que le corresponda por **ascensos y descensos**: por defecto **sube 1 y baja 1** por división, configurable en cada torneo.
- Cada división puede tener **varios grupos**, que se sortean al azar: «Legendaria 1», «Legendaria 2», «Rara 1», «Rara 2», «Infrecuente 1»… Un jugador solo puede estar en un grupo.
- **Colores** (los de rareza de las cartas): Legendaria **azul**, Rara **marrón claro**, Infrecuente **gris**, Común **marrón oscuro**. En cada clasificación, las plazas de ascenso llevan el color de la división superior y las de descenso el de la inferior; el primero de Legendaria va en **dorado** y en Común nadie baja. Hay una leyenda bajo cada tabla.
- La **Común** no tiene plazas cerradas. Pero, como la inscripción se cierra al empezar el torneo (ver Inscripción), las **altas tardías** las hará un **administrador** a mano. Cuando hay suficientes jugadores, funciona igual que las demás.

## Liguilla
- Dentro de cada división: **todos contra todos**.
- Un **plazo general** para jugar todos los partidos; cada pareja se organiza dentro de ese plazo.
- Puntuación: **victoria 3, derrota 0** (por partido). **No hay empates**: se juega hasta que alguien gana 2 partidas.
- Desempates, por orden: **juegos ganados**, **enfrentamiento directo** y **diferencia de juegos**.
- Los partidos no jugados al acabar el plazo los resuelven los **moderadores**.

## Resultados
- Los anota **cualquiera de los dos jugadores** del partido con dos desplegables (sus juegos y los del rival: 0, 1 o 2). Solo se aceptan partidos terminados al mejor de 3: 2-0, 2-1, 1-2 o 0-2. Se pide **confirmación** antes de guardar: después el jugador ya **no puede cambiarlo**. Los **moderadores** (y administradores) pueden corregirlos o marcar «No jugado».
- En estudio: que cada jugador pueda indicar la **lista de mazo** jugada en cada partido y que el resultado muestre el **arquetipo**.

## Eliminatorias (por división)
Doble eliminación en la que los **terceros** entran directamente por el cuadro de perdedores. Ejemplo con **dos grupos** (L1 y L2):

| Partido | Quién juega | Ganador va a | Perdedor va a |
|---|---|---|---|
| **A** | 1.º de L1 contra 2.º de L2 | E | C |
| **B** | 1.º de L2 contra 2.º de L1 | E | D |
| **C** | perdedor de A contra un 3.º (en espera) | F | eliminado |
| **D** | perdedor de B contra el otro 3.º (en espera) | F | eliminado |
| **E** | ganadores de A y B | H (final) | G |
| **F** | ganadores de C y D | G | eliminado |
| **G** | perdedor de E contra ganador de F | H (final) | eliminado |
| **H** | **Gran final**: ganador de E contra ganador de G | campeón | — |

- Si en la final gana quien viene por la vía de perdedores (G), se juega **otra final** (H2), porque el ganador de E aún no había perdido.
- **Proporcional al número de grupos**: con N grupos entran en el cuadro de ganadores los 2 primeros de cada grupo (2N jugadores, cruzando 1.º de un grupo con 2.º de otro) y los N terceros esperan en el cuadro de perdedores. Si no sale una potencia de 2, se usan descansos (*byes*).
- Se representa como un cuadro (como la imagen de la V edición); con muchas divisiones, en **pestañas plegables**, una por división.
- Pendiente de confirmar: a qué 3.º se enfrenta cada perdedor de la primera ronda (propuesta: el perdedor de A contra el 3.º de L2 y el de B contra el 3.º de L1), y cómo se generaliza con 3 o más grupos.

## Logros de los jugadores
- Cada jugador indica en su perfil cuántas veces ha ganado un **PQ**, **Sector**, **Regional** o **Galactic**. Se irá ajustando.
- **Liga Puente 3** (🏆, con número de veces): **no la marca el jugador**. Se sumará sola al campeón de cada edición jugada en esta web; las ediciones anteriores las asignan **moderadores o administradores** (Administración → Asignar «Liga Puente 3»).
- Se muestran como iconos en su perfil y en las clasificaciones.

## Ayuda y documentación (pendiente, siguiente PR)
- **Ayuda para jugadores** (`/help`) y **ayuda para administradores y moderadores**, separadas y explicadas de forma **muy sencilla**.
- **Documentación del proyecto** (servicios, variables, claves a rotar, migraciones, traspaso): **dentro de la web**, en una página que solo ven los administradores por configuración (`ADMIN_DISCORD_IDS`) y las personas a las que ellos se lo activen. Se retira del repositorio público (que se queda solo con lo necesario para desarrollar, sin datos sensibles).

## Mejoras de administración (pendiente)
- En la ficha de administración del torneo, las **inscripciones** se van muy abajo con muchos jugadores: mostrarlas **debajo del formulario, a ancho completo**, como una tabla o rejilla de fichas compactas.
- Asignar la **división a varios jugadores a la vez**.

## Pendiente de decidir
- Detalle de los cruces de terceros y generalización a 3 o más grupos (ver Eliminatorias).
- Iconos de los logros y si los verifica alguien.
- Listas de mazo y arquetipos: cómo se introducen y de dónde salen los datos de las cartas.
