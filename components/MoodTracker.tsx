// MoodTracker - Quick mood selection widget
import React, { useState } from 'react';
import { Icons } from './Icons';
import { useLanguage } from '../locales/LanguageContext';

const GLASS_PANEL = 'bg-[#1C1C1E]/60 backdrop-blur-[30px] border border-white/10 rounded-[28px]';

interface MoodTrackerProps {
    currentMood: number | null;
    onMoodSelect: (mood: number) => void;
}

const MOODS = [
    { value: 1, emoji: '😞', label: 'Плохо', labelEn: 'Bad' },
    { value: 2, emoji: '😕', label: 'Так себе', labelEn: 'Meh' },
    { value: 3, emoji: '😐', label: 'Норм', labelEn: 'Okay' },
    { value: 4, emoji: '🙂', label: 'Хорошо', labelEn: 'Good' },
    { value: 5, emoji: '😄', label: 'Отлично!', labelEn: 'Great!' },
];

export const MoodTracker = ({ currentMood, onMoodSelect }: MoodTrackerProps) => {
    const { language } = useLanguage();
    const isRu = language === 'ru';
    const [showExpanded, setShowExpanded] = useState(false);

    const selectedMood = MOODS.find(m => m.value === currentMood);

    if (currentMood && !showExpanded) {
        // Compact view when mood is selected
        return (
            <button
                onClick={() => setShowExpanded(true)}
                className={`${GLASS_PANEL} p-4 flex items-center justify-between w-full`}
            >
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">{selectedMood?.emoji}</span>
                    <div>
                        <p className="text-sm font-medium text-white/70">
                            {isRu ? 'Настроение сегодня' : 'Today\'s mood'}
                        </p>
                        <p className="text-xs text-white/40">
                            {isRu ? selectedMood?.label : selectedMood?.labelEn}
                        </p>
                    </div>
                </div>
                <Icons.Edit size={16} className="text-white/30" />
            </button>
        );
    }

    // Expanded view for selection
    return (
        <div className={`${GLASS_PANEL} p-4`}>
            <p className="text-sm font-medium text-white/70 mb-3">
                {isRu ? 'Как ты себя чувствуешь?' : 'How are you feeling?'}
            </p>
            <div className="flex justify-between">
                {MOODS.map(mood => (
                    <button
                        key={mood.value}
                        onClick={() => {
                            onMoodSelect(mood.value);
                            setShowExpanded(false);
                        }}
                        className={`flex flex-col items-center p-2 rounded-xl transition-all ${currentMood === mood.value
                                ? 'bg-[#00D4AA]/20 scale-110'
                                : 'hover:bg-white/10'
                            }`}
                    >
                        <span className="text-2xl mb-1">{mood.emoji}</span>
                        <span className="text-[10px] text-white/50">
                            {isRu ? mood.label : mood.labelEn}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MoodTracker;
