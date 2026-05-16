import type { ServiceClient } from './types.ts';

export async function loadFaqs(service: ServiceClient) {
  const { data, error } = await service
    .from('landing_faq_sections')
    .select('id,title,sort_order,active,created_at,updated_at,landing_faq_items(id,section_id,question,answer,sort_order,active,created_at,updated_at)')
    .order('sort_order', { ascending: true })
    .order('sort_order', { referencedTable: 'landing_faq_items', ascending: true });
  if (error) return [];
  return (data ?? []).map((section) => ({
    ...section,
    items: (section.landing_faq_items ?? []).sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)),
    landing_faq_items: undefined,
  }));
}

export async function upsertFaqSection(
  service: ServiceClient,
  input: { id?: string; title?: string; sortOrder?: number; active?: boolean },
) {
  const title = input.title?.trim();
  if (!title) throw new Error('FAQ section title is required');
  const row = {
    ...(input.id ? { id: input.id } : {}),
    title,
    sort_order: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    active: input.active ?? true,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await service.from('landing_faq_sections').upsert(row).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteFaqSection(service: ServiceClient, id?: string) {
  if (!id) throw new Error('FAQ section id is required');
  const { error } = await service.from('landing_faq_sections').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { deleted: true };
}

export async function upsertFaqItem(
  service: ServiceClient,
  input: { id?: string; sectionId?: string; question?: string; answer?: string; sortOrder?: number; active?: boolean },
) {
  const question = input.question?.trim();
  const answer = input.answer?.trim();
  if (!input.sectionId) throw new Error('FAQ section is required');
  if (!question || !answer) throw new Error('FAQ question and answer are required');
  const row = {
    ...(input.id ? { id: input.id } : {}),
    section_id: input.sectionId,
    question,
    answer,
    sort_order: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    active: input.active ?? true,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await service.from('landing_faq_items').upsert(row).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteFaqItem(service: ServiceClient, id?: string) {
  if (!id) throw new Error('FAQ item id is required');
  const { error } = await service.from('landing_faq_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { deleted: true };
}
