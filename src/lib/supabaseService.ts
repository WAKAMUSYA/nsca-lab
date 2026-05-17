import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { Question } from "@/data/questions";

// Helper type for mistakes
interface FailedQuestion extends Question {
  dateFailed: string;
}

/**
 * Two-way Synchronization Service between LocalStorage and Supabase Cloud
 */
export const supabaseService = {
  
  /**
   * Helper: Check if Supabase is active and user is logged in
   */
  async getActiveUser() {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      return user;
    } catch (e) {
      console.warn("Supabase active user fetch failed, falling back to local:", e);
      return null;
    }
  },

  /**
   * 1. Dynamic Profile Synchronization
   */
  async syncProfile() {
    const user = await this.getActiveUser();
    if (!user) return;

    try {
      // Collect local metrics
      const examType = localStorage.getItem("nsca_exam_type") || "CSCS";
      const examDate = localStorage.getItem("nsca_exam_date") || "";
      const streak = parseInt(localStorage.getItem("nsca_user_streak") || "3", 10);
      const totalSolved = parseInt(localStorage.getItem("nsca_total_solved") || "0", 10);
      const totalCorrect = parseInt(localStorage.getItem("nsca_total_correct") || "0", 10);

      // Save to Supabase nsca_user_stats
      const { error } = await supabase
        .from("nsca_user_stats")
        .upsert({
          user_id: user.id,
          exam_type: examType,
          exam_date: examDate,
          streak: streak,
          total_solved: totalSolved,
          total_correct: totalCorrect,
          updated_at: new Date().toISOString()
        });

      if (error) console.error("Error upserting cloud stats:", error);
    } catch (err) {
      console.error("Profile sync exception:", err);
    }
  },

  /**
   * 2. Dynamic Mistakes Syncing
   */
  async syncMistakes() {
    const user = await this.getActiveUser();
    if (!user) return;

    try {
      // Fetch cloud mistakes
      const { data: cloudMistakes, error } = await supabase
        .from("nsca_mistakes")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // Collect local mistakes
      const stored = localStorage.getItem("nsca_mistakes");
      let localList: FailedQuestion[] = stored ? JSON.parse(stored) : [];

      // Merge Logic: Dual Sync
      const mergedList = [...localList];
      
      if (cloudMistakes) {
        for (const cm of cloudMistakes) {
          if (!mergedList.some((lm) => lm.id === cm.question_id)) {
            mergedList.push({
              id: cm.question_id,
              category: cm.category,
              subject: cm.subject as "CSCS" | "NSCA-CPT" | "Both",
              text: cm.text,
              options: cm.options,
              answerIndex: cm.answer_index,
              explanation: cm.explanation,
              aiInsights: cm.ai_insights,
              dateFailed: cm.date_failed
            });
          }
        }
      }

      // Save merged list back to LocalStorage
      localStorage.setItem("nsca_mistakes", JSON.stringify(mergedList));
      window.dispatchEvent(new Event("nsca_storage_update"));

      // Push all local mistakes that are not yet in the cloud
      for (const lm of mergedList) {
        const alreadyInCloud = cloudMistakes?.some((cm) => cm.question_id === lm.id);
        if (!alreadyInCloud) {
          await supabase
            .from("nsca_mistakes")
            .insert({
              user_id: user.id,
              question_id: lm.id,
              category: lm.category,
              subject: lm.subject,
              text: lm.text,
              options: lm.options,
              answer_index: lm.answerIndex,
              explanation: lm.explanation,
              ai_insights: lm.aiInsights,
              date_failed: lm.dateFailed
            });
        }
      }
    } catch (err) {
      console.error("Mistakes sync exception:", err);
    }
  },

  /**
   * Helper: Add a mistake directly to cloud
   */
  async addCloudMistake(q: FailedQuestion) {
    const user = await this.getActiveUser();
    if (!user) return;

    try {
      await supabase
        .from("nsca_mistakes")
        .upsert({
          user_id: user.id,
          question_id: q.id,
          category: q.category,
          subject: q.subject,
          text: q.text,
          options: q.options,
          answer_index: q.answerIndex,
          explanation: q.explanation,
          ai_insights: q.aiInsights,
          date_failed: q.dateFailed
        });
    } catch (e) {
      console.error("Add cloud mistake failed:", e);
    }
  },

  /**
   * Helper: Remove a mistake directly from cloud
   */
  async removeCloudMistake(qId: string) {
    const user = await this.getActiveUser();
    if (!user) return;

    try {
      await supabase
        .from("nsca_mistakes")
        .delete()
        .eq("user_id", user.id)
        .eq("question_id", qId);
    } catch (e) {
      console.error("Remove cloud mistake failed:", e);
    }
  },

  /**
   * 3. Study History Syncing
   */
  async syncStudyHistory() {
    const user = await this.getActiveUser();
    if (!user) return;

    try {
      // Fetch cloud history
      const { data: cloudHistory, error } = await supabase
        .from("nsca_study_history")
        .select("completed_date")
        .eq("user_id", user.id);

      if (error) throw error;

      // Fetch local history
      const stored = localStorage.getItem("nsca_study_history");
      let localHistory: string[] = stored ? JSON.parse(stored) : [];

      // Merge
      const mergedHistory = Array.from(
        new Set([
          ...localHistory,
          ...(cloudHistory?.map((h) => h.completed_date) || [])
        ])
      );

      localStorage.setItem("nsca_study_history", JSON.stringify(mergedHistory));
      window.dispatchEvent(new Event("nsca_storage_update"));

      // Push missing to cloud
      for (const dateStr of mergedHistory) {
        const inCloud = cloudHistory?.some((h) => h.completed_date === dateStr);
        if (!inCloud) {
          await supabase
            .from("nsca_study_history")
            .insert({
              user_id: user.id,
              completed_date: dateStr
            });
        }
      }
    } catch (err) {
      console.error("Study history sync exception:", err);
    }
  },

  /**
   * 4. Roadmap Progress Syncing
   */
  async syncRoadmapProgress() {
    const user = await this.getActiveUser();
    if (!user) return;

    try {
      // Fetch cloud progress
      const { data: cloudRoadmap, error } = await supabase
        .from("nsca_roadmap_progress")
        .select("subtopic_id")
        .eq("user_id", user.id);

      if (error) throw error;

      // Fetch local checked roadmap subtopics
      const stored = localStorage.getItem("nsca_roadmap_checked");
      let localChecked: string[] = stored ? JSON.parse(stored) : [];

      // Merge
      const mergedRoadmap = Array.from(
        new Set([
          ...localChecked,
          ...(cloudRoadmap?.map((r) => r.subtopic_id) || [])
        ])
      );

      localStorage.setItem("nsca_roadmap_checked", JSON.stringify(mergedRoadmap));
      window.dispatchEvent(new Event("nsca_storage_update"));

      // Push missing checkboxes to cloud
      for (const topicId of mergedRoadmap) {
        const inCloud = cloudRoadmap?.some((r) => r.subtopic_id === topicId);
        if (!inCloud) {
          await supabase
            .from("nsca_roadmap_progress")
            .insert({
              user_id: user.id,
              subtopic_id: topicId
            });
        }
      }
    } catch (err) {
      console.error("Roadmap sync exception:", err);
    }
  },

  /**
   * Master Full Synchronizer
   * Merges all stats, mistakes, progress, and logs to the cloud.
   */
  async syncAll() {
    const user = await this.getActiveUser();
    if (!user) return false;

    try {
      // Run all sync tasks in parallel for swift response
      await Promise.all([
        this.syncProfile(),
        this.syncMistakes(),
        this.syncStudyHistory(),
        this.syncRoadmapProgress()
      ]);
      return true;
    } catch (e) {
      console.error("Master sync failed:", e);
      return false;
    }
  },

  /**
   * Pull Cloud Profile to override/populate LocalStorage (Used on Login success)
   */
  async pullCloudDataToLocal() {
    const user = await this.getActiveUser();
    if (!user) return;

    try {
      // Get stats from nsca_user_stats
      const { data: profile } = await supabase
        .from("nsca_user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        localStorage.setItem("nsca_exam_type", profile.exam_type || "CSCS");
        if (profile.exam_date) localStorage.setItem("nsca_exam_date", profile.exam_date);
        localStorage.setItem("nsca_user_streak", profile.streak.toString());
        localStorage.setItem("nsca_total_solved", profile.total_solved.toString());
        localStorage.setItem("nsca_total_correct", profile.total_correct.toString());
      }

      // Synchronize checklists, history, and mistakes
      await Promise.all([
        this.syncMistakes(),
        this.syncStudyHistory(),
        this.syncRoadmapProgress()
      ]);

      window.dispatchEvent(new Event("nsca_storage_update"));
    } catch (e) {
      console.error("Pull cloud data exception:", e);
    }
  }
};
