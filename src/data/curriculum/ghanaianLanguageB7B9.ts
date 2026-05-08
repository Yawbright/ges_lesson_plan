import type { ExplicitCurriculumTerm } from './mathematicsB7';
import type { SchemeWeek, SchemeWeekEntry } from '@/types/scheme';

const resources = {
  customs: ['Ghanaian Language textbook', 'Community elders', 'Picture cards', 'Culture notes'],
  oral: ['Prompt cards', 'Audio clips', 'Conversation guide', 'Teacher model'],
  reading: ['Short passages', 'Big book or reader', 'Question cards', 'Dictionary'],
  usage: ['Sentence cards', 'Grammar chart', 'Exercise book', 'Word bank'],
  writing: ['Exercise book', 'Writing frame', 'Model paragraphs', 'Peer checklist'],
  literature: ['Folktales', 'Songs', 'Poems', 'Drama excerpts'],
};

function entry(
  strand: string,
  subStrand: string,
  contentStandard: string,
  indicator: string,
  topic: string,
  extraResources: string[]
): SchemeWeekEntry {
  return {
    strand,
    subStrand,
    contentStandard,
    indicator,
    topic,
    resources: extraResources,
  };
}

function week(weekNumber: number, theme: string, entries: SchemeWeekEntry[]): SchemeWeek {
  const primary = entries[0];
  const mergedResources = [...new Set(entries.flatMap((item) => item.resources ?? []))];

  return {
    week: weekNumber,
    theme,
    topic: theme,
    strand: primary?.strand,
    subStrand: primary?.subStrand,
    contentStandard: primary?.contentStandard,
    indicator: primary?.indicator,
    resources: mergedResources,
    entries,
  };
}

function customs(level: 'B7' | 'B8' | 'B9', subStrand: string, topic: string, indicator: string) {
  return entry(
    'Customs and Institutions',
    subStrand,
    `${level}.1 Explore customs and institutions in Ghanaian society through language.`,
    indicator,
    topic,
    resources.customs
  );
}

function oral(level: 'B7' | 'B8' | 'B9', subStrand: string, topic: string, indicator: string) {
  return entry(
    'Listening and Speaking',
    subStrand,
    `${level}.2 Develop listening and speaking skills in meaningful Ghanaian Language contexts.`,
    indicator,
    topic,
    resources.oral
  );
}

function reading(level: 'B7' | 'B8' | 'B9', subStrand: string, topic: string, indicator: string) {
  return entry(
    'Reading',
    subStrand,
    `${level}.3 Read and interpret age-appropriate texts in Ghanaian Language.`,
    indicator,
    topic,
    resources.reading
  );
}

function usage(level: 'B7' | 'B8' | 'B9', subStrand: string, topic: string, indicator: string) {
  return entry(
    'Language and Usage',
    subStrand,
    `${level}.4 Apply grammar, vocabulary and conventions accurately in Ghanaian Language.`,
    indicator,
    topic,
    resources.usage
  );
}

function writing(level: 'B7' | 'B8' | 'B9', subStrand: string, topic: string, indicator: string) {
  return entry(
    'Composition Writing',
    subStrand,
    `${level}.5 Structure and organise ideas effectively in Ghanaian Language writing.`,
    indicator,
    topic,
    resources.writing
  );
}

function literature(level: 'B7' | 'B8' | 'B9', subStrand: string, topic: string, indicator: string) {
  return entry(
    'Literature',
    subStrand,
    `${level}.6 Respond to oral and written literary forms in Ghanaian Language.`,
    indicator,
    topic,
    resources.literature
  );
}

export const ghanaianLanguageB7Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'Ghanaian Language',
    classLevel: 'B7',
    term: 'Term 1',
    title: 'B7 Ghanaian Language Scheme of Work - Term 1',
    weeks: [
      week(1, 'Childhood rites and everyday introductions', [
        customs('B7', 'Rites of Passage: Childhood Rites', 'Childhood rites in the local community', 'Describe key childhood rites and their meanings.'),
        oral('B7', 'Conversation/Everyday Discourse', 'Greetings and self-introduction in context', 'Use appropriate greetings and introductory expressions in conversation.'),
        reading('B7', 'Reading', 'Reading a short cultural passage on childhood rites', 'Read short passages and identify key ideas.'),
      ]),
      week(2, 'Naming systems and listening for detail', [
        customs('B7', 'Naming Systems: Day Names, Order of Birth Names', 'Day names and order-of-birth names', 'Explain the significance of common naming systems.'),
        oral('B7', 'Listening Comprehension', 'Listening to oral explanations about names', 'Listen for specific details and respond appropriately.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Writing short sentences about personal names', 'Write short organised sentences on familiar topics.'),
      ]),
      week(3, 'Clan identity and speech sounds', [
        customs('B7', 'The Clan System', 'Clan identity and totems', 'Discuss the meaning and importance of the clan system.'),
        oral('B7', 'Speech Sounds: Vowels, Consonants and Syllable', 'Pronouncing vowels, consonants and syllables', 'Articulate basic sound patterns clearly in words and phrases.'),
        usage('B7', 'Sentences: Simple, Compound and Complex', 'Building simple sentences from clan vocabulary', 'Construct simple sentences accurately.'),
      ]),
      week(4, 'Chieftaincy and reading with tone awareness', [
        customs('B7', 'Chieftaincy: Installation and Destoolment', 'Installation and destoolment of chiefs', 'Describe major chieftaincy procedures and roles.'),
        oral('B7', 'Tone', 'Tone patterns in familiar expressions', 'Use tone appropriately to convey meaning in oral communication.'),
        reading('B7', 'Translation', 'Reading and translating simple cultural statements', 'Translate simple words and statements accurately.'),
      ]),
      week(5, 'Vocabulary building from custom and institution texts', [
        oral('B7', 'Vocabulary Development', 'Sight and content vocabulary from cultural topics', 'Use relevant content vocabulary in speech.'),
        reading('B7', 'Reading', 'Reading for meaning in short custom-based texts', 'Read fluently and answer literal comprehension questions.'),
        usage('B7', 'Integrating Grammar in Written Language (Nouns, Pronouns and Adjectives)', 'Nouns, pronouns and adjectives in context', 'Use nouns, pronouns and adjectives accurately in sentences.'),
      ]),
      week(6, 'Presentation of everyday experiences', [
        oral('B7', 'Presentation: Everyday Experience', 'Presenting an everyday cultural experience', 'Present familiar experiences clearly and confidently.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Organising ideas into a short paragraph', 'Organise related ideas into a coherent paragraph.'),
        literature('B7', 'Folktales, Songs, Prose, Drama, Poetry', 'Listening to and retelling a simple folktale', 'Retell and respond to simple oral literature.'),
      ]),
      week(7, 'Reading and translation practice', [
        reading('B7', 'Reading', 'Reading a short narrative with fluency', 'Read with appropriate pace and understanding.'),
        reading('B7', 'Translation', 'Translating familiar sentences from and into the language', 'Translate familiar statements using appropriate vocabulary.'),
        usage('B7', 'Vocabulary, Spelling and Punctuation', 'Basic spelling and punctuation in context', 'Spell familiar words correctly and use punctuation marks appropriately.'),
      ]),
      week(8, 'Sentence variety in speaking and writing', [
        oral('B7', 'Conversation/Everyday Discourse', 'Speaking in complete sentences during discussion', 'Respond in complete and meaningful sentences.'),
        usage('B7', 'Sentences: Simple, Compound and Complex', 'Simple and compound sentence construction', 'Distinguish and construct simple and compound sentences.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Writing short descriptions with sentence variety', 'Write clear short descriptions using varied sentence forms.'),
      ]),
      week(9, 'Grammar in meaningful contexts', [
        reading('B7', 'Reading', 'Reading model sentences and short paragraphs', 'Identify grammatical features in context.'),
        usage('B7', 'Integrating Grammar in Written Language (Verbs, Adverbs, Conjunctions, Postpositions/Prepositions)', 'Verbs, adverbs, conjunctions and postpositions/prepositions', 'Use core grammar items appropriately in writing and speech.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Writing about family or school routines', 'Develop short organised compositions on familiar themes.'),
      ]),
      week(10, 'Songs, poems and expressive language', [
        oral('B7', 'Presentation: Everyday Experience', 'Oral performance of short cultural pieces', 'Use clear voice and expression in oral presentation.'),
        literature('B7', 'Folktales, Songs, Prose, Drama, Poetry', 'Songs and poems in Ghanaian Language', 'Identify features and messages in songs and poems.'),
        usage('B7', 'Vocabulary Development', 'Expressive vocabulary from songs and poems', 'Use new words and expressions meaningfully.'),
      ]),
      week(11, 'Folktales and guided composition', [
        reading('B7', 'Reading', 'Reading or listening to folktales for meaning', 'Identify characters, events and lessons in short stories.'),
        literature('B7', 'Folktales, Songs, Prose, Drama, Poetry', 'Folktale appreciation and moral lessons', 'Discuss themes and lessons from folktales.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Writing a guided retelling of a folktale', 'Retell a story in logical sequence in writing.'),
      ]),
      week(12, 'Integrated cultural language project', [
        customs('B7', 'Review of Customs and Institutions', 'Review of B7 customs and institution themes', 'Summarise key ideas from term cultural topics.'),
        oral('B7', 'Presentation: Everyday Experience', 'Group presentation on a cultural topic', 'Present group findings using appropriate language.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Final short composition on a cultural theme', 'Produce a coherent final composition from term learning.'),
      ]),
    ],
  },
  {
    subject: 'Ghanaian Language',
    classLevel: 'B7',
    term: 'Term 2',
    title: 'B7 Ghanaian Language Scheme of Work - Term 2',
    weeks: [
      week(1, 'Conversational routines and paragraph structure', [
        oral('B7', 'Conversation/Everyday Discourse', 'Conversational routines in school and community', 'Use appropriate expressions in everyday discourse.'),
        usage('B7', 'Sentences: Simple, Compound and Complex', 'Combining ideas into compound sentences', 'Join related ideas using appropriate connectors.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Topic sentence and supporting details', 'Write paragraphs with clear topic focus.'),
      ]),
      week(2, 'Listening and descriptive writing', [
        oral('B7', 'Listening Comprehension', 'Listening to a short account and sequencing details', 'Listen, recall and sequence information accurately.'),
        reading('B7', 'Reading', 'Reading descriptive passages', 'Identify main ideas and supporting details in short texts.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Descriptive writing on people and places', 'Write descriptive paragraphs on familiar subjects.'),
      ]),
      week(3, 'Sound patterns and translation practice', [
        oral('B7', 'Speech Sounds: Vowels, Consonants and Syllable', 'Review of sound patterns in words and phrases', 'Pronounce words accurately using correct sound patterns.'),
        reading('B7', 'Translation', 'Word and sentence translation practice', 'Translate familiar expressions appropriately.'),
        usage('B7', 'Vocabulary, Spelling and Punctuation', 'Spelling patterns and punctuation review', 'Apply spelling and punctuation conventions correctly.'),
      ]),
      week(4, 'Tone and oral presentation', [
        oral('B7', 'Tone', 'Tone in statements and questions', 'Use tone correctly to distinguish meanings.'),
        oral('B7', 'Presentation: Everyday Experience', 'Short prepared oral presentations', 'Present information confidently and clearly.'),
        literature('B7', 'Songs, Prose and Poetry', 'Using oral pieces to practise tone', 'Perform short oral texts with correct tone and expression.'),
      ]),
      week(5, 'Reading fluency and grammar choices', [
        reading('B7', 'Reading', 'Guided reading for fluency', 'Read short texts fluently and answer questions.'),
        usage('B7', 'Integrating Grammar in Written Language (Nouns, Pronouns and Adjectives)', 'Expanding noun and adjective use', 'Use nouns, pronouns and adjectives purposefully in context.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Sentence expansion in short writing', 'Improve writing with descriptive grammatical choices.'),
      ]),
      week(6, 'Drama and dialogue writing', [
        literature('B7', 'Drama', 'Simple dialogue and role play', 'Participate in simple dramatic performances.'),
        oral('B7', 'Conversation/Everyday Discourse', 'Turn-taking and respectful speaking', 'Participate appropriately in pair and group dialogue.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Writing short dialogue exchanges', 'Write short dialogues using suitable expressions.'),
      ]),
      week(7, 'Cultural reading and vocabulary growth', [
        customs('B7', 'Review of Naming and Clan Systems', 'Language of kinship and identity', 'Use terms related to kinship and identity accurately.'),
        reading('B7', 'Reading', 'Reading informational cultural texts', 'Read and interpret factual cultural information.'),
        oral('B7', 'Vocabulary Development', 'Cultural and content vocabulary', 'Use new cultural vocabulary appropriately in oral tasks.'),
      ]),
      week(8, 'Prose comprehension and organised retelling', [
        literature('B7', 'Prose', 'Short prose comprehension', 'Identify plot events and lesson in prose texts.'),
        reading('B7', 'Reading', 'Answering comprehension questions from prose', 'Extract evidence from prose passages.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Retelling a prose story', 'Retell prose in logical order in writing.'),
      ]),
      week(9, 'Grammar integration in real-life writing', [
        usage('B7', 'Integrating Grammar in Written Language (Verbs, Adverbs, Conjunctions, Postpositions/Prepositions)', 'Editing grammar in short paragraphs', 'Edit writing for accurate grammar use.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Writing about a school event', 'Produce a coherent account of an event.'),
        oral('B7', 'Listening Comprehension', 'Listening for grammatical accuracy in model sentences', 'Notice and correct simple usage patterns.'),
      ]),
      week(10, 'Poetry and expressive performance', [
        literature('B7', 'Poetry', 'Short poems and chant-like texts', 'Interpret and perform simple poems.'),
        oral('B7', 'Presentation: Everyday Experience', 'Expressive oral delivery', 'Use expression and confidence in performance.'),
        usage('B7', 'Vocabulary Development', 'Imagery and expressive vocabulary', 'Use expressive vocabulary from poems appropriately.'),
      ]),
      week(11, 'Composition workshop and peer response', [
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Planning, drafting and revising short composition', 'Draft and revise writing with guidance.'),
        reading('B7', 'Reading', 'Reading peer models and checklists', 'Use models to improve written work.'),
        oral('B7', 'Conversation/Everyday Discourse', 'Giving oral feedback respectfully', 'Offer useful oral feedback on peers’ work.'),
      ]),
      week(12, 'Integrated language and literature showcase', [
        oral('B7', 'Presentation: Everyday Experience', 'Showcase oral presentation', 'Present a prepared piece confidently.'),
        literature('B7', 'Folktales, Songs, Prose, Drama, Poetry', 'Term literature showcase', 'Respond to and perform selected literary pieces.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Final polished composition', 'Produce a polished composition from the term’s work.'),
      ]),
    ],
  },
  {
    subject: 'Ghanaian Language',
    classLevel: 'B7',
    term: 'Term 3',
    title: 'B7 Ghanaian Language Scheme of Work - Term 3',
    weeks: [
      week(1, 'Review of cultural themes through oral discussion', [
        customs('B7', 'Review of Childhood Rites, Names and Chieftaincy', 'Review of key B7 cultural topics', 'Recall and discuss major cultural concepts covered this year.'),
        oral('B7', 'Conversation/Everyday Discourse', 'Structured oral discussion on cultural values', 'Contribute relevant ideas in oral discussion.'),
        reading('B7', 'Reading', 'Reading a review passage on customs', 'Read and summarise key ideas from review texts.'),
      ]),
      week(2, 'Listening, note-making and simple reports', [
        oral('B7', 'Listening Comprehension', 'Listening to a short oral report', 'Take note of key information from oral texts.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Turning notes into a short report', 'Write a short organised report from oral input.'),
        usage('B7', 'Vocabulary, Spelling and Punctuation', 'Editing report writing conventions', 'Use correct spelling and punctuation in reports.'),
      ]),
      week(3, 'Fluency, translation and sentence control', [
        reading('B7', 'Reading', 'Reading aloud with fluency', 'Read aloud accurately and meaningfully.'),
        reading('B7', 'Translation', 'Translation of practical sentences', 'Translate familiar expressions correctly.'),
        usage('B7', 'Sentences: Simple, Compound and Complex', 'Review of sentence patterns', 'Choose suitable sentence patterns for meaning.'),
      ]),
      week(4, 'Storytelling and sequence in writing', [
        literature('B7', 'Folktales', 'Oral storytelling and sequence', 'Retell stories with clear beginning, middle and end.'),
        oral('B7', 'Presentation: Everyday Experience', 'Storytelling techniques', 'Use suitable oral features in storytelling.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Writing a short narrative sequence', 'Write a short narrative in logical order.'),
      ]),
      week(5, 'Songs, rhythm and vocabulary retention', [
        literature('B7', 'Songs', 'Traditional and school songs', 'Identify meaning and message in songs.'),
        oral('B7', 'Speech Sounds and Tone', 'Rhythm, pronunciation and tone in songs', 'Use correct pronunciation and tone in songs.'),
        usage('B7', 'Vocabulary Development', 'Vocabulary retention through songs', 'Retain and use new words from song texts.'),
      ]),
      week(6, 'Reading comprehension and grammar editing', [
        reading('B7', 'Reading', 'Short comprehension passages', 'Answer literal and inferential questions on short texts.'),
        usage('B7', 'Integrating Grammar in Written Language', 'Editing grammar in comprehension responses', 'Correct grammatical errors in written responses.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Writing clear responses from reading', 'Write organised responses to reading tasks.'),
      ]),
      week(7, 'Poetry response and expressive writing', [
        literature('B7', 'Poetry', 'Understanding imagery and message in simple poems', 'Discuss meaning and feeling in poems.'),
        oral('B7', 'Presentation: Everyday Experience', 'Poetry recital and response', 'Recite with clarity and expression.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Writing personal response to a poem', 'Write short personal responses to literature.'),
      ]),
      week(8, 'Conversation and cultural problem solving', [
        oral('B7', 'Conversation/Everyday Discourse', 'Role-play on family and community issues', 'Use appropriate language in role-play situations.'),
        customs('B7', 'Customs and Institutions Review', 'Applying cultural values to community issues', 'Relate cultural values to simple community problems.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Writing advice based on cultural values', 'Write advice or guidance on familiar problems.'),
      ]),
      week(9, 'Drama and collaborative language use', [
        literature('B7', 'Drama', 'Simple dramatic performance', 'Take part in short dramatic scenes.'),
        oral('B7', 'Conversation/Everyday Discourse', 'Collaboration and turn-taking in drama', 'Use turn-taking and clear speech in collaborative tasks.'),
        reading('B7', 'Reading', 'Reading short dramatic scripts', 'Read dramatic scripts with understanding.'),
      ]),
      week(10, 'Composition improvement week', [
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Drafting, revising and editing composition', 'Improve writing through revision and editing.'),
        usage('B7', 'Vocabulary, Spelling and Punctuation', 'Editing for correctness and clarity', 'Apply conventions accurately in final drafts.'),
        oral('B7', 'Listening Comprehension', 'Listening to model compositions', 'Identify features of effective oral and written texts.'),
      ]),
      week(11, 'Integrated reading and literature reflection', [
        reading('B7', 'Reading', 'Reading chosen term-end texts', 'Read independently and respond meaningfully.'),
        literature('B7', 'Folktales, Songs, Prose, Drama, Poetry', 'Reflecting on literary forms studied', 'Compare features of different literary forms.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Reflective writing on favourite texts', 'Write a short reflective piece on studied texts.'),
      ]),
      week(12, 'End-of-year language showcase', [
        oral('B7', 'Presentation: Everyday Experience', 'Year-end oral showcase', 'Deliver an oral presentation using appropriate language.'),
        writing('B7', 'Structure and Organise Ideas in Composition Writing', 'Best-work writing portfolio selection', 'Select and present improved written work.'),
        literature('B7', 'Folktales, Songs, Prose, Drama, Poetry', 'Performance and appreciation showcase', 'Perform and appreciate selected literary pieces.'),
      ]),
    ],
  },
];

export const ghanaianLanguageB8Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'Ghanaian Language',
    classLevel: 'B8',
    term: 'Term 1',
    title: 'B8 Ghanaian Language Scheme of Work - Term 1',
    weeks: [
      week(1, 'Puberty rites and oral interaction', [
        customs('B8', 'Rites of Passage: Puberty Rites', 'Puberty rites and their social meaning', 'Describe puberty rites and their values.'),
        oral('B8', 'Conversation/Everyday Discourse', 'Discussing puberty rites respectfully', 'Use suitable language in sensitive discussions.'),
        reading('B8', 'Reading', 'Reading cultural passages on puberty rites', 'Read to identify central ideas in cultural texts.'),
      ]),
      week(2, 'Naming systems and listening comprehension', [
        customs('B8', 'Naming Systems: Family Names, Kinship Terms, Proverbial and Insinuation Names', 'Family names and kinship terms', 'Explain the function of family names and kinship terms.'),
        oral('B8', 'Listening Comprehension', 'Listening to oral examples of naming practices', 'Listen for details and implied meaning.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Writing about kinship and family names', 'Write coherent short compositions on naming systems.'),
      ]),
      week(3, 'Proverbial names and vocabulary development', [
        customs('B8', 'Naming Systems', 'Proverbial and insinuation names', 'Interpret meanings behind proverbial and insinuation names.'),
        oral('B8', 'Vocabulary Development', 'Kinship and proverbial vocabulary', 'Use content vocabulary appropriately in speech.'),
        literature('B8', 'Proverbs and Idioms', 'Proverbial expressions connected to names', 'Identify and explain simple proverbs and idioms.'),
      ]),
      week(4, 'Clan system and reading for meaning', [
        customs('B8', 'The Clan System', 'Clan relationships and obligations', 'Discuss the functions of clans in society.'),
        reading('B8', 'Reading', 'Reading informational texts on clan systems', 'Read, interpret and discuss cultural texts.'),
        usage('B8', 'Integrating Grammar in Written Language (Use of Nouns, Pronouns and Adjectives)', 'Using descriptive grammar in clan descriptions', 'Use nouns, pronouns and adjectives precisely in writing.'),
      ]),
      week(5, 'Chieftaincy and oral presentation', [
        customs('B8', 'Chieftaincy: Destoolment', 'Destoolment and accountability in leadership', 'Explain why leaders may be destooled.'),
        oral('B8', 'Presentation: Everyday Experience', 'Short talks on leadership and responsibility', 'Present ideas clearly to an audience.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Writing a short account of a leadership issue', 'Organise ideas logically in short writing.'),
      ]),
      week(6, 'Conversation and practical reading', [
        oral('B8', 'Conversation/Everyday Discourse', 'Conversing on community and school issues', 'Sustain purposeful everyday conversation.'),
        reading('B8', 'Reading', 'Short practical reading passages', 'Read and answer factual and inferential questions.'),
        usage('B8', 'Vocabulary, Spelling and Punctuation', 'Editing everyday language texts', 'Apply conventions in meaningful contexts.'),
      ]),
      week(7, 'Listening, tone and message delivery', [
        oral('B8', 'Listening Comprehension', 'Listening to oral instructions and stories', 'Follow and summarise oral messages accurately.'),
        oral('B8', 'Tone', 'Tone in oral messages and storytelling', 'Use tone to support intended meaning.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Summarising oral information in writing', 'Write organised summaries from oral input.'),
      ]),
      week(8, 'Translation and grammar integration', [
        reading('B8', 'Translation', 'Translation of connected statements', 'Translate short connected texts accurately.'),
        usage('B8', 'Integrating Grammar in Written Language (Verbs, Adverbs, Conjunctions)', 'Verbs, adverbs and conjunctions in connected writing', 'Use key grammar forms accurately in context.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Writing connected paragraphs from translation tasks', 'Develop connected paragraphs from guided tasks.'),
      ]),
      week(9, 'Proverbs, idioms and oral expression', [
        literature('B8', 'Proverbs and Idioms', 'Meaning and use of common proverbs and idioms', 'Interpret and apply simple proverbs and idioms.'),
        oral('B8', 'Conversation/Everyday Discourse', 'Using proverbs appropriately in speech', 'Use figurative language meaningfully in oral contexts.'),
        reading('B8', 'Reading', 'Reading short texts rich in idiomatic language', 'Read and infer meanings from context.'),
      ]),
      week(10, 'Prose and composition writing', [
        literature('B8', 'Prose', 'Understanding a short prose passage', 'Identify theme, events and message in prose.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Narrative and descriptive paragraph writing', 'Write organised narrative or descriptive paragraphs.'),
        usage('B8', 'Integrating Grammar in Written Language', 'Grammar choices in prose response writing', 'Choose accurate grammar forms in written responses.'),
      ]),
      week(11, 'Drama, poetry and performance', [
        literature('B8', 'Drama and Poetry', 'Simple performance pieces in Ghanaian Language', 'Respond to and perform short drama or poetry.'),
        oral('B8', 'Presentation: Everyday Experience', 'Performance with confidence and clear diction', 'Use voice and expression in oral performance.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Writing a short dramatic or poetic response', 'Write simple creative responses to literature.'),
      ]),
      week(12, 'Integrated term review', [
        customs('B8', 'Review of Customs and Institutions', 'Review of puberty rites, names, clan and chieftaincy', 'Summarise main ideas from B8 customs topics.'),
        oral('B8', 'Presentation: Everyday Experience', 'Term review presentation', 'Present learned content in organised form.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Final term composition', 'Produce a final coherent composition based on term themes.'),
      ]),
    ],
  },
  {
    subject: 'Ghanaian Language',
    classLevel: 'B8',
    term: 'Term 2',
    title: 'B8 Ghanaian Language Scheme of Work - Term 2',
    weeks: [
      week(1, 'Oral interaction and composition planning', [
        oral('B8', 'Conversation/Everyday Discourse', 'Extended conversation on familiar themes', 'Contribute relevant ideas and respond appropriately in discussion.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Planning and outlining compositions', 'Plan writing before drafting.'),
        usage('B8', 'Integrating Grammar in Written Language', 'Sentence control in composition plans', 'Use accurate sentence structures in outlines and drafts.'),
      ]),
      week(2, 'Listening and summary writing', [
        oral('B8', 'Listening Comprehension', 'Listening to oral narratives and explanations', 'Identify and summarise important points from oral texts.'),
        reading('B8', 'Reading', 'Reading related passages for comparison', 'Compare oral and written information on a similar topic.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Writing short summaries', 'Produce concise and coherent summaries.'),
      ]),
      week(3, 'Tone, fluency and oral performance', [
        oral('B8', 'Tone', 'Using tone in reading and speaking', 'Apply tone appropriately in oral expression.'),
        oral('B8', 'Presentation: Everyday Experience', 'Prepared oral performance', 'Present familiar material confidently and clearly.'),
        literature('B8', 'Poetry', 'Performance of short poetic pieces', 'Perform poems with understanding and expression.'),
      ]),
      week(4, 'Reading and translation workshop', [
        reading('B8', 'Reading', 'Fluent reading of connected texts', 'Read and interpret connected texts with understanding.'),
        reading('B8', 'Translation', 'Paragraph-level translation practice', 'Translate short paragraphs with reasonable accuracy.'),
        usage('B8', 'Vocabulary, Spelling and Punctuation', 'Editing translated texts', 'Use correct spelling and punctuation in translated work.'),
      ]),
      week(5, 'Grammar in authentic contexts', [
        usage('B8', 'Integrating Grammar in Written Language (Use of Nouns, Pronouns and Adjectives)', 'Precision in descriptive language', 'Use noun and adjective structures precisely.'),
        usage('B8', 'Integrating Grammar in Written Language (Verbs, Adverbs, Conjunctions)', 'Verb and connector choice in narrative flow', 'Use verbs, adverbs and conjunctions effectively.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Improving paragraph cohesion', 'Link ideas clearly in paragraphs.'),
      ]),
      week(6, 'Proverbs and moral discussion', [
        literature('B8', 'Proverbs and Idioms', 'Moral and social meanings in proverbs', 'Explain and apply messages in proverbs.'),
        oral('B8', 'Conversation/Everyday Discourse', 'Discussing values using proverbs', 'Use proverbs to support opinions in discussion.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Writing a short reflection from a proverb', 'Write short reflective pieces based on proverbs.'),
      ]),
      week(7, 'Idioms and contextual reading', [
        literature('B8', 'Proverbs and Idioms', 'Idioms in context', 'Infer and explain idiomatic meaning in context.'),
        reading('B8', 'Reading', 'Short passages with figurative language', 'Read figurative expressions within context.'),
        usage('B8', 'Vocabulary Development', 'Context vocabulary from figurative texts', 'Use idiomatic and content vocabulary appropriately.'),
      ]),
      week(8, 'Prose response and organised retelling', [
        literature('B8', 'Prose', 'Reading and discussing prose', 'Discuss events, characters and lessons in prose texts.'),
        reading('B8', 'Reading', 'Comprehension response to prose', 'Respond to prose using textual evidence.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Retelling prose in logical order', 'Write coherent retellings of prose texts.'),
      ]),
      week(9, 'Drama dialogue and collaborative speaking', [
        literature('B8', 'Drama', 'Short scenes and role-play', 'Participate in simple drama and role-play.'),
        oral('B8', 'Conversation/Everyday Discourse', 'Dialogue for dramatic situations', 'Use appropriate language in dramatic dialogue.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Script-writing basics', 'Write short dialogue scripts for performance.'),
      ]),
      week(10, 'Poetry, imagery and expression', [
        literature('B8', 'Poetry', 'Imagery and message in poems', 'Identify theme and imagery in short poems.'),
        oral('B8', 'Presentation: Everyday Experience', 'Poetry recital', 'Recite poems with expression and confidence.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Short poetic response', 'Write a short response or imitation inspired by a poem.'),
      ]),
      week(11, 'Composition workshop and peer editing', [
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Drafting, editing and improving compositions', 'Revise compositions using feedback.'),
        usage('B8', 'Vocabulary, Spelling and Punctuation', 'Proofreading conventions', 'Proofread and edit for correctness.'),
        oral('B8', 'Conversation/Everyday Discourse', 'Giving constructive peer feedback', 'Give helpful oral feedback respectfully.'),
      ]),
      week(12, 'Integrated term performance and writing task', [
        oral('B8', 'Presentation: Everyday Experience', 'Integrated oral showcase', 'Present a coherent oral piece using term skills.'),
        literature('B8', 'Proverbs, Idioms, Prose, Drama, Poetry', 'Literature review and performance', 'Compare and perform selected literary forms.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Final composition task', 'Produce a polished final piece of writing.'),
      ]),
    ],
  },
  {
    subject: 'Ghanaian Language',
    classLevel: 'B8',
    term: 'Term 3',
    title: 'B8 Ghanaian Language Scheme of Work - Term 3',
    weeks: [
      week(1, 'Customs review through reading and speaking', [
        customs('B8', 'Review of Puberty Rites, Naming, Clan and Chieftaincy', 'Review of B8 cultural themes', 'Recall and relate key cultural ideas covered in B8.'),
        oral('B8', 'Conversation/Everyday Discourse', 'Speaking on cultural identity', 'Express ideas on culture in organised speech.'),
        reading('B8', 'Reading', 'Review reading on culture and identity', 'Read and summarise review texts accurately.'),
      ]),
      week(2, 'Listening, note-making and short reports', [
        oral('B8', 'Listening Comprehension', 'Listening to interviews or oral reports', 'Record and organise key ideas from oral texts.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Short report writing from notes', 'Turn notes into structured short reports.'),
        usage('B8', 'Vocabulary, Spelling and Punctuation', 'Editing report language', 'Refine report writing for accuracy.'),
      ]),
      week(3, 'Fluent reading and translation', [
        reading('B8', 'Reading', 'Guided and independent reading', 'Read with fluency and understanding.'),
        reading('B8', 'Translation', 'Connected-text translation', 'Translate meaningfully at sentence and paragraph level.'),
        usage('B8', 'Integrating Grammar in Written Language', 'Grammar review during translation', 'Maintain grammatical accuracy while translating.'),
      ]),
      week(4, 'Oral presentation and descriptive writing', [
        oral('B8', 'Presentation: Everyday Experience', 'Speaking from personal and community experience', 'Deliver short oral presentations effectively.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Descriptive and expository writing', 'Write clear descriptive or expository paragraphs.'),
        reading('B8', 'Reading', 'Model texts for presentation and description', 'Analyse model texts for structure and style.'),
      ]),
      week(5, 'Proverb, idiom and reflective composition', [
        literature('B8', 'Proverbs and Idioms', 'Selecting proverbs for given situations', 'Apply proverbs and idioms to social situations.'),
        oral('B8', 'Conversation/Everyday Discourse', 'Using figurative language in discussion', 'Use figurative expressions appropriately in conversation.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Reflective writing using a proverb', 'Write a short reflection around a proverb or idiom.'),
      ]),
      week(6, 'Prose and comprehension response', [
        literature('B8', 'Prose', 'Understanding sequence and character motives', 'Interpret basic features of prose texts.'),
        reading('B8', 'Reading', 'Answering comprehension questions in full sentences', 'Provide clear written responses to prose passages.'),
        usage('B8', 'Integrating Grammar in Written Language', 'Sentence accuracy in responses', 'Use accurate grammar in comprehension answers.'),
      ]),
      week(7, 'Drama, scripts and collaborative speaking', [
        literature('B8', 'Drama', 'Role-play and scripted speaking', 'Perform short scripted scenes effectively.'),
        oral('B8', 'Conversation/Everyday Discourse', 'Voice, timing and turn-taking in drama', 'Use clear speech and turn-taking in collaborative tasks.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Improving short scripts', 'Revise short scripts for performance.'),
      ]),
      week(8, 'Poetry and oral expression', [
        literature('B8', 'Poetry', 'Theme and feeling in poems', 'Discuss mood, theme and language in short poems.'),
        oral('B8', 'Presentation: Everyday Experience', 'Poetry recital and commentary', 'Present oral commentary with confidence.'),
        usage('B8', 'Vocabulary Development', 'Expressive language from poems', 'Use vocabulary from poems in meaningful ways.'),
      ]),
      week(9, 'Writing improvement and editing', [
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Drafting and revising longer compositions', 'Develop more complete and organised compositions.'),
        usage('B8', 'Vocabulary, Spelling and Punctuation', 'Self- and peer-editing', 'Edit for spelling, punctuation and word choice.'),
        reading('B8', 'Reading', 'Using model texts as writing support', 'Use reading models to improve writing quality.'),
      ]),
      week(10, 'Integrated literacy project', [
        reading('B8', 'Reading', 'Gathering information from short texts', 'Collect relevant information from multiple short texts.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Turning reading into a project write-up', 'Organise information into a simple project draft.'),
        oral('B8', 'Presentation: Everyday Experience', 'Project briefing to peers', 'Explain project ideas orally in organised form.'),
      ]),
      week(11, 'Literature appreciation and comparison', [
        literature('B8', 'Proverbs, Idioms, Prose, Drama, Poetry', 'Comparing literary forms', 'Compare selected features of different literary forms.'),
        oral('B8', 'Conversation/Everyday Discourse', 'Discussing favourite texts and performances', 'Justify opinions about texts orally.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Short comparative response', 'Write a short comparison of two texts or forms.'),
      ]),
      week(12, 'End-of-year blended language showcase', [
        oral('B8', 'Presentation: Everyday Experience', 'End-of-year oral showcase', 'Use listening and speaking skills in a final presentation.'),
        writing('B8', 'Structure and Organise Ideas in Composition Writing', 'Final writing portfolio selection', 'Present a polished final writing piece.'),
        literature('B8', 'Proverbs, Idioms, Prose, Drama, Poetry', 'Performance and appreciation showcase', 'Demonstrate appreciation through performance and response.'),
      ]),
    ],
  },
];

export const ghanaianLanguageB9Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'Ghanaian Language',
    classLevel: 'B9',
    term: 'Term 1',
    title: 'B9 Ghanaian Language Scheme of Work - Term 1',
    weeks: [
      week(1, 'Marriage rites and respectful discussion', [
        customs('B9', 'Rites of Passage: Marriage', 'Marriage rites in the local culture', 'Describe stages and values in marriage rites.'),
        oral('B9', 'Conversation/Everyday Discourse', 'Respectful discussion of marriage and family issues', 'Use mature and appropriate language in discussion.'),
        reading('B9', 'Reading', 'Reading cultural texts on marriage', 'Read and interpret cultural passages critically.'),
      ]),
      week(2, 'Naming systems and inferential listening', [
        customs('B9', 'Naming Systems: Circumstantial, Reincarnation, Deity Names', 'Special naming systems and meanings', 'Explain different advanced naming systems and their meanings.'),
        oral('B9', 'Listening Comprehension', 'Listening for implied meanings in oral explanations', 'Infer meaning and attitude from oral texts.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Short explanatory writing on naming systems', 'Write explanatory paragraphs with clear organisation.'),
      ]),
      week(3, 'Clan system and traditional government language', [
        customs('B9', 'The Clan System', 'Clan organisation and social roles', 'Analyse the role of clan systems in society.'),
        customs('B9', 'Chieftaincy: Traditional Government', 'Traditional government structures', 'Explain features of traditional governance.'),
        usage('B9', 'Integrating Grammar in Written Language (Nouns, Adjectives)', 'Accurate descriptive language in social studies contexts', 'Use descriptive word groups accurately in formal writing.'),
      ]),
      week(4, 'Conversation, reading and translation', [
        oral('B9', 'Conversation/Everyday Discourse', 'Everyday discourse on civic and cultural issues', 'Sustain purposeful oral interaction on wider themes.'),
        reading('B9', 'Reading', 'Reading informational and reflective passages', 'Interpret main ideas and implied meanings in connected texts.'),
        reading('B9', 'Translation', 'Translation of more complex statements', 'Translate short connected passages with increasing accuracy.'),
      ]),
      week(5, 'Listening and tone in formal speech', [
        oral('B9', 'Listening Comprehension', 'Listening to speeches and explanations', 'Analyse and respond to extended oral texts.'),
        oral('B9', 'Tones', 'Tone in formal and informal speech', 'Use tone to communicate nuanced meaning.'),
        oral('B9', 'Presentation: Everyday Experiences', 'Short formal oral presentation', 'Present ideas with clarity and confidence.'),
      ]),
      week(6, 'Reading and composition writing', [
        reading('B9', 'Reading', 'Reading for theme and viewpoint', 'Identify viewpoint and supporting details in reading texts.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Organising multi-paragraph writing', 'Write organised multi-paragraph compositions.'),
        usage('B9', 'Vocabulary, Spelling and Punctuation', 'Precision in spelling and mechanics', 'Apply correct conventions in extended writing.'),
      ]),
      week(7, 'Grammar integration in connected writing', [
        usage('B9', 'Integrating Grammar in Written Language (Nouns, Adjectives)', 'Nominal groups and descriptive precision', 'Use nouns and adjectives effectively in structured writing.'),
        usage('B9', 'Integrating Grammar in Written Language (Verbs, Adverbs)', 'Verb choice and adverbial precision', 'Choose precise verbs and modifiers in context.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Refining paragraph flow and cohesion', 'Link and develop ideas coherently across paragraphs.'),
      ]),
      week(8, 'Drum, horn and symbolic language', [
        literature('B9', 'Drum/Horn/Xylophone Language', 'Symbolic and performance language in culture', 'Interpret meaning in symbolic oral performance forms.'),
        oral('B9', 'Listening Comprehension', 'Listening to performance language explanations', 'Extract message and purpose from oral performance.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Writing a brief response to performance language', 'Write organised responses to cultural performances.'),
      ]),
      week(9, 'Prose comprehension and critical response', [
        literature('B9', 'Prose', 'Prose themes and viewpoint', 'Analyse theme and message in prose texts.'),
        reading('B9', 'Reading', 'Critical reading of prose passages', 'Support responses with details from the text.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Critical written response', 'Write clear and supported responses to prose.'),
      ]),
      week(10, 'Poetry and expressive interpretation', [
        literature('B9', 'Poetry', 'Poetic meaning, mood and imagery', 'Interpret poetic language and message.'),
        oral('B9', 'Presentation: Everyday Experiences', 'Recital and oral interpretation', 'Deliver oral interpretation with confidence and expression.'),
        usage('B9', 'Vocabulary Development', 'Expressive and figurative vocabulary', 'Use figurative and expressive language appropriately.'),
      ]),
      week(11, 'Drama and dialogue for social issues', [
        literature('B9', 'Drama', 'Drama around social and cultural issues', 'Interpret and perform dramatic scenes meaningfully.'),
        oral('B9', 'Conversation/Everyday Discourse', 'Dialogue and persuasion in drama', 'Use persuasive and responsive oral language in role-play.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Script and scene writing', 'Write short dramatic scenes with clear dialogue.'),
      ]),
      week(12, 'Integrated term review and project', [
        customs('B9', 'Review of Marriage, Naming, Clan and Traditional Government', 'Review of B9 customs and institutions', 'Summarise key B9 customs and institutions ideas.'),
        oral('B9', 'Presentation: Everyday Experiences', 'Project presentation on a cultural institution', 'Present a researched cultural topic coherently.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Final term explanatory composition', 'Produce a clear explanatory composition on a cultural issue.'),
      ]),
    ],
  },
  {
    subject: 'Ghanaian Language',
    classLevel: 'B9',
    term: 'Term 2',
    title: 'B9 Ghanaian Language Scheme of Work - Term 2',
    weeks: [
      week(1, 'Advanced reading and discussion', [
        reading('B9', 'Reading', 'Reading connected passages on social themes', 'Interpret author’s ideas and key arguments in connected texts.'),
        oral('B9', 'Conversation/Everyday Discourse', 'Discussion of social and community issues', 'Support oral opinions with relevant examples.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Writing responses to social issues', 'Write reasoned short compositions on social themes.'),
      ]),
      week(2, 'Listening, inference and oral summary', [
        oral('B9', 'Listening Comprehension', 'Listening to extended oral texts', 'Infer speaker purpose and key message from oral texts.'),
        oral('B9', 'Presentation: Everyday Experiences', 'Oral summary from listening', 'Summarise oral texts accurately and confidently.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Turning oral summaries into written form', 'Write coherent summaries from listening tasks.'),
      ]),
      week(3, 'Translation and precision in vocabulary', [
        reading('B9', 'Translation', 'Connected-text translation and meaning transfer', 'Translate while preserving meaning and tone.'),
        usage('B9', 'Vocabulary, Spelling and Punctuation', 'Precision of word choice in translation', 'Select accurate vocabulary for context.'),
        reading('B9', 'Reading', 'Comparing source and translated meaning', 'Evaluate meaning in source and translated texts.'),
      ]),
      week(4, 'Formal presentation and composition structure', [
        oral('B9', 'Presentation: Everyday Experiences', 'Formal speech and organised presentation', 'Use clear structure and delivery in formal presentation.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Planning introductions, body and conclusion', 'Organise longer writing with clear structure.'),
        usage('B9', 'Integrating Grammar in Written Language', 'Accuracy in formal language use', 'Maintain grammatical accuracy in formal writing and speaking.'),
      ]),
      week(5, 'Drum and horn language appreciation', [
        literature('B9', 'Drum/Horn/Xylophone Language', 'Message, function and occasion in performance language', 'Explain the social function of symbolic language.'),
        oral('B9', 'Listening Comprehension', 'Listening to symbolic communication commentary', 'Interpret explanations of performance language.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Short interpretive response', 'Write organised responses to symbolic texts.'),
      ]),
      week(6, 'Prose analysis and paragraph development', [
        literature('B9', 'Prose', 'Theme and point of view in prose', 'Analyse theme, character and point of view.'),
        reading('B9', 'Reading', 'Close reading of prose paragraphs', 'Draw evidence from prose for interpretation.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Paragraph development from prose analysis', 'Develop analytical paragraphs with support.'),
      ]),
      week(7, 'Poetry, imagery and reflection', [
        literature('B9', 'Poetry', 'Imagery, rhythm and message', 'Interpret poetic devices and message.'),
        oral('B9', 'Presentation: Everyday Experiences', 'Poetry reading and reflection', 'Present oral reflections on poems clearly.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Reflective poetry response', 'Write clear reflective responses to poems.'),
      ]),
      week(8, 'Drama, conflict and dialogue writing', [
        literature('B9', 'Drama', 'Conflict, character and dialogue', 'Identify conflict and role in dramatic texts.'),
        oral('B9', 'Conversation/Everyday Discourse', 'Negotiation and persuasion in role-play', 'Use oral language to negotiate and persuade appropriately.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Dialogue writing for drama', 'Write realistic dialogue for social situations.'),
      ]),
      week(9, 'Grammar refinement in longer writing', [
        usage('B9', 'Integrating Grammar in Written Language (Nouns, Adjectives)', 'Precision and conciseness in description', 'Use concise and precise descriptive forms.'),
        usage('B9', 'Integrating Grammar in Written Language (Verbs, Adverbs)', 'Shading meaning with verb and adverb choices', 'Adjust meaning through accurate verb and adverb choices.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Revising longer compositions', 'Revise longer compositions for clarity and correctness.'),
      ]),
      week(10, 'Independent reading and critical response', [
        reading('B9', 'Reading', 'Independent reading of selected texts', 'Read independently and discuss ideas critically.'),
        literature('B9', 'Prose, Poetry or Drama', 'Critical response to chosen texts', 'Make informed responses to literary texts.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Critical response paragraph writing', 'Write short critical responses with support.'),
      ]),
      week(11, 'Integrated oral and written project', [
        oral('B9', 'Presentation: Everyday Experiences', 'Presenting a language project', 'Present project findings coherently and confidently.'),
        reading('B9', 'Reading', 'Using source texts for project support', 'Select relevant textual support for presentations.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Project write-up drafting', 'Write a structured project report or essay.'),
      ]),
      week(12, 'Term showcase and review', [
        oral('B9', 'Presentation: Everyday Experiences', 'Term showcase presentation', 'Use oral skills effectively in final sharing.'),
        literature('B9', 'Drum/Horn/Xylophone Language, Prose, Poetry and Drama', 'Review of studied literary forms', 'Compare studied literary forms meaningfully.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Final polished writing submission', 'Produce polished writing that reflects term learning.'),
      ]),
    ],
  },
  {
    subject: 'Ghanaian Language',
    classLevel: 'B9',
    term: 'Term 3',
    title: 'B9 Ghanaian Language Scheme of Work - Term 3',
    weeks: [
      week(1, 'Review of customs through formal speaking', [
        customs('B9', 'Review of Marriage, Naming and Traditional Government', 'Review of B9 customs and institutions', 'Relate customs and institutions to present-day life.'),
        oral('B9', 'Presentation: Everyday Experiences', 'Formal oral report on cultural themes', 'Present a structured oral report.'),
        reading('B9', 'Reading', 'Review reading on customs and governance', 'Read and summarise key review texts accurately.'),
      ]),
      week(2, 'Listening and advanced summary writing', [
        oral('B9', 'Listening Comprehension', 'Listening to speeches, interviews or oral narratives', 'Analyse and summarise extended oral texts.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Advanced summary writing', 'Write concise and coherent summaries of oral and written texts.'),
        usage('B9', 'Vocabulary, Spelling and Punctuation', 'Editing summaries for precision', 'Refine summaries for vocabulary and mechanics.'),
      ]),
      week(3, 'Translation and comparison of meaning', [
        reading('B9', 'Translation', 'Translation of connected and culturally nuanced texts', 'Translate accurately with sensitivity to context.'),
        reading('B9', 'Reading', 'Comparing original and translated meanings', 'Evaluate meaning transfer between versions.'),
        usage('B9', 'Integrating Grammar in Written Language', 'Maintaining grammatical accuracy in translation', 'Apply accurate grammar while translating.'),
      ]),
      week(4, 'Extended composition and editing', [
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Planning and drafting extended compositions', 'Develop longer, well-structured compositions.'),
        usage('B9', 'Integrating Grammar in Written Language', 'Editing for cohesion and correctness', 'Edit extended writing for grammar and cohesion.'),
        reading('B9', 'Reading', 'Using model texts to improve writing', 'Analyse model texts to strengthen own writing.'),
      ]),
      week(5, 'Performance language and cultural interpretation', [
        literature('B9', 'Drum/Horn/Xylophone Language', 'Cultural interpretation of symbolic language', 'Interpret symbolic performance language in context.'),
        oral('B9', 'Listening Comprehension', 'Listening to cultural performances or explanations', 'Respond thoughtfully to performance-based texts.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Interpretive writing on performance language', 'Write organised interpretations of cultural performances.'),
      ]),
      week(6, 'Literary comparison week', [
        literature('B9', 'Prose, Poetry and Drama', 'Comparing theme and message across genres', 'Compare literary forms using evidence and explanation.'),
        reading('B9', 'Reading', 'Reading for comparison across texts', 'Identify similarities and differences across texts.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Comparative paragraph writing', 'Write organised comparative responses.'),
      ]),
      week(7, 'Oral debate and persuasive writing', [
        oral('B9', 'Conversation/Everyday Discourse', 'Debate on a cultural or social issue', 'Use persuasive oral language respectfully.'),
        reading('B9', 'Reading', 'Reading arguments and viewpoints', 'Identify claim, support and counterpoint in texts.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Short persuasive composition', 'Write persuasive compositions with clear reasons.'),
      ]),
      week(8, 'Poetry recital and creative response', [
        literature('B9', 'Poetry', 'Recital, tone and interpretation', 'Interpret and recite poetry effectively.'),
        oral('B9', 'Presentation: Everyday Experiences', 'Creative oral response to poetry', 'Present thoughtful oral responses to poetic texts.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Creative response writing', 'Write short creative or reflective responses to poems.'),
      ]),
      week(9, 'Drama performance and script polishing', [
        literature('B9', 'Drama', 'Scene performance and character interpretation', 'Perform and interpret short dramatic pieces.'),
        oral('B9', 'Conversation/Everyday Discourse', 'Voice and interaction in dramatic performance', 'Use spoken interaction effectively in drama.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Editing and polishing short scripts', 'Refine scripts for clarity and performance.'),
      ]),
      week(10, 'Independent reading portfolio', [
        reading('B9', 'Reading', 'Independent reading of selected texts', 'Read independently and sustain response over time.'),
        literature('B9', 'Prose, Poetry or Drama', 'Literary portfolio response', 'Keep thoughtful responses to selected texts.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Portfolio reflection writing', 'Write reflective pieces on reading growth.'),
      ]),
      week(11, 'Integrated project completion', [
        oral('B9', 'Presentation: Everyday Experiences', 'Final project rehearsal and delivery', 'Deliver project presentations clearly and persuasively.'),
        reading('B9', 'Reading', 'Checking sources and evidence for project work', 'Use source material responsibly and accurately.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Final project report or essay', 'Submit a coherent and polished final project text.'),
      ]),
      week(12, 'End-of-year language and literature showcase', [
        oral('B9', 'Presentation: Everyday Experiences', 'Year-end oral showcase', 'Demonstrate mature listening and speaking skills in final performance.'),
        writing('B9', 'Structure and Organise Ideas in Composition Writing', 'Final portfolio selection and reflection', 'Present final writing that reflects growth across the year.'),
        literature('B9', 'Drum/Horn/Xylophone Language, Prose, Poetry and Drama', 'Final literature showcase', 'Demonstrate appreciation of Ghanaian literary forms through response and performance.'),
      ]),
    ],
  },
];
