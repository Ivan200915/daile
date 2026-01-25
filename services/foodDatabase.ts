// Food Database Service - База популярных блюд с точными данными КБЖУ
// Источник: USDA, калоризатор.ру

export interface DishNutrition {
    name: string;
    nameRu: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    fatPer100g: number;
    carbsPer100g: number;
    typicalPortionGrams: number;
    category: 'russian' | 'asian' | 'european' | 'american' | 'salad' | 'soup' | 'dessert' | 'drink';
    keywords: string[]; // для поиска по AI-ответу
}

// База популярных блюд с точными данными
export const DISH_DATABASE: DishNutrition[] = [
    // Русская кухня
    {
        name: 'Pilaf',
        nameRu: 'Плов',
        caloriesPer100g: 150,
        proteinPer100g: 6,
        fatPer100g: 6,
        carbsPer100g: 18,
        typicalPortionGrams: 300,
        category: 'asian',
        keywords: ['плов', 'pilaf', 'plov', 'рис с мясом']
    },
    {
        name: 'Borscht',
        nameRu: 'Борщ',
        caloriesPer100g: 49,
        proteinPer100g: 2.8,
        fatPer100g: 2.5,
        carbsPer100g: 3.8,
        typicalPortionGrams: 350,
        category: 'soup',
        keywords: ['борщ', 'borscht', 'borsch', 'свекольный суп']
    },
    {
        name: 'Pelmeni',
        nameRu: 'Пельмени',
        caloriesPer100g: 275,
        proteinPer100g: 12,
        fatPer100g: 14,
        carbsPer100g: 25,
        typicalPortionGrams: 250,
        category: 'russian',
        keywords: ['пельмени', 'pelmeni', 'dumplings']
    },
    {
        name: 'Olivier Salad',
        nameRu: 'Оливье',
        caloriesPer100g: 198,
        proteinPer100g: 5.4,
        fatPer100g: 16,
        carbsPer100g: 8,
        typicalPortionGrams: 200,
        category: 'salad',
        keywords: ['оливье', 'olivier', 'russian salad', 'зимний салат']
    },
    {
        name: 'Shchi',
        nameRu: 'Щи',
        caloriesPer100g: 32,
        proteinPer100g: 1.8,
        fatPer100g: 1.5,
        carbsPer100g: 3,
        typicalPortionGrams: 350,
        category: 'soup',
        keywords: ['щи', 'shchi', 'капустный суп', 'cabbage soup']
    },
    {
        name: 'Buckwheat with Meat',
        nameRu: 'Гречка с мясом',
        caloriesPer100g: 153,
        proteinPer100g: 8.5,
        fatPer100g: 6,
        carbsPer100g: 17,
        typicalPortionGrams: 280,
        category: 'russian',
        keywords: ['гречка', 'buckwheat', 'гречневая каша']
    },
    {
        name: 'Chicken Cutlet',
        nameRu: 'Котлета куриная',
        caloriesPer100g: 190,
        proteinPer100g: 18,
        fatPer100g: 10,
        carbsPer100g: 6,
        typicalPortionGrams: 100,
        category: 'russian',
        keywords: ['котлета', 'cutlet', 'куриная котлета', 'chicken patty']
    },
    {
        name: 'Mashed Potatoes',
        nameRu: 'Картофельное пюре',
        caloriesPer100g: 106,
        proteinPer100g: 2.5,
        fatPer100g: 4,
        carbsPer100g: 15,
        typicalPortionGrams: 200,
        category: 'russian',
        keywords: ['пюре', 'mashed potatoes', 'картошка', 'картофель']
    },

    // Азиатская кухня
    {
        name: 'Fried Rice',
        nameRu: 'Жареный рис',
        caloriesPer100g: 163,
        proteinPer100g: 4,
        fatPer100g: 6,
        carbsPer100g: 23,
        typicalPortionGrams: 250,
        category: 'asian',
        keywords: ['жареный рис', 'fried rice', 'рис с овощами']
    },
    {
        name: 'Sushi Roll',
        nameRu: 'Ролл',
        caloriesPer100g: 145,
        proteinPer100g: 5.5,
        fatPer100g: 3,
        carbsPer100g: 24,
        typicalPortionGrams: 180,
        category: 'asian',
        keywords: ['ролл', 'суши', 'sushi', 'roll', 'маки']
    },
    {
        name: 'Ramen',
        nameRu: 'Рамен',
        caloriesPer100g: 68,
        proteinPer100g: 4,
        fatPer100g: 2.5,
        carbsPer100g: 8,
        typicalPortionGrams: 500,
        category: 'asian',
        keywords: ['рамен', 'ramen', 'лапша', 'noodle soup']
    },

    // Общие блюда
    {
        name: 'Grilled Chicken Breast',
        nameRu: 'Куриная грудка',
        caloriesPer100g: 165,
        proteinPer100g: 31,
        fatPer100g: 3.6,
        carbsPer100g: 0,
        typicalPortionGrams: 150,
        category: 'european',
        keywords: ['куриная грудка', 'chicken breast', 'курица', 'грудка']
    },
    {
        name: 'Pasta Carbonara',
        nameRu: 'Паста Карбонара',
        caloriesPer100g: 191,
        proteinPer100g: 8,
        fatPer100g: 9,
        carbsPer100g: 20,
        typicalPortionGrams: 350,
        category: 'european',
        keywords: ['карбонара', 'carbonara', 'паста', 'спагетти']
    },
    {
        name: 'Caesar Salad',
        nameRu: 'Салат Цезарь',
        caloriesPer100g: 127,
        proteinPer100g: 7,
        fatPer100g: 8,
        carbsPer100g: 6,
        typicalPortionGrams: 250,
        category: 'salad',
        keywords: ['цезарь', 'caesar', 'салат с курицей']
    },
    {
        name: 'Scrambled Eggs',
        nameRu: 'Яичница',
        caloriesPer100g: 149,
        proteinPer100g: 10,
        fatPer100g: 11,
        carbsPer100g: 1.6,
        typicalPortionGrams: 150,
        category: 'european',
        keywords: ['яичница', 'scrambled eggs', 'омлет', 'omelette']
    },
    {
        name: 'Oatmeal',
        nameRu: 'Овсянка',
        caloriesPer100g: 68,
        proteinPer100g: 2.5,
        fatPer100g: 1.4,
        carbsPer100g: 12,
        typicalPortionGrams: 250,
        category: 'european',
        keywords: ['овсянка', 'oatmeal', 'каша', 'porridge']
    },
    {
        name: 'Greek Salad',
        nameRu: 'Греческий салат',
        caloriesPer100g: 85,
        proteinPer100g: 3,
        fatPer100g: 6,
        carbsPer100g: 5,
        typicalPortionGrams: 250,
        category: 'salad',
        keywords: ['греческий', 'greek', 'с фетой', 'с сыром']
    },
    {
        name: 'Burger',
        nameRu: 'Бургер',
        caloriesPer100g: 250,
        proteinPer100g: 13,
        fatPer100g: 14,
        carbsPer100g: 19,
        typicalPortionGrams: 200,
        category: 'american',
        keywords: ['бургер', 'burger', 'гамбургер', 'hamburger']
    },
    {
        name: 'Pizza Margherita',
        nameRu: 'Пицца Маргарита',
        caloriesPer100g: 266,
        proteinPer100g: 11,
        fatPer100g: 10,
        carbsPer100g: 33,
        typicalPortionGrams: 150,
        category: 'european',
        keywords: ['пицца', 'pizza', 'маргарита']
    },
    {
        name: 'French Fries',
        nameRu: 'Картошка фри',
        caloriesPer100g: 312,
        proteinPer100g: 3.4,
        fatPer100g: 15,
        carbsPer100g: 41,
        typicalPortionGrams: 150,
        category: 'american',
        keywords: ['фри', 'fries', 'картошка фри', 'french fries']
    }
];

// Поиск блюда в базе по названию
export function findDishInDatabase(dishName: string): DishNutrition | null {
    const lowerName = dishName.toLowerCase();

    for (const dish of DISH_DATABASE) {
        // Проверяем ключевые слова
        for (const keyword of dish.keywords) {
            if (lowerName.includes(keyword.toLowerCase())) {
                return dish;
            }
        }
        // Проверяем название
        if (lowerName.includes(dish.name.toLowerCase()) ||
            lowerName.includes(dish.nameRu.toLowerCase())) {
            return dish;
        }
    }

    return null;
}

// Расчет КБЖУ для порции
export function calculateNutrition(dish: DishNutrition, portionGrams: number) {
    const multiplier = portionGrams / 100;
    return {
        calories: Math.round(dish.caloriesPer100g * multiplier),
        protein: Math.round(dish.proteinPer100g * multiplier * 10) / 10,
        fat: Math.round(dish.fatPer100g * multiplier * 10) / 10,
        carbs: Math.round(dish.carbsPer100g * multiplier * 10) / 10,
        portionGrams
    };
}

// Размеры порций
export type PortionSize = 'small' | 'medium' | 'large' | 'custom';

export function getPortionMultiplier(size: PortionSize): number {
    switch (size) {
        case 'small': return 0.7;
        case 'medium': return 1.0;
        case 'large': return 1.4;
        case 'custom': return 1.0;
    }
}
