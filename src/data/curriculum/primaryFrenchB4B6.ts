import type { ClassLevel } from '@/types/lessonPlan';
import type { SchemeWeek } from '@/types/scheme';
import type { ExplicitCurriculumTerm } from './mathematicsB7';

type TopicTuple = [strand: string, subStrand: string, topic: string];

const resourcesByStrand = {
  "L'identite": ['French textbook', 'Dialogue cards', 'Flashcards', 'Exercise book'],
  'Parler de son environnement': ['French textbook', 'Picture cards', 'Reader', 'Flashcards'],
  'Exprimer ses gouts et ses preferences': ['French textbook', 'Conversation cards', 'Role-play prompts', 'Exercise book'],
  'Les activites': ['French textbook', 'Clock chart', 'Calendar chart', 'Number cards'],
} as const;

function makeWeek(
  classLevel: ClassLevel,
  week: number,
  strand: TopicTuple[0],
  subStrand: TopicTuple[1],
  topic: TopicTuple[2]
): SchemeWeek {
  const resources = resourcesByStrand[strand as keyof typeof resourcesByStrand] ?? [
    'French textbook',
  ];

  return {
    week,
    strand,
    subStrand,
    topic,
    contentStandard: `${classLevel} ${strand}: Develop basic communicative ability in ${subStrand.toLowerCase()}.`,
    indicator: `Use simple French to practise ${topic.toLowerCase()} in guided oral and written activities.`,
    resources: [...resources],
  };
}

function buildTerm(
  classLevel: ClassLevel,
  term: string,
  topics: TopicTuple[]
): ExplicitCurriculumTerm {
  return {
    subject: 'French Language',
    classLevel,
    term,
    title: `${classLevel} French Language Scheme of Work - ${term}`,
    weeks: topics.map((item, index) =>
      makeWeek(classLevel, index + 1, item[0], item[1], item[2])
    ),
  };
}

const b4Term1: TopicTuple[] = [
  ["L'identite", 'Saluer et prendre conge', 'Greeting and taking leave'],
  ["L'identite", 'Se presenter et presenter quelqu’un', 'Introducing oneself and another person'],
  ["L'identite", 'Decrire quelqu’un', 'Describing a person simply'],
  ["L'identite", 'Decrire la famille et les liens familiaux', 'Talking about family and family relationships'],
  ['Parler de son environnement', 'Parler de sa maison', 'Talking about one’s house'],
  ['Parler de son environnement', 'Parler de son ecole', 'Talking about one’s school'],
  ['Exprimer ses gouts et ses preferences', 'Dire ce que l’on aime', 'Saying what one likes'],
  ['Exprimer ses gouts et ses preferences', 'Dire ce que l’on n’aime pas', 'Saying what one does not like'],
  ['Les activites', 'Compter et faire des calculs simples', 'Counting and doing simple calculations'],
  ['Les activites', 'Demander et donner l’heure', 'Asking for and telling time'],
  ['Les activites', 'Parler des jours de la semaine', 'Talking about the days of the week'],
  ['Les activites', 'Situer les mois et les saisons dans le temps', 'Placing months and seasons in time'],
];

const b4Term2: TopicTuple[] = [
  ['Les activites', 'Entrer en contact par telephone', 'Making contact by telephone'],
  ['Les activites', 'Inviter quelqu’un et accepter une invitation', 'Inviting someone and accepting an invitation'],
  ['Les activites', 'Identifier les professions et les metiers', 'Identifying professions and jobs'],
  ['Les activites', 'Demander et expliquer la position de personnes ou d’objets les uns par rapport aux autres', 'Explaining position and location of people and objects'],
  ['Les activites', 'Donner et repondre a des ordres', 'Giving and responding to commands'],
  ["L'identite", 'Saluer et prendre conge', 'Using greetings in different daily situations'],
  ["L'identite", 'Se presenter et presenter quelqu’un', 'Presenting oneself and others more confidently'],
  ['Parler de son environnement', 'Parler de sa maison', 'Describing rooms and objects in the house'],
  ['Parler de son environnement', 'Parler de son ecole', 'Describing school places and activities'],
  ['Exprimer ses gouts et ses preferences', 'Dire ce que l’on aime et ce que l’on n’aime pas', 'Expressing likes and dislikes in sentences'],
  ['Les activites', 'Compter et faire des calculs simples', 'Using numbers in practical oral tasks'],
  ['French', 'Revision et mini-projet', 'Term revision and mini project'],
];

const b4Term3: TopicTuple[] = [
  ["L'identite", 'Decrire quelqu’un', 'Describing appearance and simple qualities'],
  ["L'identite", 'Decrire la famille et les liens familiaux', 'Describing family roles and relationships'],
  ['Parler de son environnement', 'Parler de sa maison', 'Review of home vocabulary and expression'],
  ['Parler de son environnement', 'Parler de son ecole', 'Review of school vocabulary and expression'],
  ['Exprimer ses gouts et ses preferences', 'Dire ce que l’on aime', 'Saying favourite foods, games and activities'],
  ['Exprimer ses gouts et ses preferences', 'Dire ce que l’on n’aime pas', 'Saying dislikes politely'],
  ['Les activites', 'Demander et donner l’heure', 'Using time expressions in daily routines'],
  ['Les activites', 'Parler des jours de la semaine', 'Using weekdays in practical conversation'],
  ['Les activites', 'Situer les mois et les saisons dans le temps', 'Using months and seasons in simple speech'],
  ['Les activites', 'Entrer en contact par telephone', 'Simple telephone conversation practice'],
  ['Les activites', 'Donner et repondre a des ordres', 'Command and response practice in class situations'],
  ['French', 'Projet final et revision', 'Final revision and oral project'],
];

const b5Term1: TopicTuple[] = [
  ["L'identite", 'Saluer et prendre conge', 'Greeting and taking leave appropriately'],
  ["L'identite", 'Se presenter', 'Introducing oneself with more personal details'],
  ["L'identite", 'Presenter quelqu’un', 'Introducing another person'],
  ["L'identite", 'Decrire quelqu’un', 'Describing someone using simple adjectives'],
  ["L'identite", 'Decrire la famille et les liens familiaux', 'Talking about family links and relationships'],
  ['Parler de son environnement', 'Parler de sa maison', 'Talking about one’s home and surroundings'],
  ['Parler de son environnement', 'Parler de son ecole', 'Talking about one’s school and school life'],
  ['Exprimer ses gouts et ses preferences', 'Dire ce que l’on aime et ce que l’on n’aime pas', 'Expressing likes and dislikes clearly'],
  ['Les activites', 'Compter et faire des calculs simples', 'Using numbers and simple calculations'],
  ['Les activites', 'Demander et donner l’heure', 'Asking for and telling time in context'],
  ['Les activites', 'Parler des jours de la semaine', 'Talking about weekdays and routine'],
  ['Les activites', 'Situer les mois et les saisons dans le temps', 'Talking about months and seasons'],
];

const b5Term2: TopicTuple[] = [
  ['Les activites', 'Entrer en contact par telephone', 'Making simple phone contact'],
  ['Les activites', 'Inviter quelqu’un et accepter une invitation', 'Inviting, accepting and refusing politely'],
  ['Les activites', 'Identifier les professions et les metiers', 'Talking about professions and occupations'],
  ['Les activites', 'Demander et expliquer la position des personnes ou des objets les uns par rapport aux autres', 'Giving position and location in simple French'],
  ['Les activites', 'Donner et repondre a des ordres', 'Giving and responding to classroom and daily-life commands'],
  ["L'identite", 'Decrire quelqu’un', 'Describing people with more detail'],
  ['Parler de son environnement', 'Parler de sa maison', 'House vocabulary in short descriptions'],
  ['Parler de son environnement', 'Parler de son ecole', 'School vocabulary in short descriptions'],
  ['Exprimer ses gouts et ses preferences', 'Dire ce que l’on aime et ce que l’on n’aime pas', 'Stating preferences in short dialogues'],
  ['Les activites', 'Compter et faire des calculs simples', 'Using numbers in games and shopping-like tasks'],
  ['Les activites', 'Demander et donner l’heure', 'Using time in routine and appointment contexts'],
  ['French', 'Revision et jeux de role', 'Revision and role play'],
];

const b5Term3: TopicTuple[] = [
  ["L'identite", 'Saluer et prendre conge', 'Greetings in formal and informal situations'],
  ["L'identite", 'Se presenter et presenter quelqu’un', 'Presentation practice through short dialogues'],
  ['Parler de son environnement', 'Parler de sa maison', 'Review of home descriptions'],
  ['Parler de son environnement', 'Parler de son ecole', 'Review of school descriptions'],
  ['Exprimer ses gouts et ses preferences', 'Dire ce que l’on aime et ce que l’on n’aime pas', 'Preferences in relation to food, games and school subjects'],
  ['Les activites', 'Parler des jours de la semaine', 'Talking about weekly activities'],
  ['Les activites', 'Situer les mois et les saisons dans le temps', 'Talking about time, seasons and holidays'],
  ['Les activites', 'Entrer en contact par telephone', 'Simple telephone role-play revision'],
  ['Les activites', 'Inviter quelqu’un et accepter une invitation', 'Invitation role-play revision'],
  ['Les activites', 'Identifier les professions et les metiers', 'Jobs and professions review'],
  ['Les activites', 'Donner et repondre a des ordres', 'Command and response activities'],
  ['French', 'Projet final et revision', 'Final revision and project presentation'],
];

const b6Term1: TopicTuple[] = [
  ["L'identite", 'Saluer et prendre conge', 'Using greetings and leave-taking naturally'],
  ["L'identite", 'Se presenter', 'Presenting oneself with clear basic information'],
  ["L'identite", 'Presenter quelqu’un', 'Presenting another person confidently'],
  ["L'identite", 'Decrire quelqu’un', 'Describing a person with simple detail'],
  ["L'identite", 'Decrire la famille et les liens familiaux', 'Talking about family ties and relationships'],
  ['Parler de son environnement', 'Parler de sa maison', 'Describing home spaces and objects'],
  ['Parler de son environnement', 'Parler de son ecole', 'Describing school environment and activities'],
  ['Exprimer ses gouts et ses preferences', 'Dire ce que l’on aime', 'Expressing preferences and favourites'],
  ['Les activites', 'Compter et faire des calculs simples', 'Using numbers for counting and simple calculations'],
  ['Les activites', 'Demander et donner l’heure', 'Talking about time in daily routines'],
  ['Les activites', 'Parler des jours de la semaine', 'Talking about days and weekly plans'],
  ['Les activites', 'Situer les mois et les saisons dans le temps', 'Talking about months, seasons and dates'],
];

const b6Term2: TopicTuple[] = [
  ['Les activites', 'Entrer en contact par telephone', 'Taking part in simple telephone conversations'],
  ['Les activites', 'Inviter quelqu’un et accepter une invitation', 'Inviting, accepting and declining politely'],
  ['Les activites', 'Identifier les professions et les metiers', 'Talking about jobs and occupations'],
  ['Les activites', 'Demander et expliquer la position des personnes ou des objets les uns par rapport aux autres', 'Explaining positions and locations clearly'],
  ['Les activites', 'Donner et repondre a des ordres', 'Using commands and responses in everyday situations'],
  ['Parler de son environnement', 'Parler de sa maison', 'Giving fuller descriptions of home'],
  ['Parler de son environnement', 'Parler de son ecole', 'Giving fuller descriptions of school'],
  ['Exprimer ses gouts et ses preferences', 'Dire ce que l’on aime', 'Talking about favourite activities and objects'],
  ['Exprimer ses gouts et ses preferences', 'Dire ce que l’on n’aime pas', 'Talking about dislikes with simple reasons'],
  ['Les activites', 'Compter et faire des calculs simples', 'Using numbers in realistic classroom tasks'],
  ['Les activites', 'Demander et donner l’heure', 'Using time expressions in arrangements and routines'],
  ['French', 'Revision et jeux de role', 'Revision and role play around daily situations'],
];

const b6Term3: TopicTuple[] = [
  ["L'identite", 'Revision de l’identite', 'Review of greetings, introductions and descriptions'],
  ['Parler de son environnement', 'Revision de l’environnement', 'Review of home and school vocabulary and expression'],
  ['Exprimer ses gouts et ses preferences', 'Revision des gouts et preferences', 'Review of likes and dislikes in conversation'],
  ['Les activites', 'Parler des jours de la semaine', 'Using weekdays in everyday communication'],
  ['Les activites', 'Situer les mois et les saisons dans le temps', 'Using months and seasons in practical contexts'],
  ['Les activites', 'Entrer en contact par telephone', 'Telephone role-play and revision'],
  ['Les activites', 'Inviter quelqu’un et accepter une invitation', 'Invitation role-play and revision'],
  ['Les activites', 'Identifier les professions et les metiers', 'Professions and occupations revision'],
  ['Les activites', 'Demander et expliquer la position des personnes ou des objets les uns par rapport aux autres', 'Location and direction revision'],
  ['Les activites', 'Donner et repondre a des ordres', 'Commands and responses revision'],
  ['French', 'Preparation du projet final', 'Preparing a final oral or written French task'],
  ['French', 'Presentation du projet final', 'Presenting a final French project and review'],
];

export const primaryFrenchTerms: ExplicitCurriculumTerm[] = [
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
