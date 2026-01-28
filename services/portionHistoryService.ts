/**
 * Portion History Service
 * Remembers user's typical portion sizes for personalized estimates
 */

const STORAGE_KEY = 'portion_history';

export interface PortionRecord {
    name: string;           // Normalized dish name
    avgGrams: number;       // Average portion in grams
    totalGrams: number;     // Sum of all logged portions
    count: number;          // Number of times logged
    lastUpdated: number;    // Timestamp
}

export interface PortionHistory {
    records: Record<string, PortionRecord>;
    version: number;
}

// Normalize dish name for matching (lowercase, remove extra spaces)
const normalizeName = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, '') // Keep letters, numbers, spaces (unicode)
        .replace(/\s+/g, ' ')
        .trim();
};

// Get all portion history
export const getPortionHistory = (): PortionHistory => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error loading portion history:', e);
    }
    return { records: {}, version: 1 };
};

// Save portion history
const savePortionHistory = (history: PortionHistory): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('Error saving portion history:', e);
    }
};

// Find matching portion record
export const findPortionMatch = (dishName: string): PortionRecord | null => {
    const history = getPortionHistory();
    const normalized = normalizeName(dishName);

    // Exact match first
    if (history.records[normalized]) {
        return history.records[normalized];
    }

    // Fuzzy match: check if any key contains or is contained in the search
    const keys = Object.keys(history.records);
    for (const key of keys) {
        // If our dish contains a known dish name or vice versa
        if (normalized.includes(key) || key.includes(normalized)) {
            return history.records[key];
        }

        // Check for common words (for multi-word dishes)
        const searchWords = normalized.split(' ').filter(w => w.length > 2);
        const keyWords = key.split(' ').filter(w => w.length > 2);

        // If at least half of the words match
        const matchCount = searchWords.filter(w => keyWords.includes(w)).length;
        if (matchCount >= Math.ceil(searchWords.length / 2) && matchCount > 0) {
            return history.records[key];
        }
    }

    return null;
};

// Update portion history after user confirms
export const updatePortionHistory = (dishName: string, grams: number): void => {
    const history = getPortionHistory();
    const normalized = normalizeName(dishName);

    const existing = history.records[normalized];

    if (existing) {
        // Update existing record with weighted average
        const newCount = existing.count + 1;
        const newTotalGrams = existing.totalGrams + grams;
        history.records[normalized] = {
            name: normalized,
            avgGrams: Math.round(newTotalGrams / newCount),
            totalGrams: newTotalGrams,
            count: newCount,
            lastUpdated: Date.now()
        };
    } else {
        // Create new record
        history.records[normalized] = {
            name: normalized,
            avgGrams: grams,
            totalGrams: grams,
            count: 1,
            lastUpdated: Date.now()
        };
    }

    savePortionHistory(history);
};

// Get personalization context for AI prompt
export const getPersonalizationContext = (): string => {
    const history = getPortionHistory();
    const records = Object.values(history.records);

    if (records.length === 0) return '';

    // Get top 10 most frequent dishes
    const topDishes = records
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(r => `${r.name}: ${r.avgGrams}g`)
        .join(', ');

    return `USER'S TYPICAL PORTION SIZES (use these as reference for this user): ${topDishes}`;
};

// Clear all history (for testing/reset)
export const clearPortionHistory = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};
