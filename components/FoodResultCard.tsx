import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Minus, Check, Volume2, Edit3, Trash2 } from 'lucide-react';
import { useLanguage } from '../locales/LanguageContext';
import { MacroData } from '../types';
import { searchIngredients, IngredientData } from '../services/foodDatabase';

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
    personalizedHint?: string | null;
}

export const FoodResultCard: React.FC<FoodResultCardProps> = ({
    components,
    onComponentsChange,
    onConfirm,
    onCancel,
    source = 'ai',
    confidence = 80,
    personalizedHint
}) => {
    const { language } = useLanguage();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempGrams, setTempGrams] = useState<string>('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingNameId, setEditingNameId] = useState<string | null>(null);
    const [tempName, setTempName] = useState('');
    const [newIngredient, setNewIngredient] = useState({
        name: '',
        grams: '100',
        caloriesPer100g: '100',
        proteinPer100g: '5',
        fatPer100g: '3',
        carbsPer100g: '15'
    });
    const [suggestions, setSuggestions] = useState<IngredientData[]>([]);

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

    // Начать редактирование граммов
    const startEdit = (comp: FoodComponent) => {
        setEditingId(comp.id);
        setTempGrams(comp.grams.toString());
    };

    // Сохранить редактирование граммов
    const saveEdit = (id: string) => {
        const newGrams = parseInt(tempGrams) || 100;
        onComponentsChange(components.map(c =>
            c.id === id ? { ...c, grams: Math.max(10, newGrams) } : c
        ));
        setEditingId(null);
        setTempGrams('');
    };

    // Начать редактирование названия
    const startEditName = (comp: FoodComponent) => {
        setEditingNameId(comp.id);
        setTempName(comp.name);
    };

    // Сохранить редактирование названия
    const saveEditName = (id: string) => {
        if (tempName.trim()) {
            onComponentsChange(components.map(c =>
                c.id === id ? { ...c, name: tempName.trim() } : c
            ));
        }
        setEditingNameId(null);
        setTempName('');
    };

    // Добавить новый ингредиент
    const addNewComponent = () => {
        if (!newIngredient.name.trim()) return;

        const newComp: FoodComponent = {
            id: String(Date.now()),
            name: newIngredient.name.trim(),
            grams: parseInt(newIngredient.grams) || 100,
            caloriesPer100g: parseInt(newIngredient.caloriesPer100g) || 100,
            proteinPer100g: parseFloat(newIngredient.proteinPer100g) || 5,
            fatPer100g: parseFloat(newIngredient.fatPer100g) || 3,
            carbsPer100g: parseFloat(newIngredient.carbsPer100g) || 15
        };

        onComponentsChange([...components, newComp]);
        setShowAddForm(false);
        setSuggestions([]);
        setNewIngredient({
            name: '',
            grams: '100',
            caloriesPer100g: '100',
            proteinPer100g: '5',
            fatPer100g: '3',
            carbsPer100g: '15'
        });
    };

    // Обработка ввода названия с автоподсказкой
    const handleNameInput = (value: string) => {
        setNewIngredient({ ...newIngredient, name: value });
        if (value.length >= 2) {
            const results = searchIngredients(value, 5);
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    };

    // Выбор из подсказок - автозаполнение КБЖУ
    const selectSuggestion = (ingredient: IngredientData) => {
        setNewIngredient({
            name: ingredient.nameRu,
            grams: newIngredient.grams, // сохраняем введённые граммы
            caloriesPer100g: String(ingredient.caloriesPer100g),
            proteinPer100g: String(ingredient.proteinPer100g),
            fatPer100g: String(ingredient.fatPer100g),
            carbsPer100g: String(ingredient.carbsPer100g)
        });
        setSuggestions([]);
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

            {/* Подсказка персонализации */}
            {personalizedHint && (
                <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/20">
                    <span className="text-green-400 text-sm">{personalizedHint}</span>
                </div>
            )}

            {/* Список компонентов */}
            <div className="divide-y divide-white/5">
                {components.map((comp) => {
                    const macros = calcMacros(comp);
                    const isEditing = editingId === comp.id;
                    const isEditingName = editingNameId === comp.id;

                    return (
                        <div key={comp.id} className="px-4 py-3">
                            {/* Название (кликабельно для редактирования) */}
                            <div className="flex items-center gap-2 mb-1">
                                {isEditingName ? (
                                    <>
                                        <input
                                            type="text"
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && saveEditName(comp.id)}
                                            onBlur={() => saveEditName(comp.id)}
                                        />
                                        <button
                                            onClick={() => saveEditName(comp.id)}
                                            className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg"
                                        >
                                            <Check size={14} className="text-green-400" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => startEditName(comp)}
                                        className="text-white font-medium truncate text-left hover:text-white/80 transition-colors flex-1"
                                    >
                                        {comp.name} <Edit3 size={12} className="inline ml-1 text-white/40" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {/* КБЖУ */}
                                <div className="flex-1 text-white/50 text-sm">
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

            {/* Добавить ингредиент */}
            {!showAddForm ? (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full px-4 py-3 border-t border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={18} />
                    {language === 'ru' ? 'Добавить ингредиент' : 'Add ingredient'}
                </button>
            ) : (
                <div className="px-4 py-3 border-t border-white/10 space-y-3">
                    <div className="text-white/70 text-sm font-medium">
                        {language === 'ru' ? 'Новый ингредиент' : 'New ingredient'}
                    </div>

                    {/* Название с автоподсказкой */}
                    <div className="relative">
                        <input
                            type="text"
                            value={newIngredient.name}
                            onChange={(e) => handleNameInput(e.target.value)}
                            placeholder={language === 'ru' ? 'Начните вводить название...' : 'Start typing name...'}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 text-sm"
                            autoComplete="off"
                        />

                        {/* Выпадающий список подсказок */}
                        {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 border border-white/20 rounded-lg overflow-hidden z-50 max-h-48 overflow-y-auto">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => selectSuggestion(s)}
                                        className="w-full px-3 py-2 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                                    >
                                        <div className="text-white text-sm">{s.nameRu}</div>
                                        <div className="text-white/50 text-xs">
                                            {s.caloriesPer100g} ккал • Б{s.proteinPer100g} Ж{s.fatPer100g} У{s.carbsPer100g}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Граммы и Калории */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-white/50 text-xs">{language === 'ru' ? 'Граммы' : 'Grams'}</label>
                            <input
                                type="number"
                                value={newIngredient.grams}
                                onChange={(e) => setNewIngredient({ ...newIngredient, grams: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded text-white text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-white/50 text-xs">{language === 'ru' ? 'Ккал/100г' : 'Kcal/100g'}</label>
                            <input
                                type="number"
                                value={newIngredient.caloriesPer100g}
                                onChange={(e) => setNewIngredient({ ...newIngredient, caloriesPer100g: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded text-white text-sm"
                            />
                        </div>
                    </div>

                    {/* БЖУ */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-white/50 text-xs">Б</label>
                            <input
                                type="number"
                                value={newIngredient.proteinPer100g}
                                onChange={(e) => setNewIngredient({ ...newIngredient, proteinPer100g: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded text-white text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-white/50 text-xs">Ж</label>
                            <input
                                type="number"
                                value={newIngredient.fatPer100g}
                                onChange={(e) => setNewIngredient({ ...newIngredient, fatPer100g: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded text-white text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-white/50 text-xs">У</label>
                            <input
                                type="number"
                                value={newIngredient.carbsPer100g}
                                onChange={(e) => setNewIngredient({ ...newIngredient, carbsPer100g: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded text-white text-sm"
                            />
                        </div>
                    </div>

                    {/* Кнопки */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 text-sm"
                        >
                            {language === 'ru' ? 'Отмена' : 'Cancel'}
                        </button>
                        <button
                            onClick={addNewComponent}
                            disabled={!newIngredient.name.trim()}
                            className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 text-sm disabled:opacity-50"
                        >
                            {language === 'ru' ? 'Добавить' : 'Add'}
                        </button>
                    </div>
                </div>
            )}

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
