// Voice Input Service
// Web Speech API for voice commands and meal logging

// Check browser support
export const isVoiceSupported = (): boolean => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

// Create speech recognition instance
const createRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU'; // Russian by default
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    return recognition;
};

// Voice recording state
interface VoiceState {
    isListening: boolean;
    transcript: string;
    error: string | null;
}

type VoiceCallback = (state: VoiceState) => void;

// Start listening for voice input
export const startListening = (
    onUpdate: VoiceCallback,
    onFinal: (transcript: string) => void,
    language: 'ru' | 'en' = 'ru'
): (() => void) | null => {
    const recognition = createRecognition();
    if (!recognition) {
        onUpdate({ isListening: false, transcript: '', error: 'Speech recognition not supported' });
        return null;
    }

    recognition.lang = language === 'ru' ? 'ru-RU' : 'en-US';

    recognition.onstart = () => {
        onUpdate({ isListening: true, transcript: '', error: null });
    };

    recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;

        onUpdate({ isListening: true, transcript, error: null });

        if (result.isFinal) {
            onFinal(transcript);
        }
    };

    recognition.onerror = (event: any) => {
        onUpdate({ isListening: false, transcript: '', error: event.error });
    };

    recognition.onend = () => {
        onUpdate({ isListening: false, transcript: '', error: null });
    };

    recognition.start();

    // Return stop function
    return () => {
        recognition.stop();
    };
};

// Parse meal from voice input
export const parseMealFromVoice = (transcript: string): {
    name: string;
    type?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
} | null => {
    const lower = transcript.toLowerCase();

    // Detect meal type from Russian keywords
    let type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | undefined;

    if (lower.includes('завтрак') || lower.includes('утр')) {
        type = 'Breakfast';
    } else if (lower.includes('обед') || lower.includes('ланч')) {
        type = 'Lunch';
    } else if (lower.includes('ужин') || lower.includes('вечер')) {
        type = 'Dinner';
    } else if (lower.includes('перекус') || lower.includes('снэк')) {
        type = 'Snack';
    }

    // Clean up transcript to get food name
    let name = transcript
        .replace(/залогируй|добавь|запиши|на завтрак|на обед|на ужин|перекус/gi, '')
        .trim();

    if (!name) return null;

    return { name, type };
};

// Voice commands for habits
export const parseHabitCommand = (transcript: string): {
    action: 'complete' | 'skip' | 'list';
    habitName?: string;
} | null => {
    const lower = transcript.toLowerCase();

    if (lower.includes('выполнил') || lower.includes('сделал') || lower.includes('готово')) {
        // Extract habit name after action word
        const match = lower.match(/(выполнил|сделал|готово)\s+(.+)/);
        if (match) {
            return { action: 'complete', habitName: match[2].trim() };
        }
        return { action: 'complete' };
    }

    if (lower.includes('пропустить') || lower.includes('пропуск')) {
        return { action: 'skip' };
    }

    if (lower.includes('какие привычки') || lower.includes('что осталось')) {
        return { action: 'list' };
    }

    return null;
};
