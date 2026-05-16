update public.landing_faq_items
set
  answer = 'Credits are used for AI actions like generating lesson plans, schemes, custom scheme analysis, and teaching notes. The current cost is controlled from the admin dashboard.',
  updated_at = now()
where question = 'How do credits work?'
  and answer = 'Credits are used for AI actions like generating lesson plans, schemes, and teaching notes. Each action typically costs 1 credit.';
