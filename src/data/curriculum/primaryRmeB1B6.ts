import type { ClassLevel } from '@/types/lessonPlan';
import type { SchemeWeek } from '@/types/scheme';
import type { ExplicitCurriculumTerm } from './mathematicsB7';

type TopicTuple = [strand: string, subStrand: string, topic: string];

const resourcesByStrand = {
  'God, His Creation and Attributes': ['RME textbook', 'Bible', "Qur'an", 'Nature observation notes'],
  'Religious Practices and Their Moral Implications': ['RME textbook', 'Prayer guide', 'Festival pictures', 'Songbook'],
  'Religious Leaders': ['RME textbook', 'Story cards', 'Biographies', 'Charts'],
  'The Family and the Community': ['RME textbook', 'Role-play cards', 'Case studies', 'Community stories'],
  'The Family, Authority and Obedience': ['RME textbook', 'Value cards', 'Scenario cards', 'Posters'],
  'The Family and Commitment': ['RME textbook', 'Value cards', 'Family case studies', 'Story cards'],
} as const;

function makeWeek(
  classLevel: ClassLevel,
  week: number,
  strand: TopicTuple[0],
  subStrand: TopicTuple[1],
  topic: TopicTuple[2]
): SchemeWeek {
  const resources = resourcesByStrand[strand as keyof typeof resourcesByStrand] ?? [
    'RME textbook',
  ];

  return {
    week,
    strand,
    subStrand,
    topic,
    contentStandard: `${classLevel} ${strand}: Demonstrate understanding of ${subStrand.toLowerCase()} and show its value in daily life.`,
    indicator: `Discuss and apply ideas about ${topic.toLowerCase()} through stories, discussion and practical activities.`,
    resources: [...resources],
  };
}

function buildTerm(
  classLevel: ClassLevel,
  term: string,
  topics: TopicTuple[]
): ExplicitCurriculumTerm {
  return {
    subject: 'RME',
    classLevel,
    term,
    title: `${classLevel} RME Scheme of Work - ${term}`,
    weeks: topics.map((item, index) =>
      makeWeek(classLevel, index + 1, item[0], item[1], item[2])
    ),
  };
}

const b1Term1: TopicTuple[] = [
  ['God, His Creation and Attributes', 'God the Creator', 'God as creator of the world'],
  ['God, His Creation and Attributes', 'God the Creator', 'Things God created in nature'],
  ['God, His Creation and Attributes', 'God the Creator', 'Caring for God’s creation'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'Meaning of worship'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'Simple acts of worship at home and school'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'Respectful behaviour during worship'],
  ['Religious Practices and Their Moral Implications', 'Religious Festivals in the Three Major Religions in Ghana', 'What a religious festival is'],
  ['Religious Practices and Their Moral Implications', 'Religious Festivals in the Three Major Religions in Ghana', 'Examples of festivals in Christianity, Islam and Indigenous Religion'],
  ['Religious Practices and Their Moral Implications', 'Religious Festivals in the Three Major Religions in Ghana', 'Moral lessons from religious festivals'],
  ['Religious Leaders', 'Birth of the Leaders of the Three Major Religions in Ghana', 'Important religious leaders we learn about'],
  ['Religious Leaders', 'Birth of the Leaders of the Three Major Religions in Ghana', 'Stories about the birth of religious leaders'],
  ['Religious Leaders', 'Birth of the Leaders of the Three Major Religions in Ghana', 'Qualities admired in religious leaders'],
];

const b1Term2: TopicTuple[] = [
  ['The Family and the Community', 'Roles and Relationships', 'Meaning of family and community'],
  ['The Family and the Community', 'Roles and Relationships', 'Members of the family and what they do'],
  ['The Family and the Community', 'Roles and Relationships', 'Relationships among parents, children and relatives'],
  ['The Family and the Community', 'Roles and Relationships', 'Helping one another at home and school'],
  ['The Family and the Community', 'Roles and Relationships', 'Love, sharing and respect in the family'],
  ['The Family and the Community', 'Roles and Relationships', 'Living peacefully with neighbours'],
  ['God, His Creation and Attributes', 'God the Creator', 'Thanking God for life and the environment'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'Songs, prayer and thanksgiving'],
  ['Religious Leaders', 'Birth of the Leaders of the Three Major Religions in Ghana', 'Good examples from the lives of leaders'],
  ['The Family and the Community', 'Roles and Relationships', 'Solving simple misunderstandings peacefully'],
  ['The Family and the Community', 'Project Work', 'Family values poster or role play'],
  ['RME', 'Integrated Review', 'Integrated B1 RME consolidation'],
];

const b1Term3: TopicTuple[] = [
  ['The Family and the Community', 'Roles and Relationships', 'Kindness and obedience at home'],
  ['The Family and the Community', 'Roles and Relationships', 'Showing respect to elders and visitors'],
  ['The Family and the Community', 'Roles and Relationships', 'Working together in class and community'],
  ['God, His Creation and Attributes', 'God the Creator', 'Stewardship of plants, animals and people'],
  ['Religious Practices and Their Moral Implications', 'Religious Festivals in the Three Major Religions in Ghana', 'Celebrating special days respectfully'],
  ['Religious Leaders', 'Birth of the Leaders of the Three Major Religions in Ghana', 'Review of stories of religious leaders'],
  ['The Family and the Community', 'Roles and Relationships', 'Good manners in the home and school'],
  ['The Family and the Community', 'Roles and Relationships', 'Friendship and helping others'],
  ['RME', 'Practical Activities', 'Simple worship songs, greetings and storytelling'],
  ['RME', 'Review', 'Review of family and community values'],
  ['RME', 'Project Work', 'Class display on good behaviour and family roles'],
  ['RME', 'Integrated Review', 'End-of-year B1 RME review'],
];

const b2Term1: TopicTuple[] = [
  ['God, His Creation and Attributes', 'God the Creator', 'God as creator and sustainer'],
  ['God, His Creation and Attributes', 'The Environment', 'Identifying parts of the environment'],
  ['God, His Creation and Attributes', 'The Environment', 'Caring for the natural environment'],
  ['God, His Creation and Attributes', 'Purpose of God’s Creation', 'Why God created people, animals and plants'],
  ['God, His Creation and Attributes', 'Purpose of God’s Creation', 'Using God’s gifts responsibly'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'Prayer, singing and thanksgiving in worship'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'Places of worship and respectful conduct'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Meaning and importance of festivals'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Festival practices and values'],
  ['Religious Leaders', 'Early Life of the Leaders of the Three Major Religions', 'Childhood stories of religious leaders'],
  ['Religious Leaders', 'Early Life of the Leaders of the Three Major Religions', 'Lessons from the early lives of leaders'],
  ['RME', 'Review', 'Review of God, creation and worship'],
];

const b2Term2: TopicTuple[] = [
  ['The Family and the Community', 'Roles and Relationships', 'Family roles and responsibilities'],
  ['The Family and the Community', 'Roles and Relationships', 'Cooperation in the family'],
  ['The Family and the Community', 'Personal Safety in the Community', 'Safe and unsafe situations in the community'],
  ['The Family and the Community', 'Personal Safety in the Community', 'People who help keep children safe'],
  ['The Family and the Community', 'Personal Safety in the Community', 'Basic rules for personal safety'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'Moral lessons from worship'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Respecting the celebrations of others'],
  ['Religious Leaders', 'Early Life of the Leaders of the Three Major Religions', 'Obedience and humility in the lives of leaders'],
  ['God, His Creation and Attributes', 'The Environment', 'Keeping the environment clean as a moral duty'],
  ['The Family and the Community', 'Roles and Relationships', 'Respect and care for neighbours'],
  ['The Family and the Community', 'Project Work', 'Poster or role play on personal safety'],
  ['RME', 'Integrated Review', 'Integrated B2 RME consolidation'],
];

const b2Term3: TopicTuple[] = [
  ['The Family and the Community', 'Roles and Relationships', 'Showing love and concern for others'],
  ['The Family and the Community', 'Personal Safety in the Community', 'Responding wisely to strangers and danger'],
  ['God, His Creation and Attributes', 'Purpose of God’s Creation', 'Using talents and gifts well'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Values of sharing, peace and gratitude'],
  ['Religious Leaders', 'Early Life of the Leaders of the Three Major Religions', 'Imitating good conduct from leaders'],
  ['The Family and the Community', 'Roles and Relationships', 'Peaceful living in school and community'],
  ['RME', 'Practical Activities', 'Storytelling, songs and simple recitations'],
  ['RME', 'Review', 'Review of safety, worship and family life'],
  ['RME', 'Project Work', 'Class chart on family and community values'],
  ['RME', 'Review', 'Review of major themes in B2'],
  ['RME', 'Practical Activities', 'Simple moral scenarios and discussion'],
  ['RME', 'Integrated Review', 'End-of-year B2 RME review'],
];

const b3Term1: TopicTuple[] = [
  ['God, His Creation and Attributes', 'God the Creator', 'God as creator and provider'],
  ['God, His Creation and Attributes', 'The Environment', 'Humans as caretakers of the environment'],
  ['God, His Creation and Attributes', 'The Environment', 'Consequences of harming the environment'],
  ['God, His Creation and Attributes', 'The Purpose of God’s Creation', 'Purpose of human life and creation'],
  ['God, His Creation and Attributes', 'The Purpose of God’s Creation', 'Using creation wisely and gratefully'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'Forms and meaning of worship'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'How worship builds moral behaviour'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Major festivals and their messages'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Tolerance during religious celebrations'],
  ['Religious Leaders', 'Early Life of the Leaders of the Three Major Religions', 'Childhood and upbringing of religious leaders'],
  ['Religious Leaders', 'Early Life of the Leaders of the Three Major Religions', 'Qualities shown by religious leaders in youth'],
  ['RME', 'Review', 'Review of creation, worship and leaders'],
];

const b3Term2: TopicTuple[] = [
  ['The Family and the Community', 'Roles and Relationships', 'Duties of family members'],
  ['The Family and the Community', 'Roles and Relationships', 'Respect and cooperation in the family'],
  ['The Family and the Community', 'Personal Safety in the Community', 'Keeping safe at home, on the road and in school'],
  ['The Family and the Community', 'Personal Safety in the Community', 'Reporting danger to trusted adults'],
  ['The Family and the Community', 'Personal Safety in the Community', 'Good touch, bad touch and seeking help'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'Prayer and devotion in daily life'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Using festivals to promote unity'],
  ['Religious Leaders', 'Early Life of the Leaders of the Three Major Religions', 'Life lessons from religious leaders'],
  ['God, His Creation and Attributes', 'The Environment', 'Environmental care as a religious value'],
  ['The Family and the Community', 'Roles and Relationships', 'Friendship and good neighbourliness'],
  ['The Family and the Community', 'Project Work', 'Personal safety project or poster'],
  ['RME', 'Integrated Review', 'Integrated B3 RME consolidation'],
];

const b3Term3: TopicTuple[] = [
  ['The Family and the Community', 'Roles and Relationships', 'Commitment to family duties'],
  ['The Family and the Community', 'Personal Safety in the Community', 'Wise choices in the community'],
  ['God, His Creation and Attributes', 'The Purpose of God’s Creation', 'Using one’s abilities for good'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Values of gratitude, peace and service'],
  ['Religious Leaders', 'Early Life of the Leaders of the Three Major Religions', 'Review of leaders and their virtues'],
  ['The Family and the Community', 'Roles and Relationships', 'Promoting peace in the community'],
  ['RME', 'Practical Activities', 'Storytelling, drama and memory work'],
  ['RME', 'Review', 'Review of safety, values and relationships'],
  ['RME', 'Project Work', 'Community values group activity'],
  ['RME', 'Review', 'Review of major B3 strands'],
  ['RME', 'Practical Activities', 'Scenario discussion and role play'],
  ['RME', 'Integrated Review', 'End-of-year B3 RME review'],
];

const b4Term1: TopicTuple[] = [
  ['God, His Creation and Attributes', 'God the Creator', 'Attributes of God in the major religions'],
  ['God, His Creation and Attributes', 'God the Creator', 'God’s love, power and care for creation'],
  ['God, His Creation and Attributes', 'The Environment', 'Environmental stewardship and responsibility'],
  ['God, His Creation and Attributes', 'The Environment', 'Consequences of misuse of the environment'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship, Prayer and other Religious Practices', 'Meaning and forms of prayer'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship, Prayer and other Religious Practices', 'Personal and communal worship'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship, Prayer and other Religious Practices', 'Moral values gained from prayer and worship'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Religious festivals and their significance'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Preparation and celebration of festivals'],
  ['Religious Leaders', 'Religious Leaders', 'Examples of courage and service from religious leaders'],
  ['Religious Leaders', 'Religious Leaders', 'Why religious leaders are respected'],
  ['RME', 'Review', 'Review of God, worship and leaders'],
];

const b4Term2: TopicTuple[] = [
  ['The Family and the Community', 'The Family and Community', 'Importance of the family in society'],
  ['The Family and the Community', 'The Family and Community', 'Responsibilities of family members'],
  ['The Family and the Community', 'The Family and Community', 'Peaceful relationships in the community'],
  ['The Family and the Community', 'The Family and Community', 'Community values and support systems'],
  ['The Family, Authority and Obedience', 'Authority and Obedience', 'Meaning of authority and obedience'],
  ['The Family, Authority and Obedience', 'Authority and Obedience', 'Sources of authority at home, school and community'],
  ['The Family, Authority and Obedience', 'Authority and Obedience', 'Benefits of obedience'],
  ['The Family, Authority and Obedience', 'Authority and Obedience', 'Consequences of disobedience'],
  ['The Family, Authority and Obedience', 'Roles, Relationships in the Family and Character Formation', 'Good character in the family'],
  ['The Family, Authority and Obedience', 'Roles, Relationships in the Family and Character Formation', 'Respectful relationships in the family'],
  ['The Family, Authority and Obedience', 'Roles, Relationships in the Family and Character Formation', 'Truthfulness, humility and self-control'],
  ['RME', 'Integrated Review', 'Integrated B4 RME consolidation'],
];

const b4Term3: TopicTuple[] = [
  ['The Family, Authority and Obedience', 'Roles, Relationships in the Family and Character Formation', 'Character formation through good habits'],
  ['The Family, Authority and Obedience', 'Roles, Relationships in the Family and Character Formation', 'Developing responsibility and self-discipline'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship, Prayer and other Religious Practices', 'Review of worship and prayer life'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Moral lessons from festivals'],
  ['God, His Creation and Attributes', 'The Environment', 'Protecting the environment as a duty to God'],
  ['Religious Leaders', 'Religious Leaders', 'Applying examples from religious leaders to daily life'],
  ['The Family and the Community', 'The Family and Community', 'Conflict resolution in family and community'],
  ['The Family, Authority and Obedience', 'Authority and Obedience', 'Balanced obedience and wise decision-making'],
  ['RME', 'Practical Activities', 'Role play, songs and scripture-based discussion'],
  ['RME', 'Project Work', 'Poster on authority, obedience and good character'],
  ['RME', 'Review', 'Review of family, community and authority themes'],
  ['RME', 'Integrated Review', 'End-of-year B4 RME review'],
];

const b5Term1: TopicTuple[] = [
  ['God, His Creation and Attributes', 'God the Creator', 'God’s greatness and care for creation'],
  ['God, His Creation and Attributes', 'God the Creator', 'Human responsibilities toward God’s creation'],
  ['God, His Creation and Attributes', 'The Environment', 'The environment as a gift to be protected'],
  ['God, His Creation and Attributes', 'The Environment', 'Environmental misuse and moral responsibility'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'Ways worship is expressed in the major religions'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'Values learned from worship'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Meaning and observance of festivals'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Using festivals to promote peace and unity'],
  ['Religious Leaders', 'Ministry of the Leaders of the Three Major Religions in Ghana', 'Important works of religious leaders'],
  ['Religious Leaders', 'Ministry of the Leaders of the Three Major Religions in Ghana', 'Moral lessons from the ministry of leaders'],
  ['RME', 'Review', 'Review of creation, worship and ministry of leaders'],
  ['RME', 'Practical Activities', 'Discussion and recitation activities'],
];

const b5Term2: TopicTuple[] = [
  ['The Family and Commitment', 'The Family and Commitment', 'Meaning of commitment in family life'],
  ['The Family and Commitment', 'The Family and Commitment', 'Commitment to family responsibilities'],
  ['The Family and Commitment', 'The Family and Commitment', 'Loyalty, honesty and sacrifice in the family'],
  ['The Family and Commitment', 'The Family and Commitment', 'Faithfulness in relationships'],
  ['The Family, Authority and Obedience', 'Authority and Obedience', 'Authority in home, school and society'],
  ['The Family, Authority and Obedience', 'Authority and Obedience', 'Rights and duties under authority'],
  ['The Family, Authority and Obedience', 'Authority and Obedience', 'Importance of obedience and self-discipline'],
  ['The Family, Authority and Obedience', 'Roles, Relationships in the Family and Character Formation', 'Character traits that strengthen the family'],
  ['The Family, Authority and Obedience', 'Roles, Relationships in the Family and Character Formation', 'Respectful communication in the family'],
  ['The Family, Authority and Obedience', 'Roles, Relationships in the Family and Character Formation', 'Managing peer influence and making moral choices'],
  ['RME', 'Project Work', 'Group work on commitment and obedience'],
  ['RME', 'Integrated Review', 'Integrated B5 RME consolidation'],
];

const b5Term3: TopicTuple[] = [
  ['The Family and Commitment', 'The Family and Commitment', 'Keeping promises and commitments'],
  ['The Family and Commitment', 'The Family and Commitment', 'Supporting family members in times of need'],
  ['Religious Leaders', 'Ministry of the Leaders of the Three Major Religions in Ghana', 'Examples of service and sacrifice'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Celebrating with tolerance and respect'],
  ['God, His Creation and Attributes', 'The Environment', 'Protecting community resources'],
  ['The Family, Authority and Obedience', 'Authority and Obedience', 'Responsible freedom and obedience'],
  ['The Family, Authority and Obedience', 'Roles, Relationships in the Family and Character Formation', 'Perseverance, truthfulness and humility'],
  ['The Family and Commitment', 'The Family and Commitment', 'Commitment to school and community growth'],
  ['RME', 'Practical Activities', 'Role play and case-study discussion'],
  ['RME', 'Review', 'Review of commitment, authority and worship'],
  ['RME', 'Project Work', 'Class charter on family values'],
  ['RME', 'Integrated Review', 'End-of-year B5 RME review'],
];

const b6Term1: TopicTuple[] = [
  ['God, His Creation and Attributes', 'God the Creator', 'Attributes of God and reverence for God'],
  ['God, His Creation and Attributes', 'God the Creator', 'Human dependence on God'],
  ['God, His Creation and Attributes', 'The Environment', 'Moral duty to preserve the environment'],
  ['God, His Creation and Attributes', 'The Environment', 'Consequences of abusing the environment'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'Meaning, forms and importance of worship'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'Prayer, devotion and moral discipline'],
  ['Religious Practices and Their Moral Implications', 'Religious Worship in the Three Major Religions in Ghana', 'Respect for diverse worship practices'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Major festivals and their moral teachings'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Festivals as times of reflection, sharing and peace'],
  ['Religious Leaders', 'Ministry and Latter Lives of Leaders of the Three Major Religions in Ghana', 'Ministry and mission of religious leaders'],
  ['Religious Leaders', 'Ministry and Latter Lives of Leaders of the Three Major Religions in Ghana', 'Enduring legacies of religious leaders'],
  ['RME', 'Review', 'Review of God, worship and leaders'],
];

const b6Term2: TopicTuple[] = [
  ['The Family and the Community', 'The Family and Community', 'Importance of strong families and communities'],
  ['The Family and the Community', 'The Family and Community', 'Responsibilities toward family and community development'],
  ['The Family and the Community', 'The Family and Community', 'Peace-building and cooperation in the community'],
  ['The Family, Authority and Obedience', 'Authority and Obedience', 'Authority, law and order in society'],
  ['The Family, Authority and Obedience', 'Authority and Obedience', 'Responsible obedience and respect for rules'],
  ['The Family, Authority and Obedience', 'Authority and Obedience', 'Consequences of rebellion and indiscipline'],
  ['The Family, Authority and Obedience', 'Roles, Relationships in the Family and Character Formation', 'Healthy relationships and strong character'],
  ['The Family, Authority and Obedience', 'Roles, Relationships in the Family and Character Formation', 'Leadership qualities in the family and school'],
  ['The Family, Authority and Obedience', 'Roles, Relationships in the Family and Character Formation', 'Integrity, honesty and accountability'],
  ['Religious Leaders', 'Ministry and Latter Lives of Leaders of the Three Major Religions in Ghana', 'Leadership lessons from religious leaders'],
  ['RME', 'Project Work', 'Community values or leadership project'],
  ['RME', 'Integrated Review', 'Integrated B6 RME consolidation'],
];

const b6Term3: TopicTuple[] = [
  ['The Family and the Community', 'The Family and Community', 'Commitment to community service'],
  ['The Family and the Community', 'The Family and Community', 'Resolving conflict peacefully in family and community'],
  ['The Family, Authority and Obedience', 'Roles, Relationships in the Family and Character Formation', 'Moral courage and responsible decision-making'],
  ['The Family, Authority and Obedience', 'Roles, Relationships in the Family and Character Formation', 'Character formation for adolescence and leadership'],
  ['Religious Practices and Their Moral Implications', 'Festivals in the Three Major Religions', 'Tolerance and coexistence in a diverse society'],
  ['God, His Creation and Attributes', 'The Environment', 'Environmental care as service to God and society'],
  ['Religious Leaders', 'Ministry and Latter Lives of Leaders of the Three Major Religions in Ghana', 'Applying leadership lessons to daily life'],
  ['The Family, Authority and Obedience', 'Authority and Obedience', 'Review of authority, obedience and self-discipline'],
  ['RME', 'Practical Activities', 'Debate, role play and case-study discussion'],
  ['RME', 'Review', 'Review of family, authority and worship themes'],
  ['RME', 'Transition to JHS', 'Upper primary moral and religious readiness for JHS'],
  ['RME', 'Integrated Review', 'End-of-year B6 RME review'],
];

export const primaryRmeTerms: ExplicitCurriculumTerm[] = [
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
