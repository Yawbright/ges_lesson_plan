import type { ClassLevel } from '@/types/lessonPlan';
import type { SchemeWeek } from '@/types/scheme';
import type { ExplicitCurriculumTerm } from './mathematicsB7';

type TopicTuple = [strand: string, subStrand: string, topic: string];

const resourcesByStrand = {
  'Visual Arts': ['Creative Arts textbook', 'Sketchbook', 'Pencils', 'Colours'],
  'Performing Arts': ['Creative Arts textbook', 'Drums or shakers', 'Open space', 'Costume pieces'],
} as const;

function makeWeek(
  classLevel: ClassLevel,
  week: number,
  strand: TopicTuple[0],
  subStrand: TopicTuple[1],
  topic: TopicTuple[2]
): SchemeWeek {
  const resources = resourcesByStrand[strand as keyof typeof resourcesByStrand] ?? [
    'Creative Arts textbook',
  ];

  return {
    week,
    strand,
    subStrand,
    topic,
    contentStandard: `${classLevel} ${strand}: Demonstrate understanding and skill in ${subStrand.toLowerCase()}.`,
    indicator: `Explore and apply ${topic.toLowerCase()} through observation, making, performance and reflection.`,
    resources: [...resources],
  };
}

function buildTerm(
  classLevel: ClassLevel,
  term: string,
  topics: TopicTuple[]
): ExplicitCurriculumTerm {
  return {
    subject: 'Creative Arts',
    classLevel,
    term,
    title: `${classLevel} Creative Arts Scheme of Work - ${term}`,
    weeks: topics.map((item, index) =>
      makeWeek(classLevel, index + 1, item[0], item[1], item[2])
    ),
  };
}

const b1Term1: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Observing lines, shapes and colours in the environment'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring body movement and sound in the environment'],
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Talking about things we see around us'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring rhythm through clapping and movement'],
  ['Visual Arts', 'Planning, Making and Composing', 'Drawing familiar objects and shapes'],
  ['Performing Arts', 'Planning, Making and Composing', 'Imitating simple actions, gestures and movements'],
  ['Visual Arts', 'Planning, Making and Composing', 'Using colour to fill simple drawings'],
  ['Performing Arts', 'Planning, Making and Composing', 'Creating simple songs and action patterns'],
  ['Visual Arts', 'Displaying and Sharing', 'Showing simple drawings and talking about them'],
  ['Performing Arts', 'Displaying and Sharing', 'Performing short class action songs'],
  ['Visual Arts', 'Appreciating and Appraising', 'Talking about favourite colours, shapes and drawings'],
  ['Performing Arts', 'Appreciating and Appraising', 'Talking about what we enjoyed in songs and movement'],
];

const b1Term2: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Exploring textures, patterns and objects in nature'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring local songs, chants and games'],
  ['Visual Arts', 'Planning, Making and Composing', 'Making pictures with crayons, paper and found materials'],
  ['Performing Arts', 'Planning, Making and Composing', 'Creating simple dramatic play from daily life'],
  ['Visual Arts', 'Planning, Making and Composing', 'Printing and simple pattern making'],
  ['Performing Arts', 'Planning, Making and Composing', 'Using voice, gesture and movement in play'],
  ['Visual Arts', 'Displaying and Sharing', 'Displaying class artworks neatly'],
  ['Performing Arts', 'Displaying and Sharing', 'Sharing short performances with classmates'],
  ['Visual Arts', 'Displaying and Sharing', 'Explaining simple choices in colour and shape'],
  ['Performing Arts', 'Displaying and Sharing', 'Participating in group songs and movement pieces'],
  ['Visual Arts', 'Appreciating and Appraising', 'Looking at and appreciating classmates’ artworks'],
  ['Performing Arts', 'Appreciating and Appraising', 'Responding to simple performances politely'],
];

const b1Term3: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Exploring local symbols, objects and patterns'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring simple cultural movement and rhythm'],
  ['Visual Arts', 'Planning, Making and Composing', 'Making simple artwork from community themes'],
  ['Performing Arts', 'Planning, Making and Composing', 'Creating simple role play from familiar stories'],
  ['Visual Arts', 'Planning, Making and Composing', 'Modeling with simple soft materials'],
  ['Performing Arts', 'Planning, Making and Composing', 'Combining song, movement and words in a short piece'],
  ['Visual Arts', 'Displaying and Sharing', 'Preparing and sharing a mini class exhibition'],
  ['Performing Arts', 'Displaying and Sharing', 'Preparing a short end-of-term performance'],
  ['Visual Arts', 'Appreciating and Appraising', 'Talking about what makes an artwork beautiful or interesting'],
  ['Performing Arts', 'Appreciating and Appraising', 'Talking about feelings and meanings in performance'],
  ['Visual Arts', 'Review', 'Review of B1 visual arts skills and ideas'],
  ['Performing Arts', 'Review', 'Review of B1 performing arts skills and ideas'],
];

const b2Term1: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Observing and describing natural and man-made forms'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring sound, rhythm and movement from the environment'],
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Generating simple ideas from everyday experiences'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Using imagination to create simple movement ideas'],
  ['Visual Arts', 'Planning, Making and Composing', 'Drawing and colouring with increasing control'],
  ['Performing Arts', 'Planning, Making and Composing', 'Using body movement and voice in simple performance'],
  ['Visual Arts', 'Planning, Making and Composing', 'Cutting, folding and assembling simple art forms'],
  ['Performing Arts', 'Planning, Making and Composing', 'Creating simple songs, chants and rhythmic patterns'],
  ['Visual Arts', 'Displaying and Sharing', 'Displaying and discussing visual work'],
  ['Performing Arts', 'Displaying and Sharing', 'Sharing simple performance work with confidence'],
  ['Visual Arts', 'Appreciating and Appraising', 'Recognising effort and simple artistic qualities in work'],
  ['Performing Arts', 'Appreciating and Appraising', 'Recognising effort and expression in performances'],
];

const b2Term2: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Exploring local patterns, symbols and motifs'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring local dances, songs and dramatic expressions'],
  ['Visual Arts', 'Planning, Making and Composing', 'Making pictures and simple crafts from local ideas'],
  ['Performing Arts', 'Planning, Making and Composing', 'Creating role play from home, school and community situations'],
  ['Visual Arts', 'Planning, Making and Composing', 'Using varied materials to make simple designs'],
  ['Performing Arts', 'Planning, Making and Composing', 'Combining movement, music and words'],
  ['Visual Arts', 'Displaying and Sharing', 'Preparing artwork for display with care'],
  ['Performing Arts', 'Displaying and Sharing', 'Performing in pairs or small groups'],
  ['Visual Arts', 'Displaying and Sharing', 'Explaining simple choices in making work'],
  ['Performing Arts', 'Displaying and Sharing', 'Explaining what a performance is about'],
  ['Visual Arts', 'Appreciating and Appraising', 'Responding positively to artworks and designs'],
  ['Performing Arts', 'Appreciating and Appraising', 'Responding positively to performances and movement pieces'],
];

const b2Term3: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Exploring themes from festivals and community life'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring performance ideas from stories and events'],
  ['Visual Arts', 'Planning, Making and Composing', 'Composing simple artworks on community themes'],
  ['Performing Arts', 'Planning, Making and Composing', 'Creating simple dramatic and musical scenes'],
  ['Visual Arts', 'Planning, Making and Composing', 'Making objects or models with simple techniques'],
  ['Performing Arts', 'Planning, Making and Composing', 'Using rhythm and movement to communicate ideas'],
  ['Visual Arts', 'Displaying and Sharing', 'Organising a simple class gallery'],
  ['Performing Arts', 'Displaying and Sharing', 'Organising a short class performance showcase'],
  ['Visual Arts', 'Appreciating and Appraising', 'Talking about strengths in visual artworks'],
  ['Performing Arts', 'Appreciating and Appraising', 'Talking about strengths in performances'],
  ['Visual Arts', 'Review', 'Review of B2 visual arts learning'],
  ['Performing Arts', 'Review', 'Review of B2 performing arts learning'],
];

const b3Term1: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Investigating ideas from the environment and culture'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Investigating rhythm, sound and movement ideas'],
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Sketching and discussing ideas before making'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Improvising simple dramatic and musical ideas'],
  ['Visual Arts', 'Planning, Making and Composing', 'Using drawing, colouring and craft techniques purposefully'],
  ['Performing Arts', 'Planning, Making and Composing', 'Using voice, movement and rhythm with more control'],
  ['Visual Arts', 'Planning, Making and Composing', 'Designing and composing simple visual work'],
  ['Performing Arts', 'Planning, Making and Composing', 'Composing simple songs, scenes and movement sequences'],
  ['Visual Arts', 'Displaying and Sharing', 'Presenting and explaining completed artworks'],
  ['Performing Arts', 'Displaying and Sharing', 'Presenting short performance pieces to others'],
  ['Visual Arts', 'Appreciating and Appraising', 'Describing what makes an artwork appealing'],
  ['Performing Arts', 'Appreciating and Appraising', 'Describing mood and meaning in performances'],
];

const b3Term2: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Exploring themes from local occupations and activities'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring stories, songs and dances from community life'],
  ['Visual Arts', 'Planning, Making and Composing', 'Producing visual work from local life themes'],
  ['Performing Arts', 'Planning, Making and Composing', 'Developing role play and simple dramatic sequences'],
  ['Visual Arts', 'Planning, Making and Composing', 'Using mixed materials in simple art projects'],
  ['Performing Arts', 'Planning, Making and Composing', 'Combining music, movement and dialogue'],
  ['Visual Arts', 'Displaying and Sharing', 'Displaying artworks clearly for audience viewing'],
  ['Performing Arts', 'Displaying and Sharing', 'Performing in groups with simple coordination'],
  ['Visual Arts', 'Displaying and Sharing', 'Talking about choices of materials and colour'],
  ['Performing Arts', 'Displaying and Sharing', 'Talking about message and purpose of performance'],
  ['Visual Arts', 'Appreciating and Appraising', 'Commenting on visual qualities in artworks'],
  ['Performing Arts', 'Appreciating and Appraising', 'Commenting on expression and teamwork in performances'],
];

const b3Term3: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Exploring imaginative and cultural themes'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring performance ideas from folktales and events'],
  ['Visual Arts', 'Planning, Making and Composing', 'Creating artworks from stories and community themes'],
  ['Performing Arts', 'Planning, Making and Composing', 'Creating short dramatic or musical pieces from stories'],
  ['Visual Arts', 'Planning, Making and Composing', 'Using modelling and craft techniques in final pieces'],
  ['Performing Arts', 'Planning, Making and Composing', 'Refining movement, rhythm and expression'],
  ['Visual Arts', 'Displaying and Sharing', 'Preparing end-of-year display of visual work'],
  ['Performing Arts', 'Displaying and Sharing', 'Preparing end-of-year performance presentation'],
  ['Visual Arts', 'Appreciating and Appraising', 'Appraising own work and classmates’ work'],
  ['Performing Arts', 'Appreciating and Appraising', 'Appraising own performance and group work'],
  ['Visual Arts', 'Review', 'Review of B3 visual arts knowledge and skills'],
  ['Performing Arts', 'Review', 'Review of B3 performing arts knowledge and skills'],
];

const b4Term1: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Investigating ideas from nature, culture and design'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring ideas for music, dance and drama from daily life'],
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Using observation and imagination to generate art ideas'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Generating performance ideas from stories and experiences'],
  ['Visual Arts', 'Planning, Making and Composing', 'Planning and making artworks with suitable media'],
  ['Performing Arts', 'Planning, Making and Composing', 'Planning and composing simple music, dance and drama pieces'],
  ['Visual Arts', 'Planning, Making and Composing', 'Exploring pattern, shape and colour in composition'],
  ['Performing Arts', 'Planning, Making and Composing', 'Combining rhythm, movement and speech purposefully'],
  ['Visual Arts', 'Displaying and Sharing', 'Displaying finished visual work for discussion'],
  ['Performing Arts', 'Displaying and Sharing', 'Presenting short performances with confidence'],
  ['Visual Arts', 'Appreciating and Appraising', 'Appreciating qualities such as balance, colour and neatness'],
  ['Performing Arts', 'Appreciating and Appraising', 'Appreciating expression, timing and audience response'],
];

const b4Term2: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Exploring local motifs, symbols and design references'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring local performance traditions and their meanings'],
  ['Visual Arts', 'Planning, Making and Composing', 'Designing simple craft and visual art projects'],
  ['Performing Arts', 'Planning, Making and Composing', 'Developing short dramatic or musical sequences'],
  ['Visual Arts', 'Planning, Making and Composing', 'Using mixed media and craft techniques effectively'],
  ['Performing Arts', 'Planning, Making and Composing', 'Using music, dance and drama elements purposefully'],
  ['Visual Arts', 'Displaying and Sharing', 'Preparing artwork for exhibition or presentation'],
  ['Performing Arts', 'Displaying and Sharing', 'Preparing performances for peers and school audience'],
  ['Visual Arts', 'Displaying and Sharing', 'Explaining process and meaning in visual work'],
  ['Performing Arts', 'Displaying and Sharing', 'Explaining process and meaning in performance'],
  ['Visual Arts', 'Appreciating and Appraising', 'Using simple criteria to appraise visual artwork'],
  ['Performing Arts', 'Appreciating and Appraising', 'Using simple criteria to appraise performance work'],
];

const b4Term3: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Exploring themes from community development and culture'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring themes from festivals, stories and public events'],
  ['Visual Arts', 'Planning, Making and Composing', 'Producing visual projects from chosen themes'],
  ['Performing Arts', 'Planning, Making and Composing', 'Producing group performance projects from chosen themes'],
  ['Visual Arts', 'Planning, Making and Composing', 'Refining craft and art works through revision'],
  ['Performing Arts', 'Planning, Making and Composing', 'Refining music, dance or drama pieces through practice'],
  ['Visual Arts', 'Displaying and Sharing', 'Curating a simple visual arts exhibition'],
  ['Performing Arts', 'Displaying and Sharing', 'Presenting a simple end-of-term performing arts showcase'],
  ['Visual Arts', 'Appreciating and Appraising', 'Reflecting on strengths and areas for improvement in visual work'],
  ['Performing Arts', 'Appreciating and Appraising', 'Reflecting on strengths and areas for improvement in performance'],
  ['Visual Arts', 'Review', 'Review of B4 visual arts ideas and skills'],
  ['Performing Arts', 'Review', 'Review of B4 performing arts ideas and skills'],
];

const b5Term1: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Exploring artistic ideas from environment, culture and imagination'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring performance ideas from history, culture and experience'],
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Researching and sketching ideas before making'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Improvising performance ideas before composing'],
  ['Visual Arts', 'Planning, Making and Composing', 'Planning and producing artworks with control and creativity'],
  ['Performing Arts', 'Planning, Making and Composing', 'Planning and producing performance pieces with structure'],
  ['Visual Arts', 'Planning, Making and Composing', 'Applying colour, texture and form in visual work'],
  ['Performing Arts', 'Planning, Making and Composing', 'Applying rhythm, movement, voice and gesture in performance'],
  ['Visual Arts', 'Displaying and Sharing', 'Presenting artwork professionally to peers'],
  ['Performing Arts', 'Displaying and Sharing', 'Presenting performance work effectively to an audience'],
  ['Visual Arts', 'Appreciating and Appraising', 'Using artistic vocabulary to discuss artwork'],
  ['Performing Arts', 'Appreciating and Appraising', 'Using performance vocabulary to discuss performances'],
];

const b5Term2: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Exploring symbols, patterns and themes in local art'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring meaning and style in local performance traditions'],
  ['Visual Arts', 'Planning, Making and Composing', 'Designing and making craft, drawing or painting projects'],
  ['Performing Arts', 'Planning, Making and Composing', 'Composing short dramatic, musical or dance works'],
  ['Visual Arts', 'Planning, Making and Composing', 'Selecting suitable media for a task'],
  ['Performing Arts', 'Planning, Making and Composing', 'Selecting suitable performance elements for a task'],
  ['Visual Arts', 'Displaying and Sharing', 'Organising and displaying work in thoughtful ways'],
  ['Performing Arts', 'Displaying and Sharing', 'Organising and rehearsing group presentations'],
  ['Visual Arts', 'Displaying and Sharing', 'Explaining theme, purpose and process in artworks'],
  ['Performing Arts', 'Displaying and Sharing', 'Explaining theme, purpose and process in performances'],
  ['Visual Arts', 'Appreciating and Appraising', 'Appraising visual artworks using agreed criteria'],
  ['Performing Arts', 'Appreciating and Appraising', 'Appraising performance works using agreed criteria'],
];

const b5Term3: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Exploring community, heritage and environment as themes'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring social and cultural issues through performance ideas'],
  ['Visual Arts', 'Planning, Making and Composing', 'Developing a themed visual art or craft project'],
  ['Performing Arts', 'Planning, Making and Composing', 'Developing a themed music, dance or drama project'],
  ['Visual Arts', 'Planning, Making and Composing', 'Refining technique and originality in final work'],
  ['Performing Arts', 'Planning, Making and Composing', 'Refining technique and expression in final work'],
  ['Visual Arts', 'Displaying and Sharing', 'Preparing a class exhibition or portfolio display'],
  ['Performing Arts', 'Displaying and Sharing', 'Preparing a class showcase or performance presentation'],
  ['Visual Arts', 'Appreciating and Appraising', 'Reflecting on process, product and audience response in visual arts'],
  ['Performing Arts', 'Appreciating and Appraising', 'Reflecting on process, product and audience response in performing arts'],
  ['Visual Arts', 'Review', 'Review of B5 visual arts learning'],
  ['Performing Arts', 'Review', 'Review of B5 performing arts learning'],
];

const b6Term1: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Investigating complex ideas from culture, environment and design'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Investigating complex ideas from music, dance, drama and story'],
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Planning ideas through sketches, notes and research'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Planning performance ideas through improvisation and discussion'],
  ['Visual Arts', 'Planning, Making and Composing', 'Producing well-planned visual art and craft works'],
  ['Performing Arts', 'Planning, Making and Composing', 'Producing well-planned performance works'],
  ['Visual Arts', 'Planning, Making and Composing', 'Controlling media, techniques and visual elements'],
  ['Performing Arts', 'Planning, Making and Composing', 'Controlling rhythm, movement, voice and dramatic elements'],
  ['Visual Arts', 'Displaying and Sharing', 'Presenting visual work with clear organisation and purpose'],
  ['Performing Arts', 'Displaying and Sharing', 'Presenting performance work with confidence and clarity'],
  ['Visual Arts', 'Appreciating and Appraising', 'Analysing qualities and meanings in visual work'],
  ['Performing Arts', 'Appreciating and Appraising', 'Analysing qualities and meanings in performance work'],
];

const b6Term2: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Exploring local and global inspirations in visual arts'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring local and global inspirations in performance'],
  ['Visual Arts', 'Planning, Making and Composing', 'Designing and making advanced primary-level art projects'],
  ['Performing Arts', 'Planning, Making and Composing', 'Designing and making advanced primary-level performance pieces'],
  ['Visual Arts', 'Planning, Making and Composing', 'Using suitable techniques and media with intention'],
  ['Performing Arts', 'Planning, Making and Composing', 'Using suitable performance techniques with intention'],
  ['Visual Arts', 'Displaying and Sharing', 'Preparing exhibition-quality display of artworks'],
  ['Performing Arts', 'Displaying and Sharing', 'Preparing structured group performances for an audience'],
  ['Visual Arts', 'Displaying and Sharing', 'Articulating the process and message behind artworks'],
  ['Performing Arts', 'Displaying and Sharing', 'Articulating the process and message behind performances'],
  ['Visual Arts', 'Appreciating and Appraising', 'Using reflective language to evaluate visual work'],
  ['Performing Arts', 'Appreciating and Appraising', 'Using reflective language to evaluate performance work'],
];

const b6Term3: TopicTuple[] = [
  ['Visual Arts', 'Thinking and Exploring Ideas', 'Exploring art ideas linked to leadership, responsibility and identity'],
  ['Performing Arts', 'Thinking and Exploring Ideas', 'Exploring performance ideas linked to leadership, responsibility and identity'],
  ['Visual Arts', 'Planning, Making and Composing', 'Developing a final themed visual arts project'],
  ['Performing Arts', 'Planning, Making and Composing', 'Developing a final themed performing arts project'],
  ['Visual Arts', 'Planning, Making and Composing', 'Refining media use, creativity and personal style'],
  ['Performing Arts', 'Planning, Making and Composing', 'Refining performance quality, teamwork and expression'],
  ['Visual Arts', 'Displaying and Sharing', 'Preparing a final exhibition or display portfolio'],
  ['Performing Arts', 'Displaying and Sharing', 'Preparing a final performance showcase'],
  ['Visual Arts', 'Appreciating and Appraising', 'Evaluating personal growth in visual arts before transition'],
  ['Performing Arts', 'Appreciating and Appraising', 'Evaluating personal growth in performing arts before transition'],
  ['Visual Arts', 'Review', 'Upper primary visual arts consolidation'],
  ['Performing Arts', 'Review', 'Upper primary performing arts consolidation'],
];

export const primaryCreativeArtsTerms: ExplicitCurriculumTerm[] = [
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
