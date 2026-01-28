import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MessageSquare, Sparkles, Plus, X, ChevronRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../locales/LanguageContext';
import { fatSecretService } from '../services/fatSecretService';
import { findDishInDatabase, calculateNutrition } from '../services/foodDatabase';
import { MacroData } from '../types';

interface ParsedFoodItem {
    name: string;
    quantity: number;
    unit: string;
    macros: MacroData;
    grams: number;
    source: 'local' | 'fatsecret' | 'estimated';
}

interface NaturalLanguageInputProps {
    onFoodAdded: (food: {
        name: string;
        macros: MacroData;
        portionGrams: number;
        components: ParsedFoodItem[];
        confidence: number;
    }) => void;
    onClose?: () => void;
}

export const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({
    onFoodAdded,
    onClose
}) => {
    const { t, language } = useLanguage();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [parsedItems, setParsedItems] = useState<ParsedFoodItem[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Example inputs for placeholder rotation
    const examples = language === 'ru'
        ? ['2 яйца и тост с маслом', '200г курицы с рисом', 'кофе латте большой', 'борщ 300г со сметаной']
        : ['2 eggs and toast with butter', '200g chicken with rice', 'large latte', '300g pasta carbonara'];

    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % examples.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [examples.length]);

    // Autocomplete suggestions
    const handleInputChange = useCallback(async (value: string) => {
        setInput(value);

        if (value.length >= 2) {
            // Try local autocomplete first
            const localSuggestions: string[] = [];
            const { DISH_DATABASE } = await import('../services/foodDatabase');

            DISH_DATABASE.forEach(dish => {
                const searchName = language === 'ru' ? dish.nameRu : dish.name;
                if (searchName.toLowerCase().includes(value.toLowerCase())) {
                    localSuggestions.push(searchName);
                }
            });

            // Add FatSecret suggestions if available
            try {
                const fsSuggestions = await fatSecretService.getAutocomplete(value, 3);
                setSuggestions([...new Set([...localSuggestions.slice(0, 3), ...fsSuggestions])].slice(0, 5));
            } catch {
                setSuggestions(localSuggestions.slice(0, 5));
            }
        } else {
            setSuggestions([]);
        }
    }, [language]);

    // Parse natural language input
    const parseInput = useCallback(async () => {
        if (!input.trim()) return;

        setIsLoading(true);
        setParsedItems([]);
        setShowResults(true);
        setSuggestions([]);

        try {
            const items: ParsedFoodItem[] = [];

            // Try FatSecret NLP first (most accurate)
            try {
                const nlpResult = await fatSecretService.parseNaturalLanguage(input, language);

                if (nlpResult?.food_entries) {
                    for (const entry of nlpResult.food_entries) {
                        items.push({
                            name: entry.food.food_name,
                            quantity: entry.serving_amount,
                            unit: entry.serving.serving_description,
                            macros: {
                                calories: entry.total_calories,
                                protein: entry.total_protein,
                                fat: entry.total_fat,
                                carbs: entry.total_carbs
                            },
                            grams: entry.serving.metric_serving_amount || 100,
                            source: 'fatsecret'
                        });
                    }
                }
            } catch (fsError) {
                console.log('FatSecret NLP not available, using local parsing');
            }

            // If no FatSecret results, try local parsing
            if (items.length === 0) {
                // Simple regex-based parsing for common patterns
                // Matches: "200g chicken", "2 eggs", "chicken 200g", etc.
                const patterns = [
                    /(\d+)\s*(г|g|гр|грамм|gram|grams)?\s+(.+)/gi,
                    /(.+?)\s+(\d+)\s*(г|g|гр|грамм|gram|grams)?/gi,
                    /(\d+)\s+(.+)/gi,
                    /(.+)/gi
                ];

                // Split by common separators
                const parts = input.split(/[,иand&+]/i).map(p => p.trim()).filter(Boolean);

                for (const part of parts) {
                    let matched = false;

                    // Try to match quantity patterns
                    const quantityMatch = part.match(/(\d+)\s*(г|g|гр|грамм|gram|grams)?/i);
                    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
                    const hasGrams = quantityMatch && quantityMatch[2];

                    // Extract food name (remove quantity)
                    const foodName = part.replace(/\d+\s*(г|g|гр|грамм|gram|grams)?/gi, '').trim();

                    if (foodName) {
                        // Try local database first
                        const localDish = findDishInDatabase(foodName);

                        if (localDish) {
                            const portionGrams = hasGrams ? quantity : (quantity * localDish.typicalPortionGrams);
                            const nutrition = calculateNutrition(localDish, portionGrams);

                            items.push({
                                name: language === 'ru' ? localDish.nameRu : localDish.name,
                                quantity: hasGrams ? 1 : quantity,
                                unit: hasGrams ? `${quantity}г` : (quantity > 1 ? 'порций' : 'порция'),
                                macros: {
                                    calories: nutrition.calories,
                                    protein: nutrition.protein,
                                    fat: nutrition.fat,
                                    carbs: nutrition.carbs
                                },
                                grams: portionGrams,
                                source: 'local'
                            });
                            matched = true;
                        }

                        // Try FatSecret search if no local match
                        if (!matched) {
                            try {
                                const searchResult = await fatSecretService.searchFoods(foodName, 1, language);
                                const fsFood = searchResult?.foods?.[0];

                                if (fsFood) {
                                    const converted = fatSecretService.toInternalFormat(fsFood);
                                    const portionGrams = hasGrams ? quantity : converted.portionGrams;
                                    const multiplier = portionGrams / converted.portionGrams;

                                    items.push({
                                        name: converted.name,
                                        quantity: 1,
                                        unit: `${portionGrams}г`,
                                        macros: {
                                            calories: Math.round(converted.macros.calories * multiplier),
                                            protein: Math.round(converted.macros.protein * multiplier * 10) / 10,
                                            fat: Math.round(converted.macros.fat * multiplier * 10) / 10,
                                            carbs: Math.round(converted.macros.carbs * multiplier * 10) / 10
                                        },
                                        grams: portionGrams,
                                        source: 'fatsecret'
                                    });
                                    matched = true;
                                }
                            } catch {
                                // FatSecret search failed, use estimation
                            }
                        }

                        // Fallback: Estimate based on common values
                        if (!matched) {
                            const estimatedGrams = hasGrams ? quantity : 100;
                            items.push({
                                name: foodName,
                                quantity: 1,
                                unit: `${estimatedGrams}г (примерно)`,
                                macros: {
                                    calories: Math.round(estimatedGrams * 1.5), // ~150 kcal/100g average
                                    protein: Math.round(estimatedGrams * 0.1),
                                    fat: Math.round(estimatedGrams * 0.05),
                                    carbs: Math.round(estimatedGrams * 0.2)
                                },
                                grams: estimatedGrams,
                                source: 'estimated'
                            });
                        }
                    }
                }
            }

            setParsedItems(items);
        } catch (error) {
            console.error('Parse error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [input, language]);

    // Calculate totals
    const totals = parsedItems.reduce((acc, item) => ({
        calories: acc.calories + item.macros.calories,
        protein: acc.protein + item.macros.protein,
        fat: acc.fat + item.macros.fat,
        carbs: acc.carbs + item.macros.carbs,
        grams: acc.grams + item.grams
    }), { calories: 0, protein: 0, fat: 0, carbs: 0, grams: 0 });

    // Confirm and add
    const handleConfirm = () => {
        if (parsedItems.length === 0) return;

        const combinedName = parsedItems.map(item => item.name).join(' + ');
        const avgConfidence = parsedItems.some(i => i.source === 'estimated') ? 65
            : parsedItems.some(i => i.source === 'local') ? 85
                : 95;

        onFoodAdded({
            name: combinedName,
            macros: {
                calories: Math.round(totals.calories),
                protein: Math.round(totals.protein * 10) / 10,
                fat: Math.round(totals.fat * 10) / 10,
                carbs: Math.round(totals.carbs * 10) / 10
            },
            portionGrams: Math.round(totals.grams),
            components: parsedItems,
            confidence: avgConfidence
        });

        // Reset
        setInput('');
        setParsedItems([]);
        setShowResults(false);
        onClose?.();
    };

    return (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <MessageSquare size={16} className="text-white" />
                    </div>
                    <span className="font-medium text-white">
                        {language === 'ru' ? 'Быстрый ввод' : 'Quick Entry'}
                    </span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={18} className="text-white/60" />
                    </button>
                )}
            </div>

            {/* Input */}
            <div className="relative mb-3">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && parseInput()}
                    placeholder={examples[placeholderIndex]}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 pr-12"
                />
                <button
                    onClick={parseInput}
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 rounded-lg transition-colors"
                >
                    {isLoading ? (
                        <Loader2 size={18} className="text-white animate-spin" />
                    ) : (
                        <Sparkles size={18} className="text-white" />
                    )}
                </button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && !showResults && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {suggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setInput(suggestion);
                                setSuggestions([]);
                            }}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-white/80 transition-colors"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {/* Results */}
            {showResults && (
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={24} className="text-violet-400 animate-spin" />
                            <span className="ml-2 text-white/60">
                                {language === 'ru' ? 'Анализирую...' : 'Analyzing...'}
                            </span>
                        </div>
                    ) : parsedItems.length > 0 ? (
                        <>
                            {/* Parsed items list */}
                            <div className="space-y-2">
                                {parsedItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">{item.name}</span>
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${item.source === 'fatsecret' ? 'bg-green-500/20 text-green-400' :
                                                        item.source === 'local' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {item.source === 'fatsecret' ? '✓ точно' :
                                                        item.source === 'local' ? '✓ база' : '~ примерно'}
                                                </span>
                                            </div>
                                            <span className="text-white/50 text-sm">{item.unit}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white font-medium">{item.macros.calories} ккал</div>
                                            <div className="text-white/50 text-xs">
                                                Б{item.macros.protein} Ж{item.macros.fat} У{item.macros.carbs}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            {parsedItems.length > 1 && (
                                <div className="flex items-center justify-between p-3 bg-violet-500/20 rounded-xl border border-violet-500/30">
                                    <span className="text-white font-medium">
                                        {language === 'ru' ? 'Итого' : 'Total'}
                                    </span>
                                    <div className="text-right">
                                        <div className="text-white font-bold">{Math.round(totals.calories)} ккал</div>
                                        <div className="text-white/70 text-xs">
                                            Б{Math.round(totals.protein)} Ж{Math.round(totals.fat)} У{Math.round(totals.carbs)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Confirm button */}
                            <button
                                onClick={handleConfirm}
                                className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                <Plus size={18} />
                                {language === 'ru' ? 'Добавить в дневник' : 'Add to diary'}
                                <ChevronRight size={18} />
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-6 text-white/50">
                            {language === 'ru' ? 'Ничего не найдено. Попробуйте другой запрос.' : 'Nothing found. Try a different query.'}
                        </div>
                    )}
                </div>
            )}

            {/* Tips */}
            {!showResults && (
                <div className="mt-3 text-xs text-white/40">
                    💡 {language === 'ru'
                        ? 'Пишите как угодно: "2 яйца", "курица 200г", "борщ и хлеб"'
                        : 'Write naturally: "2 eggs", "200g chicken", "soup and bread"'}
                </div>
            )}
        </div>
    );
};

export default NaturalLanguageInput;
