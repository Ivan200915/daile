import React, { useState } from 'react';
import { X, Check, Trash2, Flame, Utensils } from 'lucide-react';
import { useLanguage } from '../locales/LanguageContext';
import { Meal, MacroData } from '../types';

// UI Constants (copied from App.tsx/constants)
const GLASS_PANEL = "backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-xl";
const GLASS_BUTTON = "backdrop-blur-md bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 active:scale-95 transition-all text-sm font-medium";
const ACCENT_BUTTON = "bg-[#00D4AA] text-black rounded-xl font-bold shadow-lg shadow-[#00D4AA]/20 hover:bg-[#00D4AA]/90 active:scale-95 transition-all";

interface EditMealModalProps {
    meal: Meal;
    onClose: () => void;
    onSave: (updatedMeal: Meal) => void;
    onDelete: (id: string) => void;
}

export const EditMealModal: React.FC<EditMealModalProps> = ({ meal, onClose, onSave, onDelete }) => {
    const { t, language } = useLanguage();
    const isRu = language === 'ru';

    const [name, setName] = useState(meal.name);
    const [type, setType] = useState(meal.type);
    const [calories, setCalories] = useState(meal.macros.calories.toString());
    const [protein, setProtein] = useState(meal.macros.protein.toString());
    const [fat, setFat] = useState(meal.macros.fat.toString());
    const [carbs, setCarbs] = useState(meal.macros.carbs.toString());

    const handleSave = () => {
        const updatedMeal: Meal = {
            ...meal,
            name,
            type,
            macros: {
                calories: Number(calories) || 0,
                protein: Number(protein) || 0,
                fat: Number(fat) || 0,
                carbs: Number(carbs) || 0,
            }
        };
        onSave(updatedMeal);
        onClose();
    };

    const handleDelete = () => {
        if (confirm(isRu ? 'Удалить этот прием пищи?' : 'Delete this meal?')) {
            onDelete(meal.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className={`${GLASS_PANEL} w-full max-w-sm p-5 relative animate-scale-in`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X size={20} className="text-white/50" />
                </button>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Utensils size={20} className="text-[#00D4AA]" />
                    {isRu ? 'Редактировать' : 'Edit Meal'}
                </h2>

                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="text-xs text-white/40 ml-1 mb-1 block uppercase tracking-wider">{isRu ? 'Название' : 'Name'}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00D4AA]/50 outline-none transition-colors"
                            placeholder={isRu ? 'Название блюда' : 'Meal name'}
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="text-xs text-white/40 ml-1 mb-1 block uppercase tracking-wider">{isRu ? 'Тип' : 'Type'}</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setType(t as any)}
                                    className={`py-2 rounded-xl text-xs font-medium transition-all ${type === t
                                            ? 'bg-[#00D4AA] text-black shadow-lg shadow-[#00D4AA]/20'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    {/* @ts-ignore */}
                                    {(isRu && { Breakfast: 'Завтрак', Lunch: 'Обед', Dinner: 'Ужин', Snack: 'Перекус' }[t]) || t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs text-white/40 ml-1 mb-1 block uppercase tracking-wider">{isRu ? 'Калории' : 'Calories'}</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={calories}
                                    onChange={(e) => setCalories(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#00D4AA]/50 outline-none transition-colors font-mono"
                                />
                                <Flame size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF6B00]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 col-span-2">
                            <div>
                                <label className="text-[10px] text-white/40 ml-1 mb-1 block text-center uppercas">{isRu ? 'Белки' : 'Protein'}</label>
                                <input
                                    type="number"
                                    value={protein}
                                    onChange={(e) => setProtein(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-2 py-2 text-center text-white focus:border-[#FF6B6B]/50 outline-none transition-colors text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-white/40 ml-1 mb-1 block text-center uppercase">{isRu ? 'Жиры' : 'Fat'}</label>
                                <input
                                    type="number"
                                    value={fat}
                                    onChange={(e) => setFat(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-2 py-2 text-center text-white focus:border-[#FFD700]/50 outline-none transition-colors text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-white/40 ml-1 mb-1 block text-center uppercase">{isRu ? 'Углев.' : 'Carbs'}</label>
                                <input
                                    type="number"
                                    value={carbs}
                                    onChange={(e) => setCarbs(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-2 py-2 text-center text-white focus:border-[#4ECDC4]/50 outline-none transition-colors text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6 pt-2">
                        <button
                            onClick={handleDelete}
                            className={`${GLASS_BUTTON} p-3 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 flex-1`}
                        >
                            <Trash2 size={20} className="mx-auto" />
                        </button>
                        <button
                            onClick={handleSave}
                            className={`${ACCENT_BUTTON} p-3 flex-[3] flex items-center justify-center gap-2`}
                        >
                            <Check size={18} />
                            {isRu ? 'Сохранить' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
