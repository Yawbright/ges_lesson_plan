import type { ExplicitCurriculumTerm } from './mathematicsB7';
import type { SchemeWeek, SchemeWeekEntry } from '@/types/scheme';

const resources = {
  oral: ['English textbook', 'Prompt cards', 'Audio clips', 'Discussion guide'],
  reading: ['Reading passages', 'Library books', 'Graphic organisers', 'Highlighters'],
  grammar: ['Sentence cards', 'Grammar reference chart', 'Exercise book'],
  writing: ['Exercise book', 'Writing frame', 'Model texts', 'Dictionary'],
  literature: ['Poems', 'Stories', 'Drama excerpts', 'Performance space'],
  media: ['Projector', 'Newspaper or blog samples', 'Audio-visual clips'],
};

function entry(
  strand: string,
  subStrand: string,
  contentStandard: string,
  indicator: string,
  topic: string,
  extraResources: string[] = []
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

export const englishB7Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'English Language',
    classLevel: 'B7',
    term: 'Term 1',
    title: 'B7 English Language Scheme of Work - Term 1',
    weeks: [
      week(1, 'Formal and informal introductions', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'B7/JHS1.1.1.1 Demonstrate use of appropriate language orally in specific situations.', 'B7/JHS1.1.1.1.1 Use appropriate register in everyday communication.', 'Formal and informal greetings and introductions', resources.oral),
        entry('Reading', 'Comprehension', 'B7/JHS1.2.1.1 Demonstrate increasing confidence and enjoyment in independent reading.', 'B7/JHS1.2.1.1.1 Read and understand a range of texts using monitoring and visualisation strategies.', 'Reading short personal and school texts for main ideas', resources.reading),
        entry('Writing', 'Production and Distribution of Writing', 'B7/JHS1.4.1.1 Develop, organise and express ideas coherently and cohesively in writing.', 'Draft clear personal paragraphs with simple supporting ideas.', 'Writing a self-introduction paragraph', resources.writing),
      ]),
      week(2, 'Asking questions and predicting meaning', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'B7/JHS1.1.1.1 Demonstrate use of appropriate language orally in specific situations.', 'B7/JHS1.1.1.1.2 Ask questions that elicit elaboration and respond to others’ questions in conversation.', 'Open-ended questioning in conversation', resources.oral),
        entry('Reading', 'Comprehension', 'B7/JHS1.2.1.1 Demonstrate increasing confidence and enjoyment in independent reading.', 'B7/JHS1.2.1.1.2 Use prediction to assess and improve understanding of texts.', 'Predicting content using titles, pictures and text features', resources.reading),
        entry('Grammar Usage', 'Vocabulary', 'B7/JHS1.3.3.1 Demonstrate appropriate use of vocabulary in communication.', 'Use question and response vocabulary appropriately in context.', 'Vocabulary for questioning and responding', resources.grammar),
      ]),
      week(3, 'Describing experiences and monitoring reading', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'B7/JHS1.1.1.1 Demonstrate use of appropriate language orally in specific situations.', 'B7/JHS1.1.1.1.3 Use appropriate language orally to describe experiences about oneself and others.', 'Describing familiar experiences orally', resources.oral),
        entry('Reading', 'Comprehension', 'B7/JHS1.2.1.1 Demonstrate increasing confidence and enjoyment in independent reading.', 'B7/JHS1.2.1.1.3 Generate and answer questions to increase understanding of fiction texts.', 'Questioning and monitoring meaning in fiction', resources.reading),
        entry('Grammar Usage', 'Grammar', 'B7/JHS1.3.1.1 Apply grammar accurately in communication.', 'Use nouns, adjectives and adverbs to add details to descriptions.', 'Descriptive words in oral and written communication', resources.grammar),
      ]),
      week(4, 'Giving directions and understanding text structure', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'B7/JHS1.1.1.1 Demonstrate use of appropriate language orally in specific situations.', 'B7/JHS1.1.1.1.4 Listen to and give accurate directions to familiar places.', 'Giving and following directions', resources.oral),
        entry('Reading', 'Comprehension', 'B7/JHS1.2.1.1 Demonstrate increasing confidence and enjoyment in independent reading.', 'B7/JHS1.2.1.1.4 Use text structure to understand and read texts independently.', 'Text structures: sequence, cause and effect, compare and contrast', resources.reading),
        entry('Writing', 'Building and Presenting Knowledge', 'B7/JHS1.4.3.1 Research to build and present knowledge.', 'Record simple route information and present it clearly in writing.', 'Writing guided directions using sequence words', resources.writing),
      ]),
      week(5, 'Voice control and non-fiction features', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'B7/JHS1.1.1.1 Demonstrate use of appropriate language orally in specific situations.', 'B7/JHS1.1.1.1.5 Use techniques such as voice modulation and eye contact for effective oral communication.', 'Voice modulation and eye contact in short presentations', resources.oral),
        entry('Reading', 'Comprehension', 'B7/JHS1.2.1.2 Read, comprehend and interpret texts.', 'B7/JHS1.2.1.2.1 Identify the main text features of a non-literary text.', 'Features of articles, notices and letters', resources.reading),
        entry('Grammar Usage', 'Punctuation and Capitalisation', 'B7/JHS1.3.2.1 Demonstrate use and mastery of capitalisation and punctuation in communication.', 'Use full stops, commas, question marks and exclamation marks correctly.', 'Punctuation in simple informational texts', resources.grammar),
      ]),
      week(6, 'Listening for key information and factual reading', [
        entry('Oral Language', 'Listening Comprehension', 'B7/JHS1.1.2.1 Demonstrate the ability to listen to extended reading and identify key information.', 'B7/JHS1.1.2.1.1 Listen attentively to identify key information.', 'Listening for purpose, main idea and supporting points', resources.oral),
        entry('Reading', 'Comprehension', 'B7/JHS1.2.1.2 Read, comprehend and interpret texts.', 'B7/JHS1.2.1.2.2 Interpret non-fiction texts pointing out attitudes, opinions, biases and facts.', 'Fact, opinion and bias in non-fiction reading', resources.reading),
        entry('Writing', 'Text Types and Purposes', 'B7/JHS1.4.2.1 Use process approach to compose descriptive, narrative and informational texts.', 'Write short factual responses using evidence from reading.', 'Summarising factual information in sentences', resources.writing),
      ]),
      week(7, 'Sharing opinions and personal responses to texts', [
        entry('Oral Language', 'Listening Comprehension', 'B7/JHS1.1.2.1 Demonstrate the ability to listen to extended reading and identify key information.', 'B7/JHS1.1.2.1.2 Listen to, discuss ideas and share opinions from a level-appropriate text.', 'Discussion skills and sharing opinions', resources.oral),
        entry('Reading', 'Comprehension', 'B7/JHS1.2.1.2 Read, comprehend and interpret texts.', 'B7/JHS1.2.1.2.3 Interpret a non-literary text showing personal responses and supporting responses with textual evidence.', 'Responding to texts with evidence', resources.reading),
        entry('Literature', 'Narrative, Drama and Poetry', 'B7/JHS1.5.1.1 Demonstrate understanding of how various elements of literary genres contribute to meaning.', 'B7/JHS1.5.1.1.1 Demonstrate understanding of oral literature and how genres contribute to meaning.', 'Responding to folktales, lullabies and simple oral literature', resources.literature),
      ]),
      week(8, 'English sounds and vocabulary in context', [
        entry('Oral Language', 'English Sounds', 'B7/JHS1.1.3.1 Articulate English speech sounds to develop confidence and skills in listening and speaking.', 'B7/JHS1.1.3.1.1-1.3 Produce short vowels, long vowels and diphthongs in context.', 'Pure vowels and diphthongs in connected speech', resources.oral),
        entry('Grammar Usage', 'Vocabulary', 'B7/JHS1.3.3.1 Demonstrate appropriate use of vocabulary in communication.', 'B7/JHS1.3.3.1.1 Apply vocabulary appropriately in specific contexts.', 'Advice, agreement and disagreement vocabulary', resources.grammar),
        entry('Writing', 'Production and Distribution of Writing', 'B7/JHS1.4.1.1 Develop, organise and express ideas coherently and cohesively in writing.', 'Draft dialogue lines using accurate sound patterns and simple punctuation.', 'Writing short dialogues for oral practice', resources.writing),
      ]),
      week(9, 'Word classes in descriptive communication', [
        entry('Grammar Usage', 'Grammar', 'B7/JHS1.3.1.1 Apply grammar accurately in communication.', 'Use nouns, adjectives, adverbs and conjunctions accurately at phrase and sentence level.', 'Adjectives, adverbs and conjunctions in description', resources.grammar),
        entry('Reading', 'Comprehension', 'B7/JHS1.2.1.1 Demonstrate increasing confidence and enjoyment in independent reading.', 'Use reading passages to identify effective grammatical choices.', 'Identifying grammatical choices in model texts', resources.reading),
        entry('Writing', 'Text Types and Purposes', 'B7/JHS1.4.2.1 Use process approach to compose descriptive and narrative texts.', 'Compose simple descriptive paragraphs using varied word classes.', 'Descriptive paragraph writing', resources.writing),
      ]),
      week(10, 'Prepositions, determiners and written organisation', [
        entry('Grammar Usage', 'Grammar', 'B7/JHS1.3.1.1 Apply grammar accurately in communication.', 'B7/JHS1.3.1.1.7-1.8 Use prepositions and determiners accurately in speech and writing.', 'Prepositions and determiners in sentences and paragraphs', resources.grammar),
        entry('Writing', 'Text Types and Purposes', 'B7/JHS1.4.2.2 Apply writing skills to specific life situations.', 'Compose short notices and classroom messages using clear format.', 'Notices and short practical writing', resources.writing),
        entry('Reading', 'Comprehension', 'B7/JHS1.2.1.2 Read, comprehend and interpret texts.', 'Read model notices and identify organisational features.', 'How layout supports meaning in practical texts', resources.reading),
      ]),
      week(11, 'Note-taking and poster writing', [
        entry('Writing', 'Text Types and Purposes', 'B7/JHS1.4.2.2 Apply writing skills to specific life situations.', 'B7/JHS1.4.2.2.3-2.4 Take notes and design notices and posters for different purposes.', 'Note-taking, notices and posters', resources.writing),
        entry('Reading', 'Comprehension', 'B7/JHS1.2.1.2 Read, comprehend and interpret texts.', 'Read notices and posters critically for audience and purpose.', 'Reading practical texts for purpose and audience', resources.reading),
        entry('Grammar Usage', 'Vocabulary', 'B7/JHS1.3.4.1 Demonstrate understanding of use of aesthetic language to enrich communication.', 'Explore the use of proverbs and simple figurative language in communication.', 'Proverbs and expressive language in posters and messages', resources.grammar),
      ]),
      week(12, 'Articles, oral literature and term presentation', [
        entry('Writing', 'Text Types and Purposes', 'B7/JHS1.4.2.2 Apply writing skills to specific life situations.', 'B7/JHS1.4.2.2.5 Write articles on given issues for publication in class and club magazines.', 'Writing simple articles on familiar issues', resources.writing),
        entry('Literature', 'Narrative, Drama and Poetry', 'B7/JHS1.5.1.1 Demonstrate understanding of how various elements of literary genres contribute to meaning.', 'B7/JHS1.5.1.1.2-1.3 Analyse basic elements of literature and use literary devices in texts.', 'Story elements and basic literary devices', resources.literature),
        entry('Oral Language', 'Conversation/Listening', 'Integrate oral presentation skills across term work.', 'Present a short article or performance with appropriate voice and register.', 'Integrated oral presentation and reflection', resources.oral),
      ]),
    ],
  },
  {
    subject: 'English Language',
    classLevel: 'B7',
    term: 'Term 2',
    title: 'B7 English Language Scheme of Work - Term 2',
    weeks: [
      week(1, 'Listening and reading around natural resources', [
        entry('Oral Language', 'Listening Comprehension', 'B7/JHS1.1.2.1 Demonstrate the ability to listen to extended reading and identify key information.', 'Listen for key points in grade-level informational texts.', 'Listening to short talks on Ghana’s natural resources', resources.oral),
        entry('Reading', 'Comprehension', 'B7/JHS1.2.1.2 Read, comprehend and interpret texts.', 'Interpret non-fiction texts using textual evidence.', 'Reading informational texts on mining and natural resources', resources.reading),
        entry('Writing', 'Building and Presenting Knowledge', 'B7/JHS1.4.3.1 Research to build and present knowledge.', 'Record information from non-text and text sources accurately.', 'Taking notes from charts and reading passages', resources.writing),
      ]),
      week(2, 'Discussion and paragraphing on environmental issues', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'Use appropriate language orally in specific situations.', 'Discuss environmental issues using suitable register and elaborative questions.', 'Structured discussion on environmental degradation and preservation', resources.oral),
        entry('Writing', 'Production and Distribution of Writing', 'Develop, organise and express ideas coherently and cohesively in writing.', 'Compose unified paragraphs on environmental issues.', 'Paragraph writing on preservation and pollution', resources.writing),
        entry('Grammar Usage', 'Grammar', 'Apply grammar accurately in communication.', 'Use conjunctions and sentence variety to connect ideas.', 'Joining environmental ideas in coherent sentences', resources.grammar),
      ]),
      week(3, 'Reading themes, facts and opinions', [
        entry('Reading', 'Comprehension', 'Read, comprehend and interpret texts.', 'Identify facts, opinions, bias and attitudes in informational texts.', 'Distinguishing fact and opinion in health and social issue texts', resources.reading),
        entry('Grammar Usage', 'Vocabulary', 'Demonstrate appropriate use of vocabulary in communication.', 'Build topic vocabulary related to health, education and entrepreneurship.', 'Thematic vocabulary building', resources.grammar),
        entry('Oral Language', 'Listening Comprehension', 'Demonstrate the ability to listen to extended reading and identify key information.', 'Share opinions respectfully after listening.', 'Oral response to informational passages', resources.oral),
      ]),
      week(4, 'Sounds, fluency and reading aloud', [
        entry('Oral Language', 'English Sounds', 'Articulate English speech sounds to develop confidence and skills in listening and speaking.', 'Produce target vowel and diphthong patterns in connected reading.', 'Reading aloud with accurate pronunciation', resources.oral),
        entry('Reading', 'Comprehension', 'Demonstrate increasing confidence and enjoyment in independent reading.', 'Read aloud fluently and monitor understanding.', 'Guided fluency and comprehension practice', resources.reading),
        entry('Literature', 'Narrative, Drama and Poetry', 'Demonstrate understanding of how various elements of literary genres contribute to meaning.', 'Read and perform simple oral poems with rhythm and expression.', 'Poetry reading for fluency and sound awareness', resources.literature),
      ]),
      week(5, 'Functional writing: notices, posters and short speeches', [
        entry('Writing', 'Text Types and Purposes', 'Apply writing skills to specific life situations.', 'Design notices, posters and short messages for different audiences.', 'Functional writing for school communication', resources.writing),
        entry('Oral Language', 'Conversation/Everyday Discourse', 'Use voice modulation and eye contact for effective oral communication.', 'Deliver short oral announcements and notices effectively.', 'Reading and presenting notices aloud', resources.oral),
        entry('Grammar Usage', 'Punctuation and Capitalisation', 'Demonstrate mastery of punctuation and capitalisation.', 'Edit punctuation and capitals in practical texts.', 'Editing practical writing', resources.grammar),
      ]),
      week(6, 'Narrative and dramatic elements', [
        entry('Literature', 'Narrative, Drama and Poetry', 'Demonstrate understanding of how various elements of literary genres contribute to meaning.', 'Identify plot, setting and characters in narratives and drama.', 'Narrative and drama elements', resources.literature),
        entry('Reading', 'Comprehension', 'Read, comprehend and interpret texts.', 'Provide textual evidence to support interpretations.', 'Reading stories and short dramatic excerpts', resources.reading),
        entry('Writing', 'Text Types and Purposes', 'Use process approach to compose narrative texts.', 'Write a short story or scene using clear setting and characters.', 'Short narrative composition', resources.writing),
      ]),
      week(7, 'Poetry, values and figurative language', [
        entry('Literature', 'Narrative, Drama and Poetry', 'Demonstrate understanding of how various elements of literary genres contribute to meaning.', 'Discuss values and types of poems; compose simple poems.', 'Poetry, values and performance', resources.literature),
        entry('Grammar Usage', 'Vocabulary/Aesthetic language', 'Demonstrate understanding of aesthetic language to enrich communication.', 'Use simile, personification and proverb-like expressions in context.', 'Simple figurative language in poetry and speech', resources.grammar),
        entry('Oral Language', 'Conversation/Presentation', 'Use appropriate oral language and performance techniques.', 'Recite poems with confidence and expression.', 'Poetry recitation and oral performance', resources.oral),
      ]),
      week(8, 'Articles and school magazine writing', [
        entry('Writing', 'Text Types and Purposes', 'Apply writing skills to specific life situations.', 'Write articles on given issues for publication.', 'Writing for class and club magazines', resources.writing),
        entry('Reading', 'Comprehension', 'Read, comprehend and interpret texts.', 'Analyse model articles for feature, structure and audience.', 'Article reading and feature spotting', resources.reading),
        entry('Grammar Usage', 'Grammar', 'Apply grammar accurately in communication.', 'Use prepositions, determiners and sentence variety in articles.', 'Editing articles for accuracy', resources.grammar),
      ]),
      week(9, 'Research and graphic information', [
        entry('Writing', 'Building and Presenting Knowledge', 'Research to build and present knowledge.', 'B7/JHS1.4.3.1.1 Identify and record information from non-text sources and present it in writing.', 'Using tables and figures to support writing', resources.writing),
        entry('Reading', 'Comprehension', 'Read, comprehend and interpret texts.', 'Interpret maps, tables and diagrams alongside written texts.', 'Reading graphical information', resources.reading),
        entry('Oral Language', 'Listening/Discussion', 'Discuss and share ideas from texts and related sources.', 'Present findings from simple graphic information.', 'Oral sharing of findings', resources.oral),
      ]),
      week(10, 'Health and social issues integrated week', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'Use appropriate register in conversations on varied themes.', 'Discuss health and social issues using open questions and respectful language.', 'Discussion on adolescent health and social inclusion', resources.oral),
        entry('Reading', 'Comprehension', 'Read, comprehend and interpret texts.', 'Interpret informational texts on health and social issues.', 'Reading health and social issue passages', resources.reading),
        entry('Writing', 'Text Types and Purposes', 'Compose informational texts for specific audiences.', 'Write advice texts and awareness messages on health and social issues.', 'Advice and awareness writing', resources.writing),
      ]),
      week(11, 'Independent reading and response portfolio', [
        entry('Reading', 'Comprehension', 'Demonstrate increasing confidence and enjoyment in independent reading.', 'Read independently and track understanding across texts.', 'Independent reading and response journal', resources.reading),
        entry('Writing', 'Building and Presenting Knowledge', 'Research to build and present knowledge.', 'Take notes and record responses to reading.', 'Portfolio note-making and reflection', resources.writing),
        entry('Literature', 'Narrative, Drama and Poetry', 'Demonstrate understanding of how literary genres contribute to meaning.', 'Connect independent reading to literary appreciation.', 'Personal response to literary reading', resources.literature),
      ]),
      week(12, 'Integrated term project and presentation', [
        entry('Writing', 'Text Types and Purposes', 'Apply writing skills to specific life situations.', 'Produce a polished article, notice, poster or short report using process writing.', 'Integrated publishing task', resources.writing),
        entry('Oral Language', 'Conversation/Presentation', 'Use appropriate voice and register in oral presentation.', 'Present project work clearly and confidently.', 'Project presentation and peer feedback', resources.oral),
        entry('Reading/Literature', 'Response and Reflection', 'Integrate reading and literary response across the term.', 'Use reading evidence and literary appreciation to support presentation.', 'Presentation supported by reading and literature', [...resources.reading, ...resources.literature]),
      ]),
    ],
  },
  {
    subject: 'English Language',
    classLevel: 'B7',
    term: 'Term 3',
    title: 'B7 English Language Scheme of Work - Term 3',
    weeks: [
      week(1, 'Tourism and place description', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'Use appropriate language orally in specific situations.', 'Describe familiar places and events using suitable language.', 'Oral descriptions of tourist sites and local places', resources.oral),
        entry('Reading', 'Comprehension', 'Demonstrate increasing confidence and enjoyment in independent reading.', 'Use comprehension strategies with descriptive texts.', 'Reading descriptive texts on tourism and places', resources.reading),
        entry('Writing', 'Text Types and Purposes', 'Use process approach to compose descriptive texts.', 'Write descriptive paragraphs about places using sensory details.', 'Descriptive writing on tourism', resources.writing),
      ]),
      week(2, 'Festivals, performance and oral literature', [
        entry('Literature', 'Narrative, Drama and Poetry', 'Demonstrate understanding of oral literature and literary elements.', 'Explore praise songs, festival drama and oral narratives.', 'Festival literature and performance', resources.literature),
        entry('Oral Language', 'Conversation/Presentation', 'Use voice modulation and eye contact for effective oral communication.', 'Perform oral pieces connected to festivals and culture.', 'Cultural oral performance', resources.oral),
        entry('Writing', 'Text Types and Purposes', 'Compose texts for audience and purpose.', 'Write short cultural narratives or performance scripts.', 'Cultural narrative and script writing', resources.writing),
      ]),
      week(3, 'Technology and media awareness', [
        entry('Reading', 'Comprehension', 'Read, comprehend and interpret texts.', 'Interpret text features and factual claims in technology texts.', 'Reading on technology and media', resources.reading),
        entry('Grammar Usage', 'Vocabulary', 'Demonstrate appropriate use of vocabulary in communication.', 'Use technology vocabulary in speech and writing.', 'Technology vocabulary in context', resources.grammar),
        entry('Writing', 'Building and Presenting Knowledge', 'Research to build and present knowledge.', 'Record information from media and reading sources.', 'Simple research note-taking on technology', [...resources.writing, ...resources.media]),
      ]),
      week(4, 'Environment and persuasive messaging', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'Discuss ideas and issues using appropriate register.', 'Share views on destruction of water bodies and preservation.', 'Environmental discussion and persuasion', resources.oral),
        entry('Writing', 'Text Types and Purposes', 'Apply writing skills to specific life situations.', 'Create posters and short persuasive texts for environmental awareness.', 'Persuasive poster and awareness writing', resources.writing),
        entry('Reading', 'Comprehension', 'Interpret non-fiction texts using evidence.', 'Read awareness texts and identify persuasive language.', 'Persuasive features in environmental texts', resources.reading),
      ]),
      week(5, 'Entrepreneurship and informational texts', [
        entry('Reading', 'Comprehension', 'Read, comprehend and interpret texts.', 'Interpret informational and explanatory texts.', 'Reading entrepreneurship and small business texts', resources.reading),
        entry('Writing', 'Building and Presenting Knowledge', 'Research to build and present knowledge.', 'Gather and organise ideas from non-text and text sources.', 'Organising information about simple business ideas', resources.writing),
        entry('Oral Language', 'Listening/Discussion', 'Listen to and discuss ideas from level-appropriate texts.', 'Share ideas on entrepreneurship opportunities.', 'Discussion on enterprise ideas', resources.oral),
      ]),
      week(6, 'Health awareness article writing', [
        entry('Reading', 'Comprehension', 'Read, comprehend and interpret texts.', 'Identify facts, supporting points and writer’s intention in health texts.', 'Reading health information critically', resources.reading),
        entry('Writing', 'Text Types and Purposes', 'Write articles on given issues for publication.', 'Write a short health awareness article for peers.', 'Health awareness article', resources.writing),
        entry('Grammar Usage', 'Punctuation and Vocabulary', 'Use punctuation and vocabulary appropriately in communication.', 'Edit topic vocabulary and punctuation in informational articles.', 'Editing and refining health writing', resources.grammar),
      ]),
      week(7, 'Drama, dialogue and role play', [
        entry('Literature', 'Narrative, Drama and Poetry', 'Demonstrate understanding of literary genres and their elements.', 'Identify plot, setting, characters and dialogue in drama.', 'Drama reading and role play', resources.literature),
        entry('Writing', 'Text Types and Purposes', 'Compose dialogues for publication and performance.', 'Write short dialogues using correct punctuation.', 'Dialogue writing', resources.writing),
        entry('Oral Language', 'Conversation/Presentation', 'Use oral techniques in communication.', 'Act scenes using turn-taking and expression.', 'Role play and performance', resources.oral),
      ]),
      week(8, 'Poetry, proverb and figurative language workshop', [
        entry('Literature', 'Narrative, Drama and Poetry', 'Demonstrate understanding of poetry and literary devices.', 'Compose and perform poems on familiar themes.', 'Poetry writing and recitation', resources.literature),
        entry('Grammar Usage', 'Aesthetic language/Vocabulary', 'Demonstrate understanding of use of aesthetic language to enrich communication.', 'Explore proverbs and figurative expressions in context.', 'Proverbs and poetic language', resources.grammar),
        entry('Oral Language', 'English Sounds/Presentation', 'Articulate English speech sounds in connected speech.', 'Read and recite poetic lines with rhythm and expression.', 'Sound, rhythm and recital practice', resources.oral),
      ]),
      week(9, 'Research and presentation from charts and figures', [
        entry('Writing', 'Building and Presenting Knowledge', 'Research to build and present knowledge.', 'Identify and record information from figures and tables; organise and present it in writing.', 'Writing from graphs, tables and figures', resources.writing),
        entry('Reading', 'Comprehension', 'Read, comprehend and interpret texts.', 'Interpret graphical information alongside related texts.', 'Reading tables and simple data displays', resources.reading),
        entry('Oral Language', 'Listening/Presentation', 'Share opinions and findings from texts and related materials.', 'Present findings from charts in simple spoken language.', 'Oral presentation of simple data', resources.oral),
      ]),
      week(10, 'Independent reading and summary practice', [
        entry('Reading', 'Comprehension/Summarising', 'Develop comprehension and summarising skills through independent reading.', 'Read age-appropriate texts and identify main ideas for summary.', 'Independent reading and guided summary', resources.reading),
        entry('Writing', 'Production and Distribution of Writing', 'Develop, organise and express ideas coherently and cohesively in writing.', 'Write concise summaries of informational texts.', 'Summary writing practice', resources.writing),
        entry('Grammar Usage', 'Grammar', 'Use sentence structures accurately in communication.', 'Use conjunctions and accurate sentence forms to produce clear summaries.', 'Sentence control in summaries', resources.grammar),
      ]),
      week(11, 'Integrated reading portfolio and reflection', [
        entry('Reading', 'Independent Reading', 'Build reading confidence and enjoyment across varied texts.', 'Select and respond to personal reading on chosen themes.', 'Reading portfolio entries', resources.reading),
        entry('Writing', 'Building and Presenting Knowledge', 'Research to build and present knowledge.', 'Keep notes and reflections on what has been read.', 'Reading log and reflection writing', resources.writing),
        entry('Oral Language', 'Discussion', 'Share and defend personal responses to texts.', 'Book talk and peer discussion', 'Book talk and peer discussion', resources.oral),
      ]),
      week(12, 'Term showcase: article, performance and presentation', [
        entry('Writing', 'Integrated Writing Task', 'Apply writing skills to a final term task.', 'Produce a polished article, poster, speech or report.', 'Final integrated English writing task', resources.writing),
        entry('Oral Language', 'Presentation', 'Use appropriate register, eye contact and voice modulation.', 'Present final term work with confidence.', 'Final oral presentation', resources.oral),
        entry('Literature/Reading', 'Response and Appreciation', 'Use literary and reading understanding to enrich final output.', 'Incorporate text evidence, themes and performance awareness.', 'Reading-supported showcase', [...resources.reading, ...resources.literature]),
      ]),
    ],
  },
];

export const englishB8Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'English Language',
    classLevel: 'B8',
    term: 'Term 1',
    title: 'B8 English Language Scheme of Work - Term 1',
    weeks: [
      week(1, 'Describing places and events with precise language', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'B8/JHS2.1.1.1 Demonstrate use of appropriate language orally in specific situations.', 'B8/JHS2.1.1.1.3 Use appropriate language orally to describe familiar places and events.', 'Oral description using sensory and figurative language', resources.oral),
        entry('Reading', 'Comprehension', 'B8/JHS2.2.1.1 Demonstrate confidence and enjoyment in reading varied texts.', 'Read descriptive and informational texts closely.', 'Reading descriptive texts for imagery and detail', resources.reading),
        entry('Writing', 'Production and Distribution of Writing', 'B8/JHS2.4.1.1 Develop, organise and express ideas coherently and cohesively in writing.', 'Write descriptive paragraphs with supporting details.', 'Descriptive paragraph writing', resources.writing),
      ]),
      week(2, 'Directions, travel and tourism texts', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'B8/JHS2.1.1.1 Demonstrate use of appropriate language orally in specific situations.', 'B8/JHS2.1.1.1.4 Listen to and give accurate directions of complex routes to different locations.', 'Giving complex directions and travel guidance', resources.oral),
        entry('Reading', 'Comprehension', 'B8/JHS2.2.1.1 Demonstrate confidence and enjoyment in reading varied texts.', 'Use contextual clues and text features to analyse tourism texts.', 'Reading tourism brochures and travel information', resources.reading),
        entry('Grammar Usage', 'Vocabulary', 'Build and apply domain-specific vocabulary in communication.', 'Use travel and location vocabulary effectively.', 'Travel and location vocabulary', resources.grammar),
      ]),
      week(3, 'Turn-taking and discussion strategies', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'B8/JHS2.1.1.1 Demonstrate use of appropriate language orally in specific situations.', 'B8/JHS2.1.1.1.5 Demonstrate appropriate turn taking for effective oral communication.', 'Turn-taking in meetings and discussions', resources.oral),
        entry('Reading', 'Comprehension', 'B8/JHS2.2.1.2 Read, comprehend and analyse varied texts.', 'Use contextual clues to analyse texts.', 'Finding cues for meaning in discussion texts', resources.reading),
        entry('Writing', 'Production and Distribution of Writing', 'Develop, organise and express ideas coherently and cohesively in writing.', 'Write discussion notes and speaking points.', 'Preparing notes for group discussion', resources.writing),
      ]),
      week(4, 'Inference and evidence in reading', [
        entry('Reading', 'Comprehension', 'B8/JHS2.2.1.2 Read, comprehend and analyse varied texts.', 'B8/JHS2.2.1.2.2-2.4 Use contextual clues, answer complex questions and provide evidence to support understanding.', 'Inference and evidence in reading', resources.reading),
        entry('Writing', 'Building and Presenting Knowledge', 'B8/JHS2.4.3.1 Research to build and present knowledge.', 'Use notes and evidence to support written responses.', 'Evidence-based response writing', resources.writing),
        entry('Oral Language', 'Listening Comprehension', 'Demonstrate the ability to listen and respond to extended texts.', 'Discuss and justify interpretations orally.', 'Justifying responses in discussion', resources.oral),
      ]),
      week(5, 'Themes and viewpoints across texts', [
        entry('Reading', 'Comprehension', 'B8/JHS2.2.1.2 Read, comprehend and analyse varied texts.', 'B8/JHS2.2.1.2.5-2.6 Generate simple themes and examine connections between a text and other points of view.', 'Themes and viewpoints in reading', resources.reading),
        entry('Literature', 'Narrative, Drama and Poetry', 'B8/JHS2.5.1.1 Demonstrate understanding of literary elements.', 'Compare viewpoints and character types across texts.', 'Comparing viewpoints in literary and informational texts', resources.literature),
        entry('Oral Language', 'Conversation/Discussion', 'Use oral language for reasoned discussion.', 'Discuss and defend interpretations using textual evidence.', 'Oral interpretation and defence', resources.oral),
      ]),
      week(6, 'Sentence control and reported speech', [
        entry('Grammar Usage', 'Grammar', 'B8/JHS2.3.1.1 Apply grammar accurately in speech and writing.', 'Use reported speech accurately and appropriately.', 'Reported speech and sentence transformation', resources.grammar),
        entry('Writing', 'Production and Distribution of Writing', 'Develop, organise and express ideas coherently and cohesively in writing.', 'Use reported speech in narrative and report writing.', 'Using reported speech in writing', resources.writing),
        entry('Reading', 'Comprehension', 'Read model texts to identify language patterns.', 'Notice and discuss reported speech in authentic texts.', 'Reported speech in reading passages', resources.reading),
      ]),
      week(7, 'Question tags, punctuation and editing', [
        entry('Grammar Usage', 'Grammar/Punctuation', 'B8/JHS2.3.1.6 and B8/JHS2.3.2.1 Apply question tags and punctuation accurately.', 'Use question tags, colon, semi-colon and apostrophe in context.', 'Question tags and advanced punctuation', resources.grammar),
        entry('Writing', 'Text Types and Purposes', 'Apply writing skills to practical texts.', 'Edit practical writing for punctuation accuracy.', 'Editing letters and announcements', resources.writing),
        entry('Oral Language', 'Conversation', 'Use question tags in communication.', 'Speak using appropriate question tags in daily discourse.', 'Interactive question-tag conversations', resources.oral),
      ]),
      week(8, 'Formal letters and emails', [
        entry('Writing', 'Text Types and Purposes', 'B8/JHS2.4.2.2 Apply writing skills to specific life situations.', 'B8/JHS2.4.2.2.1 Compose formal writing using the appropriate format.', 'Formal letters and emails', resources.writing),
        entry('Reading', 'Comprehension', 'Read model practical texts critically.', 'Identify format, purpose and audience in formal texts.', 'Reading model formal letters and emails', resources.reading),
        entry('Grammar Usage', 'Vocabulary/Grammar', 'Apply formal register appropriately.', 'Use formal vocabulary and sentence choices in practical writing.', 'Formal register and language choices', resources.grammar),
      ]),
      week(9, 'Flyers, brochures and notices', [
        entry('Writing', 'Text Types and Purposes', 'B8/JHS2.4.2.2 Apply writing skills to specific life situations.', 'B8/JHS2.4.2.2.2 Compose notes, brochures and flyers for different purposes and audiences.', 'Flyers, brochures and notices', resources.writing),
        entry('Reading', 'Comprehension', 'Analyse media and practical texts.', 'Identify headlines, slogans and audience appeal.', 'Reading brochures and publicity materials', [...resources.reading, ...resources.media]),
        entry('Oral Language', 'Presentation', 'Present information clearly to audience.', 'Pitch a brochure or flyer orally.', 'Short promotional presentation', resources.oral),
      ]),
      week(10, 'Article writing and school publication', [
        entry('Writing', 'Text Types and Purposes', 'B8/JHS2.4.2.2 Apply writing skills to specific life situations.', 'B8/JHS2.4.2.2.3 Write articles on given issues for publication in school magazines.', 'Article writing for school publication', resources.writing),
        entry('Reading', 'Comprehension', 'Read and compare article models.', 'Identify how writers organise main and supporting ideas.', 'Analysing school magazine articles', resources.reading),
        entry('Grammar Usage', 'Vocabulary/Grammar', 'Use sentence variety and topical vocabulary in writing.', 'Revise article drafts for coherence and precision.', 'Revising articles for publication', resources.grammar),
      ]),
      week(11, 'Dialogues and speeches', [
        entry('Writing', 'Text Types and Purposes', 'B8/JHS2.4.2.2 Apply writing skills to specific life situations.', 'B8/JHS2.4.2.2.4-2.5 Create dialogues and compose speeches for different purposes and occasions.', 'Dialogues and speeches', resources.writing),
        entry('Oral Language', 'Conversation/Presentation', 'Use appropriate spoken language, turn-taking and presentation skills.', 'Perform dialogues and rehearse speeches.', 'Speech rehearsal and dialogue performance', resources.oral),
        entry('Literature', 'Drama and Poetry', 'Use dramatic and rhetorical effects in communication.', 'Notice dramatic voice and audience effect.', 'Linking dialogue writing to performance', resources.literature),
      ]),
      week(12, 'Research, poetry and integrated term task', [
        entry('Writing', 'Building and Presenting Knowledge', 'B8/JHS2.4.3.1 Research to build and present knowledge.', 'Use figures, tables, graphs and maps to support ideas in writing.', 'Research-supported writing and presentation', resources.writing),
        entry('Literature', 'Narrative, Drama and Poetry', 'B8/JHS2.5.1.1 Demonstrate understanding of literary genres.', 'Examine poem types, dialogue/monologue and literary devices.', 'Poetry and performance appreciation', resources.literature),
        entry('Oral Language', 'Presentation', 'Use clear spoken language in final integrated presentations.', 'Present term project findings and creative work.', 'Integrated term presentation', resources.oral),
      ]),
    ],
  },
  {
    subject: 'English Language',
    classLevel: 'B8',
    term: 'Term 2',
    title: 'B8 English Language Scheme of Work - Term 2',
    weeks: [
      week(1, 'Values and discussion texts', [
        entry('Reading', 'Comprehension', 'B8/JHS2.2.1.2 Read, comprehend and analyse varied texts.', 'Read and interpret texts on values and work attitudes.', 'Reading on honesty, loyalty and hard work', resources.reading),
        entry('Oral Language', 'Conversation/Discussion', 'Use oral language appropriately in discussion.', 'Discuss values and defend viewpoints respectfully.', 'Discussion on values and attitude to work', resources.oral),
        entry('Writing', 'Production and Distribution of Writing', 'Develop coherent paragraphs in response to texts.', 'Write reflective paragraphs on values.', 'Reflective writing on values', resources.writing),
      ]),
      week(2, 'Engineering and invention vocabulary', [
        entry('Reading', 'Comprehension', 'Read, comprehend and analyse varied texts.', 'Use contextual clues to analyse technical texts.', 'Reading engineering and invention texts', resources.reading),
        entry('Grammar Usage', 'Vocabulary', 'Apply vocabulary appropriately in specific contexts.', 'Use engineering and invention vocabulary in speech and writing.', 'Technical vocabulary in context', resources.grammar),
        entry('Writing', 'Building and Presenting Knowledge', 'Research to build and present knowledge.', 'Take notes from technical reading and visuals.', 'Structured note-taking from informational texts', resources.writing),
      ]),
      week(3, 'Banking, finance and formal communication', [
        entry('Reading', 'Comprehension', 'Read, comprehend and analyse varied texts.', 'Interpret informational texts in finance and business contexts.', 'Reading banking and finance texts', resources.reading),
        entry('Writing', 'Text Types and Purposes', 'Compose formal writing for specific life situations.', 'Write formal requests, complaints or information emails.', 'Formal communication in finance-related contexts', resources.writing),
        entry('Grammar Usage', 'Grammar/Punctuation', 'Use punctuation and formal structures accurately.', 'Edit punctuation and sentence structures in formal communication.', 'Editing formal communication', resources.grammar),
      ]),
      week(4, 'Media, communication and audience awareness', [
        entry('Reading', 'Comprehension', 'Read, comprehend and analyse varied texts.', 'Analyse communication texts for purpose, viewpoint and audience.', 'Reading print and electronic media texts', [...resources.reading, ...resources.media]),
        entry('Writing', 'Text Types and Purposes', 'Apply writing skills to practical and media texts.', 'Write notices, flyers or short media messages for specific audiences.', 'Media writing and audience targeting', resources.writing),
        entry('Oral Language', 'Conversation/Presentation', 'Use appropriate language in discussion and presentation.', 'Present and critique short media messages.', 'Media presentation and peer critique', [...resources.oral, ...resources.media]),
      ]),
      week(5, 'Poetry forms and creative expression', [
        entry('Literature', 'Narrative, Drama and Poetry', 'B8/JHS2.5.1.1 Demonstrate understanding of literary elements.', 'B8/JHS2.5.1.1.2 Examine features of different types of poems.', 'Sonnet, acrostic and haiku', resources.literature),
        entry('Writing', 'Creative Writing', 'Compose varied poetic forms for audience and purpose.', 'Write simple poems in selected forms.', 'Poetry composition workshop', resources.writing),
        entry('Oral Language', 'Presentation', 'Perform oral texts with confidence and expression.', 'Perform poems with rhythm and clarity.', 'Poetry performance', resources.oral),
      ]),
      week(6, 'Character types and literary comparison', [
        entry('Literature', 'Narrative, Drama and Poetry', 'B8/JHS2.5.1.1 Demonstrate understanding of literary elements.', 'B8/JHS2.5.1.1.1 Analyse the types of characters in texts.', 'Round and static characters', resources.literature),
        entry('Reading', 'Comprehension', 'Read, comprehend and analyse varied texts.', 'Compare characters across texts using evidence.', 'Character comparison reading', resources.reading),
        entry('Writing', 'Text Response', 'Write organised responses to texts using support.', 'Write character comparison paragraphs.', 'Writing about character types', resources.writing),
      ]),
      week(7, 'Dialogue, monologue and performance writing', [
        entry('Literature', 'Narrative, Drama and Poetry', 'Demonstrate understanding of literary elements.', 'B8/JHS2.5.1.1.3 Examine how monologues and dialogues are used to convey characters.', 'Dialogues and monologues in narrative and drama', resources.literature),
        entry('Writing', 'Text Types and Purposes', 'Create dialogues among multiple interlocutors.', 'Write and punctuate dialogues effectively.', 'Dialogue scripting', resources.writing),
        entry('Oral Language', 'Presentation', 'Use spoken language to perform prepared texts.', 'Perform monologues and dialogues with expression.', 'Dialogue and monologue performance', resources.oral),
      ]),
      week(8, 'Literary devices and style', [
        entry('Literature', 'Narrative, Drama and Poetry', 'Demonstrate understanding of literary devices in texts.', 'B8/JHS2.5.1.1.4 Use literary devices such as euphemism, hyperbole and onomatopoeia.', 'Literary devices and style', resources.literature),
        entry('Grammar Usage', 'Vocabulary/Aesthetic language', 'Use figurative and expressive language appropriately.', 'Apply expressive devices in speech and writing.', 'Expressive language choices', resources.grammar),
        entry('Writing', 'Creative Writing', 'Craft short creative pieces using style and effect.', 'Write short creative texts using literary devices.', 'Creative style practice', resources.writing),
      ]),
      week(9, 'Sequence of events in media and narratives', [
        entry('Literature', 'Narrative, Drama and Poetry', 'Demonstrate understanding of sequence and structure in literary texts.', 'B8/JHS2.5.1.1.5 Analyse the sequence of events in film/media, narratives and play scripts.', 'Sequencing events in stories and media', resources.literature),
        entry('Reading', 'Comprehension', 'Analyse texts for structure and meaning.', 'Track sequence and transitions in multi-part texts.', 'Event mapping in reading', resources.reading),
        entry('Writing', 'Narrative Writing', 'Compose coherent event sequences in writing.', 'Write sequenced narratives and reports.', 'Sequenced narrative writing', resources.writing),
      ]),
      week(10, 'Transport, health and report writing', [
        entry('Reading', 'Comprehension', 'Read and analyse informational texts on real-life themes.', 'Interpret transport and health texts critically.', 'Reading around transport and health', resources.reading),
        entry('Writing', 'Text Types and Purposes', 'Apply writing skills to real-life communication.', 'Write short reports and informational pieces.', 'Informational and report writing', resources.writing),
        entry('Oral Language', 'Discussion', 'Discuss practical issues using appropriate register.', 'Group discussion on public issues and solutions.', 'Discussion on transport and health issues', resources.oral),
      ]),
      week(11, 'Independent reading and article development', [
        entry('Reading', 'Independent Reading', 'Build reading confidence and enjoyment across varied texts.', 'Read independently on selected thematic texts.', 'Independent thematic reading', resources.reading),
        entry('Writing', 'Text Types and Purposes', 'Write articles for publication using planning and drafting.', 'Develop and revise article drafts for school publication.', 'Article drafting and revision', resources.writing),
        entry('Grammar Usage', 'Grammar/Vocabulary', 'Use editing strategies to improve clarity and correctness.', 'Edit drafts for sentence control and word choice.', 'Revision and editing workshop', resources.grammar),
      ]),
      week(12, 'Integrated publishing and presentation week', [
        entry('Writing', 'Integrated Writing Task', 'Apply writing skills to a polished final task.', 'Publish an article, flyer, brochure, speech or report.', 'Publishing and presentation task', resources.writing),
        entry('Oral Language', 'Presentation', 'Present ideas clearly to audience.', 'Deliver speech or explain published work confidently.', 'Final oral presentation', resources.oral),
        entry('Literature/Reading', 'Response and Appreciation', 'Use reading and literary appreciation to support final work.', 'Refer to texts and literary examples when presenting.', 'Reading-supported final showcase', [...resources.reading, ...resources.literature]),
      ]),
    ],
  },
  {
    subject: 'English Language',
    classLevel: 'B8',
    term: 'Term 3',
    title: 'B8 English Language Scheme of Work - Term 3',
    weeks: [
      week(1, 'Social issues and oral argument', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'Use oral language to discuss issues appropriately.', 'Debate and discuss social issues with suitable turn taking and register.', 'Oral argument on social issues', resources.oral),
        entry('Reading', 'Comprehension', 'Read and analyse texts on current issues.', 'Identify viewpoints and evidence in social issue texts.', 'Reading on social issues and current affairs', resources.reading),
        entry('Writing', 'Text Response', 'Write organised responses using textual evidence.', 'Compose argumentative paragraphs on social issues.', 'Written response to social issues', resources.writing),
      ]),
      week(2, 'Agriculture and informative explanation', [
        entry('Reading', 'Comprehension', 'Analyse informational texts using contextual clues and evidence.', 'Interpret agriculture and environment texts.', 'Reading agriculture and environment passages', resources.reading),
        entry('Writing', 'Building and Presenting Knowledge', 'Research to build and present knowledge.', 'Support ideas in writing with information from text and non-text sources.', 'Research-supported explanation writing', resources.writing),
        entry('Grammar Usage', 'Vocabulary', 'Use subject-specific vocabulary in context.', 'Apply agriculture and environment vocabulary accurately.', 'Domain vocabulary in context', resources.grammar),
      ]),
      week(3, 'Speech writing and persuasive appeals', [
        entry('Writing', 'Text Types and Purposes', 'Compose speeches for different purposes and occasions.', 'Write speeches with logical and emotional appeals.', 'Speech writing and rhetorical structure', resources.writing),
        entry('Oral Language', 'Presentation', 'Use oral techniques to deliver structured messages.', 'Rehearse and present persuasive speeches.', 'Speech presentation', resources.oral),
        entry('Reading', 'Comprehension', 'Analyse persuasive models for structure and effect.', 'Identify audience appeal in speech models.', 'Reading speeches and persuasive texts', resources.reading),
      ]),
      week(4, 'Research and non-text sources', [
        entry('Writing', 'Building and Presenting Knowledge', 'Research to build and present knowledge.', 'B8/JHS2.4.3.1.1 Use information from figures, tables, graphs and maps to support ideas in writing.', 'Research using graphs, figures and maps', resources.writing),
        entry('Reading', 'Comprehension', 'Interpret non-textual elements and support ideas with evidence.', 'Analyse figures, tables and maps.', 'Reading graphical and visual data', resources.reading),
        entry('Oral Language', 'Discussion/Presentation', 'Present findings using clear spoken language.', 'Explain graphical findings orally.', 'Presenting research findings', resources.oral),
      ]),
      week(5, 'Poetry and creative performance', [
        entry('Literature', 'Narrative, Drama and Poetry', 'Demonstrate understanding of literary genres and their elements.', 'Revisit poem types and performance techniques.', 'Poetry interpretation and performance', resources.literature),
        entry('Writing', 'Creative Writing', 'Compose original creative texts for audience and effect.', 'Write and refine short poems or reflective pieces.', 'Creative poetry writing', resources.writing),
        entry('Oral Language', 'Presentation', 'Perform oral texts with confidence and expression.', 'Recite and perform original poems.', 'Poetry performance showcase', resources.oral),
      ]),
      week(6, 'Media and technology communication', [
        entry('Reading', 'Comprehension', 'Read and analyse media and technology texts.', 'Interpret purpose, audience and message in media texts.', 'Reading on communication and technology', [...resources.reading, ...resources.media]),
        entry('Writing', 'Text Types and Purposes', 'Create short practical and media texts for audience.', 'Write emails, notices or short media messages.', 'Technology-supported communication writing', resources.writing),
        entry('Grammar Usage', 'Vocabulary/Style', 'Use communication and media vocabulary effectively.', 'Apply media and digital vocabulary in context.', 'Media vocabulary and style', resources.grammar),
      ]),
      week(7, 'Comparative reading and thematic synthesis', [
        entry('Reading', 'Comprehension', 'Compare text meaning, viewpoints and themes.', 'Compare ideas across more than one text.', 'Comparative reading and synthesis', resources.reading),
        entry('Writing', 'Text Response', 'Write integrated responses that combine evidence from multiple texts.', 'Compose synthesis paragraphs and notes.', 'Synthesis writing', resources.writing),
        entry('Oral Language', 'Discussion', 'Discuss text comparisons and defend viewpoints.', 'Panel-style comparison discussion', 'Panel-style comparison discussion', resources.oral),
      ]),
      week(8, 'Narratives, dialogues and publication', [
        entry('Writing', 'Text Types and Purposes', 'Create dialogues and articles for publication.', 'Write a dialogue-based article or short narrative with dialogue.', 'Dialogue-rich publication writing', resources.writing),
        entry('Literature', 'Narrative, Drama and Poetry', 'Use literary elements to enrich writing.', 'Incorporate character and dialogue effectively.', 'Narrative craft and dialogue', resources.literature),
        entry('Grammar Usage', 'Punctuation', 'Use dialogue punctuation and capitals correctly.', 'Edit punctuation in dialogue writing.', 'Dialogue punctuation workshop', resources.grammar),
      ]),
      week(9, 'Environmental and health campaign writing', [
        entry('Writing', 'Text Types and Purposes', 'Apply writing skills to campaign and awareness tasks.', 'Create posters, flyers and short campaign texts.', 'Campaign writing on environment and health', resources.writing),
        entry('Reading', 'Comprehension', 'Read campaign texts critically for audience and effectiveness.', 'Analyse awareness texts and visual choices.', 'Reading campaign materials', resources.reading),
        entry('Oral Language', 'Presentation', 'Present campaigns orally with confidence.', 'Short oral advocacy presentations', 'Short oral advocacy presentations', resources.oral),
      ]),
      week(10, 'Independent reading and literary appreciation', [
        entry('Reading', 'Independent Reading', 'Sustain independent reading across themes.', 'Read self-selected texts and log insights.', 'Independent reading journal', resources.reading),
        entry('Literature', 'Narrative, Drama and Poetry', 'Connect literary appreciation to wider reading.', 'Respond to favourite texts with reflection.', 'Literary response journal', resources.literature),
        entry('Writing', 'Reflection Writing', 'Write reflections and reviews on texts read.', 'Reader response writing', 'Reader response writing', resources.writing),
      ]),
      week(11, 'Revision, editing and portfolio assembly', [
        entry('Writing', 'Production and Distribution of Writing', 'Develop, revise and present coherent writing.', 'Revise and edit a portfolio of English writing.', 'Portfolio editing and assembly', resources.writing),
        entry('Grammar Usage', 'Grammar/Punctuation/Vocabulary', 'Use editing strategies across multiple drafts.', 'Correct grammar, vocabulary and punctuation issues in portfolio work.', 'Editing workshop', resources.grammar),
        entry('Oral Language', 'Conference', 'Use speaking skills in feedback conferences.', 'Peer feedback and conferencing', 'Peer feedback and conferencing', resources.oral),
      ]),
      week(12, 'Integrated B8 English showcase', [
        entry('Writing', 'Integrated Final Task', 'Apply B8 writing skills to a polished final piece.', 'Publish a final article, speech, flyer, brochure or research response.', 'Final integrated B8 writing task', resources.writing),
        entry('Oral Language', 'Presentation', 'Use oral confidence and appropriate register in final presentation.', 'Present final work effectively.', 'Final presentation and defence', resources.oral),
        entry('Reading/Literature', 'Response and Appreciation', 'Use reading and literary understanding to enrich final work.', 'Reference reading and literature in explanation of final product.', 'Integrated reading/literature support', [...resources.reading, ...resources.literature]),
      ]),
    ],
  },
];

export const englishB9Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'English Language',
    classLevel: 'B9',
    term: 'Term 1',
    title: 'B9 English Language Scheme of Work - Term 1',
    weeks: [
      week(1, 'Register, slang and purposeful conversation', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'B9/JHS3.1.1.1 Demonstrate the use of appropriate language orally in specific situations.', 'B9/JHS3.1.1.1.1 Use appropriate register in everyday communication with diverse partners.', 'Formal and informal register, slang and jargon', resources.oral),
        entry('Reading', 'Comprehension', 'B9/JHS3.2.1.1 Demonstrate increasing confidence and enjoyment in independent reading.', 'Read a variety of texts and identify viewpoint and audience.', 'Reading texts for register and audience awareness', resources.reading),
        entry('Writing', 'Production and Distribution of Writing', 'B9/JHS3.4.1.1 Develop, organise and express ideas coherently and cohesively in writing.', 'Write short pieces that shift register for audience and purpose.', 'Register-sensitive writing', resources.writing),
      ]),
      week(2, 'Open-ended discussion on national and global issues', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'B9/JHS3.1.1.1 Demonstrate the use of appropriate language orally in specific situations.', 'B9/JHS3.1.1.1.2-1.3 Ask questions that link speakers’ ideas and discuss national/global issues.', 'Discussion of national and global issues', resources.oral),
        entry('Reading', 'Comprehension', 'B9/JHS3.2.1.1 Demonstrate increasing confidence and enjoyment in independent reading.', 'Reflect on how reading impacts self and others see the world.', 'Reading texts on governance, media and social values', resources.reading),
        entry('Writing', 'Text Response', 'Compose organised viewpoints using support.', 'Write discussion responses using reasons and examples.', 'Issue-based response writing', resources.writing),
      ]),
      week(3, 'Argument and debate techniques', [
        entry('Oral Language', 'Conversation/Everyday Discourse', 'B9/JHS3.1.1.1 Demonstrate the use of appropriate language orally in specific situations.', 'B9/JHS3.1.1.1.4 Demonstrate appropriate turn taking and use techniques for effective argument (debating).', 'Argument, debate and rebuttal', resources.oral),
        entry('Reading', 'Comprehension', 'Read a variety of texts and analyse how ideas are supported.', 'Evaluate arguments and evidence in texts.', 'Reading arguments and identifying support', resources.reading),
        entry('Writing', 'Persuasive Writing', 'Use writing to defend a clear position.', 'Draft short argumentative paragraphs.', 'Argument paragraph writing', resources.writing),
      ]),
      week(4, 'Audio-visual listening and media response', [
        entry('Oral Language', 'Listening Comprehension', 'B9/JHS3.1.2.1 Demonstrate the ability to listen to extended texts and identify key information.', 'B9/JHS3.1.2.1.1-1.2 Listen to audio-visual texts and participate in collaborative discussions.', 'Audio-visual listening and response', [...resources.oral, ...resources.media]),
        entry('Reading', 'Comprehension', 'B9/JHS3.2.1.1 Demonstrate increasing confidence and enjoyment in independent reading.', 'Evaluate the ways media helps to disseminate information.', 'Media reading and critique', [...resources.reading, ...resources.media]),
        entry('Writing', 'Building and Presenting Knowledge', 'Research to build and present knowledge.', 'Record information from audio-visual and print sources.', 'Media note-taking and response writing', resources.writing),
      ]),
      week(5, 'Advanced sound work and oral fluency', [
        entry('Oral Language', 'English Sounds', 'B9/JHS3.1.3.1 Articulate English speech sounds to develop confidence and skills in listening and speaking.', 'B9/JHS3.1.3.1.1-1.3 Produce /r/ and /l/, consonant clusters and correct word stress in speech.', 'Advanced pronunciation and stress patterns', resources.oral),
        entry('Reading', 'Comprehension', 'Use texts to support sound and fluency practice.', 'Read aloud for clarity, stress and connected meaning.', 'Oral fluency through reading', resources.reading),
        entry('Writing', 'Production and Distribution of Writing', 'Develop coherent writing that supports oral communication.', 'Prepare annotated reading and speech scripts.', 'Preparing oral scripts', resources.writing),
      ]),
      week(6, 'Comparing viewpoints and expanding perspectives', [
        entry('Reading', 'Comprehension', 'B9/JHS3.2.1.1 Demonstrate increasing confidence and enjoyment in independent reading.', 'B9/JHS3.2.1.1.2-1.4 Reflect on reading, evaluate media and expand perspectives from texts.', 'Comparing viewpoints and perspectives', resources.reading),
        entry('Oral Language', 'Discussion', 'Discuss and defend interpretations clearly and persuasively.', 'Seminar discussion on contrasting viewpoints', 'Seminar discussion on contrasting viewpoints', resources.oral),
        entry('Writing', 'Analytical Response', 'Write organised analytical responses to texts.', 'Writing viewpoint comparison responses', 'Writing viewpoint comparison responses', resources.writing),
      ]),
      week(7, 'Timed reading, prediction and generalisation', [
        entry('Reading', 'Comprehension', 'B9/JHS3.2.1.2 Read, comprehend and analyse varieties of texts.', 'B9/JHS3.2.1.2.1-2.3 Read for specific information, predict, identify patterns and make generalisations.', 'Timed reading and pattern analysis', resources.reading),
        entry('Writing', 'Summary and Notes', 'Produce concise written records of reading.', 'Write predictions, summaries and generalisations clearly.', 'Summary and note-making from timed reading', resources.writing),
        entry('Grammar Usage', 'Vocabulary', 'Use academic and technical vocabulary in context.', 'Apply new reading vocabulary in written responses.', 'Vocabulary from academic reading', resources.grammar),
      ]),
      week(8, 'Comparative text analysis', [
        entry('Reading', 'Comprehension', 'B9/JHS3.2.1.2 Read, comprehend and analyse varieties of texts.', 'B9/JHS3.2.1.2.4-2.5 Compare language, style, structure and purpose across texts and answer complex questions.', 'Comparative analysis of narrative, expository and procedural texts', resources.reading),
        entry('Writing', 'Analytical Writing', 'Develop coherent multi-text analytical responses.', 'Write comparative paragraphs using evidence.', 'Comparative analytical writing', resources.writing),
        entry('Oral Language', 'Discussion', 'Discuss similarities and differences in texts with support.', 'Oral comparison of text choices', 'Oral comparison of text choices', resources.oral),
      ]),
      week(9, 'Imagery, figurative meaning and effect on reader', [
        entry('Reading', 'Comprehension', 'B9/JHS3.2.1.2 Read, comprehend and analyse varieties of texts.', 'B9/JHS3.2.1.2.6-2.7 Show the effect of a text on the reader and interpret figurative, symbolic and sensory words/phrases.', 'Imagery and reader response', resources.reading),
        entry('Literature', 'Narrative, Drama and Poetry', 'Analyse literary devices and thematic effect.', 'Use imagery and symbolism to deepen meaning.', 'Literary imagery and effect', resources.literature),
        entry('Writing', 'Creative/Analytical Writing', 'Use imagery purposefully in original writing.', 'Write short reflective or descriptive passages using imagery.', 'Imagery in writing', resources.writing),
      ]),
      week(10, 'Academic and technical vocabulary', [
        entry('Reading', 'Comprehension', 'B9/JHS3.2.1.2 Read, comprehend and analyse varieties of texts.', 'B9/JHS3.2.1.2.8-2.9 Demonstrate understanding of academic, domain-specific and technical vocabulary and analyse nuances of words.', 'Academic and technical vocabulary in context', resources.reading),
        entry('Grammar Usage', 'Vocabulary', 'Demonstrate appropriate use of vocabulary and spelling conventions in communication.', 'Interpret vocabulary appropriately in more complex texts.', 'Precision and nuance in word choice', resources.grammar),
        entry('Writing', 'Academic Response', 'Use academic vocabulary in coherent paragraphs.', 'Write with precise topic vocabulary.', 'Academic vocabulary in writing', resources.writing),
      ]),
      week(11, 'Objective summary and evidence', [
        entry('Reading', 'Summarising', 'B9/JHS3.2.2.1 Cite the textual evidence that supports an analysis of what the text says and provide an objective summary.', 'B9/JHS3.2.2.1.1 Analyse critically a given text in its entirety and provide an objective summary.', 'Critical reading and objective summary', resources.reading),
        entry('Writing', 'Summary Writing', 'Write objective summaries that preserve central ideas.', 'Produce summary responses from complex texts.', 'Objective summary writing', resources.writing),
        entry('Oral Language', 'Discussion', 'Explain central ideas and evidence orally.', 'Oral explanation of main and supporting ideas', 'Oral explanation of main and supporting ideas', resources.oral),
      ]),
      week(12, 'Integrated reading and issue response portfolio', [
        entry('Reading', 'Independent Reading', 'Sustain independent reading and analysis.', 'Curate reading evidence from selected texts.', 'Independent reading portfolio', resources.reading),
        entry('Writing', 'Integrated Analytical Task', 'Produce a polished analytical or argumentative response.', 'Compile and revise issue-based analytical writing.', 'Portfolio of analytical writing', resources.writing),
        entry('Oral Language', 'Presentation', 'Present ideas with confidence and clarity.', 'Present a reading-based issue response to peers.', 'Issue-response presentation', resources.oral),
      ]),
    ],
  },
  {
    subject: 'English Language',
    classLevel: 'B9',
    term: 'Term 2',
    title: 'B9 English Language Scheme of Work - Term 2',
    weeks: [
      week(1, 'Noun phrases and sentence functions', [
        entry('Grammar Usage', 'Grammar', 'B9/JHS3.3.1.1 Apply the knowledge of phrases and clauses and their functions in communication.', 'B9/JHS3.3.1.1.1 Use noun phrases accurately in context.', 'Noun phrases and sentence functions', resources.grammar),
        entry('Reading', 'Comprehension', 'Read and analyse texts for structure and meaning.', 'Identify noun phrase use in model texts.', 'Analysing phrase use in texts', resources.reading),
        entry('Writing', 'Production and Distribution of Writing', 'Develop organised and coherent writing.', 'Use noun phrases effectively in descriptive and explanatory sentences.', 'Sentence expansion with noun phrases', resources.writing),
      ]),
      week(2, 'Adjective order and phrasal verbs', [
        entry('Grammar Usage', 'Grammar', 'B9/JHS3.3.1.1 Apply the knowledge of phrases and clauses and their functions in communication.', 'B9/JHS3.3.1.1.2-1.3 Demonstrate command using multiple adjectives in correct order and more complex phrasal verbs.', 'Adjective order and phrasal verbs', resources.grammar),
        entry('Writing', 'Production and Distribution of Writing', 'Develop coherent and detailed written expression.', 'Use vivid modifiers and phrasal verbs in paragraphs.', 'Enhancing style through modifiers and phrasal verbs', resources.writing),
        entry('Oral Language', 'Conversation', 'Use complex vocabulary and phrases in speech.', 'Apply phrasal verbs naturally in discussion.', 'Phrasal verbs in spoken interaction', resources.oral),
      ]),
      week(3, 'Adverbial phrases and conditionals', [
        entry('Grammar Usage', 'Grammar', 'B9/JHS3.3.1.1-3.1.2 Apply phrase knowledge and conditional tenses in communication.', 'B9/JHS3.3.1.1.4 and B9/JHS3.3.1.2.1 Use adverbial phrases and type 3 conditional sentences.', 'Adverbial phrases and conditional structures', resources.grammar),
        entry('Writing', 'Production and Distribution of Writing', 'Develop organised and nuanced sentences and paragraphs.', 'Write sentences and short paragraphs using adverbial phrases and conditionals.', 'Sentence variety with adverbials and conditionals', resources.writing),
        entry('Reading', 'Comprehension', 'Notice grammatical choices in complex texts.', 'Identify how conditionals and adverbials shape meaning.', 'Grammar in context through reading', resources.reading),
      ]),
      week(4, 'Relative clauses, subject and predicate', [
        entry('Grammar Usage', 'Grammar', 'B9/JHS3.3.1.2-3.1.3 Apply clause knowledge and sentence structure in communication.', 'B9/JHS3.3.1.2.2 and B9/JHS3.3.1.3.1 Use defining/non-defining relative clauses and identify subject and predicate.', 'Relative clauses, subject and predicate', resources.grammar),
        entry('Writing', 'Production and Distribution of Writing', 'Construct complete and varied sentences.', 'Expand sentences with relative clauses.', 'Sentence combining and expansion', resources.writing),
        entry('Reading', 'Comprehension', 'Use model texts to identify sentence structures.', 'Analyse sentence structure in authentic texts.', 'Sentence structure in reading', resources.reading),
      ]),
      week(5, 'Voice, reported speech and punctuation', [
        entry('Grammar Usage', 'Grammar/Punctuation', 'B9/JHS3.3.1.4 and B9/JHS3.3.2.1 Demonstrate mastery of active/passive voice, reported speech, punctuation and capitalisation.', 'Use passive forms, reported speech, dash, hyphen and bracket appropriately.', 'Voice, reported speech and advanced punctuation', resources.grammar),
        entry('Writing', 'Editing and Revision', 'Improve writing through effective editing.', 'Edit news-style and formal texts using accurate punctuation.', 'Editing for advanced punctuation and reported speech', resources.writing),
        entry('Reading', 'Comprehension', 'Read complex texts and identify stylistic features.', 'Notice punctuation choices and voice changes in model texts.', 'Punctuation and voice in model texts', resources.reading),
      ]),
      week(6, 'Logical paragraphs and cohesion', [
        entry('Writing', 'Production and Distribution of Writing', 'B9/JHS3.4.1.1 Develop, organise and express ideas coherently and cohesively in writing.', 'B9/JHS3.4.1.1.1-1.2 Compose logically connected paragraphs and develop paragraphs using supporting details.', 'Paragraph cohesion, unity and completeness', resources.writing),
        entry('Grammar Usage', 'Grammar', 'Apply connectors, clauses and phrase structures to writing.', 'Use cohesive devices and supporting structures effectively.', 'Cohesive devices in paragraph writing', resources.grammar),
        entry('Reading', 'Comprehension', 'Analyse paragraph organisation in model texts.', 'Identify transitions and support in strong paragraphs.', 'Reading as a model for paragraph structure', resources.reading),
      ]),
      week(7, 'Complex paragraphs and connectors', [
        entry('Writing', 'Production and Distribution of Writing', 'B9/JHS3.4.1.2 Create different paragraphs on given topics.', 'B9/JHS3.4.1.2.1 Compose more complex paragraphs using appropriate strategies.', 'Mixed and periodic paragraphs, logical connectors', resources.writing),
        entry('Reading', 'Comprehension', 'Read model paragraphs for style and purpose.', 'Identify how connectors shape coherence and emphasis.', 'Model paragraph analysis', resources.reading),
        entry('Oral Language', 'Discussion', 'Explain paragraph choices and organisation orally.', 'Talk through planning and structure decisions.', 'Oral reasoning about writing choices', resources.oral),
      ]),
      week(8, 'Descriptive and narrative essays', [
        entry('Writing', 'Text Types and Purposes', 'B9/JHS3.4.2.1 Use process approach to compose descriptive, narrative/imaginative, informational and persuasive/argumentative texts.', 'B9/JHS3.4.2.1.1-1.2 Create effective descriptive sentences and use narrative techniques to manipulate time in a story.', 'Descriptive and narrative essays', resources.writing),
        entry('Literature', 'Narrative, Drama and Poetry', 'Use literary craft to support writing choices.', 'Study narrative techniques, mood and imagery.', 'Narrative craft and literary technique', resources.literature),
        entry('Reading', 'Comprehension', 'Read narrative and descriptive models critically.', 'Identify backstory, flashback and descriptive detail.', 'Reading narrative models', resources.reading),
      ]),
      week(9, 'Argumentative and informative writing', [
        entry('Writing', 'Text Types and Purposes', 'B9/JHS3.4.2.1 Use process approach to compose persuasive and informative texts.', 'B9/JHS3.4.2.1.3-1.4 Write persuasive and informative/explanatory texts.', 'Argumentative and informative writing', resources.writing),
        entry('Reading', 'Comprehension', 'Analyse persuasive and explanatory texts.', 'Identify evidence, stance and objective explanation.', 'Reading persuasive and explanatory texts', resources.reading),
        entry('Oral Language', 'Debate/Discussion', 'Use oral argument to test and refine positions.', 'Defend positions and explain processes orally.', 'Debate and explanation in speech', resources.oral),
      ]),
      week(10, 'Formal writing, minutes and agendas', [
        entry('Writing', 'Text Types and Purposes', 'B9/JHS3.4.2.2 Apply writing skills to specific life situations using appropriate format.', 'B9/JHS3.4.2.2.1 Compose formal writing such as business letters, email, minutes, programme agenda and reports.', 'Formal writing, minutes and agendas', resources.writing),
        entry('Reading', 'Comprehension', 'Read model practical texts for organisation and tone.', 'Identify headings, sequencing and formal tone.', 'Model analysis of practical texts', resources.reading),
        entry('Grammar Usage', 'Formal Register', 'Use formal language and avoid inappropriate short forms.', 'Edit practical documents for correctness and professionalism.', 'Formal register editing', resources.grammar),
      ]),
      week(11, 'Short texts, articles and speeches for publication', [
        entry('Writing', 'Text Types and Purposes', 'B9/JHS3.4.2.2 Apply writing skills to specific life situations using appropriate format.', 'B9/JHS3.4.2.2.2-2.4 Compose short texts, articles and speeches for different purposes and audiences.', 'Flyers, invitations, emails, articles and speeches', resources.writing),
        entry('Oral Language', 'Presentation', 'Use oral techniques and inclusive language in speeches.', 'Present speech drafts and receive feedback.', 'Speech delivery and oral refinement', resources.oral),
        entry('Reading', 'Comprehension', 'Analyse published articles and speeches for effect.', 'Identify rhetorical and organisational techniques.', 'Reading articles and speeches as models', resources.reading),
      ]),
      week(12, 'Research project design and source handling', [
        entry('Writing', 'Building and Presenting Knowledge', 'B9/JHS3.4.3.1 Research to build and present knowledge.', 'B9/JHS3.4.3.1.1 Conduct short research projects based on focused questions and present key findings in writing.', 'Research question design and source recording', resources.writing),
        entry('Reading', 'Comprehension/Research', 'Use sources critically and select evidence.', 'Read source material to support focused inquiry.', 'Reading for research', resources.reading),
        entry('Oral Language', 'Conference/Presentation', 'Explain research intentions and findings clearly.', 'Present research plans and feedback to peers.', 'Research conference and proposal presentation', resources.oral),
      ]),
    ],
  },
  {
    subject: 'English Language',
    classLevel: 'B9',
    term: 'Term 3',
    title: 'B9 English Language Scheme of Work - Term 3',
    weeks: [
      week(1, 'Research findings and academic presentation', [
        entry('Writing', 'Building and Presenting Knowledge', 'B9/JHS3.4.3.1 Research to build and present knowledge.', 'Present key findings from short research projects in writing.', 'Drafting and presenting research findings', resources.writing),
        entry('Oral Language', 'Presentation', 'Use formal and persuasive presentation skills.', 'Present research findings clearly and persuasively.', 'Research presentation', resources.oral),
        entry('Reading', 'Research Reading', 'Use research sources critically and accurately.', 'Review and refine evidence gathered from texts.', 'Reviewing research sources', resources.reading),
      ]),
      week(2, 'Characters and dialogue in media and drama', [
        entry('Literature', 'Narrative, Drama and Poetry', 'B9/JHS3.5.1.1 Demonstrate understanding of how various elements of literary genres contribute to meaning.', 'B9/JHS3.5.1.1.1-1.2 Analyse the use of language to convey characters and create monologues/dialogues in play scripts.', 'Characters, monologues and dialogues', resources.literature),
        entry('Writing', 'Creative Writing', 'Compose original dramatic and narrative pieces.', 'Write monologues and dialogues using correct punctuation.', 'Dialogue and monologue creation', resources.writing),
        entry('Oral Language', 'Performance', 'Perform dramatic speech with expression and clarity.', 'Act monologues and dialogue scenes.', 'Dramatic oral performance', resources.oral),
      ]),
      week(3, 'Sequence of events across texts', [
        entry('Literature', 'Narrative, Drama and Poetry', 'B9/JHS3.5.1.1 Demonstrate understanding of how various elements of literary genres contribute to meaning.', 'B9/JHS3.5.1.1.3 Analyse the sequence of events across texts.', 'Sequencing in media, narrative and drama', resources.literature),
        entry('Reading', 'Comparative Reading', 'Compare texts for structure and event development.', 'Track sequence, transition and event patterning.', 'Comparative event analysis', resources.reading),
        entry('Writing', 'Narrative/Analytical Writing', 'Write about sequence and craft coherent event structures.', 'Create event maps and sequenced responses.', 'Sequenced writing and analysis', resources.writing),
      ]),
      week(4, 'Imagery and figurative expression in speech and writing', [
        entry('Literature', 'Narrative, Drama and Poetry', 'Demonstrate understanding of literary devices and effect.', 'B9/JHS3.5.1.1.4 Use literary devices (imagery) in texts.', 'Imagery, simile, metaphor and idiomatic expression', resources.literature),
        entry('Writing', 'Creative Writing', 'Use figurative language for effect in original writing.', 'Compose creative pieces using imagery deliberately.', 'Crafting imagery in original writing', resources.writing),
        entry('Oral Language', 'Presentation', 'Use expressive spoken language to communicate vividly.', 'Read and present imagery-rich passages aloud.', 'Expressive oral reading', resources.oral),
      ]),
      week(5, 'Themes, values and adaptation', [
        entry('Literature', 'Narrative, Drama and Poetry', 'Demonstrate understanding of thematic meaning in texts.', 'B9/JHS3.5.1.1.5 Analyse common themes in texts and adapt narratives around given themes.', 'Themes and adaptation', resources.literature),
        entry('Reading', 'Comparative Reading', 'Identify themes in texts and connect them to context.', 'Read on social, moral and cultural values and identify common themes.', 'Thematic reading on values and media', resources.reading),
        entry('Writing', 'Creative/Analytical Writing', 'Write adapted narratives or thematic responses.', 'Compose stories or reflections around selected themes.', 'Theme-based adaptation writing', resources.writing),
      ]),
      week(6, 'Media, society and article publication', [
        entry('Reading', 'Comprehension', 'Analyse media texts and public discourse critically.', 'Interpret media texts on governance, social values and entertainment.', 'Media and society reading', [...resources.reading, ...resources.media]),
        entry('Writing', 'Text Types and Purposes', 'Write for publication using audience awareness and clear argument.', 'Produce articles, letters to the editor or short reports.', 'Publication writing on current issues', resources.writing),
        entry('Oral Language', 'Discussion/Debate', 'Discuss and argue viewpoints on public issues.', 'Panel discussion on media and public values', 'Panel discussion on media and public values', resources.oral),
      ]),
      week(7, 'Environmental and civic communication', [
        entry('Reading', 'Comprehension', 'Read texts on civic and environmental issues critically.', 'Analyse texts on climate change, sanitation and rights/responsibilities.', 'Environmental and civic reading', resources.reading),
        entry('Writing', 'Persuasive/Informative Writing', 'Write effective awareness and civic texts.', 'Compose persuasive pieces, speeches or reports on civic issues.', 'Civic and environmental writing', resources.writing),
        entry('Oral Language', 'Presentation', 'Use persuasive oral language for advocacy.', 'Deliver short advocacy speeches.', 'Civic advocacy presentation', resources.oral),
      ]),
      week(8, 'Portfolio research and reference handling', [
        entry('Writing', 'Building and Presenting Knowledge', 'Research to build and present knowledge.', 'Refine source use, referencing and organisation of findings.', 'Source handling and referencing', resources.writing),
        entry('Reading', 'Research Reading', 'Read and select credible sources.', 'Evaluate source usefulness and credibility.', 'Evaluating research sources', resources.reading),
        entry('Grammar Usage', 'Academic Vocabulary', 'Use domain-specific and academic vocabulary appropriately.', 'Apply accurate academic vocabulary in project writing.', 'Academic vocabulary in project work', resources.grammar),
      ]),
      week(9, 'Independent reading and literary response', [
        entry('Reading', 'Independent Reading', 'Sustain independent reading and analysis across complex texts.', 'Select and respond to personal reading.', 'Independent reading portfolio', resources.reading),
        entry('Literature', 'Response and Appreciation', 'Connect literary understanding to personal reading.', 'Write literary responses and theme reflections.', 'Literary response journal', resources.literature),
        entry('Writing', 'Reflective Writing', 'Write sustained reflective responses on reading.', 'Compose review and reflection entries.', 'Independent reading reflection', resources.writing),
      ]),
      week(10, 'Revision of advanced grammar in authentic writing', [
        entry('Grammar Usage', 'Integrated Grammar Revision', 'Apply advanced grammar choices accurately in communication.', 'Revise phrases, clauses, voice, punctuation and vocabulary in authentic writing.', 'Integrated grammar revision in context', resources.grammar),
        entry('Writing', 'Editing and Revision', 'Improve substantial writing through revision.', 'Edit essays, speeches and reports for precision and coherence.', 'Advanced editing workshop', resources.writing),
        entry('Reading', 'Model Analysis', 'Read final models as support for revision.', 'Notice high-level structure and language choices.', 'Model analysis for revision', resources.reading),
      ]),
      week(11, 'Exam-style synthesis and response writing', [
        entry('Reading', 'Comprehension/Summary', 'Analyse, compare and summarise complex texts.', 'Work with multiple texts and summarise critically.', 'Exam-style synthesis and summary', resources.reading),
        entry('Writing', 'Analytical and Summary Writing', 'Produce concise and well-supported responses.', 'Write synthesis paragraphs, summaries and issue responses.', 'Timed analytical writing', resources.writing),
        entry('Oral Language', 'Reasoned Explanation', 'Explain choices and reasoning clearly.', 'Talk through evidence selection and argument choices.', 'Reasoning aloud and peer feedback', resources.oral),
      ]),
      week(12, 'Final integrated English project and presentation', [
        entry('Writing', 'Integrated Final Task', 'Apply B9 English skills in a polished final task.', 'Produce a final publication, research piece, speech or creative response.', 'Final integrated B9 English task', resources.writing),
        entry('Oral Language', 'Presentation', 'Use mature oral communication in final defence and presentation.', 'Present final work persuasively and confidently.', 'Final oral presentation and defence', resources.oral),
        entry('Reading/Literature', 'Response and Appreciation', 'Use reading and literature as support for final tasks.', 'Cite themes, texts and evidence to support final work.', 'Integrated reading/literature support', [...resources.reading, ...resources.literature]),
      ]),
    ],
  },
];
