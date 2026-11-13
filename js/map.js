/**
 * Definición de Mapas, Colisiones, NPCs y Puntos de Teletransporte
 * Estilo Pokémon Esmeralda / Rojo Fuego
 * Incluye Planta Baja, Aulas, Biblioteca, Sótano, Primer Piso y Terraza en L
 */

class MapManager {
    constructor() {
        this.currentMapId = 'lobby';
        this.maps = {};
        this.initMaps();
    }

    initMaps() {
        this.maps['lobby'] = this.buildLobbyMap();
        this.maps['classroom'] = this.buildClassroomMap();
        this.maps['library'] = this.buildLibraryMap();
        this.maps['lab'] = this.buildLabMap();
        this.maps['floor1'] = this.buildFloor1Map();
        this.maps['terrace'] = this.buildTerraceMap();
    }

    getCurrentMap() {
        return this.maps[this.currentMapId];
    }

    switchMap(mapId, targetX, targetY) {
        if (this.maps[mapId]) {
            this.currentMapId = mapId;
            return { x: targetX, y: targetY };
        }
        return null;
    }

    /* ============================================================
     * 1. VESTÍBULO PRINCIPAL DE LA ACADEMIA ESPECTRAL (PLANTA BAJA)
     * ============================================================ */
    buildLobbyMap() {
        const W = 20;
        const H = 15;
        const map = {
            id: 'lobby',
            name: 'Vestíbulo Principal - Academia Espectral',
            width: W,
            height: H,
            tiles: [],
            solid: Array.from({ length: H }, () => Array(W).fill(false)),
            warps: [
                // Salida oeste -> Aula de Encantamientos (solo al cruzar el umbral en x=0)
                { x: 0, y: 7, targetMap: 'classroom', targetX: 12, targetY: 5 },
                // Salida este -> Biblioteca (solo al cruzar el umbral en x=19)
                { x: 19, y: 7, targetMap: 'library', targetX: 1, targetY: 5 },
                // Salida norte central -> Sótano / Laboratorio Prohibido
                { x: 9, y: 2, targetMap: 'lab', targetX: 9, targetY: 12 },
                { x: 10, y: 2, targetMap: 'lab', targetX: 9, targetY: 12 },
                // Escaleras hacia el Primer Piso (Floor 1)
                { x: 13, y: 1, targetMap: 'floor1', targetX: 13, targetY: 3 },
                { x: 14, y: 1, targetMap: 'floor1', targetX: 14, targetY: 3 }
            ],
            npcs: [
                {
                    id: 'wendy',
                    name: 'Wendy',
                    sprite: 'wendy',
                    x: 6,
                    y: 7,
                    dir: 'right',
                    dialogue: () => {
                        if (window.gameCompanion && window.gameCompanion.active) {
                            return [
                                "¡Hola chicos! Me alegra tanto verlos juntos recorriendo el colegio.",
                                "¡Hacen un gran equipo espectral!"
                            ];
                        }
                        if (window.puzzleManager && window.puzzleManager.isSolved) {
                            return [
                                "¡Increíble! ¡Lograste salvar a Leonel del sótano!",
                                "Leonel está descansando cerca de las escaleras.",
                                "¡Háblale si quieres que te acompañe a explorar el colegio!"
                            ];
                        }
                        return [
                            "¡Hola amigo! Menos mal que llegaste a la Academia.",
                            "¿Viste a Leonel? Fue al Laboratorio Prohibido en el Sótano (puerta norte) a buscar un libro antiguo...",
                            "¡Y dicen que las runas de contención se activaron y quedó atrapado en una jaula espectral!",
                            "Ve al Aula de Encantamientos (oeste) y a la Biblioteca (este) para buscar pistas de cómo desactivar el sello."
                        ];
                    }
                },
                {
                    id: 'custodian',
                    name: 'Don Ecto (Conserje)',
                    sprite: 'custodian',
                    x: 16,
                    y: 3,
                    dir: 'down',
                    dialogue: () => [
                        "¡Ehh, alto ahí novato!",
                        "El Gimnasio Embrujado está cerrado por una tormenta de poltergeists rebeldes.",
                        "Cinta de clausura oficial del colegio.",
                        "★ Misión 2: 'El Poltergeist del Gimnasio' - Próximo Desarrollo ★"
                    ]
                },
                {
                    id: 'guard',
                    name: 'Prefecto Espectral',
                    sprite: 'guard',
                    x: 3,
                    y: 3,
                    dir: 'down',
                    dialogue: () => [
                        "El acceso a la Torre del Rector está restringido.",
                        "El Gran Consejo Fantasmal colocó un Sello Dorado infranqueable.",
                        "Regresa cuando hayas demostrado tu valía académica.",
                        "★ Misión 3: 'El Secreto del Rector Fantasma' - Próximo Desarrollo ★"
                    ]
                },
                {
                    id: 'casperito',
                    name: 'Casperito',
                    sprite: 'casperito',
                    x: 13,
                    y: 10,
                    dir: 'left',
                    dialogue: () => [
                        "¿Sabías que si subes por las escaleras de la derecha llegas al primer piso y a la terraza?",
                        "¡La brisa de la terraza es perfecta para flotar!"
                    ]
                },
                // Leonel en el vestíbulo tras ser rescatado (si no está acompañando)
                {
                    id: 'leonel_lobby',
                    name: 'Leonel',
                    sprite: 'leonel',
                    x: 10,
                    y: 4,
                    dir: 'down',
                    dialogue: () => {
                        const comp = window.gameCompanion;
                        if (!comp.active) {
                            comp.active = true;
                            if (window.retroAudio) window.retroAudio.playSelect();
                            return [
                                "¡Hola amigo! Qué bien se siente estar fuera de ese sótano oscuro.",
                                "¡Claro que sí! ¡Te acompaño a explorar el colegio!",
                                "★ ¡Leonel ahora te acompaña por todo el mapa! ★"
                            ];
                        } else {
                            return [
                                "¡Vamos a recorrer juntos las aulas y la terraza en L!",
                                "¡Estoy listo para cualquier aventura!"
                            ];
                        }
                    }
                }
            ],
            interactables: [
                { x: 5, y: 2, text: "Casillero estudiantil: Contiene una capa espectral doblada y polvos mágicos." },
                { x: 6, y: 2, text: "Casillero de Leonel: Tiene una foto de ambos en su primer día de fantasmas." },
                { x: 16, y: 2, text: "Puerta del Gimnasio Embrujado. Bloqueada con cinta de peligro: 'EN OBRAS (Misión 2)'." },
                { x: 3, y: 2, text: "Puerta de la Torre del Rector. Un sello dorado flota impidiendo el paso: 'SELLADO (Misión 3)'." },
                { x: 10, y: 5, text: "Cartel Informativo: 'Norte: Sótano | Oeste: Aula | Este: Biblioteca | Escaleras: Piso 1 y Terraza'." }
            ]
        };

        for (let y = 0; y < H; y++) {
            const row = [];
            for (let x = 0; x < W; x++) {
                if (y === 0) {
                    row.push('wall_school_top');
                    map.solid[y][x] = true;
                } else if (y === 1) {
                    if (x === 3) row.push('tower_seal');
                    else if (x === 16) row.push('gym_tape');
                    else if (x === 9 || x === 10) row.push('door');
                    else if (x === 13 || x === 14) row.push('stairs_up'); // Escaleras al Piso 1
                    else if (x === 5 || x === 6) row.push('locker');
                    else row.push('wall_school_bot');
                    // Solo las escaleras son transitables en la fila 1 para subir de piso
                    if (x !== 13 && x !== 14) {
                        map.solid[y][x] = true;
                    }
                } else if (y === H - 1) {
                    if (x === 9 || x === 10) row.push('mat');
                    else {
                        row.push('wall_school_bot');
                        map.solid[y][x] = true;
                    }
                } else if (x === 0 || x === W - 1) {
                    if (y === 7) row.push('mat');
                    else {
                        row.push(y <= 2 ? 'wall_school_top' : 'wall_school_bot');
                        map.solid[y][x] = true;
                    }
                } else {
                    if (x >= 8 && x <= 11) row.push('floor_carpet');
                    else row.push('floor_tiles');
                }
            }
            map.tiles.push(row);
        }

        map.tiles[2][1] = 'plant'; map.solid[2][1] = true;
        map.tiles[2][W - 2] = 'plant'; map.solid[2][W - 2] = true;
        map.tiles[H - 2][1] = 'plant'; map.solid[H - 2][1] = true;
        map.tiles[H - 2][W - 2] = 'plant'; map.solid[H - 2][W - 2] = true;

        return map;
    }

    /* ============================================================
     * 2. AULA DE ENCANTAMIENTOS (CLASSROOM A)
     * ============================================================ */
    buildClassroomMap() {
        const W = 14;
        const H = 10;
        const map = {
            id: 'classroom',
            name: 'Aula de Encantamientos',
            width: W,
            height: H,
            tiles: [],
            solid: Array.from({ length: H }, () => Array(W).fill(false)),
            warps: [
                { x: 13, y: 5, targetMap: 'lobby', targetX: 2, targetY: 7 }
            ],
            npcs: [
                {
                    id: 'teacher',
                    name: 'Prof. Ectoplasma',
                    sprite: 'teacher',
                    x: 7,
                    y: 3,
                    dir: 'down',
                    dialogue: () => [
                        "¡Atención clase! Sean bienvenidos a Encantamientos Aplicados.",
                        "Hoy estudiamos los Sellos Cuádruples de Contención.",
                        "Para romper un sello elemental, lean atentamente la pizarra.",
                        "Recuerden: Si encienden una llama fuera de orden, la energía colapsará."
                    ]
                }
            ],
            interactables: [
                {
                    x: 4, y: 1,
                    text: [
                        "📜 Pizarra - [Lección Rúnica Parte 1]:",
                        "'1. El Fuego de Zafiro (Azul) apacigua las corrientes etéreas e inicia el ritual.'",
                        "'2. Inmediatamente después, el Fuego de Esmeralda (Verde) despierta la resonancia elemental.'"
                    ]
                },
                {
                    x: 5, y: 1,
                    text: [
                        "📜 Pizarra - Esquema de braseros:",
                        "Hay un boceto de cuatro pedestales arcanos.",
                        "Nota: 'Consultar el tomo de la Biblioteca para la parte final.'"
                    ]
                },
                { x: 2, y: 5, text: "Pupitre escolar: Cuaderno de apuntes de un fantasma dormilón." },
                { x: 2, y: 7, text: "Pupitre escolar: Dibujo de un pequeño fantasma sonriente." },
                { x: 10, y: 5, text: "Pupitre escolar: Contiene una regla espectral y una goma de borrar." },
                { x: 10, y: 7, text: "Pupitre escolar: '¡Estudiar para el examen de Poltergeist!'." }
            ]
        };

        for (let y = 0; y < H; y++) {
            const row = [];
            for (let x = 0; x < W; x++) {
                if (y === 0) {
                    row.push('wall_school_top');
                    map.solid[y][x] = true;
                } else if (y === 1) {
                    if (x === 4) row.push('blackboard_left');
                    else if (x === 5) row.push('blackboard_right');
                    else if (x === 2 || x === 11) row.push('window');
                    else row.push('wall_school_bot');
                    map.solid[y][x] = true;
                } else if (y === H - 1 || x === 0) {
                    row.push('wall_school_bot');
                    map.solid[y][x] = true;
                } else if (x === W - 1) {
                    if (y === 5) row.push('mat');
                    else {
                        row.push('wall_school_bot');
                        map.solid[y][x] = true;
                    }
                } else {
                    row.push('floor_wood');
                }
            }
            map.tiles.push(row);
        }

        const deskCoords = [
            [2, 5], [4, 5], [8, 5], [10, 5],
            [2, 7], [4, 7], [8, 7], [10, 7]
        ];
        deskCoords.forEach(([dx, dy]) => {
            map.tiles[dy][dx] = 'desk';
            map.solid[dy][dx] = true;
        });

        map.tiles[2][7] = 'desk';
        map.solid[2][7] = true;

        return map;
    }

    /* ============================================================
     * 3. BIBLIOTECA ESPECTRAL
     * ============================================================ */
    buildLibraryMap() {
        const W = 14;
        const H = 10;
        const map = {
            id: 'library',
            name: 'Biblioteca Espectral',
            width: W,
            height: H,
            tiles: [],
            solid: Array.from({ length: H }, () => Array(W).fill(false)),
            warps: [
                { x: 0, y: 5, targetMap: 'lobby', targetX: 17, targetY: 7 }
            ],
            npcs: [
                {
                    id: 'librarian',
                    name: 'Bibliotecario Sabio',
                    sprite: 'teacher',
                    x: 6,
                    y: 3,
                    dir: 'down',
                    dialogue: () => [
                        "¡Shhh! Silencio en el recinto de lectura espectral.",
                        "¿Buscas cómo desarmar trampas de alquimia?",
                        "En el atril central descansa el 'Códice Secreto de Sellos'. Léelo con atención."
                    ]
                }
            ],
            interactables: [
                {
                    x: 6, y: 2,
                    text: [
                        "📖 Gran Códice Secreto de Sellos Arcanos:",
                        "'...Habiendo despertado la resonancia del fuego verde...'",
                        "'3. Debe encenderse la llama de Amatista (Púrpura) para enlazar los polos.'",
                        "'4. Finalmente, el Fuego de Rubí (Rojo) quebrará la barrera y liberará a los cautivos.'",
                        "★ SECUENCIA COMPLETA: 1° Azul ➔ 2° Verde ➔ 3° Púrpura ➔ 4° Rojo ★"
                    ]
                },
                { x: 2, y: 1, text: "Estantería: 'Tratado de Levitación Avanzada para Almas Nuevas'." },
                { x: 3, y: 1, text: "Estantería: 'Enciclopedia de Ectoplasma y sus Derivados'." },
                { x: 10, y: 1, text: "Estantería: 'Historia de la Academia Espectral (Vol. 1)'." },
                { x: 11, y: 1, text: "Estantería: '100 Maneras de no asustar humanos por accidente'." }
            ]
        };

        for (let y = 0; y < H; y++) {
            const row = [];
            for (let x = 0; x < W; x++) {
                if (y === 0) {
                    row.push('wall_school_top');
                    map.solid[y][x] = true;
                } else if (y === 1) {
                    if (x >= 2 && x <= 4) row.push('bookshelf');
                    else if (x >= 9 && x <= 11) row.push('bookshelf');
                    else if (x === 6) row.push('desk');
                    else row.push('wall_school_bot');
                    map.solid[y][x] = true;
                } else if (y === H - 1 || x === W - 1) {
                    row.push('wall_school_bot');
                    map.solid[y][x] = true;
                } else if (x === 0) {
                    if (y === 5) row.push('mat');
                    else {
                        row.push('wall_school_bot');
                        map.solid[y][x] = true;
                    }
                } else {
                    row.push('floor_wood');
                }
            }
            map.tiles.push(row);
        }

        map.tiles[5][3] = 'bookshelf'; map.solid[5][3] = true;
        map.tiles[6][3] = 'bookshelf'; map.solid[6][3] = true;
        map.tiles[5][10] = 'bookshelf'; map.solid[5][10] = true;
        map.tiles[6][10] = 'bookshelf'; map.solid[6][10] = true;

        map.tiles[6][6] = 'desk'; map.solid[6][6] = true;
        map.tiles[6][7] = 'desk'; map.solid[6][7] = true;

        return map;
    }

    /* ============================================================
     * 4. SÓTANO: LABORATORIO PROHIBIDO (MISIÓN 1)
     * ============================================================ */
    buildLabMap() {
        const W = 19;
        const H = 15;
        const map = {
            id: 'lab',
            name: 'Laboratorio Prohibido - Sótano',
            width: W,
            height: H,
            tiles: [],
            solid: Array.from({ length: H }, () => Array(W).fill(false)),
            warps: [
                { x: 9, y: 14, targetMap: 'lobby', targetX: 9, targetY: 3 }
            ],
            npcs: [
                {
                    id: 'leonel',
                    name: 'Leonel',
                    sprite: 'leonel',
                    x: 9,
                    y: 4,
                    dir: 'down',
                    dialogue: () => {
                        const pm = window.puzzleManager;
                        if (!pm.isSolved) {
                            return [
                                "¡¡AYUDA!! ¡Amigo, estoy atrapado aquí adentro!",
                                "Pisé una runa equivocada mientras buscaba mi libro y este campo de fuerza me encerró.",
                                "Hay cuatro braseros rúnicos alrededor del laboratorio: Zafiro (Azul), Esmeralda (Verde), Amatista (Púrpura) y Rubí (Rojo).",
                                "¡Tienes que encenderlos en el orden exacto que indican las lecciones de la escuela para romper el sello!"
                            ];
                        } else {
                            if (!window.gameQuestState.mission1Claimed) {
                                window.gameQuestState.mission1Claimed = true;
                                window.gameQuestState.hasRunningShoes = true;
                                return [
                                    "¡¡GRACIAS AMIGO!! ¡Me salvaste de quedar disuelto en ectoplasma!",
                                    "¡Eres el mejor compañero de toda la academia!",
                                    "¡Recibiste: 'ZAPATILLAS FANTASMA'!",
                                    "(¡Ahora puedes correr a gran velocidad manteniendo pulsado [Shift] o la tecla [X]!)",
                                    "¡Subamos al vestíbulo! Búscame arriba si quieres que te acompañe a explorar el colegio."
                                ];
                            } else {
                                return [
                                    "¡Qué alivio respirar fuera de esa celda!",
                                    "¡Subamos al vestíbulo! Búscame arriba cuando quieras que te acompañe a recorrer la academia."
                                ];
                            }
                        }
                    }
                }
            ],
            interactables: [
                { x: 4, y: 4, isBrazier: true, color: 'blue' },
                { x: 14, y: 4, isBrazier: true, color: 'green' },
                { x: 4, y: 10, isBrazier: true, color: 'purple' },
                { x: 14, y: 10, isBrazier: true, color: 'red' },
                { x: 9, y: 5, isCage: true }
            ]
        };

        for (let y = 0; y < H; y++) {
            const row = [];
            for (let x = 0; x < W; x++) {
                if (y === 0) {
                    row.push('wall_stone_top');
                    map.solid[y][x] = true;
                } else if (y === 1) {
                    row.push('wall_stone_bot');
                    map.solid[y][x] = true;
                } else if (y === H - 1) {
                    if (x === 9) row.push('mat');
                    else {
                        row.push('wall_stone_bot');
                        map.solid[y][x] = true;
                    }
                } else if (x === 0 || x === W - 1) {
                    row.push(y <= 2 ? 'wall_stone_top' : 'wall_stone_bot');
                    map.solid[y][x] = true;
                } else {
                    row.push('floor_stone');
                }
            }
            map.tiles.push(row);
        }

        const brazierPos = [[4, 4], [14, 4], [4, 10], [14, 10]];
        brazierPos.forEach(([bx, by]) => {
            map.solid[by][bx] = true;
        });

        map.solid[4][8] = true;
        map.solid[4][9] = true;
        map.solid[4][10] = true;
        map.solid[5][8] = true;
        map.solid[5][9] = true;
        map.solid[5][10] = true;

        return map;
    }

    /* ============================================================
     * 5. PRIMER PISO (FLOOR 1 - GALERÍA SUPERIOR)
     * ============================================================ */
    buildFloor1Map() {
        const W = 20;
        const H = 12;
        const map = {
            id: 'floor1',
            name: 'Primer Piso - Galería Superior',
            width: W,
            height: H,
            tiles: [],
            solid: Array.from({ length: H }, () => Array(W).fill(false)),
            warps: [
                // Escaleras hacia abajo al Vestíbulo (Planta Baja)
                { x: 13, y: 1, targetMap: 'lobby', targetX: 13, targetY: 3 },
                { x: 14, y: 1, targetMap: 'lobby', targetX: 14, targetY: 3 },
                // Escaleras hacia arriba a la Gran Terraza en L (Piso 2)
                { x: 3, y: 1, targetMap: 'terrace', targetX: 5, targetY: 5 }
            ],
            npcs: [
                {
                    id: 'student_bubu',
                    name: 'Bubu (Estudiante)',
                    sprite: 'student_bubu',
                    x: 8,
                    y: 6,
                    dir: 'right',
                    dialogue: () => [
                        "¡Hola! Estás en la Galería del Primer Piso.",
                        "Si subes por las escaleras de la izquierda (noroeste) llegarás a la Terraza en L.",
                        "¡Desde allá arriba las estrellas se ven gigantescas!"
                    ]
                },
                {
                    id: 'professor_shadow',
                    name: 'Prof. Sombrilla',
                    sprite: 'teacher',
                    x: 16,
                    y: 5,
                    dir: 'left',
                    dialogue: () => [
                        "¡Recuerden no correr por los pasillos con las Zapatillas Fantasma!",
                        "Las ondas de choque pueden desordenar los trofeos espectrales."
                    ]
                }
            ],
            interactables: [
                { x: 7, y: 2, text: "Vitrina de Trofeos: 'Campeonato Intercolegial de Levitación Espectral 1998'." },
                { x: 8, y: 2, text: "Trofeo de Oro: 'Premio al Susto Más Elegante otorgado a la Academia'." },
                { x: 10, y: 2, text: "Ventana con vistas al patio: La noche está calma y llena de estrellas." },
                { x: 3, y: 1, text: "Escaleras que suben al Piso 2: Conducen a la Terraza Panorámica en L." }
            ]
        };

        for (let y = 0; y < H; y++) {
            const row = [];
            for (let x = 0; x < W; x++) {
                if (y === 0) {
                    row.push('wall_school_top');
                    map.solid[y][x] = true;
                } else if (y === 1) {
                    if (x === 3) row.push('stairs_up'); // Escalera que sube a Terraza
                    else if (x === 13 || x === 14) row.push('stairs_down'); // Escalera que baja a Lobby
                    else if (x === 7 || x === 8) row.push('trophy_case');
                    else if (x === 10 || x === 11) row.push('window');
                    else if (x === 5 || x === 17) row.push('locker');
                    else row.push('wall_school_bot');
                    // Escaleras transitables para cambiar de piso
                    if (x !== 3 && x !== 13 && x !== 14) {
                        map.solid[y][x] = true;
                    }
                } else if (y === H - 1 || x === 0 || x === W - 1) {
                    row.push(y <= 2 ? 'wall_school_top' : 'wall_school_bot');
                    map.solid[y][x] = true;
                } else {
                    if (x >= 2 && x <= 17 && y >= 5 && y <= 7) row.push('floor_carpet');
                    else row.push('floor_wood');
                }
            }
            map.tiles.push(row);
        }

        // Plantas decorativas
        map.tiles[3][1] = 'plant'; map.solid[3][1] = true;
        map.tiles[H - 2][1] = 'plant'; map.solid[H - 2][1] = true;
        map.tiles[H - 2][W - 2] = 'plant'; map.solid[H - 2][W - 2] = true;

        return map;
    }

    /* ============================================================
     * 6. SEGUNDO PISO: GRAN TERRAZA PANORÁMICA EN FORMA DE L
     *    - Mucho más grande (34 x 26 tiles)
     *    - Rodeada por copas de árboles nocturnos en verde oscuro
     *    - Telescopio espectral con visor astronómico de aurora boreal
     * ============================================================ */
    buildTerraceMap() {
        const W = 34;
        const H = 26;
        const map = {
            id: 'terrace',
            name: 'Segundo Piso - Gran Terraza Panorámica (En L)',
            width: W,
            height: H,
            tiles: [],
            solid: Array.from({ length: H }, () => Array(W).fill(false)),
            warps: [
                // Escaleras hacia abajo al Primer Piso
                { x: 5, y: 4, targetMap: 'floor1', targetX: 3, targetY: 2 }
            ],
            npcs: [
                {
                    id: 'stella',
                    name: 'Stella (Astrónoma)',
                    sprite: 'stella',
                    x: 25,
                    y: 4,
                    dir: 'right',
                    dialogue: () => [
                        "¡Bienvenido a la Gran Terraza en L de la academia!",
                        "Las copas del bosque nocturno se extienden hasta donde alcanza la vista.",
                        "Usa el telescopio dorado a mi lado para observar la aurora boreal espectral."
                    ]
                }
            ],
            interactables: [
                {
                    x: 27, y: 4,
                    isTelescope: true
                },
                { x: 5, y: 3, text: "Escaleras de descenso: Regresan a la galería del Primer Piso." },
                { x: 12, y: 3, text: "Mirador Norte: El aire nocturno es fresco y el bosque se mece bajo la luna." },
                { x: 24, y: 15, text: "Mirador Este: El horizonte espectral brilla con luces tenues." }
            ]
        };

        // Generar Terraza Gigante CON FORMA DE L:
        // Ala Horizontal Norte: x = 3..29, y = 3..9 (27 casillas de ancho x 7 de alto)
        // Ala Vertical Este:    x = 20..29, y = 10..22 (10 casillas de ancho x 13 de alto)
        for (let y = 0; y < H; y++) {
            const row = [];
            for (let x = 0; x < W; x++) {
                const inHorizontalWing = (x >= 3 && x <= 29 && y >= 3 && y <= 9);
                const inVerticalWing = (x >= 20 && x <= 29 && y >= 10 && y <= 22);
                const isInsideL = inHorizontalWing || inVerticalWing;

                if (isInsideL) {
                    // Escalera que baja al primer piso
                    if (x === 5 && y === 4) {
                        row.push('stairs_down');
                    } else if (x === 27 && y === 4) {
                        row.push('telescope');
                        map.solid[y][x] = true;
                    } else {
                        // Bordes de la L con barandilla (parapeto)
                        const isBorderN = (y === 3 && x >= 3 && x <= 29);
                        const isBorderW_Top = (x === 3 && y >= 3 && y <= 9);
                        const isBorderS_Top = (y === 9 && x >= 3 && x < 20);
                        const isBorderW_Bot = (x === 20 && y >= 10 && y <= 22);
                        const isBorderS_Bot = (y === 22 && x >= 20 && x <= 29);
                        const isBorderE = (x === 29 && y >= 3 && y <= 22);

                        if (isBorderN || isBorderW_Top || isBorderS_Top || isBorderW_Bot || isBorderS_Bot || isBorderE) {
                            if (x === 5 && y === 4) {
                                row.push('stairs_down');
                            } else {
                                row.push('terrace_rail');
                                map.solid[y][x] = true;
                            }
                        } else {
                            // Suelo de piedra de la terraza
                            row.push('terrace_floor');
                        }
                    }
                } else {
                    // Todo lo que está fuera de la terraza en L son COPAS DE ÁRBOLES en verde oscuro nocturno
                    const treeVariant = (x + y) % 3 === 0 ? 'treetop_night_alt' : 'treetop_night';
                    row.push(treeVariant);
                    map.solid[y][x] = true; // El bosque no se puede pisar desde el tejado
                }
            }
            map.tiles.push(row);
        }

        // Decoración de plantas y bancos en la terraza
        const plantCoords = [
            [8, 5], [14, 5], [18, 5],
            [22, 12], [22, 17], [22, 20]
        ];
        plantCoords.forEach(([px, py]) => {
            if (map.tiles[py] && map.tiles[py][px]) {
                map.tiles[py][px] = 'plant';
                map.solid[py][px] = true;
            }
        });

        return map;
    }
}

window.mapManager = new MapManager();
