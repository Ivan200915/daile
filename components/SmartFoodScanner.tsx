import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, Scan, Image, Loader2, RotateCcw, Keyboard } from 'lucide-react';
import { useLanguage } from '../locales/LanguageContext';
import { scanBarcode } from '../services/barcodeService';
import { analyzeFood } from '../services/geminiService';
import { FoodResultCard, FoodComponent } from './FoodResultCard';
import { MacroData } from '../types';
import { findPortionMatch, updatePortionHistory } from '../services/portionHistoryService';

interface SmartFoodScannerProps {
    onFoodAdded: (food: { name: string; macros: MacroData; portionGrams: number }) => void;
    onClose: () => void;
}

type ScanState = 'camera' | 'barcode_input' | 'loading' | 'result' | 'error';

export const SmartFoodScanner: React.FC<SmartFoodScannerProps> = ({ onFoodAdded, onClose }) => {
    const { language } = useLanguage();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [state, setState] = useState<ScanState>('camera');
    const [components, setComponents] = useState<FoodComponent[]>([]);
    const [source, setSource] = useState<'ai' | 'barcode'>('ai');
    const [confidence, setConfidence] = useState(80);
    const [error, setError] = useState('');
    const [barcodeInput, setBarcodeInput] = useState('');
    const [personalizedHint, setPersonalizedHint] = useState<string | null>(null);

    // Инициализация камеры
    useEffect(() => {
        let stream: MediaStream | null = null;

        const initCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Camera error:', err);
                setError(language === 'ru' ? 'Нет доступа к камере' : 'Camera access denied');
                setState('error');
            }
        };

        if (state === 'camera') {
            initCamera();
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
            }
        };
    }, [state, language]);

    // Обработка штрих-кода
    const handleBarcodeSubmit = async () => {
        if (!barcodeInput.trim()) return;

        setState('loading');
        try {
            const result = await scanBarcode(barcodeInput.trim());

            if (result.success && result.product) {
                const p = result.product;
                setComponents([{
                    id: '1',
                    name: p.brand ? `${p.brand} ${p.name}` : p.name,
                    grams: p.servingSize || 100,
                    caloriesPer100g: p.caloriesPer100g,
                    proteinPer100g: p.proteinPer100g,
                    fatPer100g: p.fatPer100g,
                    carbsPer100g: p.carbsPer100g
                }]);
                setSource('barcode');
                setConfidence(95);
                setState('result');
            } else {
                setError(result.error || 'Продукт не найден');
                setState('error');
            }
        } catch (err) {
            setError('Ошибка сканирования');
            setState('error');
        }
    };

    // Сделать фото и проанализировать
    const captureAndAnalyze = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setState('loading');

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        try {
            const result = await analyzeFood(imageData, language);

            if (result) {
                // Преобразуем результат AI в компоненты
                let comps: FoodComponent[] = result.components?.length > 0
                    ? result.components.map((c, i) => ({
                        id: String(i + 1),
                        name: c.name,
                        grams: c.grams || 100,
                        caloriesPer100g: c.grams > 0 ? Math.round((c.calories / c.grams) * 100) : 0,
                        proteinPer100g: c.grams > 0 ? Math.round((c.protein / c.grams) * 100 * 10) / 10 : 0,
                        fatPer100g: c.grams > 0 ? Math.round((c.fat / c.grams) * 100 * 10) / 10 : 0,
                        carbsPer100g: c.grams > 0 ? Math.round((c.carbs / c.grams) * 100 * 10) / 10 : 0
                    }))
                    : [{
                        id: '1',
                        name: result.name,
                        grams: result.portionGrams,
                        caloriesPer100g: result.portionGrams > 0 ? Math.round((result.macros.calories / result.portionGrams) * 100) : 0,
                        proteinPer100g: result.portionGrams > 0 ? Math.round((result.macros.protein / result.portionGrams) * 100 * 10) / 10 : 0,
                        fatPer100g: result.portionGrams > 0 ? Math.round((result.macros.fat / result.portionGrams) * 100 * 10) / 10 : 0,
                        carbsPer100g: result.portionGrams > 0 ? Math.round((result.macros.carbs / result.portionGrams) * 100 * 10) / 10 : 0
                    }];

                // 🎯 ПЕРСОНАЛИЗАЦИЯ: Ищем в истории пользователя
                let hint: string | null = null;
                comps = comps.map(comp => {
                    const match = findPortionMatch(comp.name);
                    if (match && match.count >= 1) {
                        // Нашли похожее блюдо в истории — применяем персональный вес
                        hint = language === 'ru'
                            ? `📊 Ваша обычная порция: ${match.avgGrams}г`
                            : `📊 Your typical portion: ${match.avgGrams}g`;
                        return { ...comp, grams: match.avgGrams };
                    }
                    return comp;
                });

                setPersonalizedHint(hint);
                setComponents(comps);
                setSource('ai');
                setConfidence(result.confidence);
                setState('result');
            } else {
                setError(language === 'ru' ? 'Не удалось распознать еду' : 'Failed to recognize food');
                setState('error');
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError(language === 'ru' ? 'Ошибка анализа' : 'Analysis error');
            setState('error');
        }
    }, [language]);

    // Загрузка из галереи
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setState('loading');

        const reader = new FileReader();
        reader.onload = async (event) => {
            const imageData = event.target?.result as string;

            try {
                const result = await analyzeFood(imageData, language);

                if (result) {
                    let comp: FoodComponent = {
                        id: '1',
                        name: result.name,
                        grams: result.portionGrams,
                        caloriesPer100g: result.portionGrams > 0 ? Math.round((result.macros.calories / result.portionGrams) * 100) : 0,
                        proteinPer100g: result.portionGrams > 0 ? Math.round((result.macros.protein / result.portionGrams) * 100 * 10) / 10 : 0,
                        fatPer100g: result.portionGrams > 0 ? Math.round((result.macros.fat / result.portionGrams) * 100 * 10) / 10 : 0,
                        carbsPer100g: result.portionGrams > 0 ? Math.round((result.macros.carbs / result.portionGrams) * 100 * 10) / 10 : 0
                    };

                    // 🎯 ПЕРСОНАЛИЗАЦИЯ
                    const match = findPortionMatch(result.name);
                    if (match && match.count >= 1) {
                        comp.grams = match.avgGrams;
                        setPersonalizedHint(language === 'ru'
                            ? `📊 Ваша обычная порция: ${match.avgGrams}г`
                            : `📊 Your typical portion: ${match.avgGrams}g`);
                    } else {
                        setPersonalizedHint(null);
                    }

                    setComponents([comp]);
                    setSource('ai');
                    setConfidence(result.confidence);
                    setState('result');
                } else {
                    setError(language === 'ru' ? 'Не удалось распознать' : 'Recognition failed');
                    setState('error');
                }
            } catch (err) {
                setError(language === 'ru' ? 'Ошибка обработки' : 'Processing error');
                setState('error');
            }
        };
        reader.readAsDataURL(file);
    };

    // Подтверждение результата
    const handleConfirm = (macros: MacroData, grams: number, name: string) => {
        // Сохраняем в историю порций для персонализации
        updatePortionHistory(name, grams);
        onFoodAdded({ name, macros, portionGrams: grams });
    };

    // Сброс
    const reset = () => {
        setComponents([]);
        setError('');
        setBarcodeInput('');
        setPersonalizedHint(null);
        setState('camera');
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Заголовок с Safe Area */}
            <div className="absolute top-0 left-0 right-0 z-10 pt-[60px] px-4 pb-4 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/60 to-transparent">
                <button onClick={onClose} className="p-2 bg-white/10 backdrop-blur-sm rounded-full">
                    <X size={24} className="text-white" />
                </button>
                <span className="text-white font-medium">
                    {language === 'ru' ? 'Сканер еды' : 'Food Scanner'}
                </span>
                <div className="w-10" />
            </div>

            {/* Основной контент */}
            {state === 'camera' && (
                <>
                    {/* Видео с камеры */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="flex-1 object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Нижняя панель */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        {/* Кнопки */}
                        <div className="flex items-center justify-center gap-6">
                            {/* Галерея */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 bg-white/10 backdrop-blur-sm rounded-full"
                            >
                                <Image size={24} className="text-white" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />

                            {/* Кнопка съёмки */}
                            <button
                                onClick={captureAndAnalyze}
                                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                            >
                                <div className="w-14 h-14 bg-white border-2 border-black/10 rounded-full" />
                            </button>

                            {/* Штрих-код */}
                            <button
                                onClick={() => setState('barcode_input')}
                                className="p-3 bg-white/10 backdrop-blur-sm rounded-full"
                            >
                                <Scan size={24} className="text-white" />
                            </button>
                        </div>

                        <p className="text-center text-white/50 text-sm mt-4">
                            {language === 'ru' ? '📷 Сфотографируйте еду' : '📷 Take a photo of your food'}
                        </p>
                    </div>
                </>
            )}

            {state === 'barcode_input' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <Scan size={48} className="text-white/50 mb-4" />
                    <p className="text-white text-lg mb-4">
                        {language === 'ru' ? 'Введите штрих-код' : 'Enter barcode'}
                    </p>
                    <input
                        type="text"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        placeholder="1234567890123"
                        className="w-full max-w-xs px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center text-lg placeholder-white/30"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSubmit()}
                    />
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={reset}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white"
                        >
                            {language === 'ru' ? 'Назад' : 'Back'}
                        </button>
                        <button
                            onClick={handleBarcodeSubmit}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl text-white font-medium"
                        >
                            {language === 'ru' ? 'Найти' : 'Search'}
                        </button>
                    </div>
                </div>
            )}

            {state === 'loading' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 size={48} className="text-white animate-spin mb-4" />
                    <span className="text-white/70">
                        {language === 'ru' ? 'Анализирую...' : 'Analyzing...'}
                    </span>
                </div>
            )}

            {state === 'result' && (
                <div className="flex-1 flex flex-col p-4 pt-20 overflow-auto">
                    <FoodResultCard
                        components={components}
                        onComponentsChange={setComponents}
                        onConfirm={handleConfirm}
                        onCancel={reset}
                        source={source}
                        confidence={confidence}
                        personalizedHint={personalizedHint}
                    />
                </div>
            )}

            {state === 'error' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="text-6xl mb-4">😕</div>
                    <p className="text-white text-center mb-6">{error}</p>
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white flex items-center gap-2"
                    >
                        <RotateCcw size={18} />
                        {language === 'ru' ? 'Попробовать снова' : 'Try again'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SmartFoodScanner;
