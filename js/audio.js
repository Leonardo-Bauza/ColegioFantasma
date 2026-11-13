/**
 * Sistema de Audio Chiptune estilo GBA / Pokémon
 * Utiliza Web Audio API sin necesidad de archivos externos.
 */
class RetroAudio {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmPlaying = false;
        this.bgmTimer = null;
        this.masterVolume = 0.25;
        this.tempo = 115; // BPM
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBgm();
        } else {
            this.startBgm();
        }
        return this.isMuted;
    }

    // Sonido al escribir texto en la caja de diálogo (clásico "blip" de Pokémon)
    playTextBeep() {
        if (this.isMuted || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'square';
        // Variación sutil de tono para realismo GBA
        osc.frequency.setValueAtTime(420 + Math.random() * 40, now);

        gain.gain.setValueAtTime(this.masterVolume * 0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.045);
    }

    // Sonido al interactuar / seleccionar
    playSelect() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

        gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Sonido al chocar contra una pared (clásico "thud" de Pokémon)
    playBump() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.07);

        gain.gain.setValueAtTime(this.masterVolume * 0.35, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.075);
    }

    // Sonido al activar un brasero del puzzle
    playRuneActive(pitchMultiplier = 1) {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        
        // Acorde mágico
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq * pitchMultiplier, now + idx * 0.04);

            gain.gain.setValueAtTime(this.masterVolume * 0.2, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 0.32);
        });
    }

    // Sonido de error al equivocarse de orden en el puzzle
    playPuzzleError() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(130, now + 0.12);

        gain.gain.setValueAtTime(this.masterVolume * 0.25, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
    }

    // Fanfarria clásica de victoria GBA (¡Has resuelto el puzzle / completado la misión!)
    playFanfare() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [
            { note: 523.25, time: 0, dur: 0.12 },     // C5
            { note: 523.25, time: 0.12, dur: 0.12 },  // C5
            { note: 523.25, time: 0.24, dur: 0.12 },  // C5
            { note: 659.25, time: 0.36, dur: 0.25 },  // E5
            { note: 783.99, time: 0.61, dur: 0.18 },  // G5
            { note: 659.25, time: 0.79, dur: 0.18 },  // E5
            { note: 783.99, time: 0.97, dur: 0.18 },  // G5
            { note: 1046.50, time: 1.15, dur: 0.6 },  // C6 sostenida
        ];

        notes.forEach(({ note, time, dur }) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(note, now + time);

            gain.gain.setValueAtTime(this.masterVolume * 0.3, now + time);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.25, now + time + dur - 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + time);
            osc.stop(now + time + dur + 0.02);
        });
    }

    // Música de Fondo Estilo Misterio / Colegio Fantasmal GBA (BGM procedural con arpegios)
    startBgm() {
        if (this.isMuted || this.bgmPlaying || !this.ctx) return;
        this.bgmPlaying = true;
        this.playBgmLoop();
    }

    stopBgm() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    playBgmLoop() {
        if (!this.bgmPlaying || this.isMuted || !this.ctx) return;

        // Progresión de acordes nostálgica y espectral (Cm -> Ab -> Fm -> G)
        const chords = [
            [261.63, 311.13, 392.00, 523.25], // C minor
            [207.65, 261.63, 311.13, 415.30], // Ab major
            [174.61, 207.65, 261.63, 349.23], // F minor
            [196.00, 246.94, 293.66, 392.00]  // G major
        ];

        const stepTime = 0.22; // Duración por paso de arpegio
        let totalBarsTime = chords.length * 8 * stepTime;
        const now = this.ctx.currentTime;

        chords.forEach((chord, chordIdx) => {
            const chordStart = now + chordIdx * (8 * stepTime);

            // Arpegio de campanas de cristal / sintetizador
            for (let i = 0; i < 8; i++) {
                const noteTime = chordStart + i * stepTime;
                const noteFreq = chord[i % chord.length] * (i >= 4 ? 2 : 1);

                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(noteFreq, noteTime);

                gain.gain.setValueAtTime(this.masterVolume * 0.12, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + stepTime * 1.5);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(noteTime);
                osc.stop(noteTime + stepTime * 1.6);
            }

            // Bajo pulsante (square wave estilo GBA)
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = 'square';
            bassOsc.frequency.setValueAtTime(chord[0] / 2, chordStart);

            bassGain.gain.setValueAtTime(this.masterVolume * 0.08, chordStart);
            bassGain.gain.exponentialRampToValueAtTime(0.001, chordStart + (8 * stepTime) - 0.05);

            bassOsc.connect(bassGain);
            bassGain.connect(this.ctx.destination);

            bassOsc.start(chordStart);
            bassOsc.stop(chordStart + (8 * stepTime));
        });

        this.bgmTimer = setTimeout(() => {
            if (this.bgmPlaying) {
                this.playBgmLoop();
            }
        }, totalBarsTime * 1000 - 100);
    }
}

window.retroAudio = new RetroAudio();

