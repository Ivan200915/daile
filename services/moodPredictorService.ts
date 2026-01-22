// Mood Predictor Service
// AI-based mood prediction for tomorrow based on habits and patterns

export interface MoodData {
    date: string;
    mood: number; // 1-5
    energy: number; // 1-10
    habits: {
        workout: boolean;
        meditation: boolean;
        sleep: number; // hours
        steps: number;
    };
}

export interface MoodPrediction {
    predictedMood: number; // 1-5
    confidence: number; // 0-100%
    factors: {
        factor: string;
        factorRu: string;
        impact: 'positive' | 'negative' | 'neutral';
        weight: number;
    }[];
    recommendation: string;
    recommendationRu: string;
}

// Simple ML-inspired mood prediction
export const predictTomorrowMood = (
    historyData: MoodData[],
    todayHabits: {
        workout: boolean;
        meditation: boolean;
        sleep: number;
        steps: number;
    }
): MoodPrediction => {
    if (historyData.length < 3) {
        return {
            predictedMood: 3,
            confidence: 20,
            factors: [],
            recommendation: 'Need more data for accurate prediction',
            recommendationRu: 'Нужно больше данных для точного прогноза'
        };
    }

    const factors: MoodPrediction['factors'] = [];
    let moodScore = 3; // Baseline neutral mood
    let confidenceScore = 40;

    // Factor 1: Workout correlation
    const workoutDays = historyData.filter(d => d.habits.workout);
    if (workoutDays.length >= 2) {
        const avgMoodWithWorkout = workoutDays.reduce((sum, d) => sum + d.mood, 0) / workoutDays.length;
        const noWorkoutDays = historyData.filter(d => !d.habits.workout);
        const avgMoodNoWorkout = noWorkoutDays.length > 0
            ? noWorkoutDays.reduce((sum, d) => sum + d.mood, 0) / noWorkoutDays.length
            : 3;

        const workoutImpact = avgMoodWithWorkout - avgMoodNoWorkout;

        if (todayHabits.workout) {
            moodScore += workoutImpact * 0.4;
            factors.push({
                factor: 'Workout completed',
                factorRu: 'Тренировка выполнена',
                impact: workoutImpact > 0 ? 'positive' : 'negative',
                weight: Math.abs(workoutImpact)
            });
            confidenceScore += 15;
        }
    }

    // Factor 2: Sleep correlation
    const avgSleep = historyData.reduce((sum, d) => sum + d.habits.sleep, 0) / historyData.length;
    const sleepDeviation = todayHabits.sleep - avgSleep;

    if (Math.abs(sleepDeviation) > 1) {
        const sleepImpact = sleepDeviation > 0 ? 0.3 : -0.5;
        moodScore += sleepImpact;
        factors.push({
            factor: sleepDeviation > 0 ? 'Extra sleep' : 'Sleep deficit',
            factorRu: sleepDeviation > 0 ? 'Дополнительный сон' : 'Недосып',
            impact: sleepDeviation > 0 ? 'positive' : 'negative',
            weight: Math.abs(sleepImpact)
        });
        confidenceScore += 10;
    }

    // Factor 3: Meditation
    const meditationDays = historyData.filter(d => d.habits.meditation);
    if (meditationDays.length >= 2) {
        const avgMoodWithMed = meditationDays.reduce((sum, d) => sum + d.mood, 0) / meditationDays.length;

        if (todayHabits.meditation && avgMoodWithMed > 3) {
            moodScore += 0.4;
            factors.push({
                factor: 'Meditation practiced',
                factorRu: 'Медитация выполнена',
                impact: 'positive',
                weight: 0.4
            });
            confidenceScore += 10;
        }
    }

    // Factor 4: Steps/Activity
    const avgSteps = historyData.reduce((sum, d) => sum + d.habits.steps, 0) / historyData.length;
    if (todayHabits.steps > avgSteps * 1.2) {
        moodScore += 0.3;
        factors.push({
            factor: 'High activity',
            factorRu: 'Высокая активность',
            impact: 'positive',
            weight: 0.3
        });
        confidenceScore += 8;
    } else if (todayHabits.steps < avgSteps * 0.5) {
        moodScore -= 0.2;
        factors.push({
            factor: 'Low activity',
            factorRu: 'Низкая активность',
            impact: 'negative',
            weight: 0.2
        });
        confidenceScore += 5;
    }

    // Trend analysis - recent mood trajectory
    const recentDays = historyData.slice(-3);
    const moodTrend = recentDays.length >= 3
        ? (recentDays[2].mood - recentDays[0].mood) / 2
        : 0;

    if (Math.abs(moodTrend) > 0.5) {
        moodScore += moodTrend * 0.3;
        factors.push({
            factor: moodTrend > 0 ? 'Positive trend' : 'Negative trend',
            factorRu: moodTrend > 0 ? 'Позитивный тренд' : 'Негативный тренд',
            impact: moodTrend > 0 ? 'positive' : 'negative',
            weight: Math.abs(moodTrend * 0.3)
        });
        confidenceScore += 12;
    }

    // Clamp mood score to 1-5 range
    const finalMood = Math.max(1, Math.min(5, Math.round(moodScore)));

    // Generate recommendation
    let recommendation = '';
    let recommendationRu = '';

    if (finalMood <= 2) {
        recommendation = 'Try meditation and extra sleep to boost mood';
        recommendationRu = 'Попробуй медитацию и дополнительный сон для улучшения настроения';
    } else if (finalMood >= 4) {
        recommendation = 'Keep up the great work! Maintain your habits';
        recommendationRu = 'Продолжай в том же духе! Сохраняй свои привычки';
    } else {
        recommendation = 'Add a workout or walk to improve tomorrow';
        recommendationRu = 'Добавь тренировку или прогулку для улучшения';
    }

    return {
        predictedMood: finalMood,
        confidence: Math.min(95, confidenceScore),
        factors: factors.sort((a, b) => b.weight - a.weight),
        recommendation,
        recommendationRu
    };
};

// Get mood emoji
export const getMoodEmoji = (mood: number): string => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[mood - 1] || '😐';
};

// Get mood label
export const getMoodLabel = (mood: number): { en: string; ru: string } => {
    const labels = [
        { en: 'Very Sad', ru: 'Очень грустно' },
        { en: 'Sad', ru: 'Грустно' },
        { en: 'Neutral', ru: 'Нормально' },
        { en: 'Happy', ru: 'Хорошо' },
        { en: 'Very Happy', ru: 'Отлично' }
    ];
    return labels[mood - 1] || labels[2];
};
