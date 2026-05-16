-- Editable landing-page FAQ content.

create table if not exists public.landing_faq_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.landing_faq_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.landing_faq_sections(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.landing_faq_sections enable row level security;
alter table public.landing_faq_items enable row level security;

drop policy if exists "public read active landing faq sections" on public.landing_faq_sections;
create policy "public read active landing faq sections"
  on public.landing_faq_sections for select
  using (active = true);

drop policy if exists "public read active landing faq items" on public.landing_faq_items;
create policy "public read active landing faq items"
  on public.landing_faq_items for select
  using (
    active = true
    and exists (
      select 1
      from public.landing_faq_sections s
      where s.id = section_id
        and s.active = true
    )
  );

drop policy if exists "admins read landing faq sections" on public.landing_faq_sections;
create policy "admins read landing faq sections"
  on public.landing_faq_sections for select
  using (public.is_admin());

drop policy if exists "admins read landing faq items" on public.landing_faq_items;
create policy "admins read landing faq items"
  on public.landing_faq_items for select
  using (public.is_admin());

create index if not exists landing_faq_sections_sort_idx
  on public.landing_faq_sections(sort_order, title);

create index if not exists landing_faq_items_section_sort_idx
  on public.landing_faq_items(section_id, sort_order, question);

insert into public.landing_faq_sections (title, sort_order, active)
values
  ('General', 1, true),
  ('Lesson Plans', 2, true),
  ('Schemes of Work', 3, true),
  ('Credits & Payments', 4, true),
  ('Technical & Privacy', 5, true)
on conflict do nothing;

insert into public.landing_faq_items (section_id, question, answer, sort_order, active)
select s.id, item.question, item.answer, item.sort_order, true
from public.landing_faq_sections s
join (
  values
    ('General', 'What is Ghana Lesson Planner?', 'An AI-powered tool that helps Ghanaian teachers create lesson plans, schemes of work, and teaching notes faster.', 1),
    ('General', 'Who is it for?', 'Teachers in Ghanaian basic schools, especially those handling B1 to B9 classes.', 2),
    ('General', 'Which class levels are supported?', 'B1, B2, B3, B4, B5, B6, B7, B8, and B9 are all supported.', 3),
    ('General', 'Is it designed for the Ghana curriculum?', 'Yes. Built around Ghanaian class levels, subjects, terms, lesson structure, and scheme-of-work planning.', 4),
    ('Lesson Plans', 'How does lesson plan generation work?', 'Select class, subject, term, week, and lesson number. Ghana Lesson Planner creates a structured plan based on your selected scheme.', 1),
    ('Lesson Plans', 'Can I export plans as PDF?', 'Yes. Lesson plans can be saved or exported as PDF for printing, sharing, or record keeping.', 2),
    ('Lesson Plans', 'Do plans include my teacher details?', 'Yes. Save your teacher name, school name, district, and class sizes in your profile, and they appear on new lesson plans.', 3),
    ('Schemes of Work', 'Can Ghana Lesson Planner generate a scheme of work?', 'Yes. It can create a full 12-week scheme for any selected subject, class, and term.', 1),
    ('Schemes of Work', 'Can I upload my own scheme?', 'Yes. Upload a PDF or DOCX scheme and the app analyses it into week-by-week scheme rows.', 2),
    ('Credits & Payments', 'How do credits work?', 'Credits are used for AI actions like generating lesson plans, schemes, and teaching notes. Each action typically costs 1 credit.', 1),
    ('Credits & Payments', 'Can I pay with MoMo?', 'Yes. The app supports credit packages and MoMo checkout.', 2),
    ('Credits & Payments', 'Do new users get free credits?', 'Yes. New users may receive starter credits when the setting is active.', 3),
    ('Technical & Privacy', 'Is my work private?', 'Yes. Each teacher can only access their own saved work and credit data through protected account access.', 1),
    ('Technical & Privacy', 'Can I use it on mobile and web?', 'Yes. The app works on both mobile and web browsers.', 2),
    ('Technical & Privacy', 'Are the generated plans always perfect?', 'No AI tool is perfect. Ghana Lesson Planner provides a strong draft; teachers should review before classroom use.', 3)
) as item(section_title, question, answer, sort_order)
  on item.section_title = s.title
where not exists (
  select 1
  from public.landing_faq_items existing
  where existing.section_id = s.id
    and existing.question = item.question
);
