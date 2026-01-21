// Virtual Pet Service
// A companion that grows with user's progress

export interface VirtualPet {
    name: string;
    type: 'cat' | 'dog' | 'panda' | 'dragon';
    level: number;
    experience: number;
    happiness: number; // 0-100
    lastFed: string | null; // ISO date
    outfit: string | null;
    createdAt: string;
}

// Pet evolution stages with emojis
export const PET_STAGES = {
    cat: ['🐱', '😺', '😸', '😻', '🦁'],
    dog: ['🐶', '🐕', '🦮', '🐺', '🦊'],
    panda: ['🐼', '🐻', '🧸', '🐻‍❄️', '🦝'],
    dragon: ['🥚', '🐉', '🔥', '⚡', '👑']
};

// Get pet emoji based on level
export const getPetEmoji = (pet: VirtualPet): string => {
    const stages = PET_STAGES[pet.type];
    const stageIndex = Math.min(Math.floor(pet.level / 5), stages.length - 1);
    return stages[stageIndex];
};

// Pet mood based on happiness
export const getPetMood = (pet: VirtualPet): { emoji: string; text: string; textRu: string } => {
    if (pet.happiness >= 80) return { emoji: '😊', text: 'Very Happy', textRu: 'Очень счастлив' };
    if (pet.happiness >= 60) return { emoji: '🙂', text: 'Happy', textRu: 'Счастлив' };
    if (pet.happiness >= 40) return { emoji: '😐', text: 'Okay', textRu: 'Нормально' };
    if (pet.happiness >= 20) return { emoji: '😕', text: 'Sad', textRu: 'Грустит' };
    return { emoji: '😢', text: 'Very Sad', textRu: 'Очень грустит' };
};

// Experience needed for each level
export const getExpForLevel = (level: number): number => {
    return 50 * level;
};

// Storage
const PET_STORAGE_KEY = 'dd_virtual_pet';

export const loadPet = (): VirtualPet | null => {
    const saved = localStorage.getItem(PET_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
};

export const savePet = (pet: VirtualPet): void => {
    localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(pet));
};

export const createPet = (name: string, type: VirtualPet['type']): VirtualPet => {
    const pet: VirtualPet = {
        name,
        type,
        level: 1,
        experience: 0,
        happiness: 100,
        lastFed: null,
        outfit: null,
        createdAt: new Date().toISOString()
    };
    savePet(pet);
    return pet;
};

// Feed pet (happens when user completes habits)
export const feedPet = (): { pet: VirtualPet; levelUp: boolean } | null => {
    const pet = loadPet();
    if (!pet) return null;

    const today = new Date().toISOString().split('T')[0];

    // Can only feed once per day
    if (pet.lastFed === today) {
        return { pet, levelUp: false };
    }

    const oldLevel = pet.level;
    pet.lastFed = today;
    pet.experience += 25;
    pet.happiness = Math.min(100, pet.happiness + 15);

    // Check level up
    while (pet.experience >= getExpForLevel(pet.level)) {
        pet.experience -= getExpForLevel(pet.level);
        pet.level++;
    }

    savePet(pet);
    return { pet, levelUp: pet.level > oldLevel };
};

// Pet happiness decays if not using app
export const updatePetHappiness = (): VirtualPet | null => {
    const pet = loadPet();
    if (!pet) return null;

    const lastFed = pet.lastFed ? new Date(pet.lastFed) : null;
    if (!lastFed) return pet;

    const daysSinceFeeding = Math.floor((Date.now() - lastFed.getTime()) / (24 * 60 * 60 * 1000));

    if (daysSinceFeeding > 1) {
        pet.happiness = Math.max(0, pet.happiness - (daysSinceFeeding * 10));
        savePet(pet);
    }

    return pet;
};

// Pet says something based on context
export const getPetMessage = (pet: VirtualPet, context: 'morning' | 'habit_done' | 'day_close' | 'streak'): string => {
    const messages = {
        morning: [
            `${pet.name} рад тебя видеть! 🌅`,
            `Доброе утро! ${pet.name} ждал тебя 💕`,
            `${pet.name}: Готов покорять день вместе? 💪`
        ],
        habit_done: [
            `${pet.name} гордится тобой! ⭐`,
            `Отлично! ${pet.name} стал счастливее 😊`,
            `${pet.name}: Так держать! 🎯`
        ],
        day_close: [
            `${pet.name} счастлив! Ты молодец! 🎉`,
            `${pet.name} вырос благодаря тебе! 📈`,
            `Супер день! ${pet.name} обожает тебя 💖`
        ],
        streak: [
            `${pet.name}: Стрик растёт! Мы команда! 🔥`,
            `${pet.name} в восторге от твоего стрика! 🏆`,
            `Вместе мы непобедимы! — ${pet.name} 💪`
        ]
    };

    const contextMessages = messages[context];
    return contextMessages[Math.floor(Math.random() * contextMessages.length)];
};

// Pet outfits (unlockable)
export const PET_OUTFITS = [
    { id: 'none', name: 'Обычный', emoji: '', unlockLevel: 1 },
    { id: 'hat', name: 'Шляпа', emoji: '🎩', unlockLevel: 5 },
    { id: 'glasses', name: 'Очки', emoji: '😎', unlockLevel: 10 },
    { id: 'crown', name: 'Корона', emoji: '👑', unlockLevel: 15 },
    { id: 'cape', name: 'Плащ', emoji: '🦸', unlockLevel: 20 },
];
