import type { ExplicitCurriculumTerm } from './mathematicsB7';
import type { SchemeWeek, SchemeWeekEntry } from '@/types/scheme';

const resources = {
  oral: ['Ghanaian Language textbook', 'Prompt cards', 'Story prompts', 'Teacher model'],
  reading: ['Big book or reader', 'Picture cards', 'Word cards', 'Short passages'],
  writing: ['Exercise book', 'Writing frame', 'Copybook', 'Model texts'],
  usage: ['Sentence cards', 'Grammar chart', 'Word bank', 'Exercise book'],
  extensive: ['Story books', 'Poems', 'Folktales', 'Reading log'],
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
    subject: 'Ghanaian Language',
    classLevel: classLevel as ExplicitCurriculumTerm['classLevel'],
    term,
    title: `${classLevel} Ghanaian Language Scheme of Work - ${term}`,
    weeks: bundles.map((bundle, index) => week(classLevel, index + 1, bundle)),
  };
}

function lowerWeek(
  theme: string,
  oralTopic: string,
  readingTopic: string,
  writingTopic: string,
  usageTopic: string
): WeeklyBundle {
  return {
    theme,
    entries: [
      {
        strand: 'Oral Language (Listening and Speaking)',
        subStrand: 'Listening, Story Telling, Conversation and Presentation',
        topic: oralTopic,
        resources: resources.oral,
      },
      {
        strand: 'Reading',
        subStrand: 'Pre-Reading, Print Concept, Phonics, Vocabulary and Comprehension',
        topic: readingTopic,
        resources: resources.reading,
      },
      {
        strand: 'Writing',
        subStrand: 'Penmanship, Writing Words and Simple Sentences',
        topic: writingTopic,
        resources: resources.writing,
      },
      {
        strand: 'Writing Conventions/Usage',
        subStrand: 'Capitalisation, Action Words, Qualifying Words, Postpositions and Spelling',
        topic: usageTopic,
        resources: resources.usage,
      },
      {
        strand: 'Extensive Reading/Children’s Literature/Library',
        subStrand: 'Building the Love and Culture of Reading / Read Aloud',
        topic: `Shared reading around ${theme.toLowerCase()}`,
        resources: resources.extensive,
      },
    ],
  };
}

function upperWeek(
  theme: string,
  oralTopic: string,
  readingTopic: string,
  writingTopic: string,
  usageTopic: string
): WeeklyBundle {
  return {
    theme,
    entries: [
      {
        strand: 'Oral Language (Listening and Speaking)',
        subStrand: 'Poems, Story Telling, Conversation, Questions, Commands and Presentation',
        topic: oralTopic,
        resources: resources.oral,
      },
      {
        strand: 'Reading',
        subStrand: 'Phonics, Vocabulary, Comprehension, Silent Reading, Fluency and Summarising',
        topic: readingTopic,
        resources: resources.reading,
      },
      {
        strand: 'Composition Writing',
        subStrand: 'Narrative, Creative, Descriptive, Persuasive, Informative and Letter Writing',
        topic: writingTopic,
        resources: resources.writing,
      },
      {
        strand: 'Writing Conventions/Usage',
        subStrand: 'Capitalisation, Punctuation, Action Words, Qualifying Words, Postpositions, Sentences and Spelling',
        topic: usageTopic,
        resources: resources.usage,
      },
      {
        strand: 'Extensive Reading/Children’s Literature/Library',
        subStrand: 'Reading Texts, Poems, Narratives and Short Stories',
        topic: `Independent and guided reading around ${theme.toLowerCase()}`,
        resources: resources.extensive,
      },
    ],
  };
}

const b1Term1: WeeklyBundle[] = [
  lowerWeek('Myself and my family', 'Talking about oneself, family members and simple greetings', 'Pre-reading, print concepts and familiar family words', 'Penmanship and writing names of family members', 'Capitalisation and spelling of names'),
  lowerWeek('People and places around us', 'Conversation about people, home and school places', 'Phonics and vocabulary from home and school', 'Writing simple labels for people and places', 'Action words and qualifying words in simple sentences'),
  lowerWeek('Stories we hear', 'Listening and storytelling with simple retelling', 'Comprehension from picture stories and read-aloud texts', 'Writing simple words from stories', 'Spelling familiar story words'),
  lowerWeek('Commands and requests', 'Giving and following commands and simple requests', 'Reading simple instruction words and phrases', 'Copying short instructions with correct spacing', 'Using action words in commands'),
  lowerWeek('Our classroom and school', 'Talking about classroom objects and school routines', 'Vocabulary and comprehension around school life', 'Writing names of classroom items and short sentences', 'Capitalisation, spacing and spelling review'),
  lowerWeek('Songs and rhymes', 'Reciting songs and rhymes with actions', 'Phonological awareness through rhyme and sound play', 'Writing repeated words or lines from songs', 'Spelling from sound patterns'),
  lowerWeek('Questions and answers', 'Asking and answering simple questions', 'Reading question prompts and familiar responses', 'Writing short answers', 'Simple punctuation and sentence forms'),
  lowerWeek('Things we do every day', 'Conversation about daily routines', 'Reading simple routine texts', 'Writing simple routine sentences', 'Action words and postpositions in context'),
  lowerWeek('Our community helpers', 'Talking about familiar occupations and helpers', 'Reading words and sentences about helpers', 'Writing labels and short sentences about helpers', 'Qualifying words in description'),
  lowerWeek('Listening for meaning', 'Listening comprehension with simple oral passages', 'Reading matching words and short passages', 'Writing key words from listening', 'Spelling and capitalisation practice'),
  lowerWeek('Reading for joy', 'Shared oral participation in stories and songs', 'Read-aloud and shared reading from simple books', 'Writing favourite words or sentences from reading', 'Editing simple sentence mistakes'),
  lowerWeek('Integrated review', 'Presentation, song or short oral performance', 'Review of phonics, vocabulary and comprehension', 'Guided writing review', 'Integrated usage review'),
];

const b1Term2: WeeklyBundle[] = [
  lowerWeek('Animals and nature', 'Talking about animals, plants and things in nature', 'Reading familiar nature words and simple texts', 'Writing labels and simple nature sentences', 'Spelling and qualifying words'),
  lowerWeek('Home and community life', 'Conversation about events at home and in the community', 'Comprehension from short community texts', 'Writing simple community sentences', 'Capitalisation and action words'),
  lowerWeek('Storytelling and drama', 'Listening to stories and dramatising them', 'Reading simple story sequences', 'Writing words and short sentences from stories', 'Sentence spacing and spelling'),
  lowerWeek('Greetings and customs', 'Using greetings and polite expressions in context', 'Reading familiar social expressions', 'Writing greeting sentences and short messages', 'Capital letters and punctuation'),
  lowerWeek('Directions and instructions', 'Giving and following simple directions', 'Reading instruction phrases', 'Writing simple directions', 'Action words and postpositions'),
  lowerWeek('Questions about people and places', 'Oral questions about family, people and places', 'Reading question-answer patterns', 'Writing short question-answer pairs', 'Sentence forms and punctuation'),
  lowerWeek('Listening and retelling', 'Listening comprehension and retelling', 'Reading linked short texts for meaning', 'Writing key ideas from listening', 'Spelling familiar words'),
  lowerWeek('Describing familiar things', 'Conversation using simple descriptive expressions', 'Vocabulary and comprehension from descriptive texts', 'Writing simple descriptive sentences', 'Qualifying words in context'),
  lowerWeek('Reading aloud with confidence', 'Short oral presentation and recitation', 'Shared reading and read-aloud practice', 'Writing from model sentences', 'Editing capitals and spelling'),
  lowerWeek('Children’s literature week', 'Oral participation in stories, songs and poems', 'Read-aloud and simple literature response', 'Writing favourite lines or words', 'Usage review from literature'),
  lowerWeek('Project and practice week', 'Speaking and listening through class tasks', 'Review of reading strands', 'Writing practice on familiar topics', 'Integrated conventions review'),
  lowerWeek('Term review', 'Presentation and oral reflection', 'Reading review and fluency practice', 'Guided writing showcase', 'Integrated spelling and usage review'),
];

const b1Term3: WeeklyBundle[] = [
  lowerWeek('My environment', 'Talking about things we see around us', 'Reading simple environmental words and texts', 'Writing labels and short environmental sentences', 'Qualifying words and spelling'),
  lowerWeek('Play, games and commands', 'Giving and following play instructions', 'Reading instruction words for games', 'Writing simple commands', 'Action words and punctuation'),
  lowerWeek('Picture stories', 'Storytelling from picture prompts', 'Reading clues from pictures and simple story texts', 'Writing simple picture-based sentences', 'Sentence spacing and capitalisation'),
  lowerWeek('People, places and events', 'Conversation about events and people in the community', 'Comprehension from short event texts', 'Writing short event sentences', 'Action words and simple sentence patterns'),
  lowerWeek('Listening carefully', 'Listening for specific details in oral passages', 'Reading matching texts and vocabulary', 'Writing key words from oral texts', 'Spelling review'),
  lowerWeek('Songs, poems and rhythm', 'Reciting songs, rhymes and simple poems', 'Reading repeated words and sound patterns', 'Writing patterned words and lines', 'Sound-based spelling practice'),
  lowerWeek('Questions, answers and responses', 'Oral questioning and response practice', 'Reading question forms in texts', 'Writing short responses', 'Simple punctuation and usage'),
  lowerWeek('Reading for pleasure', 'Story sharing and oral talk', 'Shared reading, read-aloud and simple comprehension', 'Writing favourite sentence from reading', 'Editing familiar words'),
  lowerWeek('Describing people and objects', 'Conversation and description in context', 'Reading descriptive words and phrases', 'Writing short descriptive sentences', 'Qualifying words and postpositions'),
  lowerWeek('Practice and revision', 'Oral revision through games and recitation', 'Reading revision texts and cards', 'Writing revision sentences', 'Integrated conventions review'),
  lowerWeek('Project week', 'Group speaking and listening activities', 'Review of read-aloud texts', 'Guided writing from a project', 'Usage review'),
  lowerWeek('Year-end showcase', 'Short presentation or recitation', 'Reading fluency and story review', 'Writing showcase', 'Integrated final review'),
];

const b2Term1: WeeklyBundle[] = [
  lowerWeek('Family, people and places', 'Conversation about family, people and places', 'Phonological awareness, phonics and vocabulary in context', 'Writing words, names and simple sentences', 'Capitalisation, action words and spelling'),
  lowerWeek('Rhymes and oral patterns', 'Rhymes, songs and oral repetition', 'Reading sound patterns and word families', 'Writing repeated words and simple lines', 'Spelling through rhyme patterns'),
  lowerWeek('Listening and storytelling', 'Listening to stories and retelling key ideas', 'Comprehension from simple stories', 'Writing short story-based sentences', 'Sentence spacing and punctuation'),
  lowerWeek('Dramatisation and role play', 'Speaking through role play and simple drama', 'Reading dialogue clues and action words', 'Writing simple dialogue lines', 'Action words and sentence patterns'),
  lowerWeek('Questions and answers', 'Asking and answering questions orally', 'Reading question forms and responses', 'Writing short question-answer pairs', 'Punctuation and capitals'),
  lowerWeek('Commands and presentation', 'Giving instructions and short presentations', 'Reading instruction phrases and classroom texts', 'Writing simple instructions', 'Action words, spelling and spacing'),
  lowerWeek('Reading and comprehension', 'Talking about what is read', 'Vocabulary and comprehension in short texts', 'Writing short answers from reading', 'Qualifying words in short sentences'),
  lowerWeek('Silent reading beginnings', 'Oral sharing from simple books', 'Silent reading and fluency practice', 'Writing favourite sentence from reading', 'Integrated usage review'),
  lowerWeek('Community and school life', 'Conversation about community and school events', 'Reading short informative texts', 'Writing simple event sentences', 'Simple and compound sentence beginnings'),
  lowerWeek('Children’s literature week', 'Story, song and oral sharing', 'Read-aloud and response', 'Writing short reflections from stories', 'Spelling and punctuation review'),
  lowerWeek('Practice and project week', 'Listening and speaking practice', 'Reading review texts', 'Writing on a familiar class theme', 'Integrated usage review'),
  lowerWeek('Term review', 'Presentation and oral reflection', 'Reading fluency and comprehension review', 'Writing review from prompts', 'Integrated conventions review'),
];

const b2Term2: WeeklyBundle[] = [
  lowerWeek('Nature and everyday life', 'Talking about nature and everyday experiences', 'Reading simple nature texts and vocabulary', 'Writing short descriptive sentences', 'Qualifying words and capitals'),
  lowerWeek('Customs and social expressions', 'Conversation with greetings and polite expressions', 'Reading familiar custom-related texts', 'Writing greetings and short messages', 'Sentence forms and punctuation'),
  lowerWeek('Storytelling and listening', 'Listening comprehension and story retelling', 'Reading linked story texts', 'Writing words and short sentences from stories', 'Spelling and capitalisation'),
  lowerWeek('Directions and requests', 'Giving and following instructions and requests', 'Reading direction and instruction words', 'Writing simple requests and instructions', 'Action words and postpositions'),
  lowerWeek('Vocabulary and fluency', 'Oral use of new vocabulary', 'Reading vocabulary in context and fluency practice', 'Writing sentences using target words', 'Simple and compound sentence patterns'),
  lowerWeek('Questions and oral response', 'Asking and answering questions clearly', 'Reading question-response texts', 'Writing short answers', 'Punctuation and usage'),
  lowerWeek('Writing with spacing and clarity', 'Oral planning before writing', 'Reading model simple texts', 'Copying and writing simple sentences with correct spacing', 'Capitalisation and spelling'),
  lowerWeek('Read-aloud and shared reading', 'Oral participation during read-aloud', 'Read-aloud and comprehension work', 'Writing favourite lines or words', 'Review of usage through reading'),
  lowerWeek('Describing familiar objects and places', 'Oral descriptions in context', 'Reading descriptive vocabulary and texts', 'Writing simple descriptions', 'Qualifying words and postpositions'),
  lowerWeek('Silent reading and response', 'Talking about independent reading', 'Silent reading and basic response', 'Writing simple reading responses', 'Editing familiar errors'),
  lowerWeek('Project and review', 'Presentation of simple oral tasks', 'Reading revision texts', 'Writing on a class topic', 'Integrated usage review'),
  lowerWeek('Integrated term review', 'Presentation and oral review', 'Reading and fluency review', 'Writing review activities', 'Final conventions review'),
];

const b2Term3: WeeklyBundle[] = [
  lowerWeek('My community and events', 'Conversation about community people and events', 'Reading event-based short texts', 'Writing short community sentences', 'Action words and punctuation'),
  lowerWeek('Rhythm, songs and stories', 'Songs, rhymes and storytelling', 'Reading rhythmic and story texts', 'Writing repeated words and short lines', 'Spelling from sound patterns'),
  lowerWeek('Listening for meaning', 'Listening comprehension with simple details', 'Reading linked comprehension passages', 'Writing key words and short answers', 'Usage review'),
  lowerWeek('Questions, instructions and responses', 'Oral questioning and response', 'Reading question and instruction texts', 'Writing short responses and instructions', 'Sentence forms and punctuation'),
  lowerWeek('Reading for enjoyment', 'Book talk and oral sharing', 'Extensive reading and read-aloud response', 'Writing simple reflections on reading', 'Integrated spelling and usage'),
  lowerWeek('Descriptions and comparisons', 'Conversation describing familiar things', 'Reading descriptive passages', 'Writing simple descriptive pieces', 'Qualifying words and postpositions'),
  lowerWeek('Presentation and oral confidence', 'Short oral presentations on familiar topics', 'Reading model presentation texts', 'Writing short presentation notes', 'Capitalisation and spelling'),
  lowerWeek('Children’s literature and moral lessons', 'Talking about stories and songs', 'Reading simple literary texts', 'Writing short story responses', 'Usage review from texts'),
  lowerWeek('Writing practice week', 'Oral planning and discussion', 'Reading model sentences and passages', 'Writing sentences and short paragraphs', 'Integrated conventions review'),
  lowerWeek('Project week', 'Speaking and listening group tasks', 'Reading review texts and cards', 'Writing on project tasks', 'Usage review'),
  lowerWeek('Revision week', 'Oral revision through games', 'Reading revision and fluency', 'Writing revision activities', 'Spelling and punctuation revision'),
  lowerWeek('Year-end showcase', 'Final presentation and reflection', 'Reading review showcase', 'Writing showcase', 'Integrated final review'),
];

const b3Term1: WeeklyBundle[] = [
  lowerWeek('Identity and community language', 'Conversation about oneself, family, people and places', 'Reading phonics, vocabulary and comprehension texts', 'Writing simple connected sentences and short paragraphs', 'Capitalisation, action words, qualifying words and spelling'),
  lowerWeek('Poems and oral expression', 'Poems, songs and oral performance', 'Reading sound patterns and simple literary texts', 'Writing patterned lines or short poem responses', 'Usage from oral performance'),
  lowerWeek('Listening and story retelling', 'Listening to stories and retelling with sequence', 'Reading stories for comprehension', 'Writing short retellings', 'Sentence patterns and punctuation'),
  lowerWeek('Questions and directions', 'Asking questions and giving directions orally', 'Reading question and direction texts', 'Writing question-answer exchanges and simple directions', 'Simple and compound sentence use'),
  lowerWeek('Vocabulary growth and fluency', 'Using content vocabulary in speech', 'Reading vocabulary-rich passages and practising fluency', 'Writing short responses using new words', 'Spelling and usage in context'),
  lowerWeek('Silent reading and response', 'Oral sharing from reading', 'Silent reading and comprehension', 'Writing simple reading responses', 'Integrated usage review'),
  lowerWeek('Writing with purpose', 'Oral planning before writing', 'Reading model simple texts', 'Writing short informative and descriptive pieces', 'Conventions and grammar review'),
  lowerWeek('Stories and dramatization', 'Role play and dramatization of stories', 'Reading dialogue and story texts', 'Writing short dialogue or story responses', 'Action words and punctuation'),
  lowerWeek('Descriptions and comparisons', 'Oral comparison of people and places', 'Reading descriptive texts', 'Writing simple descriptive paragraphs', 'Qualifying words and postpositions'),
  lowerWeek('Children’s literature week', 'Story, poem and oral response', 'Reading children’s literature and responding', 'Writing short reflections on literature', 'Usage review from literature'),
  lowerWeek('Project and review', 'Presentation of oral tasks', 'Reading revision passages', 'Writing on a familiar project theme', 'Integrated usage review'),
  lowerWeek('Term review', 'Oral presentation and recap', 'Reading, fluency and comprehension review', 'Writing review and showcase', 'Final conventions review'),
];

const b3Term2: WeeklyBundle[] = [
  lowerWeek('Social values and community life', 'Conversation about customs, events and social values', 'Reading community-based passages', 'Writing short paragraphs on community life', 'Capitalisation and sentence use'),
  lowerWeek('Listening and comprehension', 'Listening comprehension and oral explanation', 'Reading linked short texts for detail', 'Writing short summaries and answers', 'Simple and compound sentence patterns'),
  lowerWeek('Poems, storytelling and drama', 'Poems, storytelling and role play', 'Reading short literary texts', 'Writing story or poem responses', 'Usage from literature'),
  lowerWeek('Questions, requests and presentation', 'Asking and answering questions, making requests and presenting', 'Reading simple functional texts', 'Writing responses, requests and short notes', 'Punctuation and spelling'),
  lowerWeek('Reading and fluency', 'Oral reading and discussion', 'Vocabulary, fluency and comprehension practice', 'Writing short reading responses', 'Qualifying words and spelling'),
  lowerWeek('Writing connected ideas', 'Oral planning and peer talk', 'Reading model paragraphs', 'Writing connected short compositions', 'Usage review in connected writing'),
  lowerWeek('Descriptions and details', 'Conversation with descriptive expressions', 'Reading descriptive passages', 'Writing descriptive compositions', 'Qualifying words and postpositions'),
  lowerWeek('Silent reading and children’s literature', 'Book talk and oral sharing', 'Silent reading and literary response', 'Writing short reflections from reading', 'Integrated usage review'),
  lowerWeek('Directions and explanation', 'Oral directions and explanation', 'Reading instructional passages', 'Writing simple explanations and instructions', 'Action words and sentence patterns'),
  lowerWeek('Project week', 'Speaking, listening and presentation task', 'Reading review selections', 'Writing on a project theme', 'Conventions review'),
  lowerWeek('Revision week', 'Oral revision through songs and games', 'Reading fluency and comprehension review', 'Writing revision activities', 'Spelling and punctuation review'),
  lowerWeek('Integrated term review', 'Presentation and oral reflection', 'Reading and comprehension review', 'Writing showcase', 'Final conventions review'),
];

const b3Term3: WeeklyBundle[] = [
  lowerWeek('People, places and events', 'Conversation about people, places and events', 'Reading informative and narrative passages', 'Writing short descriptive and narrative paragraphs', 'Integrated usage review'),
  lowerWeek('Listening and oral response', 'Listening and responding with details', 'Reading matching comprehension texts', 'Writing key ideas from listening', 'Sentence structure and spelling'),
  lowerWeek('Poems and performance', 'Poems and oral presentation', 'Reading poetic and rhythmic texts', 'Writing patterned lines and short reflections', 'Usage through poetry'),
  lowerWeek('Questions and dialogue', 'Asking and answering questions in dialogue', 'Reading question forms and conversational texts', 'Writing short dialogues', 'Punctuation and simple sentence review'),
  lowerWeek('Reading for enjoyment', 'Book talk and oral sharing', 'Silent reading, fluency and response', 'Writing a favourite response from reading', 'Integrated spelling and usage'),
  lowerWeek('Writing with organisation', 'Oral planning and sequencing', 'Reading model compositions', 'Writing short organised compositions', 'Conventions and grammar review'),
  lowerWeek('Children’s literature and storytelling', 'Storytelling and dramatization', 'Reading stories and responding to them', 'Writing story retellings', 'Sentence patterns and punctuation'),
  lowerWeek('Descriptive and informative language', 'Conversation using content vocabulary', 'Reading descriptive and informative texts', 'Writing simple informative pieces', 'Qualifying words and postpositions'),
  lowerWeek('Project communication', 'Presentation and group speaking', 'Reading project support texts', 'Writing from project work', 'Usage review'),
  lowerWeek('Practice and revision', 'Oral revision and recitation', 'Reading revision texts', 'Writing revision responses', 'Spelling and punctuation revision'),
  lowerWeek('Portfolio week', 'Speaking about completed work', 'Reading review selections', 'Writing from favourite topics', 'Integrated conventions review'),
  lowerWeek('Year-end showcase', 'Final oral presentation', 'Reading review and fluency showcase', 'Writing showcase', 'Final integrated review'),
];

const b4Term1: WeeklyBundle[] = [
  upperWeek('Family, people and places', 'Conversation, questioning and presentation about people, family and places', 'Reading phonics, vocabulary and comprehension texts on familiar themes', 'Narrative and descriptive writing on family and community life', 'Capitalisation, punctuation, action words and qualifying words in context'),
  upperWeek('Poems and oral creativity', 'Poems, storytelling and oral performance', 'Reading poems and short literary texts', 'Creative/free writing from poems and stories', 'Usage review through literary expression'),
  upperWeek('Listening and story development', 'Listening, retelling and presentation', 'Reading comprehension and summarising of stories', 'Narrative writing from oral stories', 'Simple and compound sentences in narratives'),
  upperWeek('Commands, directions and requests', 'Giving and following commands and instructions', 'Reading functional and procedural texts', 'Writing simple directions or instructions', 'Postpositions and sentence patterns'),
  upperWeek('Vocabulary and fluency', 'Oral use of content vocabulary', 'Silent reading, fluency and vocabulary development', 'Short informative or descriptive writing', 'Spelling and punctuation review'),
  upperWeek('Children’s literature response', 'Oral discussion on stories and poems', 'Reading texts, poems, narratives and short stories', 'Literary writing and response', 'Usage from literary texts'),
  upperWeek('Writing with process and organisation', 'Planning and discussing writing orally', 'Reading model compositions', 'Process writing and paragraph organisation', 'Editing conventions in writing'),
  upperWeek('Describing and persuading', 'Oral opinions and descriptions', 'Reading descriptive and persuasive texts', 'Descriptive and persuasive writing', 'Qualifying words, conjunctions and punctuation'),
  upperWeek('Narratives and letters', 'Presentation of experiences and stories', 'Reading narratives and letters for structure', 'Narrative writing and simple letter writing', 'Sentence variety and spelling'),
  upperWeek('Summarising information', 'Oral summary of what is heard and read', 'Reading for summarising and main ideas', 'Informative/academic writing in short form', 'Usage in summary writing'),
  upperWeek('Project and reading culture week', 'Book talk and project presentation', 'Extensive reading and response', 'Writing reflections and project notes', 'Integrated usage review'),
  upperWeek('Integrated review', 'Presentation and oral reflection', 'Reading fluency, comprehension and summary review', 'Writing portfolio review', 'Final conventions review'),
];

const b4Term2: WeeklyBundle[] = [
  upperWeek('Customs, events and identity', 'Conversation and presentation on customs and events', 'Reading informational and literary texts on local life', 'Informative and descriptive writing on customs and identity', 'Capitalisation, punctuation and qualifying words in connected writing'),
  upperWeek('Poetry, stories and drama', 'Poetry recitation, storytelling and role play', 'Reading poems, narratives and short stories', 'Creative/free writing and literary response', 'Usage from literary performance'),
  upperWeek('Listening and explanation', 'Listening comprehension and oral explanation', 'Reading comprehension with main ideas and details', 'Informative writing and short summaries', 'Simple and compound sentence review'),
  upperWeek('Questions, instructions and communication', 'Questions, answers and spoken instructions', 'Reading functional and direction texts', 'Letter writing and functional writing', 'Postpositions, action words and punctuation'),
  upperWeek('Vocabulary, fluency and reading response', 'Vocabulary use in oral interaction', 'Silent reading, fluency and response to texts', 'Reading response writing', 'Spelling and sentence editing'),
  upperWeek('Narrative and descriptive writing', 'Oral retelling and description', 'Reading model narratives and descriptions', 'Narrative and descriptive compositions', 'Qualifying words and sentence variety'),
  upperWeek('Persuasion and argument', 'Expressing views and reasons orally', 'Reading persuasive passages', 'Persuasive and simple argumentative writing', 'Conjunctions and punctuation in argument'),
  upperWeek('Children’s literature and moral lessons', 'Oral discussion of literature themes', 'Reading literary texts and responding', 'Literary writing and reflections', 'Usage review through literature'),
  upperWeek('Presentation and summary', 'Short oral presentations on familiar topics', 'Reading for summarising and oral report', 'Academic/informative short writing', 'Conventions in organised writing'),
  upperWeek('Writing process workshop', 'Planning, drafting and peer talk', 'Reading model essays and letters', 'Editing and revising compositions', 'Integrated usage and spelling review'),
  upperWeek('Project week', 'Group presentation and discussion', 'Extensive reading and linked texts', 'Project-based writing', 'Integrated usage review'),
  upperWeek('Integrated term review', 'Presentation and reflection', 'Reading, fluency and summarising review', 'Writing showcase', 'Final conventions review'),
];

const b4Term3: WeeklyBundle[] = [
  upperWeek('Community growth and responsibility', 'Conversation and presentation on community issues', 'Reading issue-based texts and stories', 'Informative and persuasive writing on responsibility', 'Grammar and conventions in connected writing'),
  upperWeek('Poems and creative response', 'Poetry performance and discussion', 'Reading poems and short literary pieces', 'Creative/free writing from poems', 'Usage through poetic language'),
  upperWeek('Narrative, drama and dialogue', 'Storytelling and dramatization', 'Reading narratives and dramatic extracts', 'Narrative and literary writing', 'Sentence patterns and punctuation'),
  upperWeek('Listening and summarising', 'Listening carefully and summarising orally', 'Reading for summary and main ideas', 'Summary and informative writing', 'Conventions in concise writing'),
  upperWeek('Directions, commands and everyday communication', 'Oral instructions, commands and requests', 'Reading functional texts and simple notices', 'Writing directions and practical messages', 'Postpositions and action words'),
  upperWeek('Vocabulary, fluency and response', 'Vocabulary building through oral discussion', 'Silent reading, fluency and response', 'Writing reading reflections', 'Spelling and punctuation review'),
  upperWeek('Descriptive and letter writing', 'Oral description and audience awareness', 'Reading descriptive passages and letters', 'Descriptive writing and letter writing', 'Qualifying words and sentence forms'),
  upperWeek('Children’s literature and reflection', 'Discussion of stories, poems and lessons', 'Reading texts, poems and narratives', 'Literary writing and short reflections', 'Usage review from literature'),
  upperWeek('Writing process and project communication', 'Planning and presenting writing ideas', 'Reading model compositions', 'Drafting and revising compositions', 'Integrated usage review'),
  upperWeek('Extensive reading culture', 'Book talk and oral reflection', 'Extensive reading and read-aloud response', 'Writing book response notes', 'Final spelling and sentence review'),
  upperWeek('Revision week', 'Oral revision through presentations and games', 'Reading revision texts and summaries', 'Writing revision tasks', 'Integrated conventions review'),
  upperWeek('Year-end showcase', 'Final oral presentation and reflection', 'Reading and fluency showcase', 'Writing portfolio showcase', 'Final integrated review'),
];

const b5Term1: WeeklyBundle[] = [
  upperWeek('Identity, culture and communication', 'Conversation, questioning and presentation on culture and identity', 'Reading comprehension and vocabulary on cultural themes', 'Narrative, descriptive and informative writing on cultural identity', 'Capitalisation, punctuation, action words and qualifying words in context'),
  upperWeek('Poetry, songs and oral tradition', 'Poems, songs and oral performance', 'Reading literary texts, poems and stories', 'Creative/free writing and literary response', 'Usage through oral and literary language'),
  upperWeek('Listening and storytelling', 'Listening comprehension and retelling', 'Reading stories for fluency, comprehension and summarising', 'Narrative writing from oral stories', 'Simple and compound sentence use'),
  upperWeek('Commands, instructions and practical communication', 'Giving and following directions and instructions', 'Reading practical texts and simple notices', 'Letter writing and functional writing', 'Postpositions, action words and punctuation'),
  upperWeek('Vocabulary, fluency and response', 'Vocabulary building in oral interaction', 'Silent reading, fluency and reading response', 'Short informative writing from reading', 'Spelling and usage review'),
  upperWeek('Descriptions and persuasion', 'Oral opinions and descriptive talk', 'Reading descriptive and persuasive passages', 'Descriptive and persuasive writing', 'Qualifying words, conjunctions and punctuation'),
  upperWeek('Narratives and literary writing', 'Presentation of stories and experiences', 'Reading narratives, poems and short stories', 'Narrative and literary writing', 'Sentence forms in storytelling'),
  upperWeek('Summaries and reports', 'Oral summary of what is read and heard', 'Reading for summarising and main ideas', 'Informative/academic writing and summary', 'Conventions in organised writing'),
  upperWeek('Writing process workshop', 'Planning, drafting and discussion', 'Reading model compositions and letters', 'Editing and revising writing', 'Integrated usage and spelling'),
  upperWeek('Children’s literature and moral reflection', 'Oral discussion of literature themes', 'Reading literature and responding', 'Literary response writing', 'Usage through literature'),
  upperWeek('Project week and reading culture', 'Project presentation and book talk', 'Extensive reading and response', 'Writing project reflections', 'Integrated usage review'),
  upperWeek('Integrated review', 'Presentation and oral reflection', 'Reading, summary and fluency review', 'Writing portfolio review', 'Final conventions review'),
];

const b5Term2: WeeklyBundle[] = [
  upperWeek('Community events and values', 'Conversation and presentation on events and values', 'Reading issue-based and cultural texts', 'Informative and persuasive writing on community themes', 'Capitalisation, punctuation and sentence forms in context'),
  upperWeek('Poetry, stories and drama', 'Poetry recital, storytelling and role play', 'Reading poems, narratives and dramatic pieces', 'Creative/free writing and literary writing', 'Usage through performance'),
  upperWeek('Listening, questions and oral explanation', 'Listening comprehension, questions and explanation', 'Reading for main ideas and detail', 'Summary and informative writing', 'Simple and compound sentence review'),
  upperWeek('Functional communication and letters', 'Commands, directions and practical speaking', 'Reading letters, notices and instructions', 'Letter writing and functional composition', 'Postpositions and punctuation'),
  upperWeek('Vocabulary and reading fluency', 'Oral use of topic vocabulary', 'Silent reading, fluency and response', 'Response writing from reading', 'Spelling and qualifying words'),
  upperWeek('Narrative and descriptive composition', 'Oral retelling and description', 'Reading model narrative and descriptive texts', 'Narrative and descriptive writing', 'Sentence variety and conjunctions'),
  upperWeek('Persuasive and argumentative expression', 'Expressing views and reasons orally', 'Reading persuasive passages', 'Persuasive and argumentative writing', 'Conjunctions and punctuation in argument'),
  upperWeek('Children’s literature and reflection', 'Discussing themes and lessons from literature', 'Reading poems, stories and narratives', 'Literary response writing', 'Usage review from literature'),
  upperWeek('Presentation and summary week', 'Short oral presentations', 'Reading for summarising and reporting', 'Academic/informative writing and summaries', 'Conventions in summary writing'),
  upperWeek('Writing process and editing', 'Planning and peer discussion', 'Reading models for revision', 'Drafting, revising and proofreading', 'Integrated usage review'),
  upperWeek('Extensive reading and project work', 'Book talk and project discussion', 'Extensive reading and response', 'Writing project notes or reflections', 'Integrated conventions review'),
  upperWeek('Integrated term review', 'Presentation and oral reflection', 'Reading and fluency review', 'Writing showcase', 'Final conventions review'),
];

const b5Term3: WeeklyBundle[] = [
  upperWeek('People, places and development', 'Conversation and presentation on people, places and development', 'Reading informative, descriptive and cultural texts', 'Informative, descriptive and persuasive writing on development themes', 'Grammar and conventions in connected writing'),
  upperWeek('Poetry and oral creativity', 'Poetry recital and oral interpretation', 'Reading poems and literary texts', 'Creative/free writing from poetry', 'Usage through poetic language'),
  upperWeek('Narrative, dialogue and drama', 'Storytelling and dramatization', 'Reading narratives and dialogues', 'Narrative and literary writing', 'Sentence patterns and punctuation'),
  upperWeek('Listening and reporting', 'Listening comprehension and oral reporting', 'Reading passages for detail and summary', 'Summary and report writing', 'Conventions in concise writing'),
  upperWeek('Instructions and everyday language', 'Giving and following commands and directions', 'Reading practical and instruction texts', 'Functional writing and directions', 'Action words and postpositions'),
  upperWeek('Vocabulary, fluency and reading response', 'Vocabulary development through discussion', 'Silent reading, fluency and response', 'Writing reading reflections', 'Spelling and sentence review'),
  upperWeek('Descriptive, literary and letter writing', 'Audience-aware speaking and sharing', 'Reading descriptive passages, stories and letters', 'Descriptive, literary and letter writing', 'Qualifying words and sentence forms'),
  upperWeek('Children’s literature and moral values', 'Discussion of stories, poems and lessons', 'Reading children’s literature and responding', 'Literary response writing', 'Usage review from literature'),
  upperWeek('Writing workshop and project communication', 'Planning and presenting writing ideas', 'Reading model texts', 'Drafting and revising project writing', 'Integrated usage review'),
  upperWeek('Extensive reading culture', 'Book talk and oral reflection', 'Extensive reading and read-aloud response', 'Writing book response notes', 'Final spelling and punctuation review'),
  upperWeek('Revision week', 'Oral revision through games and presentations', 'Reading revision and summaries', 'Writing revision tasks', 'Integrated conventions review'),
  upperWeek('Year-end showcase', 'Final oral presentation and reflection', 'Reading, fluency and summary showcase', 'Writing portfolio showcase', 'Final integrated review'),
];

const b6Term1: WeeklyBundle[] = [
  upperWeek('Identity, culture and leadership', 'Conversation, questions and presentation on identity, culture and leadership', 'Reading vocabulary, comprehension and summary texts on social themes', 'Narrative, informative and descriptive writing on culture and leadership', 'Capitalisation, punctuation, action words, qualifying words and sentence control in context'),
  upperWeek('Poetry, songs and oral literature', 'Poems, songs and oral storytelling performance', 'Reading poems, narratives and short stories', 'Creative/free writing and literary response', 'Usage through oral and literary language'),
  upperWeek('Listening, explanation and retelling', 'Listening comprehension, explanation and retelling', 'Reading for detail, fluency and summary', 'Summary and narrative writing', 'Simple and compound sentence review'),
  upperWeek('Commands, instructions and functional language', 'Giving and following commands, instructions and requests', 'Reading notices, directions and practical texts', 'Functional writing and letter writing', 'Postpositions, action words and punctuation'),
  upperWeek('Vocabulary and reading fluency', 'Oral use of topic vocabulary', 'Silent reading, fluency and response', 'Response writing from reading', 'Spelling and usage review'),
  upperWeek('Descriptions, persuasion and argument', 'Oral opinions, reasons and descriptions', 'Reading persuasive and descriptive passages', 'Descriptive, persuasive and argumentative writing', 'Conjunctions and sentence variety'),
  upperWeek('Children’s literature and reflection', 'Discussion of themes and lessons from literature', 'Reading texts, poems, narratives and stories', 'Literary writing and reflection', 'Usage review from literature'),
  upperWeek('Informative and academic writing', 'Presentation of ideas clearly to others', 'Reading informational texts for summary and report', 'Informative/academic writing', 'Conventions in organised writing'),
  upperWeek('Writing process workshop', 'Planning, drafting and peer discussion', 'Reading model texts for improvement', 'Drafting, revising and editing compositions', 'Integrated usage and spelling'),
  upperWeek('Project communication and reading culture', 'Project presentation and book talk', 'Extensive reading and response', 'Writing project reflections or notes', 'Integrated conventions review'),
  upperWeek('Revision through integrated tasks', 'Oral revision and recap', 'Reading, fluency and summary review', 'Writing review tasks', 'Final usage review'),
  upperWeek('Integrated term review', 'Presentation and oral reflection', 'Reading review showcase', 'Writing portfolio review', 'Final integrated review'),
];

const b6Term2: WeeklyBundle[] = [
  upperWeek('Community issues and values', 'Conversation and presentation on community issues and values', 'Reading issue-based and cultural texts critically', 'Informative, persuasive and argumentative writing on community issues', 'Capitalisation, punctuation and sentence control in context'),
  upperWeek('Poetry, drama and oral creativity', 'Poetry recital, drama and oral interpretation', 'Reading poems, narratives and dramatic texts', 'Creative/free writing and literary writing', 'Usage through performance'),
  upperWeek('Listening, questioning and discussion', 'Listening comprehension, questioning and discussion', 'Reading for main ideas, detail and summary', 'Summary and informative writing', 'Simple and compound sentence review'),
  upperWeek('Letters, notices and instructions', 'Practical communication in oral language', 'Reading functional texts, letters and notices', 'Letter writing and functional writing', 'Postpositions, action words and punctuation'),
  upperWeek('Vocabulary, fluency and response', 'Oral use of content vocabulary', 'Silent reading, fluency and response to texts', 'Response writing from reading', 'Spelling and qualifying words'),
  upperWeek('Narrative and descriptive compositions', 'Retelling and describing experiences orally', 'Reading model narratives and descriptions', 'Narrative and descriptive writing', 'Sentence variety and conjunctions'),
  upperWeek('Argument and explanation', 'Expressing reasons and explanation orally', 'Reading argumentative and explanatory passages', 'Persuasive and argumentative writing', 'Conjunctions and punctuation'),
  upperWeek('Children’s literature and values', 'Discussing stories, poems and lessons', 'Reading literature and responding', 'Literary response writing', 'Usage review from literature'),
  upperWeek('Presentation and reporting', 'Short oral reports and presentations', 'Reading for summary and reporting', 'Academic/informative writing and reports', 'Conventions in summary writing'),
  upperWeek('Writing process and editing', 'Planning and revising through peer discussion', 'Reading models for editing', 'Drafting, revising and proofreading', 'Integrated usage review'),
  upperWeek('Project and extensive reading', 'Book talk and project presentation', 'Extensive reading and response', 'Writing project notes and reflections', 'Integrated conventions review'),
  upperWeek('Integrated term review', 'Presentation and oral reflection', 'Reading, fluency and summary review', 'Writing showcase', 'Final conventions review'),
];

const b6Term3: WeeklyBundle[] = [
  upperWeek('Development, responsibility and identity', 'Conversation and presentation on development and responsibility', 'Reading informative, cultural and issue-based texts', 'Informative, persuasive and descriptive writing on responsibility', 'Grammar and conventions in connected writing'),
  upperWeek('Poetry and oral tradition', 'Poetry recital and oral literary performance', 'Reading poems and literary texts for meaning', 'Creative/free writing and literary response', 'Usage through poetic language'),
  upperWeek('Narrative, dialogue and storytelling', 'Storytelling and dramatization', 'Reading narratives, dialogue and dramatic pieces', 'Narrative and literary writing', 'Sentence patterns and punctuation'),
  upperWeek('Listening and synthesis', 'Listening comprehension and oral synthesis', 'Reading passages for detail, summary and reflection', 'Summary and report writing', 'Conventions in concise writing'),
  upperWeek('Functional communication and letters', 'Commands, instructions and practical speaking', 'Reading practical texts and letters', 'Letter writing and functional writing', 'Action words, postpositions and punctuation'),
  upperWeek('Vocabulary, fluency and reading response', 'Vocabulary development through oral discussion', 'Silent reading, fluency and response', 'Writing reflections from reading', 'Spelling and sentence review'),
  upperWeek('Persuasive, argumentative and informative writing', 'Oral explanation, opinion and justification', 'Reading persuasive, argumentative and informative texts', 'Persuasive, argumentative and informative compositions', 'Conjunctions and sentence variety'),
  upperWeek('Children’s literature and reflection', 'Discussing texts, poems and stories', 'Reading children’s literature and responding', 'Literary response writing', 'Usage review from literature'),
  upperWeek('Writing workshop and project communication', 'Planning and presenting writing ideas', 'Reading model compositions', 'Drafting, revising and proofreading', 'Integrated usage review'),
  upperWeek('Extensive reading culture', 'Book talk and oral reflection', 'Extensive reading and read-aloud response', 'Writing book response notes', 'Final spelling and punctuation review'),
  upperWeek('Revision through integrated tasks', 'Oral revision and presentations', 'Reading review texts and summaries', 'Writing revision tasks', 'Integrated conventions review'),
  upperWeek('Transition showcase', 'Final oral presentation and reflection', 'Reading, fluency and summary showcase', 'Writing portfolio showcase', 'Final integrated review'),
];

export const primaryGhanaianLanguageTerms: ExplicitCurriculumTerm[] = [
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
