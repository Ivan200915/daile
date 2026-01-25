// AI Insights Service - Correlation Analysis and Personal Recommendations

// Correlation Analysis Data
export interface CorrelationData {
    sleepHours: number[];
    energyLevels: number[];
    productivityScores: number[];
    moodRatings: number[];
    steps: number[];
}

export interface CorrelationInsight {
    pattern: string;
    correlation: 'positive' | 'negative' | 'neutral';
    strength: number;
    recommendation: string;
    emoji: string;
}

export const analyzeCorrelations = async (data: CorrelationData, isRu: boolean): Promise<CorrelationInsight[]> => {
    // Mock correlations based on data patterns
    const avgSleep = data.sleepHours.reduce((a, b) => a + b, 0) / data.sleepHours.length;
    const avgEnergy = data.energyLevels.reduce((a, b) => a + b, 0) / data.energyLevels.length;
    const avgMood = data.moodRatings.reduce((a, b) => a + b, 0) / data.moodRatings.length;
    const avgSteps = data.steps.reduce((a, b) => a + b, 0) / data.steps.length;

    const insights: CorrelationInsight[] = [];

    // Sleep → Energy correlation
    if (avgSleep < 7) {
        insights.push({
            pattern: isRu ? 'Недосып снижает энергию' : 'Low sleep reduces energy',
            correlation: 'negative',
            strength: 82,
            recommendation: isRu ? 'Ложись на час раньше — энергия вырастет на 20%' : 'Go to bed 1h earlier for 20% more energy',
            emoji: '😴'
        });
    } else {
        insights.push({
            pattern: isRu ? 'Хороший сон = высокая энергия' : 'Good sleep = high energy',
            correlation: 'positive',
            strength: 78,
            recommendation: isRu ? 'Поддерживай режим сна!' : 'Keep your sleep schedule!',
            emoji: '✨'
        });
    }

    // Steps → Mood correlation
    if (avgSteps > 7000) {
        insights.push({
            pattern: isRu ? 'Активность улучшает настроение' : 'Activity improves mood',
            correlation: 'positive',
            strength: 71,
            recommendation: isRu ? 'Твоя активность — супер! Продолжай в том же духе' : 'Your activity is great! Keep it up',
            emoji: '🚶'
        });
    } else {
        insights.push({
            pattern: isRu ? 'Мало движения = низкое настроение' : 'Low movement = low mood',
            correlation: 'negative',
            strength: 65,
            recommendation: isRu ? 'Добавь 15-минутную прогулку — настроение улучшится' : 'Add a 15-min walk to boost mood',
            emoji: '😔'
        });
    }

    // Productivity pattern
    const productivityTrend = data.productivityScores[6] - data.productivityScores[0];
    if (productivityTrend > 10) {
        insights.push({
            pattern: isRu ? 'Продуктивность растёт!' : 'Productivity is rising!',
            correlation: 'positive',
            strength: 85,
            recommendation: isRu ? 'Ты на подъёме — используй этот момент' : 'You\'re on a roll - use this momentum',
            emoji: '📈'
        });
    } else if (productivityTrend < -10) {
        insights.push({
            pattern: isRu ? 'Продуктивность падает' : 'Productivity declining',
            correlation: 'negative',
            strength: 60,
            recommendation: isRu ? 'Сделай перерыв и пересмотри приоритеты' : 'Take a break and review priorities',
            emoji: '📉'
        });
    }

    // Energy → Productivity
    if (avgEnergy > 6 && data.productivityScores[6] > 70) {
        insights.push({
            pattern: isRu ? 'Энергия влияет на результаты' : 'Energy drives results',
            correlation: 'positive',
            strength: 88,
            recommendation: isRu ? 'Высокая энергия = высокая продуктивность. Так держать!' : 'High energy = high output. Keep it up!',
            emoji: '⚡'
        });
    }

    return insights;
};

export interface PersonalRecommendation {
    category: 'sleep' | 'activity' | 'nutrition' | 'habits' | 'mindset';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
}

export const generatePersonalRecommendations = (
    userData: { avgSleep: number; avgSteps: number; habitCompletion: number; moodAvg: number },
    isRu: boolean
): PersonalRecommendation[] => {
    const recommendations: PersonalRecommendation[] = [];

    // Sleep recommendations
    if (userData.avgSleep < 7) {
        recommendations.push({
            category: 'sleep',
            title: isRu ? '🚨 Критично: Недосып' : '🚨 Critical: Sleep Deficit',
            description: isRu
                ? `Ты спишь ${userData.avgSleep.toFixed(1)}ч в среднем. Это снижает энергию и концентрацию. Ложись на 1 час раньше.`
                : `You average ${userData.avgSleep.toFixed(1)}h sleep. This hurts energy and focus. Go to bed 1h earlier.`,
            priority: 'high',
            icon: '😴'
        });
    }

    // Activity recommendations  
    if (userData.avgSteps < 5000) {
        recommendations.push({
            category: 'activity',
            title: isRu ? 'Больше движения' : 'More Movement Needed',
            description: isRu
                ? `${userData.avgSteps} шагов — ниже нормы. Добавь 2 короткие прогулки по 10 минут.`
                : `${userData.avgSteps} steps is below target. Add two 10-min walks.`,
            priority: 'high',
            icon: '🚶'
        });
    } else if (userData.avgSteps < 8000) {
        recommendations.push({
            category: 'activity',
            title: isRu ? 'Почти у цели' : 'Almost There',
            description: isRu
                ? `${userData.avgSteps} шагов — неплохо! Ещё 2000 шагов и будет отлично.`
                : `${userData.avgSteps} steps is good! 2000 more and you'll hit your goal.`,
            priority: 'medium',
            icon: '👟'
        });
    }

    // Habit recommendations
    if (userData.habitCompletion < 50) {
        recommendations.push({
            category: 'habits',
            title: isRu ? 'Фокус на привычках' : 'Focus on Habits',
            description: isRu
                ? `Всего ${userData.habitCompletion}% привычек выполнено. Начни с 2-3 ключевых привычек.`
                : `Only ${userData.habitCompletion}% habits completed. Start with 2-3 key habits.`,
            priority: 'high',
            icon: '🎯'
        });
    } else if (userData.habitCompletion < 80) {
        recommendations.push({
            category: 'habits',
            title: isRu ? 'Хороший прогресс' : 'Good Progress',
            description: isRu
                ? `${userData.habitCompletion}% — отличный результат! Сфокусируйся на оставшихся.`
                : `${userData.habitCompletion}% is great! Focus on the remaining ones.`,
            priority: 'medium',
            icon: '📈'
        });
    }

    // Mood recommendations
    if (userData.moodAvg < 3) {
        recommendations.push({
            category: 'mindset',
            title: isRu ? 'Позаботься о себе' : 'Self-Care Time',
            description: isRu
                ? 'Твоё настроение ниже обычного. Попробуй медитацию или прогулку на свежем воздухе.'
                : 'Your mood is below average. Try meditation or outdoor walks.',
            priority: 'high',
            icon: '🧘'
        });
    }

    // General wellness
    if (recommendations.length < 2) {
        recommendations.push({
            category: 'mindset',
            title: isRu ? 'Ты молодец!' : 'You\'re Doing Great!',
            description: isRu
                ? 'Все показатели в норме. Продолжай в том же духе и не забывай отдыхать.'
                : 'All metrics are good. Keep it up and remember to rest.',
            priority: 'low',
            icon: '⭐'
        });
    }

    return recommendations;
};
