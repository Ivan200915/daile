// FatSecret Professional Food Database API Service
// Provides high-accuracy food search, barcode lookup, NLP parsing, and image recognition
// API Docs: https://platform.fatsecret.com/docs

export interface FatSecretFood {
    food_id: string;
    food_name: string;
    brand_name?: string;
    food_type: 'Generic' | 'Brand';
    food_url?: string;
    servings: FatSecretServing[];
}

export interface FatSecretServing {
    serving_id: string;
    serving_description: string;
    metric_serving_amount?: number;
    metric_serving_unit?: string;
    calories: number;
    protein: number;
    fat: number;
    carbohydrate: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
}

export interface FatSecretSearchResult {
    foods: FatSecretFood[];
    max_results: number;
    page_number: number;
    total_results: number;
}

export interface FatSecretNLPResult {
    food_entries: {
        food: FatSecretFood;
        serving_amount: number;
        serving: FatSecretServing;
        total_calories: number;
        total_protein: number;
        total_fat: number;
        total_carbs: number;
    }[];
    raw_text: string;
}

export interface FatSecretImageResult {
    recognized_foods: {
        food: FatSecretFood;
        confidence: number;
        bounding_box?: { x: number; y: number; width: number; height: number };
        estimated_serving: FatSecretServing;
    }[];
}

// Backend proxy URL - все запросы идут через наш сервер для безопасности OAuth ключей
const API_BASE = '/api/fatsecret';

class FatSecretService {
    /**
     * Search foods by text query
     * Supports autocomplete and returns matched foods with nutritional data
     */
    async searchFoods(query: string, maxResults: number = 10, language: string = 'en'): Promise<FatSecretSearchResult | null> {
        try {
            const response = await fetch(`${API_BASE}/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, max_results: maxResults, language })
            });

            if (!response.ok) {
                console.error('FatSecret search error:', response.status);
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('FatSecret search request failed:', error);
            return null;
        }
    }

    /**
     * Get detailed food info by ID
     */
    async getFoodById(foodId: string): Promise<FatSecretFood | null> {
        try {
            const response = await fetch(`${API_BASE}/food/${foodId}`);

            if (!response.ok) {
                console.error('FatSecret get food error:', response.status);
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('FatSecret get food failed:', error);
            return null;
        }
    }

    /**
     * Scan barcode (UPC/EAN) - 90%+ coverage globally
     * Falls back to Open Food Facts if not found
     */
    async scanBarcode(barcode: string): Promise<FatSecretFood | null> {
        try {
            const response = await fetch(`${API_BASE}/barcode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barcode })
            });

            if (!response.ok) {
                console.error('FatSecret barcode error:', response.status);
                return null;
            }

            const data = await response.json();
            return data.food || null;
        } catch (error) {
            console.error('FatSecret barcode scan failed:', error);
            return null;
        }
    }

    /**
     * Natural Language Processing - parse text like "2 eggs and toast with butter"
     * Supports 24 languages including Russian
     */
    async parseNaturalLanguage(text: string, language: string = 'en'): Promise<FatSecretNLPResult | null> {
        try {
            const response = await fetch(`${API_BASE}/nlp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language })
            });

            if (!response.ok) {
                console.error('FatSecret NLP error:', response.status);
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('FatSecret NLP failed:', error);
            return null;
        }
    }

    /**
     * AI Image Recognition - analyze food photo (Premier feature)
     * Returns detected foods with confidence scores and estimated servings
     */
    async recognizeImage(base64Image: string, language: string = 'en'): Promise<FatSecretImageResult | null> {
        try {
            // Remove data URL prefix if present
            const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

            const response = await fetch(`${API_BASE}/image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: cleanBase64, language })
            });

            if (!response.ok) {
                console.error('FatSecret image recognition error:', response.status);
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('FatSecret image recognition failed:', error);
            return null;
        }
    }

    /**
     * Autocomplete suggestions for search input
     */
    async getAutocomplete(query: string, maxResults: number = 5): Promise<string[]> {
        try {
            const response = await fetch(`${API_BASE}/autocomplete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, max_results: maxResults })
            });

            if (!response.ok) return [];

            const data = await response.json();
            return data.suggestions || [];
        } catch (error) {
            console.error('FatSecret autocomplete failed:', error);
            return [];
        }
    }

    /**
     * Calculate nutrition for a specific serving
     */
    calculateNutrition(serving: FatSecretServing, amount: number = 1): {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
        grams?: number;
    } {
        return {
            calories: Math.round(serving.calories * amount),
            protein: Math.round(serving.protein * amount * 10) / 10,
            fat: Math.round(serving.fat * amount * 10) / 10,
            carbs: Math.round(serving.carbohydrate * amount * 10) / 10,
            grams: serving.metric_serving_amount ? Math.round(serving.metric_serving_amount * amount) : undefined
        };
    }

    /**
     * Convert FatSecret food to our internal format
     */
    toInternalFormat(food: FatSecretFood, serving?: FatSecretServing): {
        name: string;
        brand?: string;
        macros: { calories: number; protein: number; fat: number; carbs: number };
        portionGrams: number;
        servingDescription: string;
        source: 'fatsecret';
        confidence: number;
    } {
        const s = serving || food.servings[0];

        return {
            name: food.brand_name ? `${food.brand_name} ${food.food_name}` : food.food_name,
            brand: food.brand_name,
            macros: {
                calories: Math.round(s.calories),
                protein: Math.round(s.protein * 10) / 10,
                fat: Math.round(s.fat * 10) / 10,
                carbs: Math.round(s.carbohydrate * 10) / 10
            },
            portionGrams: s.metric_serving_amount || 100,
            servingDescription: s.serving_description,
            source: 'fatsecret',
            confidence: 95 // FatSecret data is verified
        };
    }
}

export const fatSecretService = new FatSecretService();
export default fatSecretService;
