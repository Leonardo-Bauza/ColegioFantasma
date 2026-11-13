# 👻 Academia Espectral (Ghost Academy Chronicles)

Videojuego desarrollado en **JavaScript puro (Vanilla JS)** y **HTML5 Canvas** con estética y jugabilidad inspirada en **Pokémon de Game Boy Advance (Pokémon Edición Esmeralda y Rojo Fuego / Verde Hoja)**.

---

## 🚀 Cómo Jugar de Inmediato
Solo abre [`index.html`](file:///h:/Documentos/5_Programador%20y%20Proyectos/03%20-%20Videojuego%20JavaScript/index.html) directamente con tu navegador web favorito (Chrome, Edge, Firefox, Safari, Opera). No requiere Node.js, dependencias ni servidores externos.

---

## 🏰 Novedades y Estructura del Colegio

La aventura transcurre en la **Academia Espectral San Ectoplasma**, donde **todos son fantasmas** (alumnos, profesores y conserjes). El colegio cuenta con múltiples plantas y alas interconectadas:

### 1. 🏛️ Planta Baja (Vestíbulo Principal)
* **Puerta Oeste (x=0, y=7):** Aula de Encantamientos (Prof. Ectoplasma y lecciones en pizarra). *Ahora permite bordear y caminar por el pasillo lateral sin teletransportarse por accidente.*
* **Puerta Este (x=19, y=7):** Biblioteca Espectral (Códices arcanos de sellos elementales).
* **Puerta Norte:** Acceso al Sótano / Laboratorio Prohibido (Misión 1: Leonel).
* **Puerta Noreste:** Gimnasio Embrujado (Misión 2 - En Obras por Don Ecto).
* **Escaleras Noroeste:** Despacho del Rector (Misión 3 - Sellado por el Prefecto).
* **Escaleras Noreste (x=13..14, y=1):** Subida al Primer Piso.

### 2. 🏆 Primer Piso (Galería Superior)
* Vitrinas con copas y trofeos dorados de la academia.
* Alumnos estudiando y profesores vigilando los pasillos.
* Ventanales góticos con vistas al cielo estrellado.
* Escaleras que ascienden a la Gran Terraza Panorámica.

### 3. 🌌 Segundo Piso (Gran Terraza Panorámica en L)
* **Tamaño Expandido (34 × 26 casillas):** Amplia terraza de piedra al aire libre con un ala horizontal norte y un ala vertical este.
* **Bosque Nocturno Alrededor:** Toda la terraza está rodeada por densas copas de árboles en verdes oscuros y sombras nocturnas que representan el gran bosque que rodea el colegio.
* **Telescopio Espectral Interactivo:** Al examinar el telescopio dorado en el mirador, se abre un **visor circular astronómico** con:
  * Campo de estrellas titilantes y luna creciente.
  * **Aurora Boreal Animada:** Ondulaciones mágicas fluidas con gradientes de tonos **violáceos a turquesas y verde menta**.
* **Stella (Astrónoma):** Fantasma astrónoma que estudia los fenómenos cósmicos desde la terraza.

---

## 🤝 Compañero de Aventura: Leonel
* **Velocidad Sincronizada:** Leonel comparte tus mismas **Zapatillas Fantasma**, corriendo a tu misma velocidad idéntica paso a paso, sin desfasarse ni salirse de los límites del mapa.
* **Seguimiento Fiel:** Tras rescatarlo en el sótano, búscalo en el vestíbulo y te seguirá fielmente casilla por casilla (estilo *Pokémon HeartGold / SoulSilver*).
* **Interacción Dinámica:** Habla con él en cualquier momento para escuchar sus comentarios sobre cada sala o pedirle que descanse. También puedes consultar su estado en la opción `LEONEL` del Menú Start.

---

## 📜 Sistema de Misiones

* **🌟 Misión 1: El Rescate de Leonel (¡Jugable completa!)**
  * Descifra la pista de la pizarra del Aula (1° Azul, 2° Verde) y del códice de la Biblioteca (3° Púrpura, 4° Rojo).
  * Enciende los 4 braseros en el Laboratorio Prohibido en el orden:
    $$\text{Azul} \longrightarrow \text{Verde} \longrightarrow \text{Púrpura} \longrightarrow \text{Rojo}$$
  * Libera a Leonel y obtén las **Zapatillas Fantasma** para correr.
* **🔒 Misión 2: El Poltergeist del Gimnasio (Próximo desarrollo)**
* **🔒 Misión 3: El Secreto del Rector Fantasma (Próximo desarrollo)**

---

## ⌨️ Controles de Teclado (Menú Desplegable a la Izquierda)

| Acción | Teclas |
| :--- | :--- |
| **Moverse (4 Direcciones)** | Flechas de dirección / `W`, `A`, `S`, `D` |
| **Botón (A) - Hablar / Interactuar** | `Z`, `Espacio` o `Enter` |
| **Botón (B) - Correr con Zapatillas** | `X` o `Shift` |
| **START - Menú Pokémon** | `Escape` o `M` |
| **Menú de Controles** | Botón desplegable `[⌨️ Controles]` en la esquina izquierda |
| **Audio** | Botón `[🔊 Audio: ON/OFF]` en la barra superior |
