import mongoose from "mongoose";
import Quiz from "../models/quiz.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import EloRating from "../models/eloRating.model.js";
import LevelMappingService from "./levelMapping.service.js";

/**
 * Fetch Overall Global Leaderboard across all students
 */
export const getGlobalLeaderboard = async (userId, limit = 20) => {
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
                topList: [
                    { $limit: limit },
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
                            username: "$user.username",
                            email: "$user.email",
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

    const topList = globalLeaderboard[0]?.topList || [];
    const allRanks = globalLeaderboard[0]?.allRanks || [];

    const userRankIndex = allRanks.findIndex(
        (entry) => entry.userId.toString() === userId.toString()
    );
    const currentRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

    // Fetch student profiles and Elo ratings for all top users
    const userIds = topList.map((entry) => entry.userId);
    const profiles = await StudentProfile.find({ userId: { $in: userIds } }).lean();
    const eloRecords = await EloRating.find({
        studentId: { $in: userIds },
        isArchived: false,
    }).lean();

    const levels = await LevelMappingService.getAllLevels();

    const leaderboard = topList.map((entry, index) => {
        const profile = profiles.find((p) => p.userId.toString() === entry.userId.toString());
        const userElos = eloRecords.filter(
            (r) => r.studentId.toString() === entry.userId.toString()
        );

        // Highest Elo rating from active records or profile.overallElo or 1000 default
        const elo = profile?.overallElo ||
            (userElos.length > 0 ? Math.max(...userElos.map((r) => r.rating)) : 1000);

        // Tier resolution
        const matchedLevel = levels?.find(
            (lvl) => elo >= lvl.minElo && elo < lvl.maxElo
        );
        const tier = profile?.levelName || matchedLevel?.levelName || (elo >= 1000 ? "Learner" : "Beginner");

        return {
            rank: index + 1,
            userId: entry.userId,
            name: entry.name,
            username: entry.username || entry.name?.toLowerCase().replace(/\s+/g, "_"),
            email: entry.email,
            averageScore: entry.averageScore,
            maxScore: entry.maxScore,
            score: entry.averageScore,
            totalTests: entry.totalTests,
            elo: elo,
            tier: tier,
            isMe: entry.userId.toString() === userId.toString(),
        };
    });

    return { currentRank, leaderboard };
};

/**
 * Fetch Specific Quiz Leaderboard (Ranked by Score -> Time Taken)
 */
export const getQuizLeaderboard = async (quizId, userId, limit = 50) => {
    const quizObjectId = new mongoose.Types.ObjectId(quizId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Fetch all completed attempts for this quiz, sorted by Highest Score -> Lowest Time -> Earliest Completion
    const allAttempts = await QuizAttempt.aggregate([
        {
            $match: {
                quizId: quizObjectId,
                status: "completed",
            },
        },
        {
            $sort: {
                score: -1,
                timeTaken: 1,
                completedAt: 1,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: "$user" },
        {
            $project: {
                _id: 0,
                attemptId: "$_id",
                userId: "$userId",
                name: "$user.name",
                score: 1,
                timeTakenInSeconds: "$timeTaken",
                completedAt: 1,
            },
        },
    ]);

    if (!allAttempts || allAttempts.length === 0) {
        return {
            userStats: {
                currentScore: 0,
                currentRank: null,
                bestScore: 0,
                bestRank: null,
                totalAttempts: 0,
            },
            leaderboard: [],
        };
    }

    // 2. Identify Current User's LATEST Attempt ID
    const userAttempts = allAttempts
        .filter((a) => a.userId.toString() === userId.toString())
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    const latestAttempt = userAttempts[0] || null;
    const latestAttemptId = latestAttempt ? latestAttempt.attemptId.toString() : null;

    // 3. Find User Stats (Latest Rank vs Best Rank)
    let currentRank = null;
    let bestRank = null;
    let bestScore = 0;

    if (userAttempts.length > 0) {
        // Find index of latest attempt in global sorted array
        const latestRankIndex = allAttempts.findIndex(
            (a) => a.attemptId.toString() === latestAttemptId
        );
        currentRank = latestRankIndex !== -1 ? latestRankIndex + 1 : null;

        // Best Score & Best Rank
        bestScore = Math.max(...userAttempts.map((a) => a.score));
        const bestRankIndex = allAttempts.findIndex(
            (a) => a.userId.toString() === userId.toString() && a.score === bestScore
        );
        bestRank = bestRankIndex !== -1 ? bestRankIndex + 1 : null;
    }

    // 4. Construct Final Leaderboard List
    const leaderboard = allAttempts.slice(0, limit).map((entry, index) => {
        const isCurrentAttempt =
            latestAttemptId && entry.attemptId.toString() === latestAttemptId;
        const isMe = entry.userId.toString() === userId.toString();

        return {
            rank: index + 1,
            attemptId: entry.attemptId,
            name: entry.name,
            score: entry.score,
            timeTakenInSeconds: entry.timeTakenInSeconds,
            completedAt: entry.completedAt,
            isMe: isMe,
            isCurrentAttempt: isCurrentAttempt, // Frontend will use this flag to HIGHLIGHT the row!
        };
    });

    return {
        userStats: {
            currentScore: latestAttempt ? latestAttempt.score : 0,
            currentRank: currentRank,
            bestScore: bestScore,
            bestRank: bestRank,
            totalAttempts: userAttempts.length,
        },
        leaderboard,
    };
};

/**
 * Main Service for Student Dashboard Analytics
 */
export const fetchStudentDashboardAnalytics = async (userId) => {
    const studentProfile = await StudentProfile.findOne({ userId }).lean();

    const completedAttempts = await QuizAttempt.find({
        userId,
        status: "completed",
    })
        .sort({ completedAt: -1 })
        .populate({ path: "quizId", select: "title tags" })
        .lean();

    const { currentRank, leaderboard } = await getGlobalLeaderboard(userId, 20);

    if (!completedAttempts || completedAttempts.length === 0) {
        return {
            totalTestsTaken: 0,
            averageScore: 0,
            maxScore: 0,
            minScore: 0,
            currentRank: null,
            latestResult: null,
            overallElo: studentProfile?.overallElo || 1000,
            levelName: studentProfile?.levelName || "Beginner",
            coinsBalance: studentProfile?.coinsBalance || 100,
            hintTokens: studentProfile?.hintTokens || 3,
            experiencePoints: studentProfile?.experiencePoints || 0,
            performanceTrend: [],
            predictedNextScore: 0,
            weakAreas: [],
            recentHistory: [],
            leaderboard: leaderboard,
            dailyActivity: {
                activityMap: {},
                currentStreak: 0,
                longestStreak: 0,
                activeDaysThisMonth: 0,
                submissionsThisMonth: 0,
            },
        };
    }

    const totalTestsTaken = completedAttempts.length;
    const scores = completedAttempts.map((a) => a.score);
    const averageScore = parseFloat(
        (scores.reduce((sum, s) => sum + s, 0) / totalTestsTaken).toFixed(2)
    );
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const latestAttempt = completedAttempts[0];

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

    // Calculate Daily Practice Heatmap & Streak (GitHub / LeetCode style)
    const activityMap = {};
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    let submissionsThisMonth = 0;

    completedAttempts.forEach((attempt) => {
        if (attempt.completedAt) {
            const dateStr = new Date(attempt.completedAt).toISOString().split("T")[0];
            activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
            if (dateStr.startsWith(currentMonthPrefix)) {
                submissionsThisMonth++;
            }
        }
    });

    const activeDaysThisMonth = Object.keys(activityMap).filter((d) => d.startsWith(currentMonthPrefix)).length;

    const sortedDates = Object.keys(activityMap).sort().reverse();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (sortedDates.length > 0) {
        const todayStr = now.toISOString().split("T")[0];
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const dateSet = new Set(sortedDates);
        let checkDate = new Date(dateSet.has(todayStr) ? todayStr : (dateSet.has(yesterdayStr) ? yesterdayStr : null));
        
        if (!isNaN(checkDate.getTime())) {
            while (true) {
                const checkStr = checkDate.toISOString().split("T")[0];
                if (dateSet.has(checkStr)) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        const allAscDates = Object.keys(activityMap).sort();
        for (let i = 0; i < allAscDates.length; i++) {
            if (i === 0) {
                tempStreak = 1;
            } else {
                const prev = new Date(allAscDates[i - 1]);
                const curr = new Date(allAscDates[i]);
                const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    tempStreak++;
                } else if (diffDays > 1) {
                    tempStreak = 1;
                }
            }
            if (tempStreak > longestStreak) longestStreak = tempStreak;
        }
    }
    if (longestStreak < currentStreak) longestStreak = currentStreak;

    const dailyActivity = {
        activityMap,
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        activeDaysThisMonth,
        submissionsThisMonth,
    };

    return {
        totalTestsTaken,
        averageScore,
        maxScore,
        minScore,
        currentRank,
        overallElo: studentProfile?.overallElo || 1000,
        levelName: studentProfile?.levelName || "Learner",
        coinsBalance: studentProfile?.coinsBalance || 100,
        hintTokens: studentProfile?.hintTokens || 3,
        experiencePoints: studentProfile?.experiencePoints || 0,
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
        dailyActivity,
    };
};