/**
 * Motor Principal del Videojuego - Estilo Pokémon GBA
 * - Movimiento por casillas fluidas con colisiones y efecto de choque
 * - Cámara centrada en el jugador con resolución interna nítida (320x240)
 * - Sistema de Acompañante (Leonel te sigue por el mapa tras ser rescatado)
 * - Menú desplegable estilo Start de Pokémon
 * - Registro de Misiones (Misión 1 completa, Misiones 2 y 3 para próximo desarrollo)
 */

// Estado global de Misiones
window.gameQuestState = {
    mission1Title: "1. El Rescate de Leonel",
    mission1Desc: "Encuentra y libera a tu amigo Leonel atrapado en la celda mágica del Sótano.",
    mission1Completed: false,
    mission1Claimed: false,
    hasRunningShoes: false,

    mission2Title: "2. El Poltergeist del Gimnasio",
    mission2Desc: "Investiga los extraños temblores en la cancha de basket fantasmal. (Próximo Desarrollo)",

    mission3Title: "3. El Secreto del Rector Fantasma",
    mission3Desc: "Averigua qué oculta el Gran Consejo en lo alto de la Torre Espectral. (Próximo Desarrollo)"
};

// Estado global del Acompañante (Leonel)
window.gameCompanion = {
    active: false,
    name: 'Leonel',
    sprite: 'leonel',
    gridX: 9,
    gridY: 11,
    pixelX: 9 * 16,
    pixelY: 11 * 16,
    startX: 9 * 16,
    startY: 11 * 16,
    targetGridX: 9,
    targetGridY: 11,
    destPixelX: 9 * 16,
    destPixelY: 11 * 16,
    dir: 'down',
    isMoving: false,
    animFrame: 0,
    animTimer: 0
};

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        // Resolución nativa de 320 x 240 píxeles (20 x 15 tiles de 16x16)
        this.viewWidth = 320;
        this.viewHeight = 240;
        this.tileSize = 16;

        this.canvas.width = this.viewWidth;
        this.canvas.height = this.viewHeight;

        // Estado del visor del telescopio astral
        this.telescopeActive = false;
        this.initTelescopeStars();

        // Posición y estado del Jugador
        this.player = {
            gridX: 9,
            gridY: 10,
            pixelX: 9 * 16,
            pixelY: 10 * 16,
            startX: 9 * 16,
            startY: 10 * 16,
            targetGridX: 9,
            targetGridY: 10,
            destPixelX: 9 * 16,
            destPixelY: 10 * 16,
            dir: 'down',
            isMoving: false,
            moveProgress: 0,
            walkSpeed: 2,       // píxeles por frame al andar
            runSpeed: 3.5,      // píxeles por frame al correr (con Zapatillas Fantasma)
            animFrame: 0,
            animTimer: 0
        };

        // Entradas de control
        this.keys = {
            up: false, down: false, left: false, right: false,
            action: false, cancel: false, run: false, start: false
        };
        this.lastActionPress = 0;
        this.lastStartPress = 0;

        // Menú Pokémon desplegable
        this.menuOpen = false;
        this.menuCursor = 0;
        this.menuOptions = [
            { id: 'quests', label: 'MISIONES' },
            { id: 'companion', label: 'LEONEL' },
            { id: 'inventory', label: 'MOCHILA' },
            { id: 'ghosts', label: 'FANTASMAS' },
            { id: 'audio', label: 'AUDIO: ON' },
            { id: 'close', label: 'SALIR' }
        ];
        this.modalSubmenu = null; // 'quests' | 'inventory' | 'ghosts' | 'companion'

        // Notificación flotante de Misión
        this.questToast = null;
        this.questToastTimer = 0;

        this.bindEvents();
        this.triggerQuestNotification("¡Misión 1 Iniciada: Busca a Leonel!");
    }

    bindEvents() {
        // Teclado
        window.addEventListener('keydown', (e) => {
            if (window.retroAudio && !window.retroAudio.ctx) {
                window.retroAudio.init();
                window.retroAudio.startBgm();
            }

            // Si está viendo por el telescopio, cualquier botón sale del visor
            if (this.telescopeActive) {
                this.closeTelescope();
                return;
            }

            switch (e.key) {
                case 'ArrowUp': case 'w': case 'W':
                    this.keys.up = true; break;
                case 'ArrowDown': case 's': case 'S':
                    this.keys.down = true; break;
                case 'ArrowLeft': case 'a': case 'A':
                    this.keys.left = true; break;
                case 'ArrowRight': case 'd': case 'D':
                    this.keys.right = true; break;
                case ' ': case 'z': case 'Z': case 'Enter':
                    if (!this.keys.action) this.handleActionButton();
                    this.keys.action = true;
                    break;
                case 'x': case 'X': case 'Shift':
                    this.keys.run = true;
                    this.keys.cancel = true;
                    break;
                case 'Escape': case 'm': case 'M':
                    this.toggleMenu();
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'ArrowUp': case 'w': case 'W':
                    this.keys.up = false; break;
                case 'ArrowDown': case 's': case 'S':
                    this.keys.down = false; break;
                case 'ArrowLeft': case 'a': case 'A':
                    this.keys.left = false; break;
                case 'ArrowRight': case 'd': case 'D':
                    this.keys.right = false; break;
                case ' ': case 'z': case 'Z': case 'Enter':
                    this.keys.action = false; break;
                case 'x': case 'X': case 'Shift':
                    this.keys.run = false;
                    this.keys.cancel = false;
                    break;
            }
        });

        this.bindVirtualButtons();
    }

    bindVirtualButtons() {
        const bindBtn = (id, onDown, onUp) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                if (window.retroAudio && !window.retroAudio.ctx) {
                    window.retroAudio.init();
                    window.retroAudio.startBgm();
                }
                onDown();
            });
            el.addEventListener('pointerup', (e) => {
                e.preventDefault();
                if (onUp) onUp();
            });
            el.addEventListener('pointerleave', (e) => {
                e.preventDefault();
                if (onUp) onUp();
            });
        };

        bindBtn('btn-up', () => this.keys.up = true, () => this.keys.up = false);
        bindBtn('btn-down', () => this.keys.down = true, () => this.keys.down = false);
        bindBtn('btn-left', () => this.keys.left = true, () => this.keys.left = false);
        bindBtn('btn-right', () => this.keys.right = true, () => this.keys.right = false);

        bindBtn('btn-a', () => {
            this.handleActionButton();
            this.keys.action = true;
        }, () => this.keys.action = false);

        bindBtn('btn-b', () => {
            if (this.telescopeActive) {
                this.closeTelescope();
                return;
            }
            this.keys.run = true;
            if (this.menuOpen) this.toggleMenu();
        }, () => this.keys.run = false);

        bindBtn('btn-start', () => {
            if (this.telescopeActive) {
                this.closeTelescope();
                return;
            }
            this.toggleMenu();
        });
    }

    triggerQuestNotification(text) {
        this.questToast = text;
        this.questToastTimer = 180;
    }

    handleActionButton() {
        if (this.telescopeActive) {
            this.closeTelescope();
            return;
        }

        if (window.dialogSystem && window.dialogSystem.isOpen) {
            window.dialogSystem.handleAction();
            return;
        }

        if (this.menuOpen) {
            this.handleMenuSelect();
            return;
        }

        if (!this.player.isMoving) {
            this.tryInteract();
        }
    }

    toggleMenu() {
        if (window.dialogSystem && window.dialogSystem.isOpen) return;

        if (this.modalSubmenu) {
            this.modalSubmenu = null;
            if (window.retroAudio) window.retroAudio.playSelect();
            return;
        }

        this.menuOpen = !this.menuOpen;
        if (window.retroAudio) window.retroAudio.playSelect();
    }

    handleMenuSelect() {
        if (this.modalSubmenu) {
            this.modalSubmenu = null;
            if (window.retroAudio) window.retroAudio.playSelect();
            return;
        }

        const opt = this.menuOptions[this.menuCursor];
        if (!opt) return;

        if (window.retroAudio) window.retroAudio.playSelect();

        switch (opt.id) {
            case 'quests':
                this.modalSubmenu = 'quests';
                break;
            case 'companion':
                this.modalSubmenu = 'companion';
                break;
            case 'inventory':
                this.modalSubmenu = 'inventory';
                break;
            case 'ghosts':
                this.modalSubmenu = 'ghosts';
                break;
            case 'audio':
                if (window.retroAudio) {
                    const muted = window.retroAudio.toggleMute();
                    opt.label = muted ? 'AUDIO: OFF' : 'AUDIO: ON';
                }
                break;
            case 'close':
                this.menuOpen = false;
                break;
        }
    }

    tryInteract() {
        const curMap = window.mapManager.getCurrentMap();
        if (!curMap) return;

        let targetX = this.player.gridX;
        let targetY = this.player.gridY;

        if (this.player.dir === 'up') targetY--;
        else if (this.player.dir === 'down') targetY++;
        else if (this.player.dir === 'left') targetX--;
        else if (this.player.dir === 'right') targetX++;

        const comp = window.gameCompanion;

        // 1. Interacción con Leonel cuando nos acompaña
        if (comp.active && targetX === comp.gridX && targetY === comp.gridY) {
            // Girar a Leonel hacia el jugador
            if (this.player.dir === 'up') comp.dir = 'down';
            else if (this.player.dir === 'down') comp.dir = 'up';
            else if (this.player.dir === 'left') comp.dir = 'right';
            else if (this.player.dir === 'right') comp.dir = 'left';

            let comment = "¡Qué gran día para flotar por la academia!";
            if (curMap.id === 'lobby') comment = "El vestíbulo siempre tiene movimiento. ¿Subimos al primer piso o a la terraza?";
            else if (curMap.id === 'classroom') comment = "El profesor Ectoplasma da miedo cuando se enoja... ¡mejor no hagamos ruido!";
            else if (curMap.id === 'library') comment = "¡Mira cuántos libros mágicos! ¿Habrá alguno sobre golosinas de ectoplasma?";
            else if (curMap.id === 'lab') comment = "Uff... me da escalofríos recordar esa celda. ¡Menos mal que resolviste el puzzle!";
            else if (curMap.id === 'floor1') comment = "¡El primer piso tiene la vitrina de trofeos de los Juegos Fantasmales!";
            else if (curMap.id === 'terrace') comment = "¡La terraza en L es asombrosa! ¡La vista nocturna desde aquí arriba no tiene igual!";

            window.dialogSystem.show("Leonel", [
                comment,
                "¿Quieres que espere aquí un momento?",
                "(Abre el Menú con START para activar o desactivar mi compañía cuando quieras)."
            ], 'leonel');
            return;
        }

        // 2. Comprobar si hay un NPC enfrente
        const npc = curMap.npcs.find(n => n.x === targetX && n.y === targetY);
        if (npc) {
            // Si es Leonel estático en el lobby y ya está como acompañante activo, ignorar
            if (npc.id === 'leonel_lobby' && comp.active) return;
            // Si el puzzle no está resuelto, Leonel no aparece en el lobby
            if (npc.id === 'leonel_lobby' && !window.puzzleManager.isSolved) return;

            if (this.player.dir === 'up') npc.dir = 'down';
            else if (this.player.dir === 'down') npc.dir = 'up';
            else if (this.player.dir === 'left') npc.dir = 'right';
            else if (this.player.dir === 'right') npc.dir = 'left';

            const dialogLines = typeof npc.dialogue === 'function' ? npc.dialogue() : npc.dialogue;
            window.dialogSystem.show(npc.name, dialogLines, npc.sprite, () => {
                if (npc.id === 'leonel' && window.puzzleManager.isSolved && !window.gameQuestState.mission1Completed) {
                    window.gameQuestState.mission1Completed = true;
                    this.triggerQuestNotification("¡Misión 1 COMPLETADA: Leonel Rescatado!");
                }
            });
            return;
        }

        // 3. Comprobar si hay un objeto interactuable (brasero, telescopio, cartel, pizarra, etc.)
        const item = curMap.interactables.find(it => it.x === targetX && it.y === targetY);
        if (item) {
            if (item.isTelescope) {
                this.openTelescope();
                return;
            } else if (item.isBrazier) {
                window.puzzleManager.interactBrazier(item.color, (msg) => {
                    window.dialogSystem.show("Altar de Fuego Espectral", msg, null);
                });
            } else if (item.isCage) {
                if (!window.puzzleManager.isSolved) {
                    const leonelNpc = curMap.npcs.find(n => n.id === 'leonel');
                    if (leonelNpc) {
                        const dialogLines = typeof leonelNpc.dialogue === 'function' ? leonelNpc.dialogue() : leonelNpc.dialogue;
                        window.dialogSystem.show(leonelNpc.name, dialogLines, leonelNpc.sprite);
                    }
                }
            } else if (item.text) {
                window.dialogSystem.show("", item.text, null);
            }
        }
    }

    /* ============================================================
     * VISOR DEL TELESCOPIO (ASTRONOMÍA Y AURORA BOREAL)
     * ============================================================ */
    initTelescopeStars() {
        this.telescopeStars = [];
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(Math.random()) * 78;
            this.telescopeStars.push({
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                size: Math.random() < 0.25 ? 2 : 1,
                phase: Math.random() * Math.PI * 2,
                color: Math.random() < 0.3 ? '#93c5fd' : (Math.random() < 0.2 ? '#fde047' : '#ffffff')
            });
        }
    }

    openTelescope() {
        this.telescopeActive = true;
        if (window.retroAudio) {
            window.retroAudio.playRuneActive(1.25);
        }
    }

    closeTelescope() {
        this.telescopeActive = false;
        if (window.retroAudio) {
            window.retroAudio.playSelect();
        }
    }

    update() {
        const now = performance.now();

        window.dialogSystem.update(now);
        window.puzzleManager.update();

        if (this.questToastTimer > 0) {
            this.questToastTimer--;
            if (this.questToastTimer <= 0) this.questToast = null;
        }

        // Si el telescopio o los diálogos están activos, pausar controles de movimiento
        if (this.telescopeActive || window.dialogSystem.isOpen) return;

        if (this.menuOpen) {
            if (this.keys.up && !this.lastMenuMove) {
                this.menuCursor = (this.menuCursor - 1 + this.menuOptions.length) % this.menuOptions.length;
                this.lastMenuMove = true;
                if (window.retroAudio) window.retroAudio.playSelect();
            } else if (this.keys.down && !this.lastMenuMove) {
                this.menuCursor = (this.menuCursor + 1) % this.menuOptions.length;
                this.lastMenuMove = true;
                if (window.retroAudio) window.retroAudio.playSelect();
            } else if (!this.keys.up && !this.keys.down) {
                this.lastMenuMove = false;
            }
            return;
        }

        this.updatePlayerMovement();
    }

    updatePlayerMovement() {
        const curMap = window.mapManager.getCurrentMap();
        if (!curMap) return;

        // Si el jugador corre, Leonel corre a su misma velocidad idéntica
        const isRunning = this.player.isMoving && this.keys.run && window.gameQuestState.hasRunningShoes;
        const currentSpeed = isRunning ? this.player.runSpeed : this.player.walkSpeed;
        const comp = window.gameCompanion;

        if (this.player.isMoving) {
            this.player.moveProgress += currentSpeed;
            const ratio = Math.min(1.0, this.player.moveProgress / this.tileSize);

            // Interpolación matemática fluida del jugador
            this.player.pixelX = this.player.startX + (this.player.destPixelX - this.player.startX) * ratio;
            this.player.pixelY = this.player.startY + (this.player.destPixelY - this.player.startY) * ratio;

            // Animación de pasos (cambio de fotograma)
            this.player.animTimer++;
            if (this.player.animTimer >= 5) {
                this.player.animTimer = 0;
                this.player.animFrame = (this.player.animFrame + 1) % 3;
            }

            // Interpolación 100% SINCRONIZADA de Leonel (misma velocidad y progreso exacto)
            if (comp.active && comp.isMoving) {
                comp.pixelX = comp.startX + (comp.destPixelX - comp.startX) * ratio;
                comp.pixelY = comp.startY + (comp.destPixelY - comp.startY) * ratio;
                comp.animFrame = this.player.animFrame;
            }

            // Paso completado: asentar posiciones exactas en la cuadrícula
            if (this.player.moveProgress >= this.tileSize) {
                this.player.gridX = this.player.targetGridX;
                this.player.gridY = this.player.targetGridY;
                this.player.pixelX = this.player.gridX * this.tileSize;
                this.player.pixelY = this.player.gridY * this.tileSize;
                this.player.isMoving = false;
                this.player.moveProgress = 0;
                this.player.animFrame = 0;

                if (comp.active && comp.isMoving) {
                    comp.gridX = comp.targetGridX;
                    comp.gridY = comp.targetGridY;
                    comp.pixelX = comp.gridX * this.tileSize;
                    comp.pixelY = comp.gridY * this.tileSize;
                    comp.isMoving = false;
                    comp.animFrame = 0;
                }

                this.checkWarps();
            }
        } else {
            // Jugador en reposo: detectar pulsación para iniciar paso
            let newDir = null;
            if (this.keys.up) newDir = 'up';
            else if (this.keys.down) newDir = 'down';
            else if (this.keys.left) newDir = 'left';
            else if (this.keys.right) newDir = 'right';

            if (newDir) {
                const wasSameDir = (this.player.dir === newDir);
                this.player.dir = newDir;

                let nextX = this.player.gridX;
                let nextY = this.player.gridY;
                if (newDir === 'up') nextY--;
                else if (newDir === 'down') nextY++;
                else if (newDir === 'left') nextX--;
                else if (newDir === 'right') nextX++;

                if (this.canWalkTo(curMap, nextX, nextY)) {
                    // Fijar puntos de inicio y destino del jugador
                    this.player.startX = this.player.gridX * this.tileSize;
                    this.player.startY = this.player.gridY * this.tileSize;
                    this.player.targetGridX = nextX;
                    this.player.targetGridY = nextY;
                    this.player.destPixelX = nextX * this.tileSize;
                    this.player.destPixelY = nextY * this.tileSize;
                    this.player.isMoving = true;
                    this.player.moveProgress = 0;

                    // Fijar puntos de inicio y destino de Leonel (hacia la casilla que deja libre el jugador)
                    if (comp.active) {
                        const targetX = this.player.gridX;
                        const targetY = this.player.gridY;

                        if (comp.gridX !== targetX || comp.gridY !== targetY) {
                            comp.startX = comp.gridX * this.tileSize;
                            comp.startY = comp.gridY * this.tileSize;
                            comp.targetGridX = targetX;
                            comp.targetGridY = targetY;
                            comp.destPixelX = targetX * this.tileSize;
                            comp.destPixelY = targetY * this.tileSize;
                            comp.isMoving = true;

                            if (targetY < comp.gridY) comp.dir = 'up';
                            else if (targetY > comp.gridY) comp.dir = 'down';
                            else if (targetX < comp.gridX) comp.dir = 'left';
                            else if (targetX > comp.gridX) comp.dir = 'right';
                        } else {
                            comp.isMoving = false;
                            comp.dir = this.player.dir;
                        }
                    }
                } else if (wasSameDir) {
                    if (window.retroAudio && (!this.lastBump || performance.now() - this.lastBump > 250)) {
                        this.lastBump = performance.now();
                        window.retroAudio.playBump();
                    }
                }
            } else {
                this.player.animFrame = 0;
                if (comp.active) comp.animFrame = 0;
            }
        }
    }

    canWalkTo(map, gx, gy) {
        if (gx < 0 || gx >= map.width || gy < 0 || gy >= map.height) return false;

        if (map.solid && map.solid[gy] && map.solid[gy][gx]) {
            if (map.id === 'lab' && window.puzzleManager.isSolved) {
                if (gy === 5 && (gx === 8 || gx === 9 || gx === 10)) return true;
                if (gy === 4 && (gx === 8 || gx === 10)) return true;
            }
            return false;
        }

        // Comprobar NPCs en esa casilla
        const npcOnTile = map.npcs.find(n => {
            if (n.id === 'leonel_lobby' && (window.gameCompanion.active || !window.puzzleManager.isSolved)) {
                return false;
            }
            return n.x === gx && n.y === gy;
        });
        if (npcOnTile) return false;

        return true;
    }

    checkWarps() {
        const curMap = window.mapManager.getCurrentMap();
        if (!curMap || !curMap.warps) return;

        const warp = curMap.warps.find(w => w.x === this.player.gridX && w.y === this.player.gridY);
        if (warp) {
            const res = window.mapManager.switchMap(warp.targetMap, warp.targetX, warp.targetY);
            if (res) {
                this.player.gridX = res.x;
                this.player.gridY = res.y;
                this.player.pixelX = res.x * this.tileSize;
                this.player.pixelY = res.y * this.tileSize;
                this.player.isMoving = false;
                this.player.moveProgress = 0;

                // Si Leonel acompaña, reposicionarlo detrás del jugador en el nuevo mapa
                if (window.gameCompanion.active) {
                    let backX = res.x;
                    let backY = res.y;
                    if (this.player.dir === 'down') backY--;
                    else if (this.player.dir === 'up') backY++;
                    else if (this.player.dir === 'left') backX++;
                    else if (this.player.dir === 'right') backX--;

                    const targetMapObj = window.mapManager.getCurrentMap();
                    if (this.canWalkTo(targetMapObj, backX, backY)) {
                        window.gameCompanion.gridX = backX;
                        window.gameCompanion.gridY = backY;
                    } else {
                        window.gameCompanion.gridX = res.x;
                        window.gameCompanion.gridY = res.y;
                    }
                    window.gameCompanion.pixelX = window.gameCompanion.gridX * this.tileSize;
                    window.gameCompanion.pixelY = window.gameCompanion.gridY * this.tileSize;
                    window.gameCompanion.startX = window.gameCompanion.pixelX;
                    window.gameCompanion.startY = window.gameCompanion.pixelY;
                    window.gameCompanion.targetGridX = window.gameCompanion.gridX;
                    window.gameCompanion.targetGridY = window.gameCompanion.gridY;
                    window.gameCompanion.destPixelX = window.gameCompanion.pixelX;
                    window.gameCompanion.destPixelY = window.gameCompanion.pixelY;
                    window.gameCompanion.dir = this.player.dir;
                    window.gameCompanion.isMoving = false;
                }

                if (window.retroAudio) {
                    window.retroAudio.playSelect();
                }
            }
        }
    }

    /* ============================================================
     * RENDERIZADO DEL JUEGO ESTILO POKÉMON GBA
     * ============================================================ */
    render() {
        const ctx = this.ctx;
        const curMap = window.mapManager.getCurrentMap();
        if (!curMap) return;

        ctx.fillStyle = '#080c18';
        ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

        const mapPixelWidth = curMap.width * this.tileSize;
        const mapPixelHeight = curMap.height * this.tileSize;

        let camX = this.player.pixelX + (this.tileSize / 2) - (this.viewWidth / 2);
        let camY = this.player.pixelY + (this.tileSize / 2) - (this.viewHeight / 2);

        if (mapPixelWidth > this.viewWidth) {
            camX = Math.max(0, Math.min(camX, mapPixelWidth - this.viewWidth));
        } else {
            camX = -(this.viewWidth - mapPixelWidth) / 2;
        }

        if (mapPixelHeight > this.viewHeight) {
            camY = Math.max(0, Math.min(camY, mapPixelHeight - this.viewHeight));
        } else {
            camY = -(this.viewHeight - mapPixelHeight) / 2;
        }

        camX = Math.floor(camX);
        camY = Math.floor(camY);

        ctx.save();
        ctx.translate(-camX, -camY);

        // Renderizado de Tiles del Mapa
        for (let y = 0; y < curMap.height; y++) {
            for (let x = 0; x < curMap.width; x++) {
                const tileKey = curMap.tiles[y][x];
                const px = x * this.tileSize;
                const py = y * this.tileSize;
                window.spriteManager.drawTile(ctx, tileKey, px, py);
            }
        }

        // Renderizado de Braseros en el Laboratorio
        if (curMap.id === 'lab') {
            const pm = window.puzzleManager;
            const braziers = [
                { color: 'blue', x: 4, y: 4 },
                { color: 'green', x: 14, y: 4 },
                { color: 'purple', x: 4, y: 10 },
                { color: 'red', x: 14, y: 10 }
            ];
            braziers.forEach(b => {
                const isLit = pm.braziers[b.color].lit;
                const tileName = isLit ? `brazier_${b.color}` : 'brazier_off';
                window.spriteManager.drawTile(ctx, tileName, b.x * this.tileSize, b.y * this.tileSize);

                if (isLit) {
                    const glowColors = {
                        blue: 'rgba(99, 179, 237, ',
                        green: 'rgba(104, 211, 145, ',
                        purple: 'rgba(183, 148, 244, ',
                        red: 'rgba(252, 129, 129, '
                    };
                    const pulse = 0.18 + Math.sin(performance.now() * 0.008 + b.x) * 0.08;
                    ctx.save();
                    ctx.fillStyle = (glowColors[b.color] || 'rgba(255,255,255,') + pulse + ')';
                    ctx.beginPath();
                    ctx.arc((b.x + 0.5) * this.tileSize, (b.y + 0.3) * this.tileSize, 10, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });

            if (pm.cageAlpha > 0) {
                ctx.save();
                ctx.globalAlpha = pm.cageAlpha;
                const cageImg = window.spriteManager.tiles['cage_barrier'];
                if (cageImg) {
                    ctx.drawImage(cageImg, 8 * this.tileSize, 4 * this.tileSize);
                }
                const sparkAlpha = (Math.sin(performance.now() * 0.012) + 1) * 0.15;
                ctx.fillStyle = `rgba(129, 230, 217, ${sparkAlpha})`;
                ctx.fillRect(8 * this.tileSize + 4, 4 * this.tileSize + 4, 40, 24);
                ctx.restore();
            }
        }

        const nowTime = performance.now();
        const globalBob = Math.sin(nowTime * 0.005) * 1.5;

        // Renderizado de NPCs
        curMap.npcs.forEach((npc, idx) => {
            // Ocultar a Leonel estático si ya está como acompañante activo o no fue rescatado
            if (npc.id === 'leonel_lobby' && (window.gameCompanion.active || !window.puzzleManager.isSolved)) {
                return;
            }
            const npx = npc.x * this.tileSize;
            const npcBob = Math.sin(nowTime * 0.005 + (idx * 1.5)) * 1.2;
            const npy = npc.y * this.tileSize + npcBob;
            window.spriteManager.drawCharacter(ctx, npc.sprite, npc.dir, 0, npx, npy);
        });

        // Renderizado del Acompañante Leonel (si está activo)
        const comp = window.gameCompanion;
        if (comp.active) {
            const compBob = comp.isMoving ? 0 : Math.sin(nowTime * 0.005 + 1) * 1.3;
            window.spriteManager.drawCharacter(
                ctx,
                'leonel',
                comp.dir,
                comp.animFrame,
                comp.pixelX,
                comp.pixelY + compBob
            );
        }

        // Renderizado del Jugador Fantasma
        const playerBob = this.player.isMoving ? 0 : globalBob;
        window.spriteManager.drawCharacter(
            ctx,
            'player',
            this.player.dir,
            this.player.animFrame,
            this.player.pixelX,
            this.player.pixelY + playerBob
        );

        ctx.restore();

        // HUD de Misión y Acompañante
        this.renderQuestHUD(ctx);

        // Menú Pokémon
        if (this.menuOpen) {
            this.renderStartMenu(ctx);
        }

        // Notificación flotante de Misión
        if (this.questToast) {
            this.renderToast(ctx);
        }

        // Diálogos
        window.dialogSystem.render(ctx, this.viewWidth, this.viewHeight);

        // Visor astronómico del telescopio (Aurora Boreal y Cielo Estrellado)
        if (this.telescopeActive) {
            this.renderTelescopeView(ctx);
        }
    }

    /* ============================================================
     * RENDERIZADO DEL VISOR CIRCULAR DEL TELESCOPIO (AURORA BOREAL)
     * ============================================================ */
    renderTelescopeView(ctx) {
        const now = performance.now();
        const cx = this.viewWidth / 2;
        const cy = this.viewHeight / 2 - 10;
        const R = 80;

        // Fondo oscuro que cubre toda la pantalla del juego
        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 23, 0.94)';
        ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

        // Recorte circular del visor del telescopio
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.clip();

        // 1. Cielo espacial nocturno profundo
        const skyGrad = ctx.createLinearGradient(cx, cy - R, cx, cy + R);
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(0.35, '#0f172a');
        skyGrad.addColorStop(0.75, '#1e1b4b');
        skyGrad.addColorStop(1, '#2e1065');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

        // 2. Campo de estrellas titilantes
        if (this.telescopeStars) {
            this.telescopeStars.forEach(star => {
                const twinkle = 0.35 + Math.sin(now * 0.0035 + star.phase) * 0.65;
                ctx.fillStyle = star.color;
                ctx.globalAlpha = Math.max(0.2, twinkle);
                ctx.fillRect(cx + star.x, cy + star.y, star.size, star.size);
                if (star.size > 1 && twinkle > 0.8) {
                    ctx.fillRect(cx + star.x - 1, cy + star.y, 3, 1);
                    ctx.fillRect(cx + star.x, cy + star.y - 1, 1, 3);
                }
            });
        }
        ctx.globalAlpha = 1.0;

        // 3. Luna creciente etérea en la esquina superior derecha
        const moonX = cx + 46;
        const moonY = cy - 36;
        const moonGlow = ctx.createRadialGradient(moonX, moonY, 3, moonX, moonY, 18);
        moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
        moonGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(moonX - 3.5, moonY - 2.5, 7.5, 0, Math.PI * 2);
        ctx.fill();

        // 4. AURORA BOREAL ANIMADA (Violácea a Turquesa)
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const auroraTime = now * 0.0012;

        // Capa 1: Aurora Violácea / Púrpura profunda
        ctx.fillStyle = 'rgba(168, 85, 247, 0.38)';
        ctx.beginPath();
        ctx.moveTo(cx - R, cy + 25);
        for (let x = -R; x <= R; x += 4) {
            const waveY = Math.sin(auroraTime + x * 0.04) * 14 + Math.cos(auroraTime * 0.7 + x * 0.02) * 8 - 12;
            ctx.lineTo(cx + x, cy + waveY);
        }
        ctx.lineTo(cx + R, cy + 35);
        ctx.closePath();
        ctx.fill();

        // Capa 2: Aurora Turquesa / Cian resplandeciente
        ctx.fillStyle = 'rgba(20, 184, 166, 0.45)';
        ctx.beginPath();
        ctx.moveTo(cx - R, cy + 15);
        for (let x = -R; x <= R; x += 4) {
            const waveY = Math.sin(auroraTime * 1.3 + x * 0.035 + 1.2) * 16 + Math.sin(auroraTime * 0.9 + x * 0.02) * 6 - 20;
            ctx.lineTo(cx + x, cy + waveY);
        }
        ctx.lineTo(cx + R, cy + 25);
        ctx.closePath();
        ctx.fill();

        // Capa 3: Rayos verticales de luz etérea verde menta / cian
        ctx.fillStyle = 'rgba(94, 234, 212, 0.3)';
        for (let x = -R + 10; x < R - 10; x += 12) {
            const rayHeight = 26 + Math.sin(auroraTime * 2 + x * 0.08) * 14;
            const rayBaseY = Math.sin(auroraTime + x * 0.035) * 12 - 16;
            ctx.fillRect(cx + x, cy + rayBaseY - rayHeight, 4, rayHeight);
        }
        ctx.restore();

        // Reflejo diagonal de cristal en la lente
        const lensGlare = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
        lensGlare.addColorStop(0.3, 'rgba(255, 255, 255, 0.07)');
        lensGlare.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = lensGlare;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

        // Retícula central sutil de astrónomo
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 25, 0, Math.PI * 2);
        ctx.moveTo(cx - 35, cy); ctx.lineTo(cx - 15, cy);
        ctx.moveTo(cx + 15, cy); ctx.lineTo(cx + 35, cy);
        ctx.moveTo(cx, cy - 35); ctx.lineTo(cx, cy - 15);
        ctx.moveTo(cx, cy + 15); ctx.lineTo(cx, cy + 35);
        ctx.stroke();

        ctx.restore(); // Fin del clip circular

        // 5. Marco circular de bronce del ocular del telescopio
        ctx.save();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, R + 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx, cy, R + 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, R + 7, 0, Math.PI * 2);
        ctx.stroke();

        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            const rx = cx + Math.cos(a) * (R + 5);
            const ry = cy + Math.sin(a) * (R + 5);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(rx - 1.5, ry - 1.5, 3, 3);
            ctx.fillStyle = '#451a03';
            ctx.fillRect(rx - 0.5, ry - 0.5, 1, 1);
        }
        ctx.restore();

        // 6. Texto informativo inferior
        ctx.save();
        ctx.fillStyle = '#2dd4bf';
        ctx.font = '7px "Press Start 2P", monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("✦ AURORA BOREAL ESPECTRAL ✦", cx, this.viewHeight - 24);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '7px monospace, sans-serif';
        ctx.fillText("Presiona [A], [B], [Espacio] o [ESC] para salir", cx, this.viewHeight - 12);
        ctx.restore();

        ctx.restore();
    }

    renderQuestHUD(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(6, 6, 175, 16);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(6.5, 6.5, 174, 15);

        ctx.font = '7px "Press Start 2P", monospace, sans-serif';
        const isDone = window.gameQuestState.mission1Completed;
        ctx.fillStyle = isDone ? '#4ade80' : '#facc15';
        ctx.fillText(isDone ? "M1: OK (Leonel Libre)" : "M1: Rescata a Leonel", 10, 17);

        // Insignia del acompañante si está activo
        if (window.gameCompanion.active) {
            ctx.fillStyle = 'rgba(13, 148, 136, 0.85)';
            ctx.fillRect(186, 6, 126, 16);
            ctx.strokeStyle = '#2dd4bf';
            ctx.strokeRect(186.5, 6.5, 125, 15);

            ctx.fillStyle = '#ccfbf1';
            ctx.fillText("Compañero: Leonel", 190, 17);
        }

        ctx.restore();
    }

    renderToast(ctx) {
        ctx.save();
        const toastW = 240;
        const toastH = 24;
        const tx = (this.viewWidth - toastW) / 2;
        const ty = 28;

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(tx, ty, toastW, toastH);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx + 0.5, ty + 0.5, toastW - 1, toastH - 1);

        ctx.font = 'bold 7px monospace, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(this.questToast, tx + (toastW / 2), ty + 15);
        ctx.restore();
    }

    renderStartMenu(ctx) {
        const mw = 84;
        const mh = this.menuOptions.length * 15 + 12;
        const mx = this.viewWidth - mw - 8;
        const my = 8;

        ctx.save();
        ctx.fillStyle = 'rgba(10, 15, 30, 0.5)';
        ctx.fillRect(mx + 2, my + 2, mw, mh);

        ctx.fillStyle = '#f8f8f0';
        ctx.fillRect(mx, my, mw, mh);
        ctx.strokeStyle = '#2b3a4a';
        ctx.lineWidth = 2;
        ctx.strokeRect(mx + 1, my + 1, mw - 2, mh - 2);

        ctx.font = '7px "Press Start 2P", monospace, sans-serif';
        this.menuOptions.forEach((opt, idx) => {
            const oy = my + 14 + (idx * 15);
            const isSelected = (idx === this.menuCursor);

            if (isSelected) {
                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.moveTo(mx + 5, oy - 6);
                ctx.lineTo(mx + 9, oy - 3);
                ctx.lineTo(mx + 5, oy);
                ctx.fill();

                ctx.fillStyle = '#c0392b';
            } else {
                ctx.fillStyle = '#2c3e50';
            }

            ctx.fillText(opt.label, mx + 13, oy);
        });

        if (this.modalSubmenu) {
            this.renderSubmenuModal(ctx);
        }

        ctx.restore();
    }

    renderSubmenuModal(ctx) {
        const boxW = 260;
        const boxH = 170;
        const bx = (this.viewWidth - boxW) / 2;
        const by = (this.viewHeight - boxH) / 2;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

        ctx.fillStyle = '#f8f8f0';
        ctx.fillRect(bx, by, boxW, boxH);
        ctx.strokeStyle = '#2b3a4a';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 1, by + 1, boxW - 2, boxH - 2);

        ctx.font = 'bold 8px monospace, sans-serif';
        ctx.textAlign = 'left';

        if (this.modalSubmenu === 'quests') {
            ctx.fillStyle = '#1e3a8a';
            ctx.fillText("=== REGISTRO DE MISIONES ===", bx + 12, by + 18);

            const m1Status = window.gameQuestState.mission1Completed ? "[COMPLETADA]" : "[EN CURSO]";
            ctx.fillStyle = window.gameQuestState.mission1Completed ? '#15803d' : '#b45309';
            ctx.fillText(`Misión 1: Rescate de Leonel ${m1Status}`, bx + 12, by + 38);
            ctx.fillStyle = '#334155';
            ctx.font = '7px monospace';
            ctx.fillText("• Objetivo: Resolver el enigma de los 4 fuegos.", bx + 12, by + 49);
            ctx.fillText("  Leonel te otorga las Zapatillas Fantasma.", bx + 12, by + 59);

            ctx.font = 'bold 8px monospace';
            ctx.fillStyle = '#64748b';
            ctx.fillText("Misión 2: El Poltergeist del Gimnasio", bx + 12, by + 78);
            ctx.fillStyle = '#475569';
            ctx.font = '7px monospace';
            ctx.fillText("• Estado: ★ PRÓXIMO DESARROLLO ★", bx + 12, by + 89);
            ctx.fillText("  Cancha embrujada cerrada por obras de Don Ecto.", bx + 12, by + 99);

            ctx.font = 'bold 8px monospace';
            ctx.fillStyle = '#64748b';
            ctx.fillText("Misión 3: El Secreto del Rector", bx + 12, by + 118);
            ctx.fillStyle = '#475569';
            ctx.font = '7px monospace';
            ctx.fillText("• Estado: ★ PRÓXIMO DESARROLLO ★", bx + 12, by + 129);
            ctx.fillText("  Sello dorado custodiado por el Prefecto.", bx + 12, by + 139);

            ctx.fillStyle = '#991b1b';
            ctx.fillText("[Presiona 'A' o 'Espacio' para volver]", bx + 12, by + 158);
        } else if (this.modalSubmenu === 'companion') {
            ctx.fillStyle = '#1e3a8a';
            ctx.fillText("=== ACOMPAÑANTE: LEONEL ===", bx + 12, by + 18);

            const comp = window.gameCompanion;
            const rescued = window.puzzleManager.isSolved;

            ctx.font = '7px monospace';
            ctx.fillStyle = '#1e293b';

            if (!rescued) {
                ctx.fillStyle = '#b45309';
                ctx.fillText("• Leonel se encuentra atrapado en el sótano.", bx + 12, by + 40);
                ctx.fillText("  Resuelve el puzzle de los braseros para liberarlo.", bx + 12, by + 55);
            } else {
                ctx.fillStyle = '#15803d';
                ctx.fillText("• ¡Leonel ha sido rescatado del laboratorio!", bx + 12, by + 40);

                if (comp.active) {
                    ctx.fillStyle = '#0369a1';
                    ctx.fillText("• Estado: SIGUIÉNDOTE por el mapa [ACTIVO]", bx + 12, by + 60);
                    ctx.fillStyle = '#334155';
                    ctx.fillText("  Leonel te sigue y comparte comentarios sobre", bx + 12, by + 75);
                    ctx.fillText("  cada sala que visitan (Aulas, Pisos y Terraza).", bx + 12, by + 88);
                } else {
                    ctx.fillStyle = '#64748b';
                    ctx.fillText("• Estado: ESPERANDO en el vestíbulo [INACTIVO]", bx + 12, by + 60);
                    ctx.fillStyle = '#334155';
                    ctx.fillText("  Habla con él en el vestíbulo para pedirle", bx + 12, by + 75);
                    ctx.fillText("  que te acompañe de nuevo.", bx + 12, by + 88);
                }
            }

            ctx.fillStyle = '#991b1b';
            ctx.fillText("[Presiona 'A' o 'Espacio' para volver]", bx + 12, by + 155);
        } else if (this.modalSubmenu === 'inventory') {
            ctx.fillStyle = '#1e3a8a';
            ctx.fillText("=== MOCHILA DE OBJETOS ===", bx + 12, by + 18);

            ctx.font = '7px monospace';
            ctx.fillStyle = '#1e293b';
            ctx.fillText("• Carnet de la Academia Espectral (Nivel 1)", bx + 12, by + 40);
            ctx.fillText("• Manual del Estudiante Fantasma", bx + 12, by + 58);

            if (window.gameQuestState.hasRunningShoes) {
                ctx.fillStyle = '#15803d';
                ctx.fillText("• [ACTIVO] Zapatillas Fantasma (Mantén Shift para correr)", bx + 12, by + 78);
            } else {
                ctx.fillStyle = '#94a3b8';
                ctx.fillText("• [BLOQUEADO] Zapatillas Fantasma (Recompensa de Leonel)", bx + 12, by + 78);
            }

            ctx.fillStyle = '#991b1b';
            ctx.fillText("[Presiona 'A' o 'Espacio' para volver]", bx + 12, by + 155);
        } else if (this.modalSubmenu === 'ghosts') {
            ctx.fillStyle = '#1e3a8a';
            ctx.fillText("=== GUÍA DE FANTASMAS ===", bx + 12, by + 18);
            ctx.font = '7px monospace';
            ctx.fillStyle = '#1e293b';
            ctx.fillText("• Leonel: Tu mejor amigo, travieso y fiel compañero.", bx + 12, by + 38);
            ctx.fillText("• Wendy: Compañera servicial que cuida el vestíbulo.", bx + 12, by + 54);
            ctx.fillText("• Prof. Ectoplasma: Sabio maestro de encantamientos.", bx + 12, by + 70);
            ctx.fillText("• Don Ecto: Conserje veterano guardián del gimnasio.", bx + 12, by + 86);
            ctx.fillText("• Stella: Astrónoma espectral que habita la Terraza en L.", bx + 12, by + 102);

            ctx.fillStyle = '#991b1b';
            ctx.fillText("[Presiona 'A' o 'Espacio' para volver]", bx + 12, by + 155);
        }
    }

    start() {
        const loop = () => {
            this.update();
            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

window.GameEngine = GameEngine;

window.addEventListener('DOMContentLoaded', () => {
    window.gameEngine = new GameEngine();
    window.gameEngine.start();
});
