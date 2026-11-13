/**
 * Sistema de Diálogos Estilo Pokémon GBA (FireRed / Emerald)
 * - Paginación estricta de máximo 2 LÍNEAS por página (soluciona el desborde fuera del cuadro)
 * - Efecto máquina de escribir con pitido retro por letra
 * - Triángulo rojo parpadeante de continuación
 * - Recorte seguro (clipping) para garantizar que ningún texto salga de la caja
 * - Avatares de personajes y placa de nombre estilizada
 */

class DialogSystem {
    constructor() {
        this.isOpen = false;
        this.pages = [];
        this.currentPageIndex = 0;
        this.currentText = '';
        this.targetText = '';
        this.charIndex = 0;
        this.typingSpeed = 20; // ms por letra
        this.lastCharTime = 0;
        this.isTyping = false;
        this.speakerName = '';
        this.speakerAvatar = null;
        this.onFinishCallback = null;
        this.arrowTimer = 0;
    }

    /**
     * Divide un texto largo o lista de textos en páginas de máximo 2 líneas
     */
    paginateText(rawInput, maxLineWidth = 220) {
        // Medidor de texto auxiliar
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = '8px "Press Start 2P", monospace, sans-serif';

        const rawList = Array.isArray(rawInput) ? rawInput : [rawInput];
        const formattedPages = [];

        rawList.forEach(rawText => {
            if (!rawText) return;
            const words = rawText.split(' ');
            const lines = [];
            let currentLine = '';

            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const metrics = ctx.measureText(testLine);

                // Si excede el ancho máximo de línea
                if (metrics.width > maxLineWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) {
                lines.push(currentLine);
            }

            // Agrupar en páginas de MÁXIMO 2 LÍNEAS (estilo Pokémon oficial)
            for (let j = 0; j < lines.length; j += 2) {
                if (j + 1 < lines.length) {
                    formattedPages.push(`${lines[j]}\n${lines[j + 1]}`);
                } else {
                    formattedPages.push(lines[j]);
                }
            }
        });

        return formattedPages.length > 0 ? formattedPages : ['...'];
    }

    /**
     * Inicia una secuencia de diálogo
     */
    show(speaker, text, avatarKey = null, onFinish = null) {
        this.isOpen = true;
        this.speakerName = speaker || '';
        this.speakerAvatar = avatarKey;
        // Paginación segura calculando el ancho disponible
        const availableWidth = avatarKey ? 200 : 240;
        this.pages = this.paginateText(text, availableWidth);
        this.currentPageIndex = 0;
        this.onFinishCallback = onFinish;
        this.startPage();
    }

    startPage() {
        this.targetText = this.pages[this.currentPageIndex] || '';
        this.currentText = '';
        this.charIndex = 0;
        this.isTyping = true;
        this.lastCharTime = performance.now();
    }

    update(now) {
        if (!this.isOpen) return;
        this.arrowTimer = (this.arrowTimer + 0.08) % (Math.PI * 2);

        if (this.isTyping) {
            if (now - this.lastCharTime >= this.typingSpeed) {
                this.lastCharTime = now;
                if (this.charIndex < this.targetText.length) {
                    const nextChar = this.targetText[this.charIndex];
                    this.currentText += nextChar;
                    this.charIndex++;
                    // Reproducir bleep si no es espacio ni salto de línea
                    if (nextChar !== ' ' && nextChar !== '\n' && window.retroAudio) {
                        window.retroAudio.playTextBeep();
                    }
                } else {
                    this.isTyping = false;
                }
            }
        }
    }

    /**
     * Maneja la pulsación del botón de acción (Espacio, Enter, Z, botón A)
     */
    handleAction() {
        if (!this.isOpen) return false;

        if (this.isTyping) {
            // Autocompletar la página inmediatamente
            this.currentText = this.targetText;
            this.charIndex = this.targetText.length;
            this.isTyping = false;
            if (window.retroAudio) window.retroAudio.playSelect();
            return true;
        }

        // Si ya terminó de escribir, avanzar de página
        this.currentPageIndex++;
        if (this.currentPageIndex < this.pages.length) {
            if (window.retroAudio) window.retroAudio.playSelect();
            this.startPage();
            return true;
        }

        // Fin de los diálogos
        this.close();
        return true;
    }

    close() {
        this.isOpen = false;
        if (window.retroAudio) window.retroAudio.playSelect();
        if (typeof this.onFinishCallback === 'function') {
            const cb = this.onFinishCallback;
            this.onFinishCallback = null;
            cb();
        }
    }

    /**
     * Renderiza el cuadro de diálogo estilo Pokémon GBA en la parte inferior del canvas
     */
    render(ctx, viewWidth, viewHeight) {
        if (!this.isOpen) return;

        const pad = 8;
        const boxHeight = 52; // Altura holgada para 2 líneas de texto
        const boxWidth = viewWidth - (pad * 2);
        const boxX = pad;
        const boxY = viewHeight - boxHeight - pad;

        ctx.save();

        // 1. Sombra exterior suave
        ctx.fillStyle = 'rgba(10, 15, 30, 0.55)';
        ctx.fillRect(boxX + 2, boxY + 2, boxWidth, boxHeight);

        // 2. Fondo del cuadro estilo Pokémon FireRed (Blanco perlado)
        ctx.fillStyle = '#f8f8f2';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // 3. Bordes dobles estilo Game Boy Advance Pokémon
        ctx.strokeStyle = '#2b3a4a'; // Marco exterior azul marino
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX + 1, boxY + 1, boxWidth - 2, boxHeight - 2);

        ctx.strokeStyle = '#c0392b'; // Marco decorativo interior rojo vino
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX + 3, boxY + 3, boxWidth - 6, boxHeight - 6);

        // 4. Placa de nombre del hablante (si tiene)
        let textStartX = boxX + 12;
        if (this.speakerName) {
            const nameWidth = Math.max(65, this.speakerName.length * 6.8 + 18);
            ctx.fillStyle = '#2b3a4a';
            ctx.fillRect(boxX + 8, boxY - 11, nameWidth, 12);
            ctx.fillStyle = '#f39c12'; // Ribete dorado
            ctx.strokeRect(boxX + 8.5, boxY - 10.5, nameWidth - 1, 11);

            ctx.font = 'bold 8px monospace, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.speakerName, boxX + 14, boxY - 5);
        }

        // 5. Avatar del hablante (a la izquierda)
        if (this.speakerAvatar && window.spriteManager && window.spriteManager.sprites[this.speakerAvatar]) {
            const avatarBoxX = boxX + 8;
            const avatarBoxY = boxY + 8;
            
            // Fondo circular / marco del avatar
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(avatarBoxX, avatarBoxY, 28, 28);
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1;
            ctx.strokeRect(avatarBoxX + 0.5, avatarBoxY + 0.5, 27, 27);

            // Dibujar fantasma estático mirando al frente
            window.spriteManager.drawCharacter(ctx, this.speakerAvatar, 'down', 0, avatarBoxX + 6, avatarBoxY + 8);

            textStartX = avatarBoxX + 36;
        }

        // 6. Texto del diálogo (MÁXIMO 2 LÍNEAS - protegido con CLIP)
        ctx.save();
        ctx.beginPath();
        ctx.rect(boxX + 4, boxY + 4, boxWidth - 8, boxHeight - 8);
        ctx.clip(); // Impide que cualquier texto salga del cuadro

        ctx.font = '8px "Press Start 2P", monospace, sans-serif';
        ctx.textBaseline = 'top';
        const lineHeight = 14;

        // Separar las líneas (máximo 2 por página)
        const displayLines = this.currentText.split('\n');

        displayLines.forEach((lineText, lineIdx) => {
            if (lineIdx >= 2) return; // Protección estricta: nunca más de 2 líneas
            const lineY = boxY + 12 + (lineIdx * lineHeight);

            // Sombra del texto
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(lineText, textStartX + 1, lineY + 1);

            // Color frontal del texto
            ctx.fillStyle = '#1e293b';
            ctx.fillText(lineText, textStartX, lineY);
        });

        ctx.restore();

        // 7. Flecha roja indicadora de Pokémon cuando termina de escribir la página
        if (!this.isTyping) {
            const bounce = Math.sin(this.arrowTimer * 3.5) * 2;
            const arrowX = boxX + boxWidth - 16;
            const arrowY = boxY + boxHeight - 14 + bounce;

            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX + 8, arrowY);
            ctx.lineTo(arrowX + 4, arrowY + 6);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#7f1d1d';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore();
    }
}

window.dialogSystem = new DialogSystem();
