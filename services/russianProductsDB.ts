// База популярных продуктов РФ со штрих-кодами
// Топ-50 для мгновенного распознавания, остальное через Open Food Facts

export interface RussianProduct {
    barcode: string;
    name: string;
    brand?: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    fatPer100g: number;
    carbsPer100g: number;
    servingSize?: number; // типичная порция в граммах/мл
    unit?: 'g' | 'ml';
}

// Топ-50 популярных продуктов РФ
export const RUSSIAN_PRODUCTS_DB: Record<string, RussianProduct> = {
    // === НАПИТКИ ===
    '5449000000996': { barcode: '5449000000996', name: 'Coca-Cola', brand: 'Coca-Cola', caloriesPer100g: 42, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 10.6, servingSize: 330, unit: 'ml' },
    '5449000131805': { barcode: '5449000131805', name: 'Coca-Cola Zero', brand: 'Coca-Cola', caloriesPer100g: 0.3, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 0, servingSize: 330, unit: 'ml' },
    '5449000004840': { barcode: '5449000004840', name: 'Fanta', brand: 'Coca-Cola', caloriesPer100g: 42, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 10.3, servingSize: 330, unit: 'ml' },
    '5449000014535': { barcode: '5449000014535', name: 'Sprite', brand: 'Coca-Cola', caloriesPer100g: 40, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 10, servingSize: 330, unit: 'ml' },
    '4600494600012': { barcode: '4600494600012', name: 'Добрый Яблоко', brand: 'Добрый', caloriesPer100g: 46, proteinPer100g: 0.3, fatPer100g: 0, carbsPer100g: 11, servingSize: 200, unit: 'ml' },
    '4607003040475': { barcode: '4607003040475', name: 'Моя Семья Апельсин', brand: 'Моя Семья', caloriesPer100g: 45, proteinPer100g: 0.5, fatPer100g: 0, carbsPer100g: 10.5, servingSize: 200, unit: 'ml' },
    '4607149372430': { barcode: '4607149372430', name: 'Rich Апельсин', brand: 'Rich', caloriesPer100g: 48, proteinPer100g: 0.6, fatPer100g: 0, carbsPer100g: 11, servingSize: 200, unit: 'ml' },

    // === МОЛОЧКА ===
    '4600605000496': { barcode: '4600605000496', name: 'Простоквашино Молоко 2.5%', brand: 'Простоквашино', caloriesPer100g: 53, proteinPer100g: 2.9, fatPer100g: 2.5, carbsPer100g: 4.7, servingSize: 200, unit: 'ml' },
    '4600605000595': { barcode: '4600605000595', name: 'Простоквашино Молоко 3.2%', brand: 'Простоквашино', caloriesPer100g: 58, proteinPer100g: 2.9, fatPer100g: 3.2, carbsPer100g: 4.7, servingSize: 200, unit: 'ml' },
    '4607018691127': { barcode: '4607018691127', name: 'Домик в деревне Молоко 3.2%', brand: 'Домик в деревне', caloriesPer100g: 58, proteinPer100g: 3, fatPer100g: 3.2, carbsPer100g: 4.7, servingSize: 200, unit: 'ml' },
    '4607025392347': { barcode: '4607025392347', name: 'Активиа Йогурт', brand: 'Активиа', caloriesPer100g: 75, proteinPer100g: 4.5, fatPer100g: 2.9, carbsPer100g: 8.5, servingSize: 125, unit: 'g' },
    '4607025395805': { barcode: '4607025395805', name: 'Даниссимо', brand: 'Danone', caloriesPer100g: 140, proteinPer100g: 4, fatPer100g: 5.5, carbsPer100g: 19, servingSize: 130, unit: 'g' },

    // === СНЕКИ ===
    '5010029000047': { barcode: '5010029000047', name: 'Lay\'s Классические', brand: 'Lay\'s', caloriesPer100g: 535, proteinPer100g: 6, fatPer100g: 33, carbsPer100g: 52, servingSize: 40, unit: 'g' },
    '5000127510562': { barcode: '5000127510562', name: 'Pringles Original', brand: 'Pringles', caloriesPer100g: 520, proteinPer100g: 4.5, fatPer100g: 32, carbsPer100g: 52, servingSize: 40, unit: 'g' },
    '4607065370015': { barcode: '4607065370015', name: 'Cheetos', brand: 'Cheetos', caloriesPer100g: 523, proteinPer100g: 6, fatPer100g: 30, carbsPer100g: 56, servingSize: 50, unit: 'g' },
    '4607065370107': { barcode: '4607065370107', name: 'Doritos', brand: 'Doritos', caloriesPer100g: 496, proteinPer100g: 7, fatPer100g: 24, carbsPer100g: 61, servingSize: 50, unit: 'g' },

    // === ШОКОЛАД ===
    '4607018691288': { barcode: '4607018691288', name: 'Milka', brand: 'Milka', caloriesPer100g: 530, proteinPer100g: 6.5, fatPer100g: 29, carbsPer100g: 59, servingSize: 100, unit: 'g' },
    '4600682000011': { barcode: '4600682000011', name: 'Алёнка', brand: 'Красный Октябрь', caloriesPer100g: 539, proteinPer100g: 7, fatPer100g: 31, carbsPer100g: 56, servingSize: 100, unit: 'g' },
    '4607061251516': { barcode: '4607061251516', name: 'Snickers', brand: 'Mars', caloriesPer100g: 488, proteinPer100g: 8, fatPer100g: 24, carbsPer100g: 59, servingSize: 50, unit: 'g' },
    '5000159461122': { barcode: '5000159461122', name: 'Mars', brand: 'Mars', caloriesPer100g: 449, proteinPer100g: 4, fatPer100g: 17, carbsPer100g: 70, servingSize: 51, unit: 'g' },
    '4011100024571': { barcode: '4011100024571', name: 'Kinder Bueno', brand: 'Kinder', caloriesPer100g: 572, proteinPer100g: 9, fatPer100g: 37, carbsPer100g: 49, servingSize: 43, unit: 'g' },

    // === КРУПЫ/МАКАРОНЫ ===
    '4607003045470': { barcode: '4607003045470', name: 'Макфа Спагетти', brand: 'Макфа', caloriesPer100g: 344, proteinPer100g: 12, fatPer100g: 1.5, carbsPer100g: 70, servingSize: 100, unit: 'g' },
    '4607001850016': { barcode: '4607001850016', name: 'Увелка Гречка', brand: 'Увелка', caloriesPer100g: 313, proteinPer100g: 12, fatPer100g: 3, carbsPer100g: 62, servingSize: 80, unit: 'g' },
    '4607001850023': { barcode: '4607001850023', name: 'Увелка Рис', brand: 'Увелка', caloriesPer100g: 333, proteinPer100g: 7, fatPer100g: 1, carbsPer100g: 74, servingSize: 80, unit: 'g' },
    '4607067552304': { barcode: '4607067552304', name: 'Мистраль Булгур', brand: 'Мистраль', caloriesPer100g: 342, proteinPer100g: 12, fatPer100g: 1.5, carbsPer100g: 70, servingSize: 80, unit: 'g' },

    // === ХЛЕБ ===
    '4607090080033': { barcode: '4607090080033', name: 'Бородинский хлеб', brand: '', caloriesPer100g: 208, proteinPer100g: 7, fatPer100g: 1.3, carbsPer100g: 41, servingSize: 50, unit: 'g' },
    '4607090080019': { barcode: '4607090080019', name: 'Белый хлеб', brand: '', caloriesPer100g: 265, proteinPer100g: 8, fatPer100g: 3, carbsPer100g: 49, servingSize: 50, unit: 'g' },

    // === ЭНЕРГЕТИКИ ===
    '90162602': { barcode: '90162602', name: 'Red Bull', brand: 'Red Bull', caloriesPer100g: 45, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 11, servingSize: 250, unit: 'ml' },
    '5060466510012': { barcode: '5060466510012', name: 'Monster Energy', brand: 'Monster', caloriesPer100g: 47, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 11, servingSize: 500, unit: 'ml' },
    '4607150550013': { barcode: '4607150550013', name: 'Adrenaline Rush', brand: 'Adrenaline Rush', caloriesPer100g: 52, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 13, servingSize: 250, unit: 'ml' },

    // === ВОДА ===
    '4600536000019': { barcode: '4600536000019', name: 'Святой Источник', brand: 'Святой Источник', caloriesPer100g: 0, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 0, servingSize: 500, unit: 'ml' },
    '4600536002204': { barcode: '4600536002204', name: 'BonAqua', brand: 'BonAqua', caloriesPer100g: 0, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 0, servingSize: 500, unit: 'ml' },

    // === КОНСЕРВЫ ===
    '4607002290011': { barcode: '4607002290011', name: 'Тунец в собственном соку', brand: '', caloriesPer100g: 96, proteinPer100g: 21, fatPer100g: 1, carbsPer100g: 0, servingSize: 185, unit: 'g' },
    '4607002290028': { barcode: '4607002290028', name: 'Горбуша натуральная', brand: '', caloriesPer100g: 142, proteinPer100g: 21, fatPer100g: 6, carbsPer100g: 0, servingSize: 245, unit: 'g' },

    // === СОУСЫ ===
    '87157277': { barcode: '87157277', name: 'Heinz Кетчуп', brand: 'Heinz', caloriesPer100g: 101, proteinPer100g: 1.3, fatPer100g: 0.1, carbsPer100g: 24, servingSize: 15, unit: 'g' },
    '4607025394600': { barcode: '4607025394600', name: 'Махеевъ Майонез', brand: 'Махеевъ', caloriesPer100g: 680, proteinPer100g: 0.5, fatPer100g: 72, carbsPer100g: 4, servingSize: 15, unit: 'g' },
};

// Поиск продукта по штрих-коду в локальной базе
export function findProductByBarcode(barcode: string): RussianProduct | null {
    return RUSSIAN_PRODUCTS_DB[barcode] || null;
}

// Расчёт КБЖУ для порции
export function calculateProductNutrition(product: RussianProduct, portionSize?: number) {
    const portion = portionSize || product.servingSize || 100;
    const multiplier = portion / 100;

    return {
        name: product.brand ? `${product.brand} ${product.name}` : product.name,
        calories: Math.round(product.caloriesPer100g * multiplier),
        protein: Math.round(product.proteinPer100g * multiplier * 10) / 10,
        fat: Math.round(product.fatPer100g * multiplier * 10) / 10,
        carbs: Math.round(product.carbsPer100g * multiplier * 10) / 10,
        portionGrams: portion,
        source: 'local_ru' as const
    };
}
