/**
 * Lógica del Puzzle de la Misión 1: "El Rescate de Leonel"
 * - Administra el estado de los 4 braseros espectrales (Azul, Verde, Púrpura, Rojo).
 * - Secuencia correcta: ['blue', 'green', 'purple', 'red'].
 * - Controla la disipación de la barrera mágica y el rescate de Leonel.
 */

class PuzzleManager {
    constructor() {
        // Secuencia requerida de braseros
        this.correctSequence = ['blue', 'green', 'purple', 'red'];
        this.currentStep = 0;
        this.braziers = {
            blue: { lit: false, name: 'Brasero de Zafiro (Azul)' },
            green: { lit: false, name: 'Brasero de Esmeralda (Verde)' },
            purple: { lit: false, name: 'Brasero de Amatista (Púrpura)' },
            red: { lit: false, name: 'Brasero de Rubí (Rojo)' }
        };
        this.isSolved = false;
        this.cageAlpha = 1.0;
        this.dissolvingCage = false;
    }

    /**
     * Se activa cuando el jugador interactúa con uno de los braseros
     * @param {string} color - 'blue' | 'green' | 'purple' | 'red'
     * @param {function} callback - Para mostrar diálogos de retroalimentación
     */
    interactBrazier(color, callback) {
        if (this.isSolved) {
            callback("El fuego espectral arde en perfecta armonía. La barrera ya ha sido disipada.");
            return;
        }

        const brazier = this.braziers[color];
        if (brazier.lit) {
            callback(`El ${brazier.name} ya está encendido.`);
            return;
        }

        // Comprobar si corresponde al paso actual
        const expectedColor = this.correctSequence[this.currentStep];

        if (color === expectedColor) {
            // ¡Correcto! Encender este brasero
            brazier.lit = true;
            this.currentStep++;

            if (window.retroAudio) {
                window.retroAudio.playRuneActive(1 + (this.currentStep * 0.15));
            }

            if (this.currentStep === this.correctSequence.length) {
                // ¡Puzzle Completado con Éxito!
                this.isSolved = true;
                this.dissolvingCage = true;

                if (window.retroAudio) {
                    setTimeout(() => window.retroAudio.playFanfare(), 300);
                }

                callback([
                    `¡Encendiste el ${brazier.name}!`,
                    "¡Las cuatro llamas mágicas resuenan al unísono!",
                    "¡CRACK! ¡El sello mágico de contención se ha desvanecido por completo!",
                    "¡Leonel es libre!"
                ]);
            } else {
                callback(`¡Encendiste el ${brazier.name}! La llama mágica arde con fuerza constante. (${this.currentStep}/4)`);
            }
        } else {
            // Error en la secuencia: apagar todos y resetear
            this.resetPuzzle();

            if (window.retroAudio) {
                window.retroAudio.playPuzzleError();
            }

            callback([
                `Intentaste encender el ${brazier.name}...`,
                "¡Zzzzt! Una corriente inestable sofoca el fuego.",
                "¡El orden de las llamas es incorrecto! Todos los braseros se han apagado.",
                "(Pista: Revisa las anotaciones en la pizarra del Aula y los libros de la Biblioteca)."
            ]);
        }
    }

    resetPuzzle() {
        this.currentStep = 0;
        for (const k in this.braziers) {
            this.braziers[k].lit = false;
        }
    }

    update() {
        if (this.dissolvingCage && this.cageAlpha > 0) {
            this.cageAlpha -= 0.02;
            if (this.cageAlpha <= 0) {
                this.cageAlpha = 0;
                this.dissolvingCage = false;
            }
        }
    }
}

window.puzzleManager = new PuzzleManager();

