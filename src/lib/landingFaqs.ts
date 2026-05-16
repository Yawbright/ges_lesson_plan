import { isSupabaseConfigured, supabase } from './supabase';

export type LandingFaqItem = {
  id?: string;
  sectionId?: string;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
};

export type LandingFaqGroup = {
  id?: string;
  title: string;
  sortOrder: number;
  active: boolean;
  items: LandingFaqItem[];
};

type FaqSectionRow = {
  id: string;
  title: string;
  sort_order: number;
  active: boolean;
  landing_faq_items?: FaqItemRow[];
};

type FaqItemRow = {
  id: string;
  section_id: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
};

export const fallbackLandingFaqGroups: LandingFaqGroup[] = [
  {
    title: 'General',
    sortOrder: 1,
    active: true,
    items: [
      { question: 'What is GES Lesson Planner?', answer: 'An AI-powered tool that helps Ghanaian teachers create lesson plans, schemes of work, and teaching notes faster.', sortOrder: 1, active: true },
      { question: 'Is GES Lesson Planner free?', answer: 'Yes. Teachers can create a free account and start using the platform without making any payment.', sortOrder: 2, active: true },
      { question: 'Who is it for?', answer: 'Teachers in Ghanaian basic schools, especially those handling B1 to B9 classes.', sortOrder: 3, active: true },
      { question: 'Which class levels are supported?', answer: 'B1, B2, B3, B4, B5, B6, B7, B8, and B9 are all supported.', sortOrder: 4, active: true },
      { question: 'Is it designed for the Ghana curriculum?', answer: 'Yes. Built around Ghanaian class levels, subjects, terms, lesson structure, and scheme-of-work planning.', sortOrder: 5, active: true },
    ],
  },
  {
    title: 'Lesson Plans',
    sortOrder: 2,
    active: true,
    items: [
      { question: 'How does lesson plan generation work?', answer: 'Select class, subject, term, week, and lesson number. GES Lesson Planner creates a structured plan based on your selected scheme.', sortOrder: 1, active: true },
      { question: 'Can I export plans as PDF?', answer: 'Yes. Lesson plans can be saved or exported as PDF for printing, sharing, or record keeping.', sortOrder: 2, active: true },
      { question: 'Do plans include my teacher details?', answer: 'Yes. Save your teacher name, school name, district, and class sizes in your profile, and they appear on new lesson plans.', sortOrder: 3, active: true },
    ],
  },
  {
    title: 'Schemes of Work',
    sortOrder: 3,
    active: true,
    items: [
      { question: 'Can GES Lesson Planner generate a scheme of work?', answer: 'Yes. It can create a full 12-week scheme for any selected subject, class, and term.', sortOrder: 1, active: true },
      { question: 'Can I upload my own scheme?', answer: 'Yes. Upload a PDF or DOCX scheme and the app analyses it into week-by-week scheme rows.', sortOrder: 2, active: true },
    ],
  },
  {
    title: 'Credits & Payments',
    sortOrder: 4,
    active: true,
    items: [
      { question: 'How do credits work?', answer: 'Credits are used for AI actions like generating lesson plans, schemes, custom scheme analysis, and teaching notes. The current cost is controlled from the admin dashboard.', sortOrder: 1, active: true },
      { question: 'How can I get more credits?', answer: 'You can earn more credits by referring other teachers. Credit purchases can be enabled later when available.', sortOrder: 2, active: true },
      { question: 'Do new users get free credits?', answer: 'Yes. New users may receive starter credits when the setting is active.', sortOrder: 3, active: true },
    ],
  },
  {
    title: 'Technical & Privacy',
    sortOrder: 5,
    active: true,
    items: [
      { question: 'Is my work private?', answer: 'Yes. Each teacher can only access their own saved work and credit data through protected account access.', sortOrder: 1, active: true },
      { question: 'Can I use it on mobile and web?', answer: 'Yes. The app works on both mobile and web browsers.', sortOrder: 2, active: true },
      { question: 'Are the generated plans always perfect?', answer: 'No AI tool is perfect. GES Lesson Planner provides a strong draft; teachers should review before classroom use.', sortOrder: 3, active: true },
    ],
  },
];

export async function loadLandingFaqGroups(): Promise<LandingFaqGroup[]> {
  if (!isSupabaseConfigured) return fallbackLandingFaqGroups;

  const { data, error } = await supabase
    .from('landing_faq_sections')
    .select('id,title,sort_order,active,landing_faq_items(id,section_id,question,answer,sort_order,active)')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('sort_order', { referencedTable: 'landing_faq_items', ascending: true });

  if (error || !data?.length) return fallbackLandingFaqGroups;

  const groups = (data as FaqSectionRow[])
    .map((section) => ({
      id: section.id,
      title: section.title,
      sortOrder: section.sort_order,
      active: section.active,
      items: (section.landing_faq_items ?? [])
        .filter((item) => item.active)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item) => ({
          id: item.id,
          sectionId: item.section_id,
          question: item.question,
          answer: item.answer,
          sortOrder: item.sort_order,
          active: item.active,
        })),
    }))
    .filter((section) => section.items.length);

  return groups.length ? groups : fallbackLandingFaqGroups;
}
