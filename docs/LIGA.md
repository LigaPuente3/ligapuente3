# Reglas y decisiones de la liga

> **Implementado (0.8.0-alpha):** eliminatorias por división (eliminación simple con un grupo, doble eliminación con varios) y 🏆 Liga Puente 3 automática. **(0.6.0-alpha):** ventana de inscripción, cierre por moderadores, altas manuales y división en lote. **(0.5.0-alpha):** torneos, inscripción, requisito opcional del servidor de Discord, logros, **divisiones, sorteo de grupos, liguilla de todos contra todos, resultados (el ganador informa; los moderadores corrigen o marcan «No jugado») y clasificación con desempates**. **Pendiente:** ascensos y descensos automáticos para la siguiente edición.

Decisiones de diseño de los torneos (fase 2 en adelante). Es una **versión alfa**: las reglas pueden cambiar en cada edición, así que lo configurable debe poder ajustarse por torneo. Mantener al día en cada PR que toque torneos.

## Torneo (edición de la liga)
- Cada torneo puede tener una **colección** como etiqueta de texto (código y nombre, p. ej. «HMW · Homeworlds»). **Sin logos oficiales** de Star Wars: Unlimited ni de sus colecciones.
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
- **Ventana de inscripción**: cada torneo puede tener fecha y hora de apertura y de cierre (hora de España). Abierta solo con el torneo **«Publicado»**, la casilla «Inscripción habilitada» marcada y dentro de la ventana. **Moderadores y administradores** pueden cerrarla antes (solo un administrador la reabre). Con el torneo **«En juego»** está **siempre cerrada**; las altas tardías las hace un administrador («Inscribir a un jugador», para alguien que ya haya entrado en la web).

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
Todas las divisiones juegan eliminatorias, **al mejor de 3**, cuando han terminado sus grupos (todos los partidos jugados o resueltos por moderadores). Las genera un administrador.

### Con un solo grupo
- Pasan **4**: semifinales **1.º contra 4.º** y **2.º contra 3.º**, y **final** entre los ganadores (eliminación simple).
- Si el grupo tiene menos de 4 jugadores: final directa **1.º contra 2.º**.

### Con dos o más grupos: doble eliminación
- **Cuadro de ganadores:** entran el **1.º y el 2.º** de cada grupo. En la primera ronda, un 1.º juega contra un 2.º **de otro grupo**. Con 2 grupos: A = 1.º L1 contra 2.º L2 y B = 1.º L2 contra 2.º L1.
- Si los clasificados no llenan el cuadro (3 o más grupos), se completa con **pases directos** para los **mejores 1.º** (por puntos, juegos ganados y diferencia de juegos).
- **Cuadro de repesca:** los **3.º están ya colocados** y esperan a los perdedores de la primera ronda; cada perdedor juega contra un 3.º **de otro grupo** siempre que se pueda. Después, los ganadores se van cruzando entre sí y con los que pierden en el cuadro de ganadores.
- **Gran final:** ganador del cuadro de ganadores contra ganador de la repesca. Si gana el que viene de la repesca, se juega **otra final**, porque el primero aún no había perdido.

Ejemplo con dos grupos (L1 y L2):

| Partido | Quién juega | Ganador va a | Perdedor va a |
|---|---|---|---|
| **A** | 1.º de L1 contra 2.º de L2 | E | C o D |
| **B** | 1.º de L2 contra 2.º de L1 | E | C o D |
| **C** | perdedor de A o B contra un 3.º de otro grupo | F | eliminado |
| **D** | el otro perdedor contra el otro 3.º | F | eliminado |
| **E** | ganadores de A y B | H (final) | G |
| **F** | ganadores de C y D | G | eliminado |
| **G** | perdedor de E contra ganador de F | H (final) | eliminado |
| **H** | **Gran final**: ganador de E contra ganador de G | campeón | segunda final si gana el de G |

- Se representa como un cuadro, con una **sección plegable por división**.
- El **campeón de Legendaria** suma automáticamente 1 a su 🏆 **Liga Puente 3** cuando el torneo pasa a «Terminado».

## Logros de los jugadores
- Cada jugador indica en su perfil cuántas veces ha ganado un **PQ**, **Sector**, **Regional** o **Galactic**. Se irá ajustando.
- **Liga Puente 3** (🏆, con número de veces): **no la marca el jugador**. Se sumará sola al campeón de cada edición jugada en esta web; las ediciones anteriores las asignan **moderadores o administradores** (Administración → Asignar «Liga Puente 3»).
- Se muestran como iconos en su perfil y en las clasificaciones.

## Ayuda y documentación (implementado en 0.7.0-alpha)
- **Ayuda para jugadores** (`/help`) y **ayuda para administradores y moderadores**, separadas y explicadas de forma **muy sencilla**.
- **Documentación del proyecto** (servicios, variables, claves a rotar, migraciones, traspaso): **dentro de la web**, en una página que solo ven los administradores por configuración (`ADMIN_DISCORD_IDS`) y las personas a las que ellos se lo activen. Se retira del repositorio público (que se queda solo con lo necesario para desarrollar, sin datos sensibles).

## Pendiente de decidir
- Iconos de los logros y si los verifica alguien.
- Listas de mazo y arquetipos: cómo se introducen y de dónde salen los datos de las cartas.
