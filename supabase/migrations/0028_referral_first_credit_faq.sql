update public.landing_faq_items
set
  question = 'How can I get more credits?',
  answer = 'You can earn more credits by referring other teachers. Credit purchases can be enabled later when available.',
  updated_at = now()
where question = 'Can I pay with MoMo?'
  and answer = 'Yes. The app supports credit packages and MoMo checkout.';
