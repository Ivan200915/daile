import React, { useState, useCallback } from 'react';
import { Plus, Minus, Check, Volume2, Edit3, Trash2 } from 'lucide-react';
import { useLanguage } from '../locales/LanguageContext';
import { MacroData } from '../types';

export interface FoodComponent {
    id: string;
    name: string;
    grams: number;
    caloriesPer100g: number;
    proteinPer100g: number;
    fatPer100g: number;
    carbsPer100g: number;
    isEditing?: boolean;
}

interface FoodResultCardProps {
    components: FoodComponent[];
    onComponentsChange: (components: FoodComponent[]) => void;
    onConfirm: (totalMacros: MacroData, totalGrams: number, name: string) => void;
    onCancel?: () => void;
    source?: 'ai' | 'barcode' | 'manual';
    confidence?: number;
}

export const FoodResultCard: React.FC<FoodResultCardProps> = ({
    components,
    onComponentsChange,
    onConfirm,
    onCancel,
    source = 'ai',
    confidence = 80
}) => {
    const { language } = useLanguage();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempGrams, setTempGrams] = useState<string>('');

    // Рассчитать КБЖУ для компонента
    const calcMacros = (comp: FoodComponent) => {
        const multiplier = comp.grams / 100;
        return {
            calories: Math.round(comp.caloriesPer100g * multiplier),
            protein: Math.round(comp.proteinPer100g * multiplier * 10) / 10,
            fat: Math.round(comp.fatPer100g * multiplier * 10) / 10,
            carbs: Math.round(comp.carbsPer100g * multiplier * 10) / 10
        };
    };

    // Общие КБЖУ
    const totals = components.reduce((acc, comp) => {
        const macros = calcMacros(comp);
        return {
            calories: acc.calories + macros.calories,
            protein: acc.protein + macros.protein,
            fat: acc.fat + macros.fat,
            carbs: acc.carbs + macros.carbs,
            grams: acc.grams + comp.grams
        };
    }, { calories: 0, protein: 0, fat: 0, carbs: 0, grams: 0 });

    // Изменить граммы кнопками +/-
    const adjustGrams = useCallback((id: string, delta: number) => {
        onComponentsChange(components.map(c =>
            c.id === id ? { ...c, grams: Math.max(10, c.grams + delta) } : c
        ));
    }, [components, onComponentsChange]);

    // Начать редактирование
    const startEdit = (comp: FoodComponent) => {
        setEditingId(comp.id);
        setTempGrams(comp.grams.toString());
    };

    // Сохранить редактирование
    const saveEdit = (id: string) => {
        const newGrams = parseInt(tempGrams) || 100;
        onComponentsChange(components.map(c =>
            c.id === id ? { ...c, grams: Math.max(10, newGrams) } : c
        ));
        setEditingId(null);
        setTempGrams('');
    };

    // Удалить компонент
    const removeComponent = (id: string) => {
        onComponentsChange(components.filter(c => c.id !== id));
    };

    // Подтвердить
    const handleConfirm = () => {
        const name = components.map(c => c.name).join(' + ');
        onConfirm(
            { calories: totals.calories, protein: totals.protein, fat: totals.fat, carbs: totals.carbs },
            totals.grams,
            name
        );
    };

    // Бейдж источника
    const sourceBadge = () => {
        if (source === 'barcode') {
            return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">📦 Штрих-код</span>;
        }
        if (confidence >= 90) {
            return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">✓ Точно</span>;
        }
        if (confidence >= 70) {
            return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">~ Примерно</span>;
        }
        return <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">? Оценка</span>;
    };

    if (components.length === 0) return null;

    return (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
            {/* Заголовок */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-white font-medium">
                    {language === 'ru' ? 'Результат анализа' : 'Analysis Result'}
                </span>
                {sourceBadge()}
            </div>

            {/* Список компонентов */}
            <div className="divide-y divide-white/5">
                {components.map((comp) => {
                    const macros = calcMacros(comp);
                    const isEditing = editingId === comp.id;

                    return (
                        <div key={comp.id} className="px-4 py-3 flex items-center gap-3">
                            {/* Название */}
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-medium truncate">{comp.name}</div>
                                <div className="text-white/50 text-sm">
                                    {macros.calories} ккал • Б{macros.protein} Ж{macros.fat} У{macros.carbs}
                                </div>
                            </div>

                            {/* Редактирование граммов */}
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="number"
                                            value={tempGrams}
                                            onChange={(e) => setTempGrams(e.target.value)}
                                            className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-center text-sm"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(comp.id)}
                                        />
                                        <button
                                            onClick={() => saveEdit(comp.id)}
                                            className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg"
                                        >
                                            <Check size={16} className="text-green-400" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => adjustGrams(comp.id, -10)}
                                            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                        >
                                            <Minus size={16} className="text-white/70" />
                                        </button>

                                        {/* Граммы (кликабельно) */}
                                        <button
                                            onClick={() => startEdit(comp)}
                                            className="min-w-[60px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-white text-center text-sm transition-colors"
                                        >
                                            {comp.grams}г
                                        </button>

                                        {/* Кнопка + */}
                                        <button
                                            onClick={() => adjustGrams(comp.id, 10)}
                                            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                        >
                                            <Plus size={16} className="text-white/70" />
                                        </button>

                                        {/* Удалить (если > 1 компонента) */}
                                        {components.length > 1 && (
                                            <button
                                                onClick={() => removeComponent(comp.id)}
                                                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} className="text-red-400/60" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Итого (если > 1 компонента) */}
            {components.length > 1 && (
                <div className="px-4 py-3 bg-violet-500/10 border-t border-violet-500/20">
                    <div className="flex items-center justify-between">
                        <span className="text-white/70">{language === 'ru' ? 'Итого' : 'Total'}</span>
                        <div className="text-right">
                            <span className="text-white font-bold text-lg">{totals.calories} ккал</span>
                            <div className="text-white/50 text-xs">
                                Б{Math.round(totals.protein)} Ж{Math.round(totals.fat)} У{Math.round(totals.carbs)} • {totals.grams}г
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Кнопки действий */}
            <div className="p-4 flex gap-3">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/70 font-medium transition-colors"
                    >
                        {language === 'ru' ? 'Отмена' : 'Cancel'}
                    </button>
                )}
                <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all"
                >
                    <Check size={18} />
                    {language === 'ru' ? 'Добавить' : 'Add'}
                </button>
            </div>
        </div>
    );
};

export default FoodResultCard;
