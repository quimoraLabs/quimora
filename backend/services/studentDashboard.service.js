import QuizAttempt from "../models/quizAttempt.model.js";

/**
 * Service to process student performance analytics and dashboard aggregation
 */
export const fetchStudentDashboardAnalytics = async (userId) => {
    // 1. Fetch all completed attempts for the student
    const completedAttempts = await QuizAttempt.find({
        userId,
        status: "completed",
    })
        .sort({ completedAt: -1 })
        .populate({ path: "quizId", select: "title tags" })
        .lean();

    // Return empty structure if new student with no completed quizzes
    if (!completedAttempts || completedAttempts.length === 0) {
        return {
            totalTestsTaken: 0,
            averageScore: 0,
            maxScore: 0,
            minScore: 0,
            currentRank: null,
            latestResult: null,
            performanceTrend: [],
            predictedNextScore: 0,
            weakAreas: [],
            recentHistory: [],
            leaderboard: [],
        };
    }

    // 2. Compute Core Score Metrics
    const totalTestsTaken = completedAttempts.length;
    const scores = completedAttempts.map((attempt) => attempt.score);
    const averageScore = parseFloat(
        (scores.reduce((sum, score) => sum + score, 0) / totalTestsTaken).toFixed(2)
    );
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const latestAttempt = completedAttempts[0];

    // 3. Format History and Performance Trend
    const recentHistory = completedAttempts.slice(0, 5).map((attempt) => ({
        id: attempt._id,
        quizTitle: attempt.quizId?.title || "Untitled Quiz",
        score: attempt.score,
        status: attempt.status,
        completedAt: attempt.completedAt,
        totalQuestions: attempt.totalQuestions,
        correctAnswersCount: attempt.correctAnswersCount,
        timeTakenInSeconds: attempt.timeTaken,
        tags: Array.isArray(attempt.quizId?.tags) ? attempt.quizId.tags : [],
    }));

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

    // 4. Calculate Predicted Next Score (Linear Slope)
    const predictedNextScore = (() => {
        if (performanceTrend.length <= 1) {
            return performanceTrend[0]?.score ?? averageScore;
        }
        const firstScore = performanceTrend[0].score;
        const lastScore = performanceTrend[performanceTrend.length - 1].score;
        const slope = (lastScore - firstScore) / (performanceTrend.length - 1);
        return Number(Math.min(100, Math.max(0, lastScore + slope)).toFixed(1));
    })();

    // 5. Group and Calculate Weak Areas by Tags
    const tagBuckets = completedAttempts.reduce((acc, attempt) => {
        const tags = Array.isArray(attempt.quizId?.tags) ? attempt.quizId.tags : [];
        tags.forEach((tag) => {
            const tagKey = typeof tag === "object" ? tag.toString() : tag;
            if (!acc[tagKey]) {
                acc[tagKey] = { totalScore: 0, count: 0 };
            }
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

    // 6. Optimized MongoDB Aggregation for Global Leaderboard & User Rank
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
        {
            $facet: {
                top20: [
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
                ],
                allRanks: [
                    {
                        $project: {
                            userId: "$_id",
                        },
                    },
                ],
            },
        },
    ]);

    const top20Data = globalLeaderboard[0]?.top20 || [];
    const allRanksData = globalLeaderboard[0]?.allRanks || [];

    const userRankIndex = allRanksData.findIndex(
        (entry) => entry.userId.toString() === userId
    );
    const currentRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

    const leaderboard = top20Data.map((entry, index) => ({
        rank: index + 1,
        name: entry.name,
        averageScore: entry.averageScore,
        totalTests: entry.totalTests,
        isMe: entry.userId.toString() === userId,
    }));

    // 7. Consolidate Payload
    return {
        totalTestsTaken,
        averageScore,
        maxScore,
        minScore,
        currentRank,
        latestResult: {
            quizTitle: latestAttempt.quizId?.title || "Untitled Quiz",
            score: latestAttempt.score,
            completedAt: latestAttempt.completedAt,
            status: latestAttempt.status,
            totalQuestions: latestAttempt.totalQuestions,
            correctAnswersCount: latestAttempt.correctAnswersCount,
            timeTakenInSeconds: latestAttempt.timeTaken,
        },
        performanceTrend,
        predictedNextScore,
        weakAreas,
        recentHistory,
        leaderboard,
    };
};