// Sound Service using Web Audio API
// Synthesizes sounds on the fly to avoid asset loading issues and keep app light.

let audioContext: AudioContext | null = null;

const getContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

export const playSound = (type: 'click' | 'toggle_on' | 'toggle_off' | 'success' | 'error' | 'level_up' | 'pop') => {
    try {
        const ctx = getContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (type) {
            case 'click':
                // High pitch short tick
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;

            case 'pop':
                // Bubbly pop
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'toggle_on':
                // Rising pitch
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.linearRampToValueAtTime(600, now + 0.1);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'toggle_off':
                // Falling pitch
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.linearRampToValueAtTime(400, now + 0.1);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'success':
                // Major triad (C-E-G ish)
                playNote(ctx, 523.25, now, 0.1, 0.1); // C5
                playNote(ctx, 659.25, now + 0.1, 0.1, 0.1); // E5
                playNote(ctx, 783.99, now + 0.2, 0.3, 0.2); // G5
                break;

            case 'error':
                // Low buzz
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;

            case 'level_up':
                // Magicalarp
                const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
                notes.forEach((freq, i) => {
                    playNote(ctx, freq, now + (i * 0.08), 0.4, 0.15, 'sine');
                });
                // Add bass
                playNote(ctx, 261.63, now, 1.5, 0.3, 'triangle');
                break;
        }

    } catch (e) {
        console.error("Audio error", e);
    }
};

const playNote = (ctx: AudioContext, freq: number, time: number, duration: number, vol: number, type: OscillatorType = 'sine') => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.start(time);
    osc.stop(time + duration);
};
