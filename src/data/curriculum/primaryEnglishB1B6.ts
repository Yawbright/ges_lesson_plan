import type { ExplicitCurriculumTerm } from './mathematicsB7';
import type { SchemeWeek, SchemeWeekEntry } from '@/types/scheme';

const resources = {
  oral: ['English textbook', 'Prompt cards', 'Song chart', 'Discussion guide'],
  reading: ['Reading cards', 'Story books', 'Phonics chart', 'Picture cards'],
  grammar: ['Grammar chart', 'Sentence cards', 'Word cards', 'Exercise book'],
  writing: ['Exercise book', 'Writing frame', 'Tracing sheets', 'Model texts'],
  extensive: ['Class library books', 'Reading log', 'Story corner materials'],
};

type WeeklyBundle = {
  theme: string;
  entries: Array<{
    strand: string;
    subStrand: string;
    topic: string;
    resources: string[];
  }>;
};

function entry(
  classLevel: string,
  strand: string,
  subStrand: string,
  topic: string,
  extraResources: string[]
): SchemeWeekEntry {
  return {
    strand,
    subStrand,
    contentStandard: `${classLevel} ${strand}: Develop understanding and confidence in ${subStrand.toLowerCase()}.`,
    indicator: `Participate in activities on ${topic.toLowerCase()} and apply the learning in speaking, reading or writing.`,
    topic,
    resources: extraResources,
  };
}

function week(classLevel: string, weekNumber: number, bundle: WeeklyBundle): SchemeWeek {
  const entries = bundle.entries.map((item) =>
    entry(classLevel, item.strand, item.subStrand, item.topic, item.resources)
  );
  const primary = entries[0];
  const mergedResources = [...new Set(entries.flatMap((item) => item.resources ?? []))];

  return {
    week: weekNumber,
    theme: bundle.theme,
    topic: bundle.theme,
    strand: primary?.strand,
    subStrand: primary?.subStrand,
    contentStandard: primary?.contentStandard,
    indicator: primary?.indicator,
    resources: mergedResources,
    entries,
  };
}

function buildTerm(
  classLevel: string,
  term: string,
  bundles: WeeklyBundle[]
): ExplicitCurriculumTerm {
  return {
    subject: 'English Language',
    classLevel: classLevel as ExplicitCurriculumTerm['classLevel'],
    term,
    title: `${classLevel} Primary English Language Scheme of Work - ${term}`,
    weeks: bundles.map((bundle, index) => week(classLevel, index + 1, bundle)),
  };
}

function lowerWeek(theme: string, oralTopic: string, readingTopic: string, writingTopic: string, grammarTopic: string): WeeklyBundle {
  return {
    theme,
    entries: [
      { strand: 'Oral Language', subStrand: 'Songs/Rhymes/Conversation', topic: oralTopic, resources: resources.oral },
      { strand: 'Reading', subStrand: 'Phonics/Vocabulary/Comprehension', topic: readingTopic, resources: resources.reading },
      { strand: 'Writing', subStrand: 'Writing Simple Words and Sentences', topic: writingTopic, resources: resources.writing },
      { strand: 'Using Writing Conventions/Grammar Usage', subStrand: 'Capitalisation/Punctuation/Spelling', topic: grammarTopic, resources: resources.grammar },
      { strand: 'Extensive Reading', subStrand: 'Building the Love and Culture of Reading', topic: `Shared reading around ${theme.toLowerCase()}`, resources: resources.extensive },
    ],
  };
}

function upperWeek(
  theme: string,
  oralTopic: string,
  readingTopic: string,
  grammarTopic: string,
  writingTopic: string
): WeeklyBundle {
  return {
    theme,
    entries: [
      { strand: 'Oral Language', subStrand: 'Conversation/Listening/Presentation', topic: oralTopic, resources: resources.oral },
      { strand: 'Reading', subStrand: 'Vocabulary/Comprehension/Fluency', topic: readingTopic, resources: resources.reading },
      { strand: 'Grammar Usage at Word and Phrase Levels', subStrand: 'Word and Phrase Study', topic: grammarTopic, resources: resources.grammar },
      { strand: 'Writing', subStrand: 'Paragraph Development/Composition', topic: writingTopic, resources: resources.writing },
      { strand: 'Extensive Reading', subStrand: 'Building the Love and Culture of Reading', topic: `Independent and guided reading around ${theme.toLowerCase()}`, resources: resources.extensive },
    ],
  };
}

const b1Term1: WeeklyBundle[] = [
  lowerWeek('Myself and greetings', 'Songs and greetings about self and school', 'Picture reading and beginning sounds in names', 'Tracing and writing own name', 'Capital letters in names and sentence beginnings'),
  lowerWeek('My family', 'Talking about family members', 'Listening to simple family stories', 'Writing family words and labels', 'Spacing and full stop in short sentences'),
  lowerWeek('People around us', 'Rhymes and talk about people in the community', 'Matching pictures to words about people', 'Labelling people and places', 'Action words for daily routines'),
  lowerWeek('My school', 'Simple conversations about school activities', 'Pre-reading and phonics with school objects', 'Writing simple words about school', 'Spelling common classroom words'),
  lowerWeek('Home and classroom instructions', 'Listening and responding to commands', 'Reading familiar classroom words', 'Copying and writing short instructions', 'Punctuation in commands'),
  lowerWeek('Places in our locality', 'Talking about familiar places', 'Vocabulary for home, school and community', 'Writing place labels and simple sentences', 'Simple prepositions for place'),
  lowerWeek('Stories we enjoy', 'Listening to and retelling short stories', 'Comprehension from simple picture stories', 'Writing key words from stories', 'Capital letters and full stops in story sentences'),
  lowerWeek('Rhymes and rhythm', 'Reciting rhymes with actions', 'Recognising rhyming endings', 'Writing rhyming words', 'Spelling simple word families'),
  lowerWeek('Things we do every day', 'Conversation about routines', 'Reading simple routine charts', 'Writing routine sentences', 'Action words in context'),
  lowerWeek('Describing things around us', 'Oral description of familiar objects', 'Reading descriptive picture-word cards', 'Writing simple describing words', 'Using adjectives in short sentences'),
  lowerWeek('Questions and answers', 'Asking and answering simple questions', 'Reading question prompts', 'Writing one-word and short-sentence answers', 'Question marks in simple questions'),
  lowerWeek('Term review and presentation', 'Short class presentation with song or rhyme', 'Shared reading review of term stories', 'Guided writing review', 'Editing capitals, punctuation and spelling'),
];

const b1Term2: WeeklyBundle[] = [
  lowerWeek('Animals and plants', 'Songs and conversation about animals and plants', 'Beginning sounds and picture-word matching', 'Writing names of animals and plants', 'Spelling and capitals in labels'),
  lowerWeek('Food we eat', 'Talking about favourite foods', 'Reading food words and simple sentences', 'Writing food words and lists', 'Naming words in sentences'),
  lowerWeek('Weather and seasons', 'Rhymes about sun and rain', 'Comprehension of simple weather texts', 'Writing words and short sentences about weather', 'Using describing words for weather'),
  lowerWeek('Customs and festivals', 'Conversation about greetings and customs', 'Reading short festival or custom texts', 'Writing festival words and labels', 'Capital letters in names of special days'),
  lowerWeek('Games and play', 'Giving and following simple game instructions', 'Reading action words in games', 'Writing simple game instructions', 'Action words and punctuation'),
  lowerWeek('Cleanliness and health', 'Talking about keeping clean', 'Reading simple health messages', 'Writing simple health sentences', 'Full stops and word spacing'),
  lowerWeek('Storytelling week', 'Retelling stories with simple drama', 'Comprehending story events and characters', 'Writing words and simple sentences from stories', 'Spelling and punctuation review'),
  lowerWeek('Making requests politely', 'Making polite requests and responses', 'Reading request sentences', 'Writing polite requests', 'Question marks and polite words'),
  lowerWeek('Listening for meaning', 'Listening comprehension from short oral texts', 'Matching oral clues to printed words', 'Writing key words from listening', 'Spelling high-frequency words'),
  lowerWeek('Simple descriptions', 'Describing people, animals and objects orally', 'Reading describing words in short texts', 'Writing simple descriptive sentences', 'Using adjectives correctly'),
  lowerWeek('Reading for fun', 'Class oral reading and shared talk', 'Reading simple storybooks with support', 'Writing favourite word or sentence from reading', 'Editing common mistakes'),
  lowerWeek('Integrated review', 'Presentation, rhyme or song performance', 'Review of phonics and comprehension', 'Review of simple sentence writing', 'Review of punctuation and spelling'),
];

const b1Term3: WeeklyBundle[] = [
  lowerWeek('My body and feelings', 'Talking about body parts and feelings', 'Reading simple body-part texts', 'Writing body-part labels and short sentences', 'Capitalisation and full stops'),
  lowerWeek('At the market', 'Conversation using buying and selling language', 'Reading market word cards', 'Writing words and simple shopping sentences', 'Naming and action words'),
  lowerWeek('Community helpers', 'Oral talk about occupations', 'Reading helper names and roles', 'Writing labels and simple helper sentences', 'Using simple prepositions'),
  lowerWeek('Travelling and directions', 'Listening to and following simple directions', 'Reading direction words', 'Writing simple commands or direction phrases', 'Punctuation for commands'),
  lowerWeek('Picture stories', 'Storytelling from picture sequences', 'Reading picture clues and key words', 'Writing simple sentences from pictures', 'Sentence order and spacing'),
  lowerWeek('Songs and poems', 'Performing simple songs and chants', 'Reading repeated words in poems', 'Writing repeated lines or words', 'Spelling review through rhyme'),
  lowerWeek('Things at home', 'Conversation about household items', 'Reading labels and simple home texts', 'Writing home-item labels and sentences', 'Using adjectives and action words'),
  lowerWeek('Friends and good behaviour', 'Asking and answering about friendship', 'Reading short moral stories', 'Writing simple good-behaviour sentences', 'Capital letters and punctuation'),
  lowerWeek('Our environment', 'Talking about places and things we see', 'Reading simple descriptive texts on the environment', 'Writing short descriptive phrases', 'Simple prepositions and describing words'),
  lowerWeek('Fun reading week', 'Oral sharing from simple books', 'Shared and paired reading', 'Writing a favourite word or sentence', 'Editing familiar words'),
  lowerWeek('Revision through games', 'Speaking games and question drills', 'Reading game cards and instructions', 'Writing from guided prompts', 'Grammar and spelling review'),
  lowerWeek('Year-end showcase', 'Oral presentation and recitation', 'Reading review from the term', 'Guided writing showcase', 'Integrated conventions review'),
];

const b2Term1: WeeklyBundle[] = [
  lowerWeek('Family and school life', 'Songs, rhymes and talk about family and school', 'Reading simple texts on family and school', 'Writing simple sentences about family and school', 'Capitalisation and punctuation in sentences'),
  lowerWeek('Customs and greetings', 'Conversation using social and cultural greetings', 'Vocabulary and comprehension on customs', 'Writing greeting sentences', 'Question marks and capital letters'),
  lowerWeek('Stories from our community', 'Storytelling and dramatization', 'Comprehending short community stories', 'Guided writing from stories', 'Spelling common words from stories'),
  lowerWeek('Listening and responding', 'Listening comprehension and oral responses', 'Reading key words from oral texts', 'Writing short answers to oral questions', 'Using full stops and question marks'),
  lowerWeek('Giving instructions', 'Giving and following commands and requests', 'Reading instruction cards', 'Writing simple instructions', 'Action words and punctuation'),
  lowerWeek('Phonics and word families', 'Oral practice with sounds and rhymes', 'Reading phonics patterns and word families', 'Writing words in families', 'Spelling through phonics'),
  lowerWeek('People and places', 'Conversation about people and places', 'Reading descriptive texts on people and places', 'Writing labels and short descriptive sentences', 'Using adjectives and simple prepositions'),
  lowerWeek('Health and cleanliness', 'Songs and talk about healthy habits', 'Reading simple health texts', 'Writing health tips in short sentences', 'Sentence spacing and punctuation'),
  lowerWeek('Questions and answers', 'Asking and answering questions orally', 'Reading question forms in simple texts', 'Writing simple question-answer pairs', 'Question forms and punctuation'),
  lowerWeek('Presentation practice', 'Short oral presentation about self or home', 'Reading model presentation texts', 'Guided writing for oral presentation', 'Editing capitals and spelling'),
  lowerWeek('Reading culture week', 'Book talk and oral sharing', 'Shared story reading and fluency', 'Writing a favourite sentence from reading', 'Proofreading simple sentences'),
  lowerWeek('Term review and integration', 'Oral performance and listening review', 'Reading and comprehension review', 'Writing review from guided prompts', 'Integrated conventions review'),
];

const b2Term2: WeeklyBundle[] = [
  lowerWeek('Animals, plants and environment', 'Conversation about the environment', 'Reading simple informational texts', 'Writing simple descriptive sentences', 'Using adjectives and capitals'),
  lowerWeek('Festivals and celebrations', 'Songs and talk about festivals', 'Reading festival-related texts', 'Writing festival words and simple sentences', 'Spelling and punctuation'),
  lowerWeek('Story retelling and role play', 'Retelling and dramatizing stories', 'Reading story events and characters', 'Controlled writing from stories', 'Sentence order and punctuation'),
  lowerWeek('Directions and requests', 'Giving and following directions', 'Reading direction phrases', 'Writing simple directions', 'Using simple prepositions'),
  lowerWeek('Everyday routines', 'Talking about routines', 'Reading sequence words in routines', 'Writing sentences about routines', 'Action words in present tense'),
  lowerWeek('Listening for detail', 'Listening comprehension with specific details', 'Reading clues and matching meaning', 'Writing responses from listening', 'Spelling high-frequency words'),
  lowerWeek('Narrative beginnings', 'Oral storytelling openings', 'Reading beginning-middle-end in texts', 'Writing simple narrative sentences', 'Capitalisation and punctuation'),
  lowerWeek('Guided composition', 'Oral planning for composition', 'Reading model compositions', 'Guided composition from pictures or prompts', 'Editing punctuation and spelling'),
  lowerWeek('Descriptive language', 'Oral description with qualifying words', 'Reading descriptive passages', 'Writing simple descriptive pieces', 'Using adjectives and simple sentences'),
  lowerWeek('Building reading confidence', 'Sharing favourite books orally', 'Fluency and comprehension practice', 'Writing a sentence about reading', 'Conventions review'),
  lowerWeek('Functional language', 'Making requests and giving polite responses', 'Reading simple notices or messages', 'Writing simple notices or messages', 'Question forms and punctuation'),
  lowerWeek('Integrated review', 'Presentation and oral review', 'Reading and phonics review', 'Writing review of key text types', 'Grammar and spelling consolidation'),
];

const b2Term3: WeeklyBundle[] = [
  lowerWeek('My community', 'Conversation about community places and helpers', 'Reading simple texts on the community', 'Writing simple community sentences', 'Capitalisation of names and places'),
  lowerWeek('Weather and daily life', 'Rhymes and talk about weather', 'Reading short weather texts', 'Writing weather observations', 'Describing words and punctuation'),
  lowerWeek('Games, play and instructions', 'Giving oral instructions for games', 'Reading simple instruction texts', 'Writing instruction steps', 'Action words and full stops'),
  lowerWeek('Picture composition', 'Talking from picture prompts', 'Reading words and phrases from pictures', 'Guided writing from picture sequences', 'Sentence structure review'),
  lowerWeek('Simple narratives', 'Oral retelling with sequence', 'Reading short narrative texts', 'Writing simple narrative sentences', 'Spelling and punctuation'),
  lowerWeek('Listening and asking questions', 'Listening carefully and asking relevant questions', 'Reading question words and answers', 'Writing short responses', 'Question marks and capitals'),
  lowerWeek('Descriptions and labels', 'Oral description of people and objects', 'Reading descriptive vocabulary', 'Writing labels and descriptions', 'Adjectives and prepositions'),
  lowerWeek('Customs and values', 'Conversation around social values', 'Reading short moral passages', 'Writing simple moral sentences', 'Conventions in simple sentences'),
  lowerWeek('Reading for pleasure', 'Shared oral reading and discussion', 'Extensive reading from simple books', 'Writing simple reflections on reading', 'Proofreading familiar words'),
  lowerWeek('Controlled writing and review', 'Speaking from guided prompts', 'Reading model controlled texts', 'Controlled writing from models', 'Grammar usage review'),
  lowerWeek('Revision and games', 'Oral language games and songs', 'Reading revision through cards and stories', 'Writing revision exercises', 'Spelling and punctuation revision'),
  lowerWeek('Year-end showcase', 'Presentation and recitation', 'Reading review selections', 'Writing showcase from favourite topics', 'Integrated editing review'),
];

const b3Term1: WeeklyBundle[] = [
  lowerWeek('Identity and community', 'Conversation about self, family and community', 'Reading short informational and story texts', 'Writing simple paragraphs and guided composition', 'Capitalisation, punctuation and spelling in paragraph writing'),
  lowerWeek('Songs, rhymes and poems', 'Oral performance of songs, rhymes and poems', 'Reading rhyming endings and sound patterns', 'Writing short poem lines or patterned sentences', 'Spelling from rhyme patterns'),
  lowerWeek('Storytelling and dramatization', 'Retelling and acting simple stories', 'Reading story sequence and characters', 'Writing narrative sentences from stories', 'Punctuation in narrative sentences'),
  lowerWeek('Listening and oral response', 'Listening comprehension and oral feedback', 'Reading short linked texts', 'Writing brief responses to listening tasks', 'Question and answer punctuation'),
  lowerWeek('Questions and requests', 'Asking and answering questions in context', 'Reading question prompts and conversational texts', 'Writing questions and responses', 'Simple and compound sentence beginnings'),
  lowerWeek('Phonics and word patterns', 'Oral practice with diphthongs and blends', 'Reading word families, digraphs and clusters', 'Writing words and short sentences with patterns', 'Spelling through phonics practice'),
  lowerWeek('Vocabulary and comprehension', 'Oral use of new vocabulary', 'Reading comprehension with main idea and detail', 'Writing short answers and summaries', 'Action words and adjectives review'),
  lowerWeek('Guided composition', 'Oral planning for short compositions', 'Reading model guided compositions', 'Writing guided composition pieces', 'Editing punctuation and spelling'),
  lowerWeek('Narrative writing', 'Telling stories with beginning, middle and end', 'Reading narrative models', 'Writing short narratives', 'Sentence connection and punctuation'),
  lowerWeek('Descriptive writing', 'Describing people, places and things orally', 'Reading descriptive passages', 'Writing descriptive pieces', 'Adjectives, adverbs and prepositions in context'),
  lowerWeek('Persuasive and informative ideas', 'Oral sharing of opinions and information', 'Reading simple persuasive and informative texts', 'Writing simple informative sentences', 'Grammar review in connected writing'),
  lowerWeek('Term review and presentation', 'Oral presentation from class themes', 'Reading fluency and comprehension review', 'Writing portfolio review', 'Integrated conventions review'),
];

const b3Term2: WeeklyBundle[] = [
  lowerWeek('Customs, events and values', 'Conversation on customs and social values', 'Reading texts on customs and events', 'Writing short reflections and guided compositions', 'Spelling and punctuation in value sentences'),
  lowerWeek('Listening and story response', 'Listening to stories and responding orally', 'Reading for comprehension and inference', 'Writing responses to stories', 'Sentence structure review'),
  lowerWeek('Commands, directions and requests', 'Giving and responding to commands and directions', 'Reading instruction and direction texts', 'Writing simple directions and requests', 'Punctuation and action words'),
  lowerWeek('Vocabulary building', 'Using new words in oral sentences', 'Reading vocabulary in context', 'Writing sentences with new vocabulary', 'Spelling and simple compound sentences'),
  lowerWeek('Fluency and oral reading', 'Reading aloud with expression', 'Fluency and phrasing in texts', 'Writing favourite lines from reading', 'Conventions editing'),
  lowerWeek('Guided and process writing', 'Oral brainstorming for writing', 'Reading model texts for structure', 'Writing as a simple process', 'Editing for capitals and punctuation'),
  lowerWeek('Narratives from pictures', 'Storytelling from picture sequences', 'Reading sequence in stories', 'Writing narratives from visuals', 'Use of time words and punctuation'),
  lowerWeek('Descriptions and comparisons', 'Oral comparisons of familiar things', 'Reading descriptive and comparative texts', 'Writing descriptive paragraphs', 'Adjectives and adverbs in context'),
  lowerWeek('Questions, answers and discussion', 'Oral questioning and discussion', 'Reading question forms and responses', 'Writing question-answer exchanges', 'Sentence punctuation and grammar'),
  lowerWeek('Reading culture week', 'Book sharing and oral recommendation', 'Extensive reading and comprehension', 'Writing a simple book response', 'Proofreading skills'),
  lowerWeek('Integrated writing week', 'Oral presentation before writing', 'Reading linked informational texts', 'Writing informative or persuasive pieces', 'Grammar and conventions review'),
  lowerWeek('Integrated review', 'Songs, stories and oral presentation review', 'Reading and fluency review', 'Writing review from prompts', 'Spelling, punctuation and sentence review'),
];

const b3Term3: WeeklyBundle[] = [
  lowerWeek('Community life and responsibility', 'Conversation about responsibility and community life', 'Reading community-based texts', 'Writing short paragraphs on responsibility', 'Grammar and punctuation in paragraph writing'),
  lowerWeek('Poems and oral performance', 'Reciting poems and oral pieces', 'Reading poetic lines and sound patterns', 'Writing short poetic or patterned lines', 'Spelling from word patterns'),
  lowerWeek('Listening and comprehension', 'Listening for key ideas and details', 'Reading linked comprehension passages', 'Writing short summaries', 'Sentence connection review'),
  lowerWeek('Storys and role play', 'Storytelling and dramatization', 'Reading narratives and dialogues', 'Writing dialogues and narratives', 'Punctuation in dialogue'),
  lowerWeek('Directions and explanation', 'Giving oral directions and explanations', 'Reading informational sequences', 'Writing short instructions and explanations', 'Using action words and prepositions'),
  lowerWeek('Vocabulary and fluency', 'Oral practice with new words', 'Reading fluently with vocabulary support', 'Writing sentences using target vocabulary', 'Spelling and usage review'),
  lowerWeek('Guided composition and revision', 'Planning orally before writing', 'Reading model guided pieces', 'Writing guided compositions', 'Editing for conventions'),
  lowerWeek('Narrative and descriptive blend', 'Oral description within storytelling', 'Reading stories with descriptive details', 'Writing descriptive narratives', 'Adjectives and adverbs in context'),
  lowerWeek('Informative and persuasive writing', 'Sharing opinions and information orally', 'Reading simple informative and persuasive texts', 'Writing short informative or persuasive pieces', 'Sentence variety and punctuation'),
  lowerWeek('Extensive reading and response', 'Book talk and peer sharing', 'Extensive reading and response', 'Writing reading reflections', 'Editing written responses'),
  lowerWeek('Revision through projects', 'Presentation and group oral task', 'Reading review materials', 'Writing from project prompts', 'Grammar and spelling revision'),
  lowerWeek('Year-end showcase', 'Final oral presentation', 'Reading fluency showcase', 'Writing portfolio showcase', 'Integrated review of conventions'),
];

const b4Term1: WeeklyBundle[] = [
  upperWeek('Identity, family and community communication', 'Conversation, listening and presentation on self, family and community', 'Reading comprehension of familiar informational and narrative texts', 'Nouns, determiners and pronouns in context', 'Paragraph development on self and family'),
  upperWeek('Songs, poems and oral performance', 'Poems, songs and oral presentation', 'Reading poems and noticing sound patterns', 'Adjectives and verbs in oral and written expression', 'Creative response writing from poems'),
  upperWeek('Storytelling and role play', 'Storytelling, dramatization and dialogue', 'Reading stories for sequence and character', 'Conjunctions and verbs in dialogue', 'Narrative paragraph writing'),
  upperWeek('Listening for detail', 'Listening comprehension and oral summary', 'Reading linked short passages for detail', 'Pronouns and modals in responses', 'Writing short summaries'),
  upperWeek('Questions, instructions and requests', 'Asking, answering and following instructions', 'Reading instruction and question forms', 'Prepositions and modals in directions', 'Writing instructions and requests'),
  upperWeek('Vocabulary and phonics review', 'Oral practice with pronunciation and meaning', 'Reading phonics, digraphs and vocabulary in context', 'Word classes in context', 'Short informative writing using new vocabulary'),
  upperWeek('Describing people, places and things', 'Oral descriptions with detail', 'Reading descriptive passages', 'Adjectives, adverbs and noun phrases', 'Descriptive paragraph writing'),
  upperWeek('Reading for understanding', 'Discussion around what is read', 'Comprehension, silent reading and fluency', 'Sentence building with conjunctions', 'Short written responses to reading'),
  upperWeek('Writing as a process', 'Oral planning and peer discussion before writing', 'Reading model paragraphs and compositions', 'Grammar support for drafting', 'Planning, drafting and revising simple compositions'),
  upperWeek('Narrative writing', 'Retelling and presenting events orally', 'Reading narrative models', 'Verb tenses and pronouns in narrative writing', 'Writing short narratives with clear sequence'),
  upperWeek('Extensive reading week', 'Book talk and oral sharing', 'Extensive reading with comprehension response', 'Vocabulary and sentence review from reading', 'Reading response paragraph'),
  upperWeek('Integrated term review', 'Presentation and oral reflection', 'Reading, fluency and summarising review', 'Grammar usage review across term themes', 'Integrated writing portfolio review'),
];

const b4Term2: WeeklyBundle[] = [
  upperWeek('School, customs and values', 'Discussion and presentation on customs, events and values', 'Reading informational and story texts on values', 'Nouns, pronouns and adjectives in context', 'Paragraph writing on values and customs'),
  upperWeek('Listening and comprehension', 'Listening comprehension and questioning', 'Reading for main idea and supporting details', 'Determiners and verbs in oral and written response', 'Short summary writing'),
  upperWeek('Directions and functional communication', 'Giving and following directions and requests', 'Reading notices and instruction texts', 'Prepositions, conjunctions and modals in context', 'Functional writing: notices and directions'),
  upperWeek('Storys, poems and role play', 'Oral performance through stories and poems', 'Reading narrative and poetic texts', 'Adverbs and sentence linking', 'Creative or free writing from oral performance'),
  upperWeek('Vocabulary and comprehension growth', 'Using new words in oral discussion', 'Reading vocabulary-rich passages', 'Word and phrase level grammar in context', 'Informative paragraph writing'),
  upperWeek('Fluency and silent reading', 'Oral reading and peer feedback', 'Silent reading, fluency and comprehension', 'Grammar review from reading passages', 'Reading response writing'),
  upperWeek('Summarising and note-making', 'Oral summarising of what is heard', 'Reading to identify key points', 'Sentence control for summarising', 'Writing short summaries and notes'),
  upperWeek('Descriptive and narrative blend', 'Oral description and story sequencing', 'Reading descriptive narratives', 'Adjectives, verbs and prepositions', 'Writing descriptive narratives'),
  upperWeek('Writing process workshop', 'Discussion and planning before writing', 'Reading model compositions for structure', 'Editing with grammar awareness', 'Drafting, revising and editing compositions'),
  upperWeek('Extensive reading and reflection', 'Book discussion and recommendation', 'Extensive reading and reflective comprehension', 'Vocabulary choices from books', 'Reflective writing on reading'),
  upperWeek('Project and presentation', 'Oral presentation on a familiar issue', 'Reading linked information texts', 'Grammar review for presentation writing', 'Informative or persuasive writing project'),
  upperWeek('Integrated review', 'Oral recap and presentation', 'Reading and summarising review', 'Grammar usage consolidation', 'Term writing portfolio review'),
];

const b4Term3: WeeklyBundle[] = [
  upperWeek('Environment and community life', 'Conversation and presentation on environment and community life', 'Reading environmental and community texts', 'Nouns, adjectives and conjunctions in context', 'Paragraph writing on environmental care'),
  upperWeek('Poetry and oral interpretation', 'Poetry recitation and listening response', 'Reading poems for meaning and rhythm', 'Adverbs and idiomatic expressions', 'Creative writing from poems'),
  upperWeek('Narratives and drama', 'Role play and storytelling', 'Reading narrative and dramatic extracts', 'Pronouns, verbs and modals in dialogue', 'Narrative and dialogue writing'),
  upperWeek('Questions and explanation', 'Oral explanation and questioning skills', 'Reading explanatory texts', 'Prepositions and sentence building', 'Informative writing on familiar topics'),
  upperWeek('Reading fluency and summarising', 'Oral reading with expression', 'Silent reading, fluency and summarising', 'Grammar review through summary sentences', 'Summary writing'),
  upperWeek('Vocabulary and word study', 'Oral vocabulary application', 'Reading vocabulary in context', 'Word and phrase study across texts', 'Writing with varied vocabulary'),
  upperWeek('Descriptive and persuasive writing', 'Oral opinion and justification', 'Reading simple persuasive texts', 'Conjunctions and modals in persuasion', 'Persuasive or descriptive composition'),
  upperWeek('Writing process and editing', 'Peer discussion of ideas', 'Reading model texts for editing', 'Grammar and conventions for revision', 'Drafting, revising and polishing writing'),
  upperWeek('Extensive reading culture', 'Book talk and discussion', 'Extensive reading with reflection', 'Sentence-level review from reading', 'Reading journal or response paragraph'),
  upperWeek('Presentation and project communication', 'Short oral presentation from project work', 'Reading supporting texts and notes', 'Grammar support for speech and writing', 'Short report or project paragraph'),
  upperWeek('Revision through integrated tasks', 'Oral review through discussion and games', 'Reading review texts', 'Grammar and sentence review', 'Integrated revision writing'),
  upperWeek('Year-end showcase', 'Final presentation and reflection', 'Reading fluency showcase and review', 'Grammar usage recap', 'Writing portfolio showcase'),
];

const b5Term1: WeeklyBundle[] = [
  upperWeek('Community, family and social issues', 'Conversation and presentation on family and community issues', 'Reading longer texts for understanding and inference', 'Nouns, determiners, pronouns and adjectives in context', 'Paragraph development on community life'),
  upperWeek('Poetry, songs and oral performance', 'Poetry and oral performance with expression', 'Reading poems and songs for message and style', 'Verbs, adverbs and idiomatic expressions', 'Creative/free writing from poetry'),
  upperWeek('Storytelling, drama and dialogue', 'Dramatization and role play', 'Reading stories and dramatic passages', 'Conjunctions and modals in dialogue', 'Narrative and dialogue writing'),
  upperWeek('Listening for information', 'Listening comprehension and oral summary', 'Reading related informational texts', 'Word and phrase work in summaries', 'Summary writing from listening and reading'),
  upperWeek('Questions, tags and response', 'Asking and answering questions and question tags', 'Reading conversational texts and interviews', 'Pronouns and sentence patterns in response', 'Writing question-answer exchanges'),
  upperWeek('Directions and instructions', 'Giving and following directions orally', 'Reading procedural texts', 'Prepositions and verbs in procedural language', 'Functional writing: instructions and notices'),
  upperWeek('Vocabulary and comprehension', 'Using topic vocabulary in oral discussions', 'Reading vocabulary-rich passages with comprehension', 'Word-class review in context', 'Informative paragraph writing'),
  upperWeek('Silent reading and fluency', 'Book talk and oral reading', 'Silent reading, fluency and comprehension', 'Sentence-level grammar choices from reading', 'Reading response writing'),
  upperWeek('Narrative writing', 'Planning and sharing story ideas orally', 'Reading narrative models', 'Tense and pronoun control in narratives', 'Narrative composition'),
  upperWeek('Descriptive and persuasive writing', 'Oral opinion and justification', 'Reading descriptive and persuasive texts', 'Adjectives, adverbs and conjunctions in context', 'Descriptive or persuasive composition'),
  upperWeek('Extensive reading and reflection', 'Independent reading talk', 'Extensive reading and response', 'Vocabulary and sentence review from books', 'Book response or reflection paragraph'),
  upperWeek('Integrated review and presentation', 'Presentation of learning from the term', 'Reading, summarising and fluency review', 'Grammar usage review across tasks', 'Writing portfolio review'),
];

const b5Term2: WeeklyBundle[] = [
  upperWeek('Customs, festivals and values', 'Discussion and presentation on customs and festivals', 'Reading cultural and informational texts', 'Nouns, verbs and adjectives in cultural contexts', 'Informative paragraph writing on festivals and values'),
  upperWeek('Listening and oral explanation', 'Listening to oral texts and explaining ideas', 'Reading for gist and detail', 'Determiners, pronouns and modals in explanation', 'Summary and explanation writing'),
  upperWeek('Stories, poems and role play', 'Storytelling, poetry and drama performance', 'Reading narrative and poetic passages', 'Adverbs, conjunctions and idioms in context', 'Creative/free writing or drama script'),
  upperWeek('Commands, directions and requests', 'Oral command and request practice', 'Reading instructional texts and notices', 'Prepositions and sentence forms in context', 'Functional writing'),
  upperWeek('Vocabulary growth and comprehension', 'Oral use of new vocabulary', 'Reading comprehension with vocabulary focus', 'Word and phrase study from passages', 'Expository paragraph writing'),
  upperWeek('Fluency, silent reading and summarising', 'Oral reading and discussion', 'Silent reading, fluency and summarising', 'Grammar choices for concise writing', 'Summary writing'),
  upperWeek('Writing as a process', 'Oral brainstorming and peer conferencing', 'Reading model texts for organisation', 'Grammar support during drafting and revision', 'Process writing workshop'),
  upperWeek('Narrative and descriptive writing', 'Oral retelling and description', 'Reading narrative and descriptive models', 'Verb choice, adjectives and adverbs', 'Narrative/descriptive composition'),
  upperWeek('Persuasive and informative writing', 'Oral argument and explanation', 'Reading persuasive and informative texts', 'Modals and conjunctions for persuasion', 'Persuasive or expository writing'),
  upperWeek('Letter writing and presentation', 'Speaking for audience and purpose', 'Reading model letters and messages', 'Sentence and phrase choices in formal and informal communication', 'Letter writing'),
  upperWeek('Extensive reading culture', 'Book discussion and oral recommendation', 'Extensive reading and reflection', 'Grammar review through reading response', 'Reading reflection writing'),
  upperWeek('Integrated review', 'Presentation and oral reflection', 'Reading comprehension and summarising review', 'Grammar usage consolidation', 'Writing portfolio review'),
];

const b5Term3: WeeklyBundle[] = [
  upperWeek('Environment, health and responsibility', 'Conversation and presentation on environment and health', 'Reading health and environmental texts', 'Nouns, verbs and adjectives in issue-based texts', 'Informative paragraph writing on responsibility'),
  upperWeek('Poetry and figurative expression', 'Poetry reading and oral interpretation', 'Reading poems for imagery and message', 'Idiomatic expressions, adverbs and conjunctions', 'Creative writing inspired by poems'),
  upperWeek('Narratives, dialogue and drama', 'Role play and dramatization', 'Reading narrative and dramatic pieces', 'Modals, pronouns and verbs in dialogue', 'Narrative/dialogue composition'),
  upperWeek('Listening and reporting', 'Listening to oral texts and reporting back', 'Reading related informational texts', 'Sentence building for reports', 'Short report or summary writing'),
  upperWeek('Questioning and discussion', 'Questions, question tags and discussion', 'Reading interview or discussion texts', 'Grammar support for spoken and written response', 'Writing discussion responses'),
  upperWeek('Fluency and summarising', 'Reading aloud with expression', 'Fluency, silent reading and summarising', 'Grammar review for concise writing', 'Summary paragraphs'),
  upperWeek('Vocabulary and expository reading', 'Oral use of academic vocabulary', 'Reading expository/informative texts', 'Word and phrase meanings in context', 'Expository writing'),
  upperWeek('Writing process and editing', 'Peer discussion and editing talk', 'Reading model drafts and revised texts', 'Grammar and conventions for editing', 'Drafting, revising and proofreading'),
  upperWeek('Persuasive and letter writing', 'Oral persuasion and audience awareness', 'Reading persuasive texts and letters', 'Conjunctions, modals and sentence variety', 'Persuasive writing or letter writing'),
  upperWeek('Extensive reading and response', 'Book talk and oral reflection', 'Extensive reading with comprehension response', 'Grammar awareness from reading', 'Book review or response writing'),
  upperWeek('Revision through project work', 'Presentation of a class project', 'Reading project support materials', 'Grammar and word study review', 'Integrated project writing'),
  upperWeek('Year-end showcase', 'Final presentation and oral reflection', 'Reading and fluency review', 'Grammar usage recap', 'Writing portfolio showcase'),
];

const b6Term1: WeeklyBundle[] = [
  upperWeek('Identity, society and leadership', 'Conversation, listening and presentation on identity and leadership', 'Reading informational and reflective texts', 'Nouns, pronouns, determiners and adjectives in context', 'Paragraph development on identity and leadership'),
  upperWeek('Poetry, songs and oral interpretation', 'Poems and oral interpretation with confidence', 'Reading poems for tone, message and rhythm', 'Adverbs, idiomatic expressions and conjunctions', 'Creative writing from poetry'),
  upperWeek('Storytelling, drama and oral performance', 'Storytelling and role play for audience', 'Reading narrative and dramatic texts', 'Verb choices, modals and direct speech', 'Narrative/dramatic writing'),
  upperWeek('Listening comprehension and reporting', 'Listening for key ideas and reporting them', 'Reading linked factual texts', 'Sentence patterns for reporting information', 'Summary or report writing'),
  upperWeek('Questioning and explanation', 'Asking and answering questions effectively', 'Reading explanatory and interview-style texts', 'Pronouns, modals and prepositions in explanation', 'Explanatory paragraph writing'),
  upperWeek('Directions and functional communication', 'Giving and following commands, directions and requests', 'Reading functional texts and notices', 'Prepositions and sentence types in context', 'Functional writing'),
  upperWeek('Vocabulary, reading and inference', 'Oral use of target vocabulary', 'Reading for vocabulary, comprehension and inference', 'Word and phrase study in context', 'Informative writing using evidence from reading'),
  upperWeek('Silent reading, fluency and summarising', 'Book talk and oral response', 'Silent reading, fluency and summarising', 'Grammar review for concise summaries', 'Summary writing'),
  upperWeek('Writing as a process', 'Planning, peer discussion and conferencing', 'Reading model texts for organisation', 'Grammar choices during revision', 'Drafting, revising and editing compositions'),
  upperWeek('Narrative and descriptive writing', 'Oral planning of narratives and descriptions', 'Reading narrative and descriptive models', 'Adjective and adverb phrases in context', 'Narrative/descriptive composition'),
  upperWeek('Extensive reading and reflective response', 'Independent reading sharing', 'Extensive reading and reflective comprehension', 'Vocabulary and sentence review from books', 'Reflective reading response'),
  upperWeek('Integrated term review', 'Presentation and reflection on learning', 'Reading comprehension and fluency review', 'Grammar usage review across strands', 'Integrated writing portfolio review'),
];

const b6Term2: WeeklyBundle[] = [
  upperWeek('Customs, citizenship and values', 'Discussion and presentation on customs, citizenship and values', 'Reading social and cultural texts critically', 'Nouns, verbs, conjunctions and modals in issue-based texts', 'Informative and reflective paragraph writing'),
  upperWeek('Listening, questioning and discussion', 'Listening comprehension and discussion', 'Reading texts for main ideas and viewpoints', 'Pronouns, conjunctions and sentence patterns for discussion', 'Written response and summary writing'),
  upperWeek('Poetry, stories and drama', 'Poetry recitation and role play', 'Reading narrative, poetry and drama with interpretation', 'Idiomatic expressions, direct and reported speech', 'Creative writing or script writing'),
  upperWeek('Directions, instructions and public messages', 'Speaking for instruction and direction', 'Reading notices, speeches and procedural texts', 'Prepositions, modals and sentence types', 'Functional writing and notice writing'),
  upperWeek('Vocabulary and expository reading', 'Using academic and topic vocabulary orally', 'Reading expository and informative texts', 'Word and phrase study from expository passages', 'Expository writing'),
  upperWeek('Fluency, silent reading and summarising', 'Oral reading and book talk', 'Silent reading, fluency and summarising', 'Grammar review for clear summaries', 'Summary and response writing'),
  upperWeek('Writing process workshop', 'Peer conferencing and planning', 'Reading model informative and persuasive texts', 'Editing with grammar and conventions in mind', 'Process writing'),
  upperWeek('Persuasive and argumentative writing', 'Oral argument and defence of opinions', 'Reading persuasive texts for techniques', 'Conjunctions, modals and sentence variety in argument', 'Persuasive/argumentative composition'),
  upperWeek('Letter writing and audience awareness', 'Oral presentation for audience and purpose', 'Reading formal and informal letters', 'Grammar choices for tone and purpose', 'Letter writing'),
  upperWeek('Extensive reading and reflection', 'Book discussion and recommendation', 'Extensive reading and analytical response', 'Vocabulary and grammar awareness from reading', 'Reading reflection or review'),
  upperWeek('Project communication week', 'Short oral project presentation', 'Reading supporting sources for a project', 'Grammar review through drafting', 'Project report or presentation writing'),
  upperWeek('Integrated review', 'Presentation and oral reflection', 'Reading and summarising review', 'Grammar usage consolidation', 'Writing portfolio review'),
];

const b6Term3: WeeklyBundle[] = [
  upperWeek('Environment, health and development', 'Conversation and presentation on environment, health and development', 'Reading issue-based informational texts', 'Nouns, adjectives, modals and conjunctions in context', 'Informative paragraph writing on issues'),
  upperWeek('Poetry and figurative language', 'Poetry recitation and oral interpretation', 'Reading poems for imagery, mood and message', 'Idiomatic expressions and figurative choices in context', 'Creative/free writing from poetry'),
  upperWeek('Narrative, drama and reporting speech', 'Role play and storytelling', 'Reading dramatic and narrative pieces', 'Direct and reported speech, verb control', 'Narrative/dialogue writing'),
  upperWeek('Listening and synthesis', 'Listening to oral texts and synthesising ideas', 'Reading complementary texts for comparison', 'Sentence and phrase choices for synthesis', 'Short report or synthesis writing'),
  upperWeek('Questions, explanations and evaluation', 'Questioning and answering with justification', 'Reading explanatory and evaluative texts', 'Pronouns, modals and sentence variety', 'Explanatory writing'),
  upperWeek('Fluency, silent reading and summarising', 'Oral reading and discussion', 'Silent reading, fluency and summarising', 'Grammar choices in concise writing', 'Summary paragraphs'),
  upperWeek('Vocabulary, inference and response', 'Oral use of nuanced vocabulary', 'Reading for inference, author’s purpose and response', 'Word and phrase development in context', 'Reflective and expository response writing'),
  upperWeek('Writing process and polishing', 'Peer discussion, conferencing and editing', 'Reading model polished texts', 'Grammar, punctuation and spelling during revision', 'Process writing and proofreading'),
  upperWeek('Persuasive, informative and letter writing', 'Presenting opinions and information orally', 'Reading persuasive, informative texts and letters', 'Sentence control for varied purposes', 'Persuasive/informative writing or letters'),
  upperWeek('Extensive reading and book response', 'Book talk and oral critique', 'Extensive reading and critical response', 'Vocabulary review from books', 'Book review or response essay'),
  upperWeek('Revision through integrated tasks', 'Project presentation and oral review', 'Reading review texts and summaries', 'Grammar usage review across strands', 'Integrated revision writing'),
  upperWeek('Transition showcase', 'Final oral presentation and reflection', 'Reading fluency and comprehension showcase', 'Grammar and conventions recap', 'Final writing portfolio and JHS readiness reflection'),
];

export const primaryEnglishTerms: ExplicitCurriculumTerm[] = [
  buildTerm('B1', 'Term 1', b1Term1),
  buildTerm('B1', 'Term 2', b1Term2),
  buildTerm('B1', 'Term 3', b1Term3),
  buildTerm('B2', 'Term 1', b2Term1),
  buildTerm('B2', 'Term 2', b2Term2),
  buildTerm('B2', 'Term 3', b2Term3),
  buildTerm('B3', 'Term 1', b3Term1),
  buildTerm('B3', 'Term 2', b3Term2),
  buildTerm('B3', 'Term 3', b3Term3),
  buildTerm('B4', 'Term 1', b4Term1),
  buildTerm('B4', 'Term 2', b4Term2),
  buildTerm('B4', 'Term 3', b4Term3),
  buildTerm('B5', 'Term 1', b5Term1),
  buildTerm('B5', 'Term 2', b5Term2),
  buildTerm('B5', 'Term 3', b5Term3),
  buildTerm('B6', 'Term 1', b6Term1),
  buildTerm('B6', 'Term 2', b6Term2),
  buildTerm('B6', 'Term 3', b6Term3),
];
