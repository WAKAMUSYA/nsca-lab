# Implementation Plan - NSCA LAB (CSCS & NSCA-CPT Study Companion)

NSCA LAB is a premium, mobile-first PWA study companion designed to help examinees for NSCA-CPT (Certified Personal Trainer) and CSCS (Certified Strength and Conditioning Specialist) build daily study habits, track their progress, analyze weaknesses, and study with AI-assisted practical insights, rather than just simple rote-memorization practice.

---

## 🛠️ Architecture & Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, custom CSS variables for premium theme (Inter/Outfit fonts, rich slate/indigo/emerald/amber slate accents, smooth glassmorphism, responsive native-app-like layouts)
- **Icons**: `lucide-react` for premium icons
- **State Management**: React state + standard LocalStorage for persistence (mock scores, mistakes list, current streak, custom exam date, progress tracker) - ready to migrate to Supabase in the future!
- **PWA Features**: Service Worker registration, manifest file, mobile meta tags, theme colors, home screen icon support

---

## 🎨 Brand & Premium Design System
NSCA LAB will feature a professional, textbook-meets-modern-app feel inspired by Notion's neat layout, Duolingo's game-like habit loops (streak keeping, rewarding feeling), and Quizlet's clean learning cards.
- **Background**: Light mode with high-contrast slate borders (Notion feel), clean dark mode support if needed (using adaptive variables).
- **Core colors**:
  - Indigo/Violet (`#4f46e5`/`#6366f1`): Active, Primary, UI accents
  - Emerald (`#10b981`): Success, correct answer, streak active
  - Rose/Red (`#f43f5e`): Error, incorrect answer, weaknesses
  - Amber/Yellow (`#f59e0b`): Warning, warning cards, tips, AI insight highlight
  - Slate (`#0f172a` to `#f8fafc`): Premium text, backgrounds, card borders

---

## 📁 Page Structure & Routes

1. **`/` (Top / Portal)**
   - Hero: "Not just a question bank, but a companion to build your daily passing habit."
   - Target exam selector (CSCS vs NSCA-CPT) with days left countdown.
   - Status Hub (Today's task, mistakes count, mock completion, streak).
   - Core feature navigation cards (Daily Quest, Mistakes Notebook, Analytics, Mock Tests, Roadmaps).
   - Testimonial/pricing banner showing the premium "試験まで伴走（980円〜1,480円）" concept vs costly paper books.

2. **`/daily` (Daily 5 Questions)**
   - Duolingo-style page layout with high progress bar (Question 1 to 5).
   - Smooth animated card transitions.
   - Interactive options with instant feedback (success/fail sound design cues, beautiful visual check/cross).
   - **AI Tutor Section**: Custom expandables for:
     - 💡 *解き方のコツ (How to solve / Biomechanics approach)*
     - 🧠 *覚え方語呂合わせ (Mnemonics & memory aids)*
     - 🏋️ *現場での実践知識 (Practical field application)*
   - End-of-session screen showing XP gained, accuracy rating, and updated calendar streak.

3. **`/mock` (Mock Exam Hub)**
   - Professional mock exams list:
     - 📝 模擬試験 ① (基礎科学 / 応用問題 100問)
     - 📝 模擬試験 ② (実技・エクササイズ実践 100問)
     - 📝 模擬試験 ③ (総合模擬試験 100問)
   - Performance tracking (best score, completion, date completed).
   - Simulated timed test interface with easy navigation through questions.

4. **`/mistakes` (Mistake Notebook)**
   - Smart mistakes filtering by category (e.g., "Nutrition", "Exercise Physiology", "Program Design").
   - Detailed history showing "When you got it wrong".
   - Explanations + AI review tips.
   - One-click "Retake" button to clear mistakes as you master them.

5. **`/stats` (Analytics Dashboard)**
   - Beautiful visual dashboards:
     - Streak Calendar (showing active days).
     - Circular accuracy charts.
     - Strong & Weak areas bar chart.
     - "Days to Exam" countdown visualizer.
   - Dynamic encouraging message based on current progress.

6. **`/roadmap` (Habit & Topic Roadmap)**
   - Clear visual roadmap of exam domains:
     - 🍖 栄養学 (Nutrition & Metabolism)
     - 🧬 解剖生理学 (Anatomy & Exercise Physiology)
     - 🏋️ トレーニング手法・プログラム (Program Design)
     - 🛡️ 安全・施設管理 (Safety & Administration)
     - 📊 測定と評価 (Testing & Evaluation)
   - Progress bar for each category showing completed items.
   - Custom calendar mapping showing where you should be based on your exam date.

---

## 📱 PWA Features to Implement
- `public/manifest.json`: Defines app icons, splash screens, display: standalone.
- `public/sw.js`: Simple Service Worker for offline asset caching.
- `src/components/PWAInstallPrompt.tsx`: Elegant in-app installation banner for iOS & Android users.
- PWA Registration script injected in `src/app/layout.tsx`.
