// Umax Service - Mock AI Face Analysis

export interface FaceAnalysis {
    id: string;
    date: string;
    overallScore: number;
    potentialScore: number;
    categories: {
        jawline: number;
        cheekbones: number;
        skinQuality: number;
        masculinity: number;
        symmetry: number;
        eyes: number;
    };
    recommendations: Recommendation[];
}

export interface Recommendation {
    id: string;
    title: string;
    description: string;
    category: string;
    impact: 'High' | 'Medium' | 'Low';
}

const RECOMMENDATIONS_DB: Record<string, Recommendation[]> = {
    jawline: [
        { id: 'mewing', title: 'Start Mewing', description: 'Keep your tongue on the roof of your mouth to improve jaw definition.', category: 'jawline', impact: 'High' },
        { id: 'chewing', title: 'Chew Hard Gum', description: 'Exercise your masseter muscles by chewing mastic gum.', category: 'jawline', impact: 'Medium' }
    ],
    skinQuality: [
        { id: 'water', title: 'Increase Water Intake', description: 'Drink 3L of water daily for clearer skin.', category: 'skin', impact: 'High' },
        { id: 'skincare', title: 'Vitamin C Serum', description: 'Apply Vitamin C serum morning and night.', category: 'skin', impact: 'Medium' }
    ],
    eyes: [
        { id: 'sleep', title: 'Optimize Sleep', description: 'Get 8+ hours of sleep to reduce dark circles.', category: 'eyes', impact: 'High' },
        { id: 'ice', title: 'Ice Morning Routine', description: 'Apply ice to eyes in the morning to reduce puffiness.', category: 'eyes', impact: 'Low' }
    ]
};

// Simulate AI Analysis
export const analyzeFace = async (imageUri?: string): Promise<FaceAnalysis> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generate random plausible scores (mostly good for positive reinforcement)
    const jawline = Math.floor(Math.random() * (95 - 75) + 75);
    const cheekbones = Math.floor(Math.random() * (90 - 70) + 70);
    const skin = Math.floor(Math.random() * (90 - 60) + 60); // More variable
    const masculinity = Math.floor(Math.random() * (95 - 80) + 80);
    const symmetry = Math.floor(Math.random() * (98 - 85) + 85);
    const eyes = Math.floor(Math.random() * (95 - 75) + 75);

    const overall = Math.round((jawline + cheekbones + skin + masculinity + symmetry + eyes) / 6);
    const potential = Math.min(100, overall + Math.floor(Math.random() * (15 - 8) + 8));

    // Pick recommendations based on lowest scores
    const recs: Recommendation[] = [];
    if (jawline < 85) recs.push(...RECOMMENDATIONS_DB.jawline);
    if (skin < 80) recs.push(...RECOMMENDATIONS_DB.skinQuality);
    if (eyes < 85) recs.push(...RECOMMENDATIONS_DB.eyes);

    return {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        overallScore: overall,
        potentialScore: potential,
        categories: {
            jawline,
            cheekbones,
            skinQuality: skin,
            masculinity,
            symmetry,
            eyes
        },
        recommendations: recs.slice(0, 4) // Limit to 4
    };
};
