-- Prevent duplicate version numbers for the same user's lesson notes.

create unique index if not exists saved_teaching_notes_unique_lesson_version_idx
  on public.saved_teaching_notes (user_id, lesson_plan_id, version_number);
