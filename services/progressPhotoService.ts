// Progress Photos Service
// Before/After photo management inspired by umax.app

export interface ProgressPhoto {
    id: string;
    type: 'before' | 'after' | 'progress';
    imageUri: string; // base64
    date: string; // ISO date
    weight?: number; // kg
    notes?: string;
    metrics?: {
        streak: number;
        totalHabits: number;
        avgEnergy: number;
    };
}

export interface PhotoComparison {
    beforePhoto: ProgressPhoto;
    afterPhoto: ProgressPhoto;
    daysDifference: number;
    metricsChange: {
        weight?: number;
        streak: number;
        habits: number;
    };
}

// Storage
const PHOTOS_STORAGE_KEY = 'dd_progress_photos';

export const loadProgressPhotos = (): ProgressPhoto[] => {
    const saved = localStorage.getItem(PHOTOS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
};

export const saveProgressPhotos = (photos: ProgressPhoto[]): void => {
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
};

// Add new progress photo
export const addProgressPhoto = (
    imageUri: string,
    type: ProgressPhoto['type'],
    weight?: number,
    notes?: string,
    metrics?: ProgressPhoto['metrics']
): ProgressPhoto => {
    const photos = loadProgressPhotos();

    const newPhoto: ProgressPhoto = {
        id: `photo_${Date.now()}`,
        type,
        imageUri,
        date: new Date().toISOString(),
        weight,
        notes,
        metrics
    };

    photos.push(newPhoto);
    saveProgressPhotos(photos);

    return newPhoto;
};

// Get before/after pairs for comparison
export const getPhotoComparisons = (): PhotoComparison[] => {
    const photos = loadProgressPhotos();
    const comparisons: PhotoComparison[] = [];

    const beforePhotos = photos.filter(p => p.type === 'before');
    const afterPhotos = photos.filter(p => p.type === 'after');

    // Match before with closest after photo
    for (const before of beforePhotos) {
        const afterCandidates = afterPhotos.filter(a =>
            new Date(a.date) > new Date(before.date)
        );

        if (afterCandidates.length > 0) {
            const after = afterCandidates[0]; // Take first chronologically
            const daysDiff = Math.floor(
                (new Date(after.date).getTime() - new Date(before.date).getTime()) / (24 * 60 * 60 * 1000)
            );

            comparisons.push({
                beforePhoto: before,
                afterPhoto: after,
                daysDifference: daysDiff,
                metricsChange: {
                    weight: before.weight && after.weight ? after.weight - before.weight : undefined,
                    streak: (after.metrics?.streak || 0) - (before.metrics?.streak || 0),
                    habits: (after.metrics?.totalHabits || 0) - (before.metrics?.totalHabits || 0)
                }
            });
        }
    }

    return comparisons;
};

// Delete photo
export const deleteProgressPhoto = (photoId: string): void => {
    const photos = loadProgressPhotos();
    saveProgressPhotos(photos.filter(p => p.id !== photoId));
};

// Get latest photo
export const getLatestPhoto = (): ProgressPhoto | null => {
    const photos = loadProgressPhotos();
    if (photos.length === 0) return null;

    return photos.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
};

// Photo timeline for visualization
export const getPhotoTimeline = (): ProgressPhoto[] => {
    const photos = loadProgressPhotos();
    return photos.sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
};
