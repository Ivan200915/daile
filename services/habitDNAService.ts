// Habit DNA Service  
// Unique DNA helix visualization of user's habit patterns

export interface HabitDNAData {
    date: string;
    habits: {
        id: string;
        completed: boolean;
        category: 'health' | 'fitness' | 'nutrition' | 'mindfulness';
    }[];
}

export interface DNAStrand {
    x: number;
    y: number;
    color: string;
    size: number;
    habitId: string;
    completed: boolean;
}

// Category colors for DNA visualization
const DNA_COLORS = {
    health: '#FF6B6B',      // Red
    fitness: '#00D4AA',     // Teal
    nutrition: '#FFD700',   // Gold
    mindfulness: '#667eea'  // Purple
};

// Generate DNA helix visualization data
export const generateHabitDNA = (logs: HabitDNAData[], width: number, height: number): {
    leftStrand: DNAStrand[];
    rightStrand: DNAStrand[];
    connections: { from: DNAStrand; to: DNAStrand }[];
} => {
    const leftStrand: DNAStrand[] = [];
    const rightStrand: DNAStrand[] = [];
    const connections: { from: DNAStrand; to: DNAStrand }[] = [];

    const centerX = width / 2;
    const amplitude = width * 0.35; // Helix radius
    const frequency = 0.08; // How tight the spiral is
    const spacing = height / (logs.length * 2); // Vertical spacing

    logs.forEach((log, logIndex) => {
        log.habits.forEach((habit, habitIndex) => {
            const yPos = logIndex * spacing * 2 + habitIndex * (spacing / 2);
            const angle = yPos * frequency;

            // Left strand (sine wave)
            const leftX = centerX + Math.sin(angle) * amplitude;
            const leftNode: DNAStrand = {
                x: leftX,
                y: yPos,
                color: DNA_COLORS[habit.category],
                size: habit.completed ? 8 : 4,
                habitId: habit.id,
                completed: habit.completed
            };
            leftStrand.push(leftNode);

            // Right strand (opposite phase sine wave)
            const rightX = centerX + Math.sin(angle + Math.PI) * amplitude;
            const rightNode: DNAStrand = {
                x: rightX,
                y: yPos,
                color: DNA_COLORS[habit.category],
                size: habit.completed ? 8 : 4,
                habitId: habit.id,
                completed: habit.completed
            };
            rightStrand.push(rightNode);

            // Connection between strands
            connections.push({ from: leftNode, to: rightNode });
        });
    });

    return { leftStrand, rightStrand, connections };
};

// Render DNA to canvas
export const renderHabitDNA = (
    canvasId: string,
    logs: HabitDNAData[]
): void => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Generate DNA data
    const dna = generateHabitDNA(logs, width, height);

    // Draw connections (rungs of the ladder)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    dna.connections.forEach(conn => {
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.stroke();
    });

    // Draw left strand
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    dna.leftStrand.forEach((node, i) => {
        if (i === 0) {
            ctx.moveTo(node.x, node.y);
        } else {
            ctx.lineTo(node.x, node.y);
        }
    });
    ctx.stroke();

    // Draw right strand
    ctx.beginPath();
    dna.rightStrand.forEach((node, i) => {
        if (i === 0) {
            ctx.moveTo(node.x, node.y);
        } else {
            ctx.lineTo(node.x, node.y);
        }
    });
    ctx.stroke();

    // Draw nodes (habits)
    [...dna.leftStrand, ...dna.rightStrand].forEach(node => {
        ctx.fillStyle = node.completed ? node.color : `${node.color}40`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect for completed habits
        if (node.completed) {
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });
};

// Get DNA pattern summary
export const getDNASummary = (logs: HabitDNAData[]): {
    dominantCategory: string;
    dominantCategoryRu: string;
    completionRate: number;
    patternStrength: number; // 0-100
} => {
    const categoryCounts: Record<string, number> = {
        health: 0,
        fitness: 0,
        nutrition: 0,
        mindfulness: 0
    };

    let totalHabits = 0;
    let completedHabits = 0;

    logs.forEach(log => {
        log.habits.forEach(habit => {
            categoryCounts[habit.category]++;
            totalHabits++;
            if (habit.completed) completedHabits++;
        });
    });

    const dominant = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
    const completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

    // Pattern strength based on consistency
    const variance = Object.values(categoryCounts).reduce((acc, val) => {
        const mean = totalHabits / 4;
        return acc + Math.abs(val - mean);
    }, 0);
    const patternStrength = Math.max(0, 100 - (variance / totalHabits) * 100);

    const categoryNamesRu: Record<string, string> = {
        health: 'Здоровье',
        fitness: 'Фитнес',
        nutrition: 'Питание',
        mindfulness: 'Осознанность'
    };

    return {
        dominantCategory: dominant[0],
        dominantCategoryRu: categoryNamesRu[dominant[0]],
        completionRate: Math.round(completionRate),
        patternStrength: Math.round(patternStrength)
    };
};
