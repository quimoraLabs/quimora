import mongoose from "mongoose";
import dotenv from "dotenv";
import Interest from "../models/interest.model.js";
import Chapter from "../models/chapter.model.js";
import Quiz from "../models/quiz.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quimora";

async function seedChapters() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Chapter Track Organization...");

    const interests = await Interest.find({ isActive: true });
    console.log(`Found ${interests.length} active interests.`);

    for (const interest of interests) {
      // Find quizzes linked to this interest
      const quizzes = await Quiz.find({ interestIds: interest._id }).sort({ createdAt: 1 });

      if (quizzes.length === 0) continue;

      // Create Chapter 1: Fundamentals
      const ch1 = await Chapter.findOneAndUpdate(
        { interestId: interest._id, orderIndex: 1 },
        {
          interestId: interest._id,
          title: `${interest.name} Fundamentals`,
          description: `Core foundational concepts and essential principles of ${interest.name}.`,
          orderIndex: 1,
          requiredPassingScore: 50,
          isPublished: true,
        },
        { upsert: true, returnDocument: "after" }
      );

      // Create Chapter 2: Applied Architecture & Advanced
      const ch2 = await Chapter.findOneAndUpdate(
        { interestId: interest._id, orderIndex: 2 },
        {
          interestId: interest._id,
          title: `${interest.name} Applied Architecture`,
          description: `Applied architectures, patterns, and production-level concepts in ${interest.name}.`,
          orderIndex: 2,
          requiredPassingScore: 50,
          isPublished: true,
        },
        { upsert: true, returnDocument: "after" }
      );

      // Distribute quizzes into chapters
      for (let i = 0; i < quizzes.length; i++) {
        const targetChapter = i === 0 ? ch1 : ch2;
        await Quiz.findByIdAndUpdate(quizzes[i]._id, {
          chapterId: targetChapter._id,
          trackOrder: i === 0 ? 1 : i,
          prerequisiteQuizId: i > 0 ? quizzes[i - 1]._id : null,
        });
      }

      console.log(`✅ Track seeded for: "${interest.name}" (${quizzes.length} quizzes distributed across 2 chapters)`);
    }

    console.log("🎉 All Curriculum Tracks organized successfully!");
  } catch (err) {
    console.error("Chapter seed failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedChapters();

