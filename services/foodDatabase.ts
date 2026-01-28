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
    },

    // === ДОПОЛНИТЕЛЬНАЯ РУССКАЯ/СНГ КУХНЯ ===
    {
        name: 'Shawarma',
        nameRu: 'Шаурма',
        caloriesPer100g: 215,
        proteinPer100g: 11,
        fatPer100g: 12,
        carbsPer100g: 16,
        typicalPortionGrams: 350,
        category: 'asian',
        keywords: ['шаурма', 'шаверма', 'shawarma', 'донер', 'doner']
    },
    {
        name: 'Manti',
        nameRu: 'Манты',
        caloriesPer100g: 220,
        proteinPer100g: 10,
        fatPer100g: 12,
        carbsPer100g: 18,
        typicalPortionGrams: 300,
        category: 'asian',
        keywords: ['манты', 'manti', 'mante']
    },
    {
        name: 'Lagman',
        nameRu: 'Лагман',
        caloriesPer100g: 95,
        proteinPer100g: 5,
        fatPer100g: 4,
        carbsPer100g: 10,
        typicalPortionGrams: 400,
        category: 'asian',
        keywords: ['лагман', 'lagman', 'лапша']
    },
    {
        name: 'Chebureki',
        nameRu: 'Чебуреки',
        caloriesPer100g: 280,
        proteinPer100g: 9,
        fatPer100g: 16,
        carbsPer100g: 25,
        typicalPortionGrams: 150,
        category: 'russian',
        keywords: ['чебурек', 'cheburek', 'чебуреки']
    },
    {
        name: 'Khinkali',
        nameRu: 'Хинкали',
        caloriesPer100g: 235,
        proteinPer100g: 11,
        fatPer100g: 10,
        carbsPer100g: 25,
        typicalPortionGrams: 250,
        category: 'russian',
        keywords: ['хинкали', 'khinkali']
    },
    {
        name: 'Solyanka',
        nameRu: 'Солянка',
        caloriesPer100g: 69,
        proteinPer100g: 5.5,
        fatPer100g: 3.5,
        carbsPer100g: 4,
        typicalPortionGrams: 350,
        category: 'soup',
        keywords: ['солянка', 'solyanka']
    },
    {
        name: 'Okroshka',
        nameRu: 'Окрошка',
        caloriesPer100g: 52,
        proteinPer100g: 2.8,
        fatPer100g: 2,
        carbsPer100g: 5.5,
        typicalPortionGrams: 350,
        category: 'soup',
        keywords: ['окрошка', 'okroshka']
    },
    {
        name: 'Blini with Sour Cream',
        nameRu: 'Блины со сметаной',
        caloriesPer100g: 189,
        proteinPer100g: 5,
        fatPer100g: 8,
        carbsPer100g: 24,
        typicalPortionGrams: 200,
        category: 'russian',
        keywords: ['блины', 'блинчики', 'blini', 'pancakes', 'crepes']
    },
    {
        name: 'Syrniki',
        nameRu: 'Сырники',
        caloriesPer100g: 183,
        proteinPer100g: 12,
        fatPer100g: 7,
        carbsPer100g: 18,
        typicalPortionGrams: 200,
        category: 'russian',
        keywords: ['сырники', 'syrniki', 'творожники']
    },
    {
        name: 'Vareniki',
        nameRu: 'Вареники',
        caloriesPer100g: 155,
        proteinPer100g: 5,
        fatPer100g: 3,
        carbsPer100g: 27,
        typicalPortionGrams: 250,
        category: 'russian',
        keywords: ['вареники', 'vareniki']
    },

    // === FAST FOOD ===
    {
        name: 'Big Mac',
        nameRu: 'Биг Мак',
        caloriesPer100g: 229,
        proteinPer100g: 12,
        fatPer100g: 11,
        carbsPer100g: 20,
        typicalPortionGrams: 215,
        category: 'american',
        keywords: ['биг мак', 'big mac', 'бигмак']
    },
    {
        name: 'Chicken Nuggets',
        nameRu: 'Куриные наггетсы',
        caloriesPer100g: 296,
        proteinPer100g: 15,
        fatPer100g: 18,
        carbsPer100g: 18,
        typicalPortionGrams: 100,
        category: 'american',
        keywords: ['наггетсы', 'nuggets', 'наги']
    },
    {
        name: 'KFC Chicken',
        nameRu: 'KFC Курица',
        caloriesPer100g: 260,
        proteinPer100g: 18,
        fatPer100g: 16,
        carbsPer100g: 11,
        typicalPortionGrams: 150,
        category: 'american',
        keywords: ['kfc', 'кфс', 'ростикс', 'острые крылышки']
    },
    {
        name: 'Hot Dog',
        nameRu: 'Хот-дог',
        caloriesPer100g: 290,
        proteinPer100g: 10,
        fatPer100g: 18,
        carbsPer100g: 22,
        typicalPortionGrams: 150,
        category: 'american',
        keywords: ['хот-дог', 'хотдог', 'hot dog']
    },

    // === НАПИТКИ ===
    {
        name: 'Latte',
        nameRu: 'Латте',
        caloriesPer100g: 56,
        proteinPer100g: 3,
        fatPer100g: 3,
        carbsPer100g: 4,
        typicalPortionGrams: 300,
        category: 'drink',
        keywords: ['латте', 'latte', 'кофе латте']
    },
    {
        name: 'Cappuccino',
        nameRu: 'Капучино',
        caloriesPer100g: 45,
        proteinPer100g: 2.5,
        fatPer100g: 2.5,
        carbsPer100g: 3.5,
        typicalPortionGrams: 250,
        category: 'drink',
        keywords: ['капучино', 'cappuccino']
    },
    {
        name: 'Americano',
        nameRu: 'Американо',
        caloriesPer100g: 2,
        proteinPer100g: 0.1,
        fatPer100g: 0,
        carbsPer100g: 0.3,
        typicalPortionGrams: 300,
        category: 'drink',
        keywords: ['американо', 'americano', 'черный кофе']
    },
    {
        name: 'Orange Juice',
        nameRu: 'Апельсиновый сок',
        caloriesPer100g: 45,
        proteinPer100g: 0.7,
        fatPer100g: 0.2,
        carbsPer100g: 10,
        typicalPortionGrams: 250,
        category: 'drink',
        keywords: ['апельсиновый сок', 'orange juice', 'сок']
    },
    {
        name: 'Smoothie',
        nameRu: 'Смузи',
        caloriesPer100g: 65,
        proteinPer100g: 1.5,
        fatPer100g: 0.5,
        carbsPer100g: 14,
        typicalPortionGrams: 350,
        category: 'drink',
        keywords: ['смузи', 'smoothie']
    },
    {
        name: 'Beer',
        nameRu: 'Пиво',
        caloriesPer100g: 43,
        proteinPer100g: 0.5,
        fatPer100g: 0,
        carbsPer100g: 3.5,
        typicalPortionGrams: 500,
        category: 'drink',
        keywords: ['пиво', 'beer']
    },
    {
        name: 'Wine',
        nameRu: 'Вино',
        caloriesPer100g: 83,
        proteinPer100g: 0.1,
        fatPer100g: 0,
        carbsPer100g: 2.6,
        typicalPortionGrams: 150,
        category: 'drink',
        keywords: ['вино', 'wine', 'красное вино', 'белое вино']
    },

    // === ЗАВТРАКИ ===
    {
        name: 'Fried Eggs',
        nameRu: 'Яичница глазунья',
        caloriesPer100g: 196,
        proteinPer100g: 13,
        fatPer100g: 15,
        carbsPer100g: 1,
        typicalPortionGrams: 120,
        category: 'european',
        keywords: ['глазунья', 'fried eggs', 'яйца жареные']
    },
    {
        name: 'Cottage Cheese',
        nameRu: 'Творог',
        caloriesPer100g: 121,
        proteinPer100g: 17,
        fatPer100g: 5,
        carbsPer100g: 2,
        typicalPortionGrams: 200,
        category: 'european',
        keywords: ['творог', 'cottage cheese', 'творожок']
    },
    {
        name: 'Yogurt',
        nameRu: 'Йогурт',
        caloriesPer100g: 65,
        proteinPer100g: 4,
        fatPer100g: 2,
        carbsPer100g: 8,
        typicalPortionGrams: 200,
        category: 'european',
        keywords: ['йогурт', 'yogurt', 'йогурт натуральный']
    },
    {
        name: 'Granola',
        nameRu: 'Гранола',
        caloriesPer100g: 471,
        proteinPer100g: 10,
        fatPer100g: 20,
        carbsPer100g: 64,
        typicalPortionGrams: 50,
        category: 'european',
        keywords: ['гранола', 'granola', 'мюсли']
    },
    {
        name: 'Toast with Butter',
        nameRu: 'Тост с маслом',
        caloriesPer100g: 313,
        proteinPer100g: 7,
        fatPer100g: 12,
        carbsPer100g: 45,
        typicalPortionGrams: 60,
        category: 'european',
        keywords: ['тост', 'toast', 'хлеб с маслом']
    },
    {
        name: 'Avocado Toast',
        nameRu: 'Тост с авокадо',
        caloriesPer100g: 220,
        proteinPer100g: 5,
        fatPer100g: 12,
        carbsPer100g: 24,
        typicalPortionGrams: 150,
        category: 'european',
        keywords: ['авокадо тост', 'avocado toast']
    },

    // === СЛАДКОЕ И ДЕСЕРТЫ ===
    {
        name: 'Chocolate Bar',
        nameRu: 'Шоколад',
        caloriesPer100g: 546,
        proteinPer100g: 5,
        fatPer100g: 31,
        carbsPer100g: 60,
        typicalPortionGrams: 50,
        category: 'dessert',
        keywords: ['шоколад', 'chocolate', 'шоколадка']
    },
    {
        name: 'Ice Cream',
        nameRu: 'Мороженое',
        caloriesPer100g: 207,
        proteinPer100g: 4,
        fatPer100g: 11,
        carbsPer100g: 24,
        typicalPortionGrams: 100,
        category: 'dessert',
        keywords: ['мороженое', 'ice cream', 'пломбир']
    },
    {
        name: 'Cake',
        nameRu: 'Торт',
        caloriesPer100g: 350,
        proteinPer100g: 5,
        fatPer100g: 18,
        carbsPer100g: 42,
        typicalPortionGrams: 100,
        category: 'dessert',
        keywords: ['торт', 'cake', 'пирожное']
    },
    {
        name: 'Croissant',
        nameRu: 'Круассан',
        caloriesPer100g: 406,
        proteinPer100g: 8,
        fatPer100g: 21,
        carbsPer100g: 46,
        typicalPortionGrams: 60,
        category: 'dessert',
        keywords: ['круассан', 'croissant']
    },
    {
        name: 'Donut',
        nameRu: 'Пончик',
        caloriesPer100g: 421,
        proteinPer100g: 5,
        fatPer100g: 22,
        carbsPer100g: 51,
        typicalPortionGrams: 65,
        category: 'dessert',
        keywords: ['пончик', 'donut', 'донат']
    },

    // === СНЕКИ ===
    {
        name: 'Potato Chips',
        nameRu: 'Чипсы',
        caloriesPer100g: 536,
        proteinPer100g: 7,
        fatPer100g: 35,
        carbsPer100g: 50,
        typicalPortionGrams: 50,
        category: 'american',
        keywords: ['чипсы', 'chips', 'lays', 'pringles']
    },
    {
        name: 'Nuts Mix',
        nameRu: 'Орехи',
        caloriesPer100g: 607,
        proteinPer100g: 20,
        fatPer100g: 54,
        carbsPer100g: 16,
        typicalPortionGrams: 30,
        category: 'european',
        keywords: ['орехи', 'nuts', 'миндаль', 'almonds', 'кешью']
    },
    {
        name: 'Protein Bar',
        nameRu: 'Протеиновый батончик',
        caloriesPer100g: 380,
        proteinPer100g: 25,
        fatPer100g: 12,
        carbsPer100g: 40,
        typicalPortionGrams: 60,
        category: 'european',
        keywords: ['протеиновый батончик', 'protein bar', 'батончик']
    },

    // === ГАРНИРЫ ===
    {
        name: 'White Rice',
        nameRu: 'Белый рис',
        caloriesPer100g: 130,
        proteinPer100g: 2.7,
        fatPer100g: 0.3,
        carbsPer100g: 28,
        typicalPortionGrams: 180,
        category: 'asian',
        keywords: ['рис', 'rice', 'белый рис']
    },
    {
        name: 'Pasta',
        nameRu: 'Макароны',
        caloriesPer100g: 131,
        proteinPer100g: 5,
        fatPer100g: 1.1,
        carbsPer100g: 25,
        typicalPortionGrams: 200,
        category: 'european',
        keywords: ['макароны', 'pasta', 'спагетти', 'spaghetti']
    },
    {
        name: 'Boiled Potatoes',
        nameRu: 'Отварной картофель',
        caloriesPer100g: 82,
        proteinPer100g: 2,
        fatPer100g: 0.4,
        carbsPer100g: 17,
        typicalPortionGrams: 200,
        category: 'european',
        keywords: ['отварной картофель', 'boiled potatoes', 'картошка']
    },
    {
        name: 'Steamed Vegetables',
        nameRu: 'Овощи на пару',
        caloriesPer100g: 35,
        proteinPer100g: 2,
        fatPer100g: 0.3,
        carbsPer100g: 6,
        typicalPortionGrams: 200,
        category: 'european',
        keywords: ['овощи на пару', 'steamed vegetables', 'овощи']
    },

    // === МЯСО И РЫБА ===
    {
        name: 'Beef Steak',
        nameRu: 'Стейк из говядины',
        caloriesPer100g: 271,
        proteinPer100g: 26,
        fatPer100g: 18,
        carbsPer100g: 0,
        typicalPortionGrams: 200,
        category: 'european',
        keywords: ['стейк', 'steak', 'говядина', 'beef']
    },
    {
        name: 'Salmon Fillet',
        nameRu: 'Филе лосося',
        caloriesPer100g: 208,
        proteinPer100g: 20,
        fatPer100g: 13,
        carbsPer100g: 0,
        typicalPortionGrams: 150,
        category: 'european',
        keywords: ['лосось', 'salmon', 'семга', 'рыба']
    },
    {
        name: 'Shrimp',
        nameRu: 'Креветки',
        caloriesPer100g: 99,
        proteinPer100g: 24,
        fatPer100g: 0.3,
        carbsPer100g: 0.2,
        typicalPortionGrams: 150,
        category: 'european',
        keywords: ['креветки', 'shrimp', 'морепродукты']
    },
    {
        name: 'Pork Chop',
        nameRu: 'Свиная отбивная',
        caloriesPer100g: 242,
        proteinPer100g: 27,
        fatPer100g: 14,
        carbsPer100g: 0,
        typicalPortionGrams: 150,
        category: 'european',
        keywords: ['свинина', 'pork', 'отбивная', 'свиная котлета']
    },

    // === СУПЫ ===
    {
        name: 'Chicken Soup',
        nameRu: 'Куриный суп',
        caloriesPer100g: 36,
        proteinPer100g: 3.5,
        fatPer100g: 1.2,
        carbsPer100g: 3,
        typicalPortionGrams: 350,
        category: 'soup',
        keywords: ['куриный суп', 'chicken soup', 'бульон']
    },
    {
        name: 'Tom Yum',
        nameRu: 'Том Ям',
        caloriesPer100g: 45,
        proteinPer100g: 4,
        fatPer100g: 2,
        carbsPer100g: 3,
        typicalPortionGrams: 350,
        category: 'asian',
        keywords: ['том ям', 'tom yum', 'тайский суп']
    },
    {
        name: 'Pho',
        nameRu: 'Фо',
        caloriesPer100g: 40,
        proteinPer100g: 3.5,
        fatPer100g: 1,
        carbsPer100g: 4,
        typicalPortionGrams: 500,
        category: 'asian',
        keywords: ['фо', 'pho', 'вьетнамский суп']
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

// =====================================================
// БАЗА ПРОСТЫХ ИНГРЕДИЕНТОВ для автоподсказки
// =====================================================
export interface IngredientData {
    name: string;
    nameRu: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    fatPer100g: number;
    carbsPer100g: number;
}

export const INGREDIENTS_DATABASE: IngredientData[] = [
    // Овощи
    { name: 'Cucumber', nameRu: 'Огурец', caloriesPer100g: 15, proteinPer100g: 0.7, fatPer100g: 0.1, carbsPer100g: 2.5 },
    { name: 'Tomato', nameRu: 'Помидор', caloriesPer100g: 20, proteinPer100g: 1, fatPer100g: 0.2, carbsPer100g: 4 },
    { name: 'Carrot', nameRu: 'Морковь', caloriesPer100g: 35, proteinPer100g: 1.3, fatPer100g: 0.1, carbsPer100g: 7 },
    { name: 'Cabbage', nameRu: 'Капуста', caloriesPer100g: 27, proteinPer100g: 1.8, fatPer100g: 0.1, carbsPer100g: 5 },
    { name: 'Onion', nameRu: 'Лук', caloriesPer100g: 41, proteinPer100g: 1.4, fatPer100g: 0.2, carbsPer100g: 8.2 },
    { name: 'Pepper', nameRu: 'Перец', caloriesPer100g: 27, proteinPer100g: 1.3, fatPer100g: 0, carbsPer100g: 5.3 },
    { name: 'Garlic', nameRu: 'Чеснок', caloriesPer100g: 143, proteinPer100g: 6.5, fatPer100g: 0.5, carbsPer100g: 30 },
    { name: 'Broccoli', nameRu: 'Брокколи', caloriesPer100g: 34, proteinPer100g: 2.8, fatPer100g: 0.4, carbsPer100g: 7 },
    { name: 'Spinach', nameRu: 'Шпинат', caloriesPer100g: 23, proteinPer100g: 2.9, fatPer100g: 0.4, carbsPer100g: 2 },
    { name: 'Lettuce', nameRu: 'Салат', caloriesPer100g: 14, proteinPer100g: 1.2, fatPer100g: 0.2, carbsPer100g: 2.3 },
    { name: 'Zucchini', nameRu: 'Кабачок', caloriesPer100g: 24, proteinPer100g: 0.6, fatPer100g: 0.3, carbsPer100g: 5 },
    { name: 'Eggplant', nameRu: 'Баклажан', caloriesPer100g: 24, proteinPer100g: 1.2, fatPer100g: 0.1, carbsPer100g: 4.5 },
    { name: 'Potato', nameRu: 'Картофель', caloriesPer100g: 77, proteinPer100g: 2, fatPer100g: 0.4, carbsPer100g: 17 },

    // Крупы и гарниры
    { name: 'Rice', nameRu: 'Рис вареный', caloriesPer100g: 130, proteinPer100g: 2.7, fatPer100g: 0.3, carbsPer100g: 28 },
    { name: 'Buckwheat', nameRu: 'Гречка вареная', caloriesPer100g: 110, proteinPer100g: 4, fatPer100g: 1, carbsPer100g: 21 },
    { name: 'Pasta', nameRu: 'Макароны', caloriesPer100g: 130, proteinPer100g: 4.5, fatPer100g: 0.5, carbsPer100g: 26 },
    { name: 'Bread', nameRu: 'Хлеб', caloriesPer100g: 265, proteinPer100g: 9, fatPer100g: 3.2, carbsPer100g: 49 },

    // Мясо и рыба
    { name: 'Chicken', nameRu: 'Курица', caloriesPer100g: 165, proteinPer100g: 31, fatPer100g: 3.6, carbsPer100g: 0 },
    { name: 'Beef', nameRu: 'Говядина', caloriesPer100g: 250, proteinPer100g: 26, fatPer100g: 15, carbsPer100g: 0 },
    { name: 'Pork', nameRu: 'Свинина', caloriesPer100g: 285, proteinPer100g: 25, fatPer100g: 20, carbsPer100g: 0 },
    { name: 'Fish', nameRu: 'Рыба', caloriesPer100g: 120, proteinPer100g: 21, fatPer100g: 3, carbsPer100g: 0 },
    { name: 'Salmon', nameRu: 'Лосось', caloriesPer100g: 208, proteinPer100g: 20, fatPer100g: 13, carbsPer100g: 0 },
    { name: 'Egg', nameRu: 'Яйцо', caloriesPer100g: 155, proteinPer100g: 12.5, fatPer100g: 11, carbsPer100g: 0.7 },

    // Молочные продукты
    { name: 'Cheese', nameRu: 'Сыр', caloriesPer100g: 350, proteinPer100g: 25, fatPer100g: 28, carbsPer100g: 0 },
    { name: 'Cottage cheese', nameRu: 'Творог', caloriesPer100g: 120, proteinPer100g: 18, fatPer100g: 5, carbsPer100g: 2 },
    { name: 'Sour cream', nameRu: 'Сметана', caloriesPer100g: 193, proteinPer100g: 2.5, fatPer100g: 20, carbsPer100g: 3.4 },
    { name: 'Butter', nameRu: 'Сливочное масло', caloriesPer100g: 717, proteinPer100g: 0.5, fatPer100g: 81, carbsPer100g: 0.1 },
    { name: 'Milk', nameRu: 'Молоко', caloriesPer100g: 60, proteinPer100g: 3.2, fatPer100g: 3.6, carbsPer100g: 4.7 },
    { name: 'Yogurt', nameRu: 'Йогурт', caloriesPer100g: 65, proteinPer100g: 4, fatPer100g: 1.5, carbsPer100g: 7 },

    // Соусы и масла
    { name: 'Cream sauce', nameRu: 'Сливочный соус', caloriesPer100g: 180, proteinPer100g: 2, fatPer100g: 15, carbsPer100g: 8 },
    { name: 'Tomato sauce', nameRu: 'Томатный соус', caloriesPer100g: 45, proteinPer100g: 1.5, fatPer100g: 0.5, carbsPer100g: 8 },
    { name: 'Mayonnaise', nameRu: 'Майонез', caloriesPer100g: 680, proteinPer100g: 1, fatPer100g: 75, carbsPer100g: 2.6 },
    { name: 'Ketchup', nameRu: 'Кетчуп', caloriesPer100g: 97, proteinPer100g: 1.8, fatPer100g: 0, carbsPer100g: 22 },
    { name: 'Soy sauce', nameRu: 'Соевый соус', caloriesPer100g: 53, proteinPer100g: 8, fatPer100g: 0, carbsPer100g: 5 },
    { name: 'Olive oil', nameRu: 'Оливковое масло', caloriesPer100g: 884, proteinPer100g: 0, fatPer100g: 100, carbsPer100g: 0 },
    { name: 'Vegetable oil', nameRu: 'Подсолнечное масло', caloriesPer100g: 899, proteinPer100g: 0, fatPer100g: 100, carbsPer100g: 0 },
    { name: 'Cheese sauce', nameRu: 'Сырный соус', caloriesPer100g: 200, proteinPer100g: 5, fatPer100g: 16, carbsPer100g: 8 },
    { name: 'Garlic sauce', nameRu: 'Чесночный соус', caloriesPer100g: 350, proteinPer100g: 1, fatPer100g: 36, carbsPer100g: 6 },

    // Фрукты и ягоды
    { name: 'Apple', nameRu: 'Яблоко', caloriesPer100g: 52, proteinPer100g: 0.3, fatPer100g: 0.2, carbsPer100g: 14 },
    { name: 'Banana', nameRu: 'Банан', caloriesPer100g: 96, proteinPer100g: 1.5, fatPer100g: 0.2, carbsPer100g: 21 },
    { name: 'Orange', nameRu: 'Апельсин', caloriesPer100g: 43, proteinPer100g: 0.9, fatPer100g: 0.2, carbsPer100g: 9 },
    { name: 'Strawberry', nameRu: 'Клубника', caloriesPer100g: 33, proteinPer100g: 0.8, fatPer100g: 0.4, carbsPer100g: 7.7 },
    { name: 'Grapes', nameRu: 'Виноград', caloriesPer100g: 72, proteinPer100g: 0.6, fatPer100g: 0.6, carbsPer100g: 17 },

    // Орехи
    { name: 'Walnuts', nameRu: 'Грецкие орехи', caloriesPer100g: 654, proteinPer100g: 15, fatPer100g: 65, carbsPer100g: 7 },
    { name: 'Almonds', nameRu: 'Миндаль', caloriesPer100g: 579, proteinPer100g: 21, fatPer100g: 50, carbsPer100g: 10 },
    { name: 'Peanuts', nameRu: 'Арахис', caloriesPer100g: 567, proteinPer100g: 26, fatPer100g: 49, carbsPer100g: 16 },

    // Сладости
    { name: 'Sugar', nameRu: 'Сахар', caloriesPer100g: 399, proteinPer100g: 0, fatPer100g: 0, carbsPer100g: 100 },
    { name: 'Honey', nameRu: 'Мёд', caloriesPer100g: 304, proteinPer100g: 0.3, fatPer100g: 0, carbsPer100g: 82 },
    { name: 'Chocolate', nameRu: 'Шоколад', caloriesPer100g: 546, proteinPer100g: 5, fatPer100g: 31, carbsPer100g: 59 },
];

// Поиск ингредиентов для автоподсказки
export function searchIngredients(query: string, limit: number = 5): IngredientData[] {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const results: IngredientData[] = [];

    for (const ingredient of INGREDIENTS_DATABASE) {
        const matchRu = ingredient.nameRu.toLowerCase().includes(lowerQuery);
        const matchEn = ingredient.name.toLowerCase().includes(lowerQuery);

        if (matchRu || matchEn) {
            results.push(ingredient);
            if (results.length >= limit) break;
        }
    }

    // Также ищем в блюдах
    for (const dish of DISH_DATABASE) {
        if (results.length >= limit) break;

        const matchRu = dish.nameRu.toLowerCase().includes(lowerQuery);
        const matchEn = dish.name.toLowerCase().includes(lowerQuery);
        const matchKeywords = dish.keywords.some(k => k.toLowerCase().includes(lowerQuery));

        if (matchRu || matchEn || matchKeywords) {
            // Преобразуем блюдо в формат ингредиента
            results.push({
                name: dish.name,
                nameRu: dish.nameRu,
                caloriesPer100g: dish.caloriesPer100g,
                proteinPer100g: dish.proteinPer100g,
                fatPer100g: dish.fatPer100g,
                carbsPer100g: dish.carbsPer100g
            });
        }
    }

    return results.slice(0, limit);
}
