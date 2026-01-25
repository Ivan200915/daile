// Barcode Scanner Service - Open Food Facts API
// Бесплатная база данных продуктов с более чем 2 миллионами товаров

export interface BarcodeProduct {
    barcode: string;
    name: string;
    brand?: string;
    quantity?: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    fatPer100g: number;
    carbsPer100g: number;
    servingSize?: number; // в граммах
    imageUrl?: string;
    isComplete: boolean; // все ли данные есть
}

export interface BarcodeScanResult {
    success: boolean;
    product?: BarcodeProduct;
    error?: string;
}

// Open Food Facts API - бесплатно, без ключа
const OFF_API_URL = 'https://world.openfoodfacts.org/api/v2/product';

export async function scanBarcode(barcode: string): Promise<BarcodeScanResult> {
    try {
        const response = await fetch(`${OFF_API_URL}/${barcode}.json`);

        if (!response.ok) {
            return {
                success: false,
                error: 'Не удалось подключиться к базе данных'
            };
        }

        const data = await response.json();

        if (data.status !== 1 || !data.product) {
            return {
                success: false,
                error: 'Продукт не найден в базе. Попробуйте сфотографировать.'
            };
        }

        const p = data.product;
        const nutrients = p.nutriments || {};

        // Проверяем наличие основных данных
        const caloriesPer100g = nutrients['energy-kcal_100g'] || nutrients['energy_100g'] / 4.184 || 0;
        const proteinPer100g = nutrients['proteins_100g'] || 0;
        const fatPer100g = nutrients['fat_100g'] || 0;
        const carbsPer100g = nutrients['carbohydrates_100g'] || 0;

        const isComplete = caloriesPer100g > 0 && (proteinPer100g > 0 || fatPer100g > 0 || carbsPer100g > 0);

        return {
            success: true,
            product: {
                barcode,
                name: p.product_name || p.product_name_ru || p.product_name_en || 'Неизвестный продукт',
                brand: p.brands,
                quantity: p.quantity,
                caloriesPer100g: Math.round(caloriesPer100g),
                proteinPer100g: Math.round(proteinPer100g * 10) / 10,
                fatPer100g: Math.round(fatPer100g * 10) / 10,
                carbsPer100g: Math.round(carbsPer100g * 10) / 10,
                servingSize: p.serving_size ? parseFloat(p.serving_size) : undefined,
                imageUrl: p.image_front_small_url || p.image_url,
                isComplete
            }
        };
    } catch (error) {
        console.error('Barcode scan error:', error);
        return {
            success: false,
            error: 'Ошибка сканирования. Проверьте интернет-соединение.'
        };
    }
}

// Расчет КБЖУ для порции продукта
export function calculateProductNutrition(product: BarcodeProduct, portionGrams: number) {
    const multiplier = portionGrams / 100;
    return {
        calories: Math.round(product.caloriesPer100g * multiplier),
        protein: Math.round(product.proteinPer100g * multiplier * 10) / 10,
        fat: Math.round(product.fatPer100g * multiplier * 10) / 10,
        carbs: Math.round(product.carbsPer100g * multiplier * 10) / 10,
        portionGrams
    };
}

// Парсинг штрих-кода из изображения (placeholder для будущей интеграции с библиотекой)
// В реальности используй библиотеку типа zxing или quagga
export async function detectBarcodeFromImage(imageBase64: string): Promise<string | null> {
    // TODO: Интегрировать с библиотекой распознавания штрих-кодов
    // Для веб-приложения можно использовать:
    // - html5-qrcode
    // - quaggaJS
    // - zxing-js
    return null;
}
