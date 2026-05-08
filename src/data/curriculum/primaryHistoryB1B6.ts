import type { ClassLevel } from '@/types/lessonPlan';
import type { SchemeWeek } from '@/types/scheme';
import type { ExplicitCurriculumTerm } from './mathematicsB7';

type TopicTuple = [strand: string, subStrand: string, topic: string];

const resourcesByStrand = {
  'History as a Subject': ['History textbook', 'Picture cards', 'Family photographs', 'Timeline chart'],
  'My Country Ghana': ['Map of Ghana', 'History textbook', 'Picture cards', 'Story notes'],
  'Europeans in Ghana': ['History textbook', 'Maps', 'Pictures of forts and castles', 'Timeline chart'],
  'Colonisation and Developments under Colonial Rule in Ghana': ['History textbook', 'Charts', 'Historical source cards', 'Maps'],
  'Journey to Independence': ['Biographies', 'History textbook', 'Timeline chart', 'National symbols posters'],
  'Independent Ghana': ['History textbook', 'Republic timeline', 'Pictures of leaders', 'Civic posters'],
} as const;

function makeWeek(
  classLevel: ClassLevel,
  week: number,
  strand: TopicTuple[0],
  subStrand: TopicTuple[1],
  topic: TopicTuple[2]
): SchemeWeek {
  const resources = resourcesByStrand[strand as keyof typeof resourcesByStrand] ?? [
    'History textbook',
  ];

  return {
    week,
    strand,
    subStrand,
    topic,
    contentStandard: `${classLevel} ${strand}: Demonstrate understanding of ${subStrand.toLowerCase()} and its relevance to Ghanaian history.`,
    indicator: `Explore and explain ${topic.toLowerCase()} through discussion, stories, timelines and simple historical evidence.`,
    resources: [...resources],
  };
}

function buildTerm(
  classLevel: ClassLevel,
  term: string,
  topics: TopicTuple[]
): ExplicitCurriculumTerm {
  return {
    subject: 'History',
    classLevel,
    term,
    title: `${classLevel} History Scheme of Work - ${term}`,
    weeks: topics.map((item, index) =>
      makeWeek(classLevel, index + 1, item[0], item[1], item[2])
    ),
  };
}

const b1Term1: TopicTuple[] = [
  ['History as a Subject', 'Why and How We Study History', 'Meaning of history and why we learn it'],
  ['History as a Subject', 'Why and How We Study History', 'Sources of history in the home and school'],
  ['History as a Subject', 'Why and How We Study History', 'Talking to elders and using stories to learn history'],
  ['History as a Subject', 'Community History', 'My family history and important family events'],
  ['History as a Subject', 'Community History', 'Our school history and important school memories'],
  ['My Country Ghana', 'The People of Ghana', 'Who Ghanaians are and where we live'],
  ['My Country Ghana', 'The People of Ghana', 'Different groups of people in Ghana'],
  ['My Country Ghana', 'How Ghana Got Its Name', 'The story behind the name Ghana'],
  ['My Country Ghana', 'How Ghana Got Its Name', 'What the name Ghana means to us today'],
  ['My Country Ghana', 'Some Selected Individuals', 'Important people we remember in Ghana'],
  ['My Country Ghana', 'Some Selected Individuals', 'How heroes and heroines help the country'],
  ['History', 'Review', 'Review of history as a subject and early Ghana stories'],
];

const b1Term2: TopicTuple[] = [
  ['History as a Subject', 'Community History', 'Important places in our community'],
  ['History as a Subject', 'Community History', 'Things that show how our community changed over time'],
  ['My Country Ghana', 'The People of Ghana', 'Families, clans and belonging in Ghana'],
  ['My Country Ghana', 'How Ghana Got Its Name', 'Retelling the origin story of Ghana'],
  ['My Country Ghana', 'Some Selected Individuals', 'Simple stories about selected Ghanaian heroes'],
  ['Europeans in Ghana', 'Arrival of Europeans', 'Who the Europeans were'],
  ['Europeans in Ghana', 'Arrival of Europeans', 'Why Europeans came to the Gold Coast'],
  ['Europeans in Ghana', 'Arrival of Europeans', 'Early contact between Europeans and local people'],
  ['Independent Ghana', 'The Republics', 'Ghana as an independent nation'],
  ['Independent Ghana', 'The Republics', 'National symbols and pride in independent Ghana'],
  ['History', 'Project Work', 'Simple family or community history project'],
  ['History', 'Integrated Review', 'Integrated B1 history consolidation'],
];

const b1Term3: TopicTuple[] = [
  ['History as a Subject', 'Why and How We Study History', 'Using pictures, songs and objects to tell history'],
  ['History as a Subject', 'Community History', 'Community festivals and what they tell us about the past'],
  ['My Country Ghana', 'The People of Ghana', 'Living together as one people in Ghana'],
  ['My Country Ghana', 'Some Selected Individuals', 'Good qualities of national heroes'],
  ['Europeans in Ghana', 'Arrival of Europeans', 'Review of first contacts with Europeans'],
  ['Independent Ghana', 'The Republics', 'What it means for Ghana to govern itself'],
  ['Independent Ghana', 'The Republics', 'Celebrating Ghana’s independence and nationhood'],
  ['History', 'Timeline Skills', 'Putting simple events in order'],
  ['History', 'Local History', 'Oral stories about our community past'],
  ['History', 'Review', 'Review of key B1 history topics'],
  ['History', 'Project Work', 'Class display on my family, school or country'],
  ['History', 'Integrated Review', 'End-of-year B1 history review'],
];

const b2Term1: TopicTuple[] = [
  ['My Country Ghana', 'The People of Ghana', 'Major groups of people in Ghana'],
  ['My Country Ghana', 'The People of Ghana', 'How people in Ghana live and work'],
  ['My Country Ghana', 'Major Historical Locations', 'Famous places in Ghana we should know'],
  ['My Country Ghana', 'Major Historical Locations', 'Why historical locations are important'],
  ['My Country Ghana', 'Some Selected Individuals', 'Selected men and women in Ghanaian history'],
  ['My Country Ghana', 'Some Selected Individuals', 'Lessons from the lives of selected individuals'],
  ['Europeans in Ghana', 'International Trade Including Slave Trade', 'Trade between Ghanaians and Europeans'],
  ['Europeans in Ghana', 'International Trade Including Slave Trade', 'Goods exchanged in early trade'],
  ['Europeans in Ghana', 'International Trade Including Slave Trade', 'Introduction to the slave trade'],
  ['History as a Subject', 'Community History', 'Important community events and memories'],
  ['History', 'Timeline Skills', 'Ordering events in family and national history'],
  ['History', 'Review', 'Review of B2 people, places and early trade'],
];

const b2Term2: TopicTuple[] = [
  ['My Country Ghana', 'The People of Ghana', 'Unity in diversity among the people of Ghana'],
  ['My Country Ghana', 'Major Historical Locations', 'Locating famous historical sites on the map'],
  ['My Country Ghana', 'Some Selected Individuals', 'Stories of selected heroes and heroines'],
  ['Europeans in Ghana', 'International Trade Including Slave Trade', 'How trade changed communities'],
  ['Europeans in Ghana', 'International Trade Including Slave Trade', 'Effects of the slave trade on people'],
  ['History as a Subject', 'Why and How We Study History', 'Evidence from stories, objects and places'],
  ['History as a Subject', 'Community History', 'Historical places in my locality'],
  ['Independent Ghana', 'The Republics', 'Leaders and symbols of independent Ghana'],
  ['Independent Ghana', 'The Republics', 'Why we celebrate national days'],
  ['History', 'Project Work', 'Picture and timeline work on Ghana'],
  ['History', 'Review', 'Review of trade, places and national pride'],
  ['History', 'Integrated Review', 'Integrated B2 history consolidation'],
];

const b2Term3: TopicTuple[] = [
  ['My Country Ghana', 'Major Historical Locations', 'Caring for major historical locations'],
  ['My Country Ghana', 'Some Selected Individuals', 'Why some individuals are remembered nationally'],
  ['Europeans in Ghana', 'International Trade Including Slave Trade', 'Review of trade and its effects'],
  ['History as a Subject', 'Community History', 'How communities remember the past'],
  ['History as a Subject', 'Community History', 'Community stories and elders as sources of history'],
  ['Independent Ghana', 'The Republics', 'Changes after independence in simple terms'],
  ['Independent Ghana', 'The Republics', 'Citizenship and belonging in Ghana'],
  ['History', 'Timeline Skills', 'Simple timelines of Ghana events'],
  ['History', 'Review', 'Review of B2 history themes'],
  ['History', 'Project Work', 'Community and country history collage'],
  ['History', 'Practical Activities', 'Map, picture and story activities'],
  ['History', 'Integrated Review', 'End-of-year B2 history review'],
];

const b3Term1: TopicTuple[] = [
  ['My Country Ghana', 'The People of Ghana', 'The people of Ghana and their backgrounds'],
  ['My Country Ghana', 'Inter-Group Relations', 'How groups in Ghana related in the past'],
  ['My Country Ghana', 'Inter-Group Relations', 'Trade, migration and friendship among groups'],
  ['My Country Ghana', 'Major Historical Locations', 'Important sites and what happened there'],
  ['My Country Ghana', 'Some Selected Individuals', 'Selected individuals and their contributions'],
  ['Europeans in Ghana', 'Arrival of Europeans', 'Arrival of the first Europeans in Ghana'],
  ['Europeans in Ghana', 'Arrival of Europeans', 'Why the Europeans came to Ghana'],
  ['Europeans in Ghana', 'Arrival of Europeans', 'The building of forts and castles'],
  ['History as a Subject', 'Why and How We Study History', 'Using sources to learn history'],
  ['History as a Subject', 'Community History', 'Relating family and community histories to national history'],
  ['History', 'Timeline Skills', 'Arranging local and national events in order'],
  ['History', 'Review', 'Review of B3 people, places and early Europeans'],
];

const b3Term2: TopicTuple[] = [
  ['My Country Ghana', 'Inter-Group Relations', 'Cooperation and conflict among groups in Ghana'],
  ['My Country Ghana', 'Major Historical Locations', 'Historical locations as evidence of the past'],
  ['My Country Ghana', 'Some Selected Individuals', 'Leadership and courage in Ghanaian history'],
  ['Europeans in Ghana', 'Arrival of Europeans', 'Early changes caused by European presence'],
  ['Europeans in Ghana', 'Arrival of Europeans', 'Interaction between Europeans and local rulers'],
  ['History as a Subject', 'Community History', 'Historical stories in the community'],
  ['Independent Ghana', 'The Republics', 'Ghana’s nationhood and pride'],
  ['Independent Ghana', 'The Republics', 'Selected leaders of independent Ghana'],
  ['History', 'Project Work', 'Short report on a historical place or person'],
  ['History', 'Review', 'Review of B3 themes and evidence of the past'],
  ['History', 'Practical Activities', 'Map, timeline and story activities'],
  ['History', 'Integrated Review', 'Integrated B3 history consolidation'],
];

const b3Term3: TopicTuple[] = [
  ['My Country Ghana', 'The People of Ghana', 'What unites the people of Ghana'],
  ['My Country Ghana', 'Inter-Group Relations', 'Benefits of peaceful relations among groups'],
  ['Europeans in Ghana', 'Arrival of Europeans', 'Review of the arrival of Europeans and forts'],
  ['History as a Subject', 'Why and How We Study History', 'Comparing old and new ways of life'],
  ['History as a Subject', 'Community History', 'Important local memories and landmarks'],
  ['Independent Ghana', 'The Republics', 'How independence changed the life of Ghanaians'],
  ['Independent Ghana', 'The Republics', 'National identity and responsibility'],
  ['History', 'Timeline Skills', 'From past to present: sequencing Ghana stories'],
  ['History', 'Review', 'Review of B3 history themes'],
  ['History', 'Project Work', 'Community history presentation'],
  ['History', 'Practical Activities', 'Historical storytelling and visual display'],
  ['History', 'Integrated Review', 'End-of-year B3 history review'],
];

const b4Term1: TopicTuple[] = [
  ['History as a Subject', 'Why and How We Study History', 'Meaning, scope and importance of history'],
  ['History as a Subject', 'Why and How We Study History', 'Primary and secondary sources of history'],
  ['My Country Ghana', 'The People of Ghana', 'Origins and settlement of selected groups in Ghana'],
  ['My Country Ghana', 'The People of Ghana', 'How different groups contribute to Ghana'],
  ['My Country Ghana', 'Major Historical Locations', 'Major historical locations and their significance'],
  ['My Country Ghana', 'Some Selected Individuals', 'Selected individuals who shaped Ghana'],
  ['Europeans in Ghana', 'Missionary Activities', 'Arrival of missionaries in Ghana'],
  ['Europeans in Ghana', 'Missionary Activities', 'Missionary work in education and religion'],
  ['Europeans in Ghana', 'Missionary Activities', 'Positive and negative effects of missionary activities'],
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Establishing British Rule in Ghana', 'How British rule was established in Ghana'],
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Establishing British Rule in Ghana', 'Treaties, wars and indirect rule'],
  ['History', 'Review', 'Review of B4 early history and colonial beginnings'],
];

const b4Term2: TopicTuple[] = [
  ['History as a Subject', 'Why and How We Study History', 'Historical inquiry and evidence'],
  ['My Country Ghana', 'Major Historical Locations', 'Historical locations as tourist and heritage sites'],
  ['My Country Ghana', 'Some Selected Individuals', 'Leadership lessons from selected individuals'],
  ['Europeans in Ghana', 'Missionary Activities', 'Mission schools and social change'],
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Establishing British Rule in Ghana', 'Colonial administration in the Gold Coast'],
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Establishing British Rule in Ghana', 'Resistance to British expansion'],
  ['Independent Ghana', 'The Republics', 'The republic periods in Ghana'],
  ['Independent Ghana', 'The Republics', 'Changes across the republics'],
  ['History', 'Project Work', 'Historical profile of a site or individual'],
  ['History', 'Review', 'Review of colonial rule and republic beginnings'],
  ['History', 'Practical Activities', 'Map and timeline work on Ghana history'],
  ['History', 'Integrated Review', 'Integrated B4 history consolidation'],
];

const b4Term3: TopicTuple[] = [
  ['My Country Ghana', 'The People of Ghana', 'National unity and shared identity'],
  ['Europeans in Ghana', 'Missionary Activities', 'Review of missionary activities and influence'],
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Establishing British Rule in Ghana', 'Effects of establishing British rule'],
  ['Independent Ghana', 'The Republics', 'Achievements and challenges of republic governments'],
  ['Independent Ghana', 'The Republics', 'Important leaders in independent Ghana'],
  ['History as a Subject', 'Community History', 'Connecting local history to national history'],
  ['History', 'Timeline Skills', 'Sequencing pre-colonial, colonial and independent Ghana'],
  ['History', 'Review', 'Review of B4 history themes'],
  ['History', 'Project Work', 'Community and national history exhibition'],
  ['History', 'Practical Activities', 'Source analysis through pictures and stories'],
  ['History', 'Review', 'Upper primary history recap for B4'],
  ['History', 'Integrated Review', 'End-of-year B4 history review'],
];

const b5Term1: TopicTuple[] = [
  ['My Country Ghana', 'The People of Ghana', 'Peoples of Ghana and their contributions to nation building'],
  ['My Country Ghana', 'Some Selected Individuals', 'Selected individuals in politics, culture and education'],
  ['Europeans in Ghana', 'International Trade Including the Slave Trade', 'International trade before the slave trade'],
  ['Europeans in Ghana', 'International Trade Including the Slave Trade', 'The trans-Atlantic slave trade in Ghana'],
  ['Europeans in Ghana', 'International Trade Including the Slave Trade', 'Effects of the slave trade on Ghanaian societies'],
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Social Developments Under Colonial Rule', 'Education, health and religion under colonial rule'],
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Social Developments Under Colonial Rule', 'Changes in social life under colonial rule'],
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Economic Developments Under Colonial Rule', 'Roads, railways and ports under colonial rule'],
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Economic Developments Under Colonial Rule', 'Cash crops, mining and labour in the colonial economy'],
  ['Journey to Independence', 'Early Protest Movements', 'Early protests against colonial rule'],
  ['Journey to Independence', 'Early Protest Movements', 'Leaders of early protest movements'],
  ['History', 'Review', 'Review of trade, colonial developments and protest'],
];

const b5Term2: TopicTuple[] = [
  ['My Country Ghana', 'Some Selected Individuals', 'Influential individuals and their legacies'],
  ['Europeans in Ghana', 'International Trade Including the Slave Trade', 'Comparing legitimate trade and slave trade'],
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Social Developments Under Colonial Rule', 'Mission education and urban growth'],
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Economic Developments Under Colonial Rule', 'Economic exploitation and African responses'],
  ['Journey to Independence', 'Early Protest Movements', 'The role of educated elites and chiefs'],
  ['Journey to Independence', 'Early Protest Movements', 'UGCC and constitutional demands'],
  ['Journey to Independence', 'The 1948 Riots and After', 'Causes of the 1948 riots'],
  ['Journey to Independence', 'The 1948 Riots and After', 'Outcomes of the 1948 riots'],
  ['Journey to Independence', 'The 1948 Riots and After', 'The rise of mass nationalism after 1948'],
  ['History', 'Project Work', 'Timeline of protest to nationalism'],
  ['History', 'Review', 'Review of colonial rule and the road to change'],
  ['History', 'Integrated Review', 'Integrated B5 history consolidation'],
];

const b5Term3: TopicTuple[] = [
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Economic Developments Under Colonial Rule', 'Benefits and costs of colonial economic development'],
  ['Journey to Independence', 'Early Protest Movements', 'Key personalities in nationalist politics'],
  ['Journey to Independence', 'The 1948 Riots and After', 'The Watson Commission and constitutional reforms'],
  ['Journey to Independence', 'The 1948 Riots and After', 'CPP and the campaign for self-government'],
  ['Journey to Independence', 'The 1948 Riots and After', 'Positive Action and political mobilisation'],
  ['History', 'Timeline Skills', 'Sequencing events from protest to nationalism'],
  ['History', 'Review', 'Review of the journey to independence themes'],
  ['History', 'Project Work', 'Biography or event study on nationalist leaders'],
  ['History', 'Practical Activities', 'Debate or role play on colonial change'],
  ['History', 'Review', 'Upper primary B5 recap'],
  ['History', 'Practical Activities', 'Source cards and timeline review'],
  ['History', 'Integrated Review', 'End-of-year B5 history review'],
];

const b6Term1: TopicTuple[] = [
  ['Europeans in Ghana', 'Impact of European Presence', 'Political, social and economic impact of Europeans in Ghana'],
  ['Europeans in Ghana', 'Impact of European Presence', 'Positive and negative effects of European presence'],
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Political Developments Under Colonial Rule', 'Colonial government and constitutions'],
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Political Developments Under Colonial Rule', 'Representation and political participation under colonial rule'],
  ['Journey to Independence', 'Formation of Political Parties', 'Political parties in the Gold Coast'],
  ['Journey to Independence', 'Formation of Political Parties', 'Differences among early political parties'],
  ['Journey to Independence', 'Ghana Gains Independence', 'Steps toward independence in 1957'],
  ['Journey to Independence', 'Ghana Gains Independence', 'Meaning and significance of independence'],
  ['Independent Ghana', 'The Republics', 'The First Republic and its features'],
  ['Independent Ghana', 'The Republics', 'Changes across later republics'],
  ['Independent Ghana', 'Military Rule', 'Meaning of military rule and periods in Ghana'],
  ['History', 'Review', 'Review of European impact, independence and republics'],
];

const b6Term2: TopicTuple[] = [
  ['Colonisation and Developments under Colonial Rule in Ghana', 'Political Developments Under Colonial Rule', 'Nationalist politics and constitutional change'],
  ['Journey to Independence', 'Formation of Political Parties', 'Roles of political leaders and parties'],
  ['Journey to Independence', 'Ghana Gains Independence', 'The celebration and challenges of independence'],
  ['Independent Ghana', 'The Republics', 'The Second, Third and Fourth Republics'],
  ['Independent Ghana', 'The Republics', 'Achievements and challenges of republican rule'],
  ['Independent Ghana', 'Military Rule', 'Military interventions in Ghanaian politics'],
  ['Independent Ghana', 'Military Rule', 'Effects of military rule on governance'],
  ['History', 'Project Work', 'Timeline from colonial rule to the Fourth Republic'],
  ['History', 'Review', 'Review of political change in Ghana'],
  ['History', 'Practical Activities', 'Constitution and leadership source activities'],
  ['History', 'Review', 'B6 midyear history recap'],
  ['History', 'Integrated Review', 'Integrated B6 history consolidation'],
];

const b6Term3: TopicTuple[] = [
  ['Journey to Independence', 'Formation of Political Parties', 'Comparing political parties and their goals'],
  ['Journey to Independence', 'Ghana Gains Independence', 'Independence and nation building'],
  ['Independent Ghana', 'The Republics', 'Citizenship under constitutional rule'],
  ['Independent Ghana', 'The Republics', 'Democracy and participation in the Fourth Republic'],
  ['Independent Ghana', 'Military Rule', 'Lessons from military rule in Ghana'],
  ['History as a Subject', 'Why and How We Study History', 'Why studying history matters for citizenship'],
  ['History', 'Timeline Skills', 'Sequencing major events in Ghana history from early contact to the present'],
  ['History', 'Review', 'Review of independence and post-independence Ghana'],
  ['History', 'Project Work', 'Historical presentation on Ghana’s political development'],
  ['History', 'Practical Activities', 'Source analysis and debate on leadership'],
  ['History', 'Transition to JHS', 'Consolidating historical thinking and national history knowledge'],
  ['History', 'Integrated Review', 'End-of-year B6 history review'],
];

export const primaryHistoryTerms: ExplicitCurriculumTerm[] = [
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
