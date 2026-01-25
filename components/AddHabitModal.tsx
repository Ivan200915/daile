// AddHabitModal - Create custom habits
import React, { useState } from 'react';
import { Habit, HabitType } from '../types';
import { Icons } from './Icons';
import { useLanguage } from '../locales/LanguageContext';

const GLASS_PANEL = 'bg-[#1C1C1E]/90 backdrop-blur-[30px] border border-white/10 rounded-[28px]';
const ACCENT_BUTTON = 'bg-[#00D4AA] text-black font-bold rounded-2xl';

interface AddHabitModalProps {
    onClose: () => void;
    onAdd: (habit: Habit) => void;
}

const HABIT_ICONS = [
    { id: 'Star', icon: Icons.Star },
    { id: 'Heart', icon: Icons.Heart },
    { id: 'Target', icon: Icons.Target },
    { id: 'Flame', icon: Icons.Flame },
    { id: 'Zap', icon: Icons.Energy },
    { id: 'Moon', icon: Icons.Moon },
    { id: 'Sun', icon: Icons.Sun },
    { id: 'Dumbbell', icon: Icons.Workout },
    { id: 'Leaf', icon: Icons.Leaf },
    { id: 'Edit', icon: Icons.Edit },
];

export const AddHabitModal = ({ onClose, onAdd }: AddHabitModalProps) => {
    const { language } = useLanguage();
    const isRu = language === 'ru';

    const [name, setName] = useState('');
    const [type, setType] = useState<HabitType>('boolean');
    const [target, setTarget] = useState(1);
    const [unit, setUnit] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Star');

    const handleSubmit = () => {
        if (!name.trim()) return;

        const newHabit: Habit = {
            id: `custom_${Date.now()}`,
            label: name,
            labelRu: name, // Both same for custom habits
            type,
            target: type !== 'boolean' ? target : undefined,
            unit: type !== 'boolean' ? unit : undefined,
            unitRu: type !== 'boolean' ? unit : undefined,
            current: 0,
            completed: false,
            icon: selectedIcon,
        };

        onAdd(newHabit);
        onClose();
    };

    const typeOptions = [
        { value: 'boolean' as HabitType, label: isRu ? 'Да/Нет' : 'Yes/No', desc: isRu ? 'Простая галочка' : 'Simple checkbox' },
        { value: 'counter' as HabitType, label: isRu ? 'Счётчик' : 'Counter', desc: isRu ? 'Считай количество' : 'Count progress' },
        { value: 'timer' as HabitType, label: isRu ? 'Таймер' : 'Timer', desc: isRu ? 'Отслеживай время' : 'Track duration' },
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 pb-8 animate-fade-in">
            <div className={`${GLASS_PANEL} w-full max-w-md p-6 max-h-[80vh] overflow-y-auto no-scrollbar`} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">{isRu ? 'Новая привычка' : 'New Habit'}</h2>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                        <Icons.X size={20} />
                    </button>
                </div>

                {/* Name Input */}
                <div className="mb-5">
                    <label className="text-sm text-white/50 mb-2 block">{isRu ? 'Название' : 'Name'}</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={isRu ? 'Например: Читать 30 минут' : 'e.g., Read 30 minutes'}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00D4AA]/50"
                    />
                </div>

                {/* Icon Selection */}
                <div className="mb-5">
                    <label className="text-sm text-white/50 mb-2 block">{isRu ? 'Иконка' : 'Icon'}</label>
                    <div className="flex flex-wrap gap-2">
                        {HABIT_ICONS.map(({ id, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setSelectedIcon(id)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedIcon === id ? 'bg-[#00D4AA] text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                            >
                                <Icon size={20} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Type Selection */}
                <div className="mb-5">
                    <label className="text-sm text-white/50 mb-2 block">{isRu ? 'Тип' : 'Type'}</label>
                    <div className="grid grid-cols-3 gap-2">
                        {typeOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setType(opt.value)}
                                className={`p-3 rounded-xl text-center transition-all ${type === opt.value ? 'bg-[#00D4AA]/20 border-2 border-[#00D4AA]' : 'bg-white/5 border border-white/10'}`}
                            >
                                <p className="font-bold text-sm">{opt.label}</p>
                                <p className="text-xs text-white/40 mt-1">{opt.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Target (for counter/timer) */}
                {type !== 'boolean' && (
                    <div className="mb-5 grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm text-white/50 mb-2 block">
                                {isRu ? 'Цель' : 'Target'}
                            </label>
                            <input
                                type="number"
                                value={target}
                                onChange={e => setTarget(parseInt(e.target.value) || 1)}
                                min={1}
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00D4AA]/50"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-white/50 mb-2 block">
                                {type === 'timer'
                                    ? (isRu ? 'Единица (мин)' : 'Unit (min)')
                                    : (isRu ? 'Единица' : 'Unit')
                                }
                            </label>
                            <input
                                type="text"
                                value={unit}
                                onChange={e => setUnit(e.target.value)}
                                placeholder={type === 'timer' ? 'мин' : (isRu ? 'шт, раз...' : 'pcs, times...')}
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00D4AA]/50"
                            />
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={!name.trim()}
                    className={`w-full py-4 ${ACCENT_BUTTON} disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                >
                    {isRu ? 'Добавить привычку' : 'Add Habit'}
                </button>
            </div>
        </div>
    );
};

export default AddHabitModal;
