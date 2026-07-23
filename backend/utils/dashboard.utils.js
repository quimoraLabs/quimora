import QuizAttempt from "../models/quizAttempt.model.js";

export const calculateDashboardMetrics = (completedAttempts) => {
    const totalTestsTaken = completedAttempts.length;
    const scores = completedAttempts.map((attempt) => attempt.score);

    const averageScore = parseFloat(
        (scores.reduce((sum, score) => sum + score, 0) / totalTestsTaken).toFixed(2)
    );
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    const performanceTrend = completedAttempts
        .slice(0, 8)
        .reverse()
        .map((attempt) => ({
            label: new Date(attempt.completedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
            score: attempt.score,
        }));

    const predictedNextScore = (() => {
        if (performanceTrend.length <= 1) {
            return performanceTrend[0]?.score ?? averageScore;
        }
        const firstScore = performanceTrend[0].score;
        const lastScore = performanceTrend[performanceTrend.length - 1].score;
        const slope = (lastScore - firstScore) / (performanceTrend.length - 1);
        return Number(Math.min(100, Math.max(0, lastScore + slope)).toFixed(1));
    })();

    const tagBuckets = completedAttempts.reduce((acc, attempt) => {
        const tags = Array.isArray(attempt.quizId?.tags) ? attempt.quizId.tags : [];
        tags.forEach((tag) => {
            const tagKey = typeof tag === "object" ? tag.toString() : tag;
            if (!acc[tagKey]) acc[tagKey] = { totalScore: 0, count: 0 };
            acc[tagKey].totalScore += attempt.score;
            acc[tagKey].count += 1;
        });
        return acc;
    }, {});

    const weakAreas = Object.entries(tagBuckets)
        .map(([tag, bucket]) => ({
            tag,
            averageScore: parseFloat((bucket.totalScore / bucket.count).toFixed(1)),
            attempts: bucket.count,
        }))
        .sort((a, b) => a.averageScore - b.averageScore)
        .slice(0, 4);

    return {
        totalTestsTaken,
        averageScore,
        maxScore,
        minScore,
        performanceTrend,
        predictedNextScore,
        weakAreas,
    };
};

export const getLeaderboardData = async (userId) => {
    const globalLeaderboard = await QuizAttempt.aggregate([
        { $match: { status: "completed" } },
        {
            $group: {
                _id: "$userId",
                averageScore: { $avg: "$score" },
                totalTests: { $sum: 1 },
                maxScore: { $max: "$score" },
            },
        },
        { $sort: { averageScore: -1, totalTests: -1 } },
        { $limit: 20 },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: "$user" },
        {
            $project: {
                _id: 0,
                userId: "$_id",
                name: "$user.name",
                averageScore: { $round: ["$averageScore", 2] },
                totalTests: 1,
                maxScore: 1,
            },
        },
    ]);

    const rankPipeline = await QuizAttempt.aggregate([
        { $match: { status: "completed" } },
        {
            $group: {
                _id: "$userId",
                averageScore: { $avg: "$score" },
                totalTests: { $sum: 1 },
            },
        },
        { $sort: { averageScore: -1, totalTests: -1 } },
    ]);

    const currentRank =
        rankPipeline.findIndex((entry) => entry._id.toString() === userId) + 1 || null;

    const leaderboard = globalLeaderboard.map((entry, index) => ({
        rank: index + 1,
        name: entry.name,
        averageScore: entry.averageScore,
        totalTests: entry.totalTests,
        isMe: entry.userId.toString() === userId,
    }));

    return { leaderboard, currentRank };
};