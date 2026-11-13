/**
 * Generador y Renderizador de Sprites en Pixel Art estilo Pokémon GBA (FireRed / Emerald)
 * Todos los gráficos se renderizan procedimentalmente en canvas ocultos a 16x16 o 16x24 píxeles
 * garantizando cero dependencias externas y máxima fidelidad retro.
 */

class SpriteManager {
    constructor() {
        this.tileSize = 16;
        this.tiles = {};
        this.sprites = {};
        this.animTick = 0;
        this.initAllGraphics();
    }

    createCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        return { canvas: c, ctx: ctx };
    }

    initAllGraphics() {
        this.generateTileGraphics();
        this.generateCharacterSprites();
        this.generatePropGraphics();
    }

    /* ============================================================
     * GENERACIÓN DE TILES (16x16)
     * ============================================================ */
    generateTileGraphics() {
        const T = this.tileSize;

        // 1. Suelo de madera de colegio (Parquet GBA)
        const { canvas: cWood, ctx: ctxWood } = this.createCanvas(T, T);
        ctxWood.fillStyle = '#b87c4c'; // Base madera cálida
        ctxWood.fillRect(0, 0, T, T);
        ctxWood.fillStyle = '#cf9867'; // Tablón claro
        ctxWood.fillRect(0, 0, T, 7);
        ctxWood.fillStyle = '#9e6236'; // Sombra y juntas
        ctxWood.fillRect(0, 7, T, 1);
        ctxWood.fillRect(0, 15, T, 1);
        ctxWood.fillRect(7, 0, 1, 7);
        ctxWood.fillRect(11, 8, 1, 7);
        // Detalles de clavos
        ctxWood.fillStyle = '#6e3c1d';
        ctxWood.fillRect(1, 1, 1, 1);
        ctxWood.fillRect(6, 6, 1, 1);
        ctxWood.fillRect(8, 9, 1, 1);
        ctxWood.fillRect(14, 14, 1, 1);
        this.tiles['floor_wood'] = cWood;

        // 2. Suelo del laboratorio / sótano (Piedra misteriosa azulada)
        const { canvas: cStone, ctx: ctxStone } = this.createCanvas(T, T);
        ctxStone.fillStyle = '#3a4454';
        ctxStone.fillRect(0, 0, T, T);
        ctxStone.fillStyle = '#49576b';
        ctxStone.fillRect(1, 1, 6, 6);
        ctxStone.fillRect(9, 1, 6, 6);
        ctxStone.fillRect(1, 9, 6, 6);
        ctxStone.fillRect(9, 9, 6, 6);
        ctxStone.fillStyle = '#262d38'; // Juntas oscuras
        ctxStone.fillRect(0, 0, T, 1);
        ctxStone.fillRect(0, 8, T, 1);
        ctxStone.fillRect(0, 0, 1, T);
        ctxStone.fillRect(8, 0, 1, T);
        // Grieta espectral
        ctxStone.fillStyle = '#21252d';
        ctxStone.fillRect(3, 3, 2, 1);
        ctxStone.fillRect(12, 11, 1, 2);
        this.tiles['floor_stone'] = cStone;

        // 3. Suelo de baldosas de ajedrez (Vestíbulo Fantasmal)
        const { canvas: cTiles, ctx: ctxTiles } = this.createCanvas(T, T);
        ctxTiles.fillStyle = '#5c637a';
        ctxTiles.fillRect(0, 0, T, T);
        ctxTiles.fillStyle = '#8f9bb3';
        ctxTiles.fillRect(0, 0, 8, 8);
        ctxTiles.fillRect(8, 8, 8, 8);
        ctxTiles.fillStyle = '#3f4559';
        ctxTiles.fillRect(8, 0, 8, 8);
        ctxTiles.fillRect(0, 8, 8, 8);
        // Borde fino
        ctxTiles.fillStyle = '#2d3242';
        ctxTiles.strokeRect(0.5, 0.5, T - 1, T - 1);
        this.tiles['floor_tiles'] = cTiles;

        // 4. Alfombra roja/púrpura real con ribete dorado (Centro de pasillos)
        const { canvas: cCarpet, ctx: ctxCarpet } = this.createCanvas(T, T);
        ctxCarpet.fillStyle = '#8b2649';
        ctxCarpet.fillRect(0, 0, T, T);
        ctxCarpet.fillStyle = '#a8335c';
        ctxCarpet.fillRect(2, 2, T - 4, T - 4);
        ctxCarpet.fillStyle = '#f0c05a'; // Ribete dorado
        ctxCarpet.fillRect(1, 0, 1, T);
        ctxCarpet.fillRect(T - 2, 0, 1, T);
        this.tiles['floor_carpet'] = cCarpet;

        // 5. Pared superior colegio (Moldura y color crema/salmón Pokémon)
        const { canvas: cWallTop, ctx: ctxWallTop } = this.createCanvas(T, T);
        ctxWallTop.fillStyle = '#dfd3c3';
        ctxWallTop.fillRect(0, 0, T, T);
        // Moldura del techo
        ctxWallTop.fillStyle = '#a68a68';
        ctxWallTop.fillRect(0, 0, T, 3);
        ctxWallTop.fillStyle = '#7a5f41';
        ctxWallTop.fillRect(0, 3, T, 1);
        this.tiles['wall_school_top'] = cWallTop;

        // 6. Pared inferior colegio (Zócalo de madera oscura Pokémon)
        const { canvas: cWallBot, ctx: ctxWallBot } = this.createCanvas(T, T);
        ctxWallBot.fillStyle = '#7a4325';
        ctxWallBot.fillRect(0, 0, T, T);
        // Moldura media
        ctxWallBot.fillStyle = '#a35f37';
        ctxWallBot.fillRect(0, 0, T, 2);
        // Paneles de madera
        ctxWallBot.fillStyle = '#5c3017';
        ctxWallBot.fillRect(1, 3, 6, 11);
        ctxWallBot.fillRect(9, 3, 6, 11);
        ctxWallBot.fillStyle = '#361b0c';
        ctxWallBot.fillRect(0, 15, T, 1); // Sombra en el suelo
        this.tiles['wall_school_bot'] = cWallBot;

        // 7. Pared superior mazmorra / laboratorio (Piedras oscuras)
        const { canvas: cStoneWallTop, ctx: ctxStoneWallTop } = this.createCanvas(T, T);
        ctxStoneWallTop.fillStyle = '#222831';
        ctxStoneWallTop.fillRect(0, 0, T, T);
        ctxStoneWallTop.fillStyle = '#393e46';
        ctxStoneWallTop.fillRect(1, 1, 6, 6);
        ctxStoneWallTop.fillRect(8, 1, 7, 6);
        ctxStoneWallTop.fillRect(3, 8, 10, 7);
        ctxStoneWallTop.fillStyle = '#15191e';
        ctxStoneWallTop.strokeRect(0.5, 0.5, T - 1, T - 1);
        this.tiles['wall_stone_top'] = cStoneWallTop;

        // 8. Pared inferior mazmorra
        const { canvas: cStoneWallBot, ctx: ctxStoneWallBot } = this.createCanvas(T, T);
        ctxStoneWallBot.fillStyle = '#2b313d';
        ctxStoneWallBot.fillRect(0, 0, T, T);
        ctxStoneWallBot.fillStyle = '#3f4757';
        ctxStoneWallBot.fillRect(1, 1, 14, 12);
        ctxStoneWallBot.fillStyle = '#15191e';
        ctxStoneWallBot.fillRect(0, 14, T, 2); // Sombra en el piso
        this.tiles['wall_stone_bot'] = cStoneWallBot;

        // 9. Puerta de aula / Sótano
        const { canvas: cDoor, ctx: ctxDoor } = this.createCanvas(T, T);
        ctxDoor.fillStyle = '#69371e';
        ctxDoor.fillRect(0, 0, T, T);
        ctxDoor.fillStyle = '#9c5b37';
        ctxDoor.fillRect(2, 2, 12, 14);
        // Vidrio superior con reflejo
        ctxDoor.fillStyle = '#7ac9d8';
        ctxDoor.fillRect(4, 3, 8, 5);
        ctxDoor.fillStyle = '#ffffff';
        ctxDoor.fillRect(5, 4, 2, 2);
        // Pomo dorado
        ctxDoor.fillStyle = '#ffd154';
        ctxDoor.fillRect(11, 9, 2, 2);
        this.tiles['door'] = cDoor;

        // 10. Felpudo / Transición
        const { canvas: cMat, ctx: ctxMat } = this.createCanvas(T, T);
        ctxMat.fillStyle = '#5c4333';
        ctxMat.fillRect(0, 0, T, T);
        ctxMat.fillStyle = '#8f6f58';
        ctxMat.fillRect(2, 2, 12, 12);
        ctxMat.fillStyle = '#ffd154';
        ctxMat.fillRect(4, 7, 8, 2);
        this.tiles['mat'] = cMat;

        // 11. Ventana con cielo nocturno estrellado
        const { canvas: cWin, ctx: ctxWin } = this.createCanvas(T, T);
        ctxWin.fillStyle = '#a68a68';
        ctxWin.fillRect(0, 0, T, T);
        // Cristal azul oscuro
        ctxWin.fillStyle = '#12182c';
        ctxWin.fillRect(2, 2, 12, 12);
        // Estrellas
        ctxWin.fillStyle = '#ffffff';
        ctxWin.fillRect(4, 4, 1, 1);
        ctxWin.fillRect(10, 6, 1, 1);
        ctxWin.fillRect(7, 10, 1, 1);
        // Luna brillante en la esquina
        ctxWin.fillStyle = '#ffffb5';
        ctxWin.fillRect(9, 3, 3, 3);
        // Marco de ventana
        ctxWin.fillStyle = '#7a5f41';
        ctxWin.fillRect(7, 2, 2, 12);
        ctxWin.fillRect(2, 7, 12, 2);
        this.tiles['window'] = cWin;

        // 12. Escaleras hacia arriba (Stairs Up)
        const { canvas: cStairsUp, ctx: ctxStairsUp } = this.createCanvas(T, T);
        ctxStairsUp.fillStyle = '#4a2810';
        ctxStairsUp.fillRect(0, 0, T, T);
        // Peldaños de madera ascendentes
        for (let i = 0; i < 4; i++) {
            ctxStairsUp.fillStyle = i % 2 === 0 ? '#78431b' : '#9c5b28';
            ctxStairsUp.fillRect(1, i * 4, 14, 3);
            ctxStairsUp.fillStyle = '#301807';
            ctxStairsUp.fillRect(1, i * 4 + 3, 14, 1);
        }
        // Alfombra central roja
        ctxStairsUp.fillStyle = '#8b2649';
        ctxStairsUp.fillRect(5, 0, 6, T);
        ctxStairsUp.fillStyle = '#ffd154';
        ctxStairsUp.fillRect(4, 0, 1, T);
        ctxStairsUp.fillRect(11, 0, 1, T);
        this.tiles['stairs_up'] = cStairsUp;

        // 13. Escaleras hacia abajo (Stairs Down)
        const { canvas: cStairsDown, ctx: ctxStairsDown } = this.createCanvas(T, T);
        ctxStairsDown.fillStyle = '#1e2430';
        ctxStairsDown.fillRect(0, 0, T, T);
        // Hueco oscuro con peldaños
        for (let i = 0; i < 4; i++) {
            ctxStairsDown.fillStyle = '#111622';
            ctxStairsDown.fillRect(2, i * 4, 12, 2);
            ctxStairsDown.fillStyle = '#334155';
            ctxStairsDown.fillRect(2, i * 4 + 2, 12, 2);
        }
        // Barandilla de madera a los lados
        ctxStairsDown.fillStyle = '#85512e';
        ctxStairsDown.fillRect(0, 0, 2, T);
        ctxStairsDown.fillRect(14, 0, 2, T);
        this.tiles['stairs_down'] = cStairsDown;

        // 14. Suelo de la Terraza en L (Piedra de exterior)
        const { canvas: cTerrace, ctx: ctxTerrace } = this.createCanvas(T, T);
        ctxTerrace.fillStyle = '#475569';
        ctxTerrace.fillRect(0, 0, T, T);
        ctxTerrace.fillStyle = '#64748b';
        ctxTerrace.fillRect(1, 1, 6, 6);
        ctxTerrace.fillRect(9, 1, 6, 6);
        ctxTerrace.fillRect(1, 9, 6, 6);
        ctxTerrace.fillRect(9, 9, 6, 6);
        ctxTerrace.fillStyle = '#334155';
        ctxTerrace.fillRect(0, 0, T, 1);
        ctxTerrace.fillRect(0, 8, T, 1);
        ctxTerrace.fillRect(0, 0, 1, T);
        ctxTerrace.fillRect(8, 0, 1, T);
        // Pequeño musgo espectral cian
        ctxTerrace.fillStyle = '#38bdf8';
        ctxTerrace.fillRect(3, 4, 2, 1);
        this.tiles['terrace_floor'] = cTerrace;

        // 15. Copas de árboles nocturnas en tonos verde oscuro (Vista aérea alrededor de la terraza)
        const { canvas: cTree, ctx: ctxTree } = this.createCanvas(T, T);
        ctxTree.fillStyle = '#0a1d15'; // Sombra base profunda bosque nocturno
        ctxTree.fillRect(0, 0, T, T);
        // Hojas y frondas redondeadas verde oscuro
        ctxTree.fillStyle = '#112c21';
        ctxTree.fillRect(1, 1, 14, 14);
        ctxTree.fillStyle = '#183c2e';
        ctxTree.fillRect(2, 2, 6, 6);
        ctxTree.fillRect(8, 2, 6, 5);
        ctxTree.fillRect(2, 8, 5, 6);
        ctxTree.fillRect(7, 7, 7, 7);
        // Toques de luz de luna tenue en el follaje
        ctxTree.fillStyle = '#22523f';
        ctxTree.fillRect(3, 3, 3, 2);
        ctxTree.fillRect(9, 3, 3, 2);
        ctxTree.fillRect(3, 9, 2, 2);
        ctxTree.fillRect(8, 8, 4, 3);
        // Detalles sutiles de hojas
        ctxTree.fillStyle = '#2f6d54';
        ctxTree.fillRect(4, 4, 1, 1);
        ctxTree.fillRect(10, 4, 1, 1);
        ctxTree.fillRect(9, 9, 1, 1);
        this.tiles['treetop_night'] = cTree;

        // Variante de copa de árbol para alternar y dar textura natural
        const { canvas: cTreeAlt, ctx: ctxTreeAlt } = this.createCanvas(T, T);
        ctxTreeAlt.fillStyle = '#091a13';
        ctxTreeAlt.fillRect(0, 0, T, T);
        ctxTreeAlt.fillStyle = '#10291f';
        ctxTreeAlt.fillRect(1, 1, 14, 14);
        ctxTreeAlt.fillStyle = '#173a2c';
        ctxTreeAlt.fillRect(3, 1, 10, 6);
        ctxTreeAlt.fillRect(1, 7, 14, 7);
        ctxTreeAlt.fillStyle = '#214e3c';
        ctxTreeAlt.fillRect(4, 2, 6, 3);
        ctxTreeAlt.fillRect(3, 8, 8, 4);
        ctxTreeAlt.fillStyle = '#2e6b53';
        ctxTreeAlt.fillRect(5, 3, 2, 1);
        ctxTreeAlt.fillRect(6, 9, 2, 1);
        this.tiles['treetop_night_alt'] = cTreeAlt;

        // Cielo nocturno de apoyo (para otros usos si se requiere)
        const { canvas: cSky, ctx: ctxSky } = this.createCanvas(T, T);
        ctxSky.fillStyle = '#0a1d15';
        ctxSky.fillRect(0, 0, T, T);
        ctxSky.drawImage(cTree, 0, 0);
        this.tiles['sky_stars'] = cSky;

        // 16. Barandilla de la terraza (Parapeto de piedra con copas de árboles detrás)
        const { canvas: cRailN, ctx: ctxRailN } = this.createCanvas(T, T);
        // Fondo: copa de árbol nocturna vista por encima de la barandilla
        ctxRailN.drawImage(cTree, 0, 0);
        // Muro de piedra del parapeto
        ctxRailN.fillStyle = '#334155';
        ctxRailN.fillRect(0, 6, T, 10);
        ctxRailN.fillStyle = '#64748b'; // Pasamanos de piedra tallada
        ctxRailN.fillRect(0, 6, T, 3);
        ctxRailN.fillStyle = '#1e293b';
        ctxRailN.fillRect(3, 9, 2, 7);
        ctxRailN.fillRect(11, 9, 2, 7);
        this.tiles['terrace_rail'] = cRailN;
    }

    /* ============================================================
     * GENERACIÓN DE OBJETOS / MUEBLES (DESKS, BLACKBOARD, ETC.)
     * ============================================================ */
    generatePropGraphics() {
        const T = this.tileSize;

        // 1. Pizarra de clase (2 tiles de ancho: parte izquierda y derecha)
        const { canvas: cBbL, ctx: ctxBbL } = this.createCanvas(T, T);
        ctxBbL.fillStyle = '#2b573d'; // Verde oscuro pizarra
        ctxBbL.fillRect(0, 0, T, T);
        ctxBbL.fillStyle = '#85512e'; // Marco madera
        ctxBbL.fillRect(0, 0, T, 2);
        ctxBbL.fillRect(0, 0, 2, T);
        ctxBbL.fillRect(0, T - 2, T, 2);
        // Trazos de tiza blanca
        ctxBbL.fillStyle = '#ffffff';
        ctxBbL.fillRect(4, 5, 6, 1);
        ctxBbL.fillRect(4, 8, 8, 1);
        ctxBbL.fillRect(5, 11, 4, 1);
        this.tiles['blackboard_left'] = cBbL;

        const { canvas: cBbR, ctx: ctxBbR } = this.createCanvas(T, T);
        ctxBbR.fillStyle = '#2b573d';
        ctxBbR.fillRect(0, 0, T, T);
        ctxBbR.fillStyle = '#85512e';
        ctxBbR.fillRect(0, 0, T, 2);
        ctxBbR.fillRect(T - 2, 0, 2, T);
        ctxBbR.fillRect(0, T - 2, T, 2);
        // Dibujo de fantasma en tiza
        ctxBbR.fillStyle = '#e0f0ff';
        ctxBbR.fillRect(5, 4, 4, 4);
        ctxBbR.fillRect(4, 6, 6, 5);
        ctxBbR.fillRect(5, 11, 1, 2);
        ctxBbR.fillRect(8, 11, 1, 2);
        // Borrador de tiza
        ctxBbR.fillStyle = '#d1ba97';
        ctxBbR.fillRect(9, T - 3, 3, 2);
        this.tiles['blackboard_right'] = cBbR;

        // 2. Pupitre escolar con silla (16x16)
        const { canvas: cDesk, ctx: ctxDesk } = this.createCanvas(T, T);
        // Base de suelo de madera debajo del pupitre
        if (this.tiles['floor_wood']) {
            ctxDesk.drawImage(this.tiles['floor_wood'], 0, 0);
        }
        // Silla (parte superior)
        ctxDesk.fillStyle = '#613b1f';
        ctxDesk.fillRect(4, 0, 8, 4);
        // Mesa
        ctxDesk.fillStyle = '#ad7242';
        ctxDesk.fillRect(1, 5, 14, 8);
        ctxDesk.fillStyle = '#cf9867';
        ctxDesk.fillRect(2, 6, 12, 6);
        // Cuaderno abierto sobre el pupitre
        ctxDesk.fillStyle = '#f8f8f8';
        ctxDesk.fillRect(4, 7, 5, 4);
        ctxDesk.fillStyle = '#4287f5'; // Lápiz azul
        ctxDesk.fillRect(10, 8, 3, 1);
        // Patas metálicas oscuras
        ctxDesk.fillStyle = '#2b231c';
        ctxDesk.fillRect(2, 13, 2, 3);
        ctxDesk.fillRect(12, 13, 2, 3);
        this.tiles['desk'] = cDesk;

        // 3. Casilleros escolares (Lockers fantasmales)
        const { canvas: cLocker, ctx: ctxLocker } = this.createCanvas(T, T);
        ctxLocker.fillStyle = '#374961';
        ctxLocker.fillRect(0, 0, T, T);
        ctxLocker.fillStyle = '#4d6585';
        ctxLocker.fillRect(2, 1, 12, 14);
        // Ranuras de ventilación
        ctxLocker.fillStyle = '#212d3b';
        ctxLocker.fillRect(4, 3, 8, 1);
        ctxLocker.fillRect(4, 5, 8, 1);
        // Cerradura dorada
        ctxLocker.fillStyle = '#f5c042';
        ctxLocker.fillRect(11, 8, 2, 3);
        this.tiles['locker'] = cLocker;

        // 4. Estantería con libros mágicos (Bookshelf)
        const { canvas: cBook, ctx: ctxBook } = this.createCanvas(T, T);
        ctxBook.fillStyle = '#52341b';
        ctxBook.fillRect(0, 0, T, T);
        // Balda 1
        ctxBook.fillStyle = '#80263c'; ctxBook.fillRect(2, 2, 2, 5); // Libro rojo
        ctxBook.fillStyle = '#24598a'; ctxBook.fillRect(5, 2, 3, 5); // Libro azul
        ctxBook.fillStyle = '#2a7849'; ctxBook.fillRect(9, 2, 2, 5); // Libro verde
        ctxBook.fillStyle = '#6a2a8a'; ctxBook.fillRect(12, 2, 2, 5); // Grimorio púrpura
        // Estante de madera
        ctxBook.fillStyle = '#7a4e29';
        ctxBook.fillRect(1, 7, 14, 2);
        // Balda 2
        ctxBook.fillStyle = '#bd7e22'; ctxBook.fillRect(2, 9, 3, 5);
        ctxBook.fillStyle = '#483582'; ctxBook.fillRect(6, 9, 2, 5);
        ctxBook.fillStyle = '#a83e60'; ctxBook.fillRect(9, 9, 2, 5);
        ctxBook.fillStyle = '#1c524f'; ctxBook.fillRect(12, 9, 2, 5);
        this.tiles['bookshelf'] = cBook;

        // 5. Planta en maceta estilo Pokémon Center
        const { canvas: cPlant, ctx: ctxPlant } = this.createCanvas(T, T);
        // Base de baldosas de suelo debajo de la maceta
        if (this.tiles['floor_tiles']) {
            ctxPlant.drawImage(this.tiles['floor_tiles'], 0, 0);
        }
        // Maceta azul cobalto
        ctxPlant.fillStyle = '#2c5282';
        ctxPlant.fillRect(4, 9, 8, 6);
        ctxPlant.fillStyle = '#3182ce';
        ctxPlant.fillRect(5, 10, 6, 4);
        // Hojas verdes frondosas
        ctxPlant.fillStyle = '#22543d';
        ctxPlant.fillRect(3, 4, 10, 5);
        ctxPlant.fillStyle = '#38a169';
        ctxPlant.fillRect(4, 2, 8, 5);
        ctxPlant.fillStyle = '#68d391';
        ctxPlant.fillRect(6, 1, 4, 3);
        this.tiles['plant'] = cPlant;

        // 6. Cinta de precaución / Obras (Misión 2 - Gimnasio)
        const { canvas: cTape, ctx: ctxTape } = this.createCanvas(T, T);
        ctxTape.fillStyle = '#3a4454';
        ctxTape.fillRect(0, 0, T, T);
        // Vallas de madera con cinta amarilla
        ctxTape.fillStyle = '#82542a';
        ctxTape.fillRect(2, 6, 2, 10);
        ctxTape.fillRect(12, 6, 2, 10);
        // Cinta amarilla y negra
        ctxTape.fillStyle = '#f6e05e';
        ctxTape.fillRect(0, 7, T, 4);
        ctxTape.fillStyle = '#1a202c';
        ctxTape.fillRect(2, 7, 2, 4);
        ctxTape.fillRect(6, 7, 2, 4);
        ctxTape.fillRect(10, 7, 2, 4);
        ctxTape.fillRect(14, 7, 2, 4);
        this.tiles['gym_tape'] = cTape;

        // 7. Sello Mágico Dorado de la Torre (Misión 3 - Rector)
        const { canvas: cSeal, ctx: ctxSeal } = this.createCanvas(T, T);
        ctxSeal.fillStyle = '#2d3242';
        ctxSeal.fillRect(0, 0, T, T);
        // Runa dorada resplandeciente
        ctxSeal.fillStyle = '#d69e2e';
        ctxSeal.fillRect(4, 3, 8, 10);
        ctxSeal.fillStyle = '#faf089';
        ctxSeal.fillRect(6, 5, 4, 6);
        ctxSeal.fillStyle = '#ffffff';
        ctxSeal.fillRect(7, 7, 2, 2);
        this.tiles['tower_seal'] = cSeal;

        // 8. Telescopio Espectral de la Terraza
        const { canvas: cTele, ctx: ctxTele } = this.createCanvas(T, T);
        if (this.tiles['terrace_floor']) {
            ctxTele.drawImage(this.tiles['terrace_floor'], 0, 0);
        }
        // Trípode de hierro
        ctxTele.fillStyle = '#1e293b';
        ctxTele.fillRect(3, 11, 2, 5);
        ctxTele.fillRect(7, 10, 2, 6);
        ctxTele.fillRect(11, 11, 2, 5);
        // Tubo de bronce dorado del telescopio apuntando al cielo
        ctxTele.fillStyle = '#d97706';
        ctxTele.fillRect(2, 4, 12, 4);
        ctxTele.fillStyle = '#fde68a';
        ctxTele.fillRect(3, 5, 10, 2);
        // Lente brillante
        ctxTele.fillStyle = '#38bdf8';
        ctxTele.fillRect(12, 3, 2, 6);
        this.tiles['telescope'] = cTele;

        // 9. Vitrina de Trofeos del Primer Piso (Trophy Case)
        const { canvas: cTrophy, ctx: ctxTrophy } = this.createCanvas(T, T);
        ctxTrophy.fillStyle = '#451a03';
        ctxTrophy.fillRect(0, 0, T, T);
        // Cristal con reflejo
        ctxTrophy.fillStyle = '#7dd3fc';
        ctxTrophy.fillRect(2, 2, 12, 12);
        // Copas y trofeos dorados
        ctxTrophy.fillStyle = '#f59e0b';
        ctxTrophy.fillRect(4, 5, 3, 4);
        ctxTrophy.fillRect(5, 9, 1, 3);
        ctxTrophy.fillRect(9, 4, 3, 5);
        ctxTrophy.fillRect(10, 9, 1, 3);
        this.tiles['trophy_case'] = cTrophy;

        // 10. Braseros espectrales para el puzzle (4 colores + apagado)
        this.generateBrazierGraphics();

        // 11. Jaula mágica espectral de Leonel
        this.generateCageGraphics();
    }

    /* Generación de Braseros del Puzzle (Azul, Verde, Púrpura, Rojo, y Apagado) */
    generateBrazierGraphics() {
        const T = this.tileSize;
        const colors = {
            'off': { flame: null, glow: null },
            'blue': { flame: '#63b3ed', glow: '#3182ce', core: '#ebf8ff' },
            'green': { flame: '#68d391', glow: '#2f855a', core: '#f0fff4' },
            'purple': { flame: '#b794f4', glow: '#6b46c1', core: '#faf5ff' },
            'red': { flame: '#fc8181', glow: '#c53030', core: '#fff5f5' }
        };

        for (const [key, col] of Object.entries(colors)) {
            const { canvas, ctx } = this.createCanvas(T, T);
            // Suelo de piedra del laboratorio bajo el brasero
            if (this.tiles['floor_stone']) {
                ctx.drawImage(this.tiles['floor_stone'], 0, 0);
            }
            // Pedestal de piedra rúnica
            ctx.fillStyle = '#2d3748';
            ctx.fillRect(2, 8, 12, 8);
            ctx.fillStyle = '#4a5568';
            ctx.fillRect(3, 9, 10, 6);
            ctx.fillStyle = '#1a202c';
            ctx.fillRect(1, 14, 14, 2); // Base ancha
            // Copa del brasero
            ctx.fillStyle = '#718096';
            ctx.fillRect(2, 6, 12, 3);
            ctx.fillStyle = '#2d3748';
            ctx.fillRect(3, 6, 10, 1);

            if (col.flame) {
                // Llama mágica encendida
                ctx.fillStyle = col.glow;
                ctx.fillRect(4, 1, 8, 6);
                ctx.fillStyle = col.flame;
                ctx.fillRect(5, 2, 6, 5);
                ctx.fillStyle = col.core;
                ctx.fillRect(6, 3, 4, 3);
                ctx.fillRect(7, 1, 2, 2); // Punta de la llama
            } else {
                // Apagado: ceniza oscura
                ctx.fillStyle = '#171923';
                ctx.fillRect(5, 6, 6, 2);
            }

            this.tiles[`brazier_${key}`] = canvas;
        }
    }

    /* Generación de la Barrera / Jaula que encierra a Leonel */
    generateCageGraphics() {
        const T = this.tileSize;
        // Barrera espectral (48x32 píxeles para cubrir los 3x2 tiles de contención: x=8..10, y=4..5)
        const { canvas, ctx } = this.createCanvas(48, 32);
        
        // Postes de contención rúnicos en las cuatro esquinas
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(0, 0, 5, 32);
        ctx.fillRect(43, 0, 5, 32);
        ctx.fillRect(0, 0, 48, 4);
        ctx.fillRect(0, 28, 48, 4);

        // Orbes mágicos brillantes en las esquinas
        ctx.fillStyle = '#63b3ed';
        ctx.fillRect(1, 1, 3, 3);
        ctx.fillRect(44, 1, 3, 3);
        ctx.fillRect(1, 28, 3, 3);
        ctx.fillRect(44, 28, 3, 3);

        // Campo de plasma translúcido
        ctx.fillStyle = 'rgba(79, 209, 197, 0.4)';
        ctx.fillRect(4, 4, 40, 24);

        // Rayos de contención verticales
        ctx.fillStyle = '#81e6d9';
        for (let bx = 11; bx < 40; bx += 8) {
            ctx.fillRect(bx, 4, 2, 24);
        }

        // Rayos horizontales
        ctx.fillStyle = '#4fd1c5';
        ctx.fillRect(4, 11, 40, 2);
        ctx.fillRect(4, 21, 40, 2);

        // Chispas de energía mágica blanca
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(12, 8, 1, 2);
        ctx.fillRect(28, 16, 2, 1);
        ctx.fillRect(36, 23, 1, 2);

        this.tiles['cage_barrier'] = canvas;
    }

    /* ============================================================
     * GENERACIÓN DE PERSONAJES FANTASMAS (PLAYER, LEONEL, NPCS)
     * ============================================================ */
    generateCharacterSprites() {
        // Generar sprites para: 'player', 'leonel', 'teacher', 'wendy', 'casperito', 'custodian', 'guard'
        const characters = {
            player: {
                main: '#e2e8f0', shadow: '#94a3b8', highlight: '#ffffff',
                eyes: '#1e293b', eyeGlow: '#38bdf8',
                accessory: '#ef4444' // Gorrito / pañuelo rojo de estudiante
            },
            leonel: {
                main: '#81e6d9', shadow: '#319795', highlight: '#e6fffa',
                eyes: '#1a365d', eyeGlow: '#4fd1c5',
                accessory: '#ecc94b' // Bufanda dorada/amarilla característica
            },
            teacher: {
                main: '#cbd5e1', shadow: '#64748b', highlight: '#f1f5f9',
                eyes: '#0f172a', eyeGlow: '#fbbf24',
                accessory: '#3b82f6', isTeacher: true // Lentes y corbata
            },
            wendy: {
                main: '#fbcfe8', shadow: '#f472b6', highlight: '#fdf2f8',
                eyes: '#4a044e', eyeGlow: '#ec4899',
                accessory: '#db2777' // Lazo rosa en la cabeza
            },
            casperito: {
                main: '#bfdbfe', shadow: '#60a5fa', highlight: '#eff6ff',
                eyes: '#1e3a8a', eyeGlow: '#3b82f6',
                accessory: null
            },
            custodian: {
                main: '#a7f3d0', shadow: '#34d399', highlight: '#ecfdf5',
                eyes: '#064e3b', eyeGlow: '#10b981',
                accessory: '#78350f', isCustodian: true // Escoba espectral
            },
            guard: {
                main: '#c084fc', shadow: '#7e22ce', highlight: '#f3e8ff',
                eyes: '#3b0764', eyeGlow: '#e9d5ff',
                accessory: '#f59e0b', isGuard: true // Armadura / Yelmo
            },
            stella: {
                main: '#818cf8', shadow: '#4338ca', highlight: '#e0e7ff',
                eyes: '#1e1b4b', eyeGlow: '#fde047',
                accessory: '#fbbf24' // Capa con broche de estrella dorada
            },
            student_bubu: {
                main: '#fed7aa', shadow: '#fb923c', highlight: '#fff7ed',
                eyes: '#7c2d12', eyeGlow: '#f97316',
                accessory: '#ea580c'
            }
        };

        const dirs = ['down', 'up', 'left', 'right'];
        const frames = [0, 1, 2]; // 0: Idle, 1: Step A, 2: Step B

        for (const [charKey, charDef] of Object.entries(characters)) {
            this.sprites[charKey] = {};

            for (const dir of dirs) {
                this.sprites[charKey][dir] = [];

                for (const frame of frames) {
                    const { canvas, ctx } = this.createCanvas(16, 20); // 16 ancho x 20 alto
                    this.drawGhostSprite(ctx, dir, frame, charDef);
                    this.sprites[charKey][dir].push(canvas);
                }
            }
        }
    }

    /**
     * Dibuja un fantasma pixel por pixel en las 4 direcciones y 3 fotogramas de animación
     */
    drawGhostSprite(ctx, dir, frame, def) {
        // Desplazamiento flotante de fantasma
        const bobOffset = (frame === 1) ? -1 : (frame === 2 ? 1 : 0);

        // Aura translúcida suave
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(2, 3 + bobOffset, 12, 13);

        // Cuerpo base del fantasma
        ctx.fillStyle = def.main;
        // Cabeza redondeada
        ctx.fillRect(4, 2 + bobOffset, 8, 3);
        ctx.fillRect(3, 4 + bobOffset, 10, 7);
        ctx.fillRect(4, 11 + bobOffset, 8, 4);

        // Cola ondulante del fantasma (animación según fotograma)
        ctx.fillStyle = def.shadow;
        if (frame === 0) {
            // Reposo
            ctx.fillRect(4, 15 + bobOffset, 2, 3);
            ctx.fillRect(7, 15 + bobOffset, 2, 2);
            ctx.fillRect(10, 15 + bobOffset, 2, 3);
        } else if (frame === 1) {
            // Ondulación izquierda
            ctx.fillRect(3, 15 + bobOffset, 3, 3);
            ctx.fillRect(7, 15 + bobOffset, 3, 2);
            ctx.fillRect(11, 14 + bobOffset, 2, 2);
        } else {
            // Ondulación derecha
            ctx.fillRect(3, 14 + bobOffset, 2, 2);
            ctx.fillRect(6, 15 + bobOffset, 3, 2);
            ctx.fillRect(10, 15 + bobOffset, 3, 3);
        }

        // Iluminación superior del fantasma
        ctx.fillStyle = def.highlight;
        ctx.fillRect(4, 2 + bobOffset, 6, 1);
        ctx.fillRect(3, 3 + bobOffset, 2, 4);

        // Accesorios especiales (Gorro, Lazo, Lentes)
        if (def.isTeacher) {
            // Lentes dorados
            ctx.fillStyle = '#f59e0b';
            if (dir === 'down') {
                ctx.strokeRect(4.5, 5.5 + bobOffset, 2, 2);
                ctx.strokeRect(9.5, 5.5 + bobOffset, 2, 2);
                ctx.fillRect(7, 6 + bobOffset, 2, 1);
            }
            // Libro que sostiene
            ctx.fillStyle = '#991b1b';
            ctx.fillRect(11, 9 + bobOffset, 3, 4);
        } else if (def.isCustodian) {
            // Palo de escoba espectral
            ctx.fillStyle = '#92400e';
            ctx.fillRect(12, 3 + bobOffset, 1, 14);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(11, 14 + bobOffset, 3, 4);
        } else if (def.isGuard) {
            // Casco espectral
            ctx.fillStyle = '#4c1d95';
            ctx.fillRect(4, 1 + bobOffset, 8, 3);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(7, 0 + bobOffset, 2, 2); // Penacho dorado
        } else if (def.accessory) {
            ctx.fillStyle = def.accessory;
            if (def.accessory === '#db2777') {
                // Lazo de Wendy en la cabeza
                ctx.fillRect(10, 1 + bobOffset, 3, 2);
                ctx.fillRect(11, 2 + bobOffset, 1, 1);
            } else {
                // Pañuelo / bufanda al cuello
                ctx.fillRect(4, 10 + bobOffset, 8, 2);
                if (dir === 'down' || dir === 'right') {
                    ctx.fillRect(10, 11 + bobOffset, 2, 3);
                }
            }
        }

        // Ojos según la dirección a la que mira
        ctx.fillStyle = def.eyes;
        if (dir === 'down') {
            ctx.fillRect(5, 6 + bobOffset, 2, 3);
            ctx.fillRect(9, 6 + bobOffset, 2, 3);
            // Brillo en los ojos
            ctx.fillStyle = def.eyeGlow;
            ctx.fillRect(5, 6 + bobOffset, 1, 1);
            ctx.fillRect(9, 6 + bobOffset, 1, 1);
        } else if (dir === 'up') {
            // Mirando arriba (espalda) - solo se ve la nuca
            ctx.fillStyle = def.shadow;
            ctx.fillRect(5, 4 + bobOffset, 6, 2);
        } else if (dir === 'left') {
            ctx.fillRect(4, 6 + bobOffset, 2, 3);
            ctx.fillStyle = def.eyeGlow;
            ctx.fillRect(4, 6 + bobOffset, 1, 1);
        } else if (dir === 'right') {
            ctx.fillRect(10, 6 + bobOffset, 2, 3);
            ctx.fillStyle = def.eyeGlow;
            ctx.fillRect(10, 6 + bobOffset, 1, 1);
        }
    }

    /**
     * Dibuja un Tile en coordenadas de píxeles
     */
    drawTile(ctx, tileKey, px, py) {
        const img = this.tiles[tileKey];
        if (img) {
            ctx.drawImage(img, px, py);
        }
    }

    /**
     * Dibuja un Personaje Fantasma
     */
    drawCharacter(ctx, charKey, dir, frame, px, py) {
        const charObj = this.sprites[charKey];
        if (!charObj || !charObj[dir]) return;
        const frameIdx = Math.floor(frame) % 3;
        const img = charObj[dir][frameIdx];
        if (img) {
            // Los personajes miden 16x20 px, dibujamos con offset Y de -4 para que los pies queden alineados con el tile de 16x16
            ctx.drawImage(img, px, py - 4);
        }
    }
}

window.spriteManager = new SpriteManager();
