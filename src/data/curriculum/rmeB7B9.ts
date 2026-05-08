import type { ExplicitCurriculumTerm } from './mathematicsB7';

const resources = {
  scriptures: ['RME textbook', 'Bible', "Qur'an", 'Oral tradition notes'],
  worship: ['RME textbook', 'Songbook', 'Prayer guide', 'Charts'],
  family: ['RME textbook', 'Case studies', 'Role-play cards', 'Community stories'],
  leadership: ['RME textbook', 'Biographies', 'Story cards', 'Posters'],
  ethics: ['RME textbook', 'Value cards', 'Scenario cards', 'Charts'],
  economic: ['RME textbook', 'Budget sheets', 'Newspaper cuttings', 'Community resource persons'],
};

function week(
  weekNumber: number,
  strand: string,
  subStrand: string,
  contentStandard: string,
  indicator: string,
  topic: string,
  resourceList: string[]
) {
  return {
    week: weekNumber,
    strand,
    subStrand,
    contentStandard,
    indicator,
    topic,
    resources: resourceList,
  };
}

export const rmeB7Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'RME',
    classLevel: 'B7',
    term: 'Term 1',
    title: 'B7 RME Scheme of Work - Term 1',
    weeks: [
      week(
        1,
        'God, His Creation and Attributes',
        'God, His Nature and Attributes',
        'B7/JHS1 1.1.1 Describe the nature and attributes of God in the three major religions in Ghana.',
        'Identify the names and attributes of God in Christianity, Islam and Indigenous African Religion.',
        'Names and attributes of God',
        resources.scriptures
      ),
      week(
        2,
        'God, His Creation and Attributes',
        'God, His Nature and Attributes',
        'B7/JHS1 1.1.1 Describe the nature and attributes of God in the three major religions in Ghana.',
        'Explain the uniqueness and greatness of God as understood in the three major religions.',
        'The uniqueness and greatness of God',
        resources.scriptures
      ),
      week(
        3,
        'God, His Creation and Attributes',
        'God, His Nature and Attributes',
        'B7/JHS1 1.1.1 Describe the nature and attributes of God in the three major religions in Ghana.',
        'Relate the knowledge of God’s attributes to moral living and responsible behaviour.',
        'Applying knowledge of God’s attributes to daily life',
        resources.scriptures
      ),
      week(
        4,
        'Religious Practices',
        'Worship',
        'B7/JHS1 2.1.1 Explain how worship is performed in the three major religions in Ghana and apply the moral lessons in worship in daily life.',
        'Explain the meaning and purpose of worship in the three major religions.',
        'Meaning and purpose of worship',
        resources.worship
      ),
      week(
        5,
        'Religious Practices',
        'Worship',
        'B7/JHS1 2.1.1 Explain how worship is performed in the three major religions in Ghana and apply the moral lessons in worship in daily life.',
        'Identify acts of worship in Christianity, Islam and Indigenous African Religion.',
        'Acts of worship in the three major religions',
        resources.worship
      ),
      week(
        6,
        'Religious Practices',
        'Worship',
        'B7/JHS1 2.1.1 Explain how worship is performed in the three major religions in Ghana and apply the moral lessons in worship in daily life.',
        'Describe the modes and procedures of worship in the three major religions.',
        'Modes of worship in the three major religions',
        resources.worship
      ),
      week(
        7,
        'Religious Practices',
        'Worship',
        'B7/JHS1 2.1.1 Explain how worship is performed in the three major religions in Ghana and apply the moral lessons in worship in daily life.',
        'Identify the moral lessons from worship and show how they apply to life.',
        'Moral lessons from worship',
        resources.worship
      ),
      week(
        8,
        'Religious Practices',
        'Religious Songs and Recitations',
        'B7/JHS1 2.2.1 Analyse and apply the moral values in religious songs and recitations.',
        'Differentiate between religious songs and non-religious songs.',
        'Religious songs and non-religious songs',
        resources.worship
      ),
      week(
        9,
        'Religious Practices',
        'Religious Songs and Recitations',
        'B7/JHS1 2.2.1 Analyse and apply the moral values in religious songs and recitations.',
        'Identify the characteristics and purposes of religious songs.',
        'Characteristics and purposes of religious songs',
        resources.worship
      ),
      week(
        10,
        'Religious Practices',
        'Religious Songs and Recitations',
        'B7/JHS1 2.2.1 Analyse and apply the moral values in religious songs and recitations.',
        'Examine messages conveyed through songs and recitations in the three major religions.',
        'Messages in religious songs and recitations',
        resources.worship
      ),
      week(
        11,
        'Religious Practices',
        'Religious Songs and Recitations',
        'B7/JHS1 2.2.1 Analyse and apply the moral values in religious songs and recitations.',
        'Demonstrate how to compose or perform simple religious songs and recitations.',
        'Composing and performing religious songs',
        resources.worship
      ),
      week(
        12,
        'Religious Practices',
        'Religious Songs and Recitations',
        'B7/JHS1 2.2.1 Analyse and apply the moral values in religious songs and recitations.',
        'Apply the moral values in religious songs and recitations to everyday conduct.',
        'Moral values from songs and recitations',
        resources.worship
      ),
    ],
  },
  {
    subject: 'RME',
    classLevel: 'B7',
    term: 'Term 2',
    title: 'B7 RME Scheme of Work - Term 2',
    weeks: [
      week(
        1,
        'The Family and the Community',
        'Family Systems',
        'B7/JHS1 3.1.1 Identify and explain the importance of family systems.',
        'Identify the meaning and types of family systems.',
        'Meaning and types of family systems',
        resources.family
      ),
      week(
        2,
        'The Family and the Community',
        'Family Systems',
        'B7/JHS1 3.1.1 Identify and explain the importance of family systems.',
        'Compare the nuclear and extended family systems.',
        'Nuclear and extended family systems',
        resources.family
      ),
      week(
        3,
        'The Family and the Community',
        'Family Systems',
        'B7/JHS1 3.1.1 Identify and explain the importance of family systems.',
        'Explain the importance and functions of the family.',
        'Importance and functions of the family',
        resources.family
      ),
      week(
        4,
        'The Family and the Community',
        'Family Systems',
        'B7/JHS1 3.1.1 Identify and explain the importance of family systems.',
        'State the merits and demerits of the nuclear family system.',
        'Merits and demerits of the nuclear family',
        resources.family
      ),
      week(
        5,
        'The Family and the Community',
        'Family Systems',
        'B7/JHS1 3.1.1 Identify and explain the importance of family systems.',
        'State the merits and demerits of the extended family system.',
        'Merits and demerits of the extended family',
        resources.family
      ),
      week(
        6,
        'The Family and the Community',
        'Family Systems',
        'B7/JHS1 3.1.1 Identify and explain the importance of family systems.',
        'Identify the roles of children, parents and grandparents in the family.',
        'Roles of family members',
        resources.family
      ),
      week(
        7,
        'The Family and the Community',
        'Family Systems',
        'B7/JHS1 3.1.1 Identify and explain the importance of family systems.',
        'Demonstrate values needed for healthy family living.',
        'Values for healthy family living',
        resources.family
      ),
      week(
        8,
        'Religious Leaders and Personalities',
        'Religious Leaders',
        'B7/JHS1 4.1.1 Identify the key features and moral messages of the call and ministry of religious leaders in the three major religions.',
        'Identify selected religious leaders and describe their call.',
        'Call of selected religious leaders',
        resources.leadership
      ),
      week(
        9,
        'Religious Leaders and Personalities',
        'Religious Leaders',
        'B7/JHS1 4.1.1 Identify the key features and moral messages of the call and ministry of religious leaders in the three major religions.',
        'Describe the ministries of Jesus Christ, Prophet Muhammad and selected indigenous religious leaders.',
        'Ministry of religious leaders',
        resources.leadership
      ),
      week(
        10,
        'Religious Leaders and Personalities',
        'Religious Leaders',
        'B7/JHS1 4.1.1 Identify the key features and moral messages of the call and ministry of religious leaders in the three major religions.',
        'Summarise key events in the lives of the selected religious leaders.',
        'Key events in the lives of religious leaders',
        resources.leadership
      ),
      week(
        11,
        'Religious Leaders and Personalities',
        'Religious Leaders',
        'B7/JHS1 4.1.1 Identify the key features and moral messages of the call and ministry of religious leaders in the three major religions.',
        'Discuss the moral lessons from the exemplary lives of religious leaders.',
        'Moral lessons from religious leaders',
        resources.leadership
      ),
      week(
        12,
        'Religious Leaders and Personalities',
        'Religious Leaders',
        'B7/JHS1 4.1.1 Identify the key features and moral messages of the call and ministry of religious leaders in the three major religions.',
        'Demonstrate how to apply lessons from religious leaders to daily life.',
        'Applying lessons from religious leaders',
        resources.leadership
      ),
    ],
  },
  {
    subject: 'RME',
    classLevel: 'B7',
    term: 'Term 3',
    title: 'B7 RME Scheme of Work - Term 3',
    weeks: [
      week(
        1,
        'Ethics and Moral Life',
        'Manners and Decency',
        'B7/JHS1 5.1.1 Demonstrate understanding of manners and decency in the home, school and community.',
        'Explain the meaning of manners and decency.',
        'Meaning of manners and decency',
        resources.ethics
      ),
      week(
        2,
        'Ethics and Moral Life',
        'Manners and Decency',
        'B7/JHS1 5.1.1 Demonstrate understanding of manners and decency in the home, school and community.',
        'Identify acceptable and unacceptable behaviours at home and in school.',
        'Acceptable and unacceptable behaviours',
        resources.ethics
      ),
      week(
        3,
        'Ethics and Moral Life',
        'Manners and Decency',
        'B7/JHS1 5.1.1 Demonstrate understanding of manners and decency in the home, school and community.',
        'Show proper manners in speech, dressing and interaction with others.',
        'Proper manners in speech, dressing and conduct',
        resources.ethics
      ),
      week(
        4,
        'Ethics and Moral Life',
        'Manners and Decency',
        'B7/JHS1 5.1.1 Demonstrate understanding of manners and decency in the home, school and community.',
        'Discuss the importance of decent behaviour in society.',
        'Importance of decent behaviour',
        resources.ethics
      ),
      week(
        5,
        'Ethics and Moral Life',
        'Manners and Decency',
        'B7/JHS1 5.1.1 Demonstrate understanding of manners and decency in the home, school and community.',
        'Demonstrate respectful behaviour in practical situations.',
        'Practising manners and decency',
        resources.ethics
      ),
      week(
        6,
        'Ethics and Moral Life',
        'Substance Abuse',
        'B7/JHS1 5.2.1 Explain the dangers of substance abuse and ways of avoiding it.',
        'Explain the meaning of substance abuse and identify common abused substances.',
        'Meaning of substance abuse and common substances',
        resources.ethics
      ),
      week(
        7,
        'Ethics and Moral Life',
        'Substance Abuse',
        'B7/JHS1 5.2.1 Explain the dangers of substance abuse and ways of avoiding it.',
        'Discuss the causes of substance abuse among young people.',
        'Causes of substance abuse',
        resources.ethics
      ),
      week(
        8,
        'Ethics and Moral Life',
        'Substance Abuse',
        'B7/JHS1 5.2.1 Explain the dangers of substance abuse and ways of avoiding it.',
        'Explain the effects of substance abuse on the individual, family and society.',
        'Effects of substance abuse',
        resources.ethics
      ),
      week(
        9,
        'Religion and Economic Life',
        'Work, Entrepreneurship and Social Security',
        'B7/JHS1 6.1.1 Cultivate the need for hard work and develop the spirit of entrepreneurship.',
        'Explain the value of work and hard work in the three major religions.',
        'The value of hard work',
        resources.economic
      ),
      week(
        10,
        'Religion and Economic Life',
        'Work, Entrepreneurship and Social Security',
        'B7/JHS1 6.1.1 Cultivate the need for hard work and develop the spirit of entrepreneurship.',
        'Describe qualities of an entrepreneur and steps to becoming one.',
        'Qualities of an entrepreneur',
        resources.economic
      ),
      week(
        11,
        'Religion and Economic Life',
        'Work, Entrepreneurship and Social Security',
        'B7/JHS1 6.1.1 Cultivate the need for hard work and develop the spirit of entrepreneurship.',
        'Discuss the importance of saving and planning for the future.',
        'Saving and planning for the future',
        resources.economic
      ),
      week(
        12,
        'Religion and Economic Life',
        'Work, Entrepreneurship and Social Security',
        'B7/JHS1 6.1.1 Cultivate the need for hard work and develop the spirit of entrepreneurship.',
        'Relate hard work, entrepreneurship and social responsibility to everyday life.',
        'Hard work, entrepreneurship and social responsibility',
        resources.economic
      ),
    ],
  },
];

export const rmeB8Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'RME',
    classLevel: 'B8',
    term: 'Term 1',
    title: 'B8 RME Scheme of Work - Term 1',
    weeks: [
      week(
        1,
        'God, His Creation and Attributes',
        'The Creation Stories of the Three Major Religions in Ghana',
        'B8/JHS2 1.1.1 Explain the creation stories of the three major religions in Ghana.',
        'Recount the creation stories in Christianity, Islam and Indigenous African Religion.',
        'Creation stories in the three major religions',
        resources.scriptures
      ),
      week(
        2,
        'God, His Creation and Attributes',
        'The Creation Stories of the Three Major Religions in Ghana',
        'B8/JHS2 1.1.1 Explain the creation stories of the three major religions in Ghana.',
        'Compare the similarities and differences in the creation stories.',
        'Comparing creation stories',
        resources.scriptures
      ),
      week(
        3,
        'God, His Creation and Attributes',
        'The Creation Stories of the Three Major Religions in Ghana',
        'B8/JHS2 1.1.1 Explain the creation stories of the three major religions in Ghana.',
        'Identify moral and spiritual lessons from the creation stories.',
        'Moral lessons from creation stories',
        resources.scriptures
      ),
      week(
        4,
        'Religious Practices',
        'Rites of Passage',
        'B8/JHS2 2.1.1 Explain rites of passage and identify the moral lessons in them.',
        'Explain the meaning of rites of passage and their importance.',
        'Meaning and importance of rites of passage',
        resources.worship
      ),
      week(
        5,
        'Religious Practices',
        'Rites of Passage',
        'B8/JHS2 2.1.1 Explain rites of passage and identify the moral lessons in them.',
        'Describe naming ceremonies in the three major religions.',
        'Naming ceremonies',
        resources.worship
      ),
      week(
        6,
        'Religious Practices',
        'Rites of Passage',
        'B8/JHS2 2.1.1 Explain rites of passage and identify the moral lessons in them.',
        'Describe puberty rites and their relevance in Ghanaian society.',
        'Puberty rites and their relevance',
        resources.worship
      ),
      week(
        7,
        'Religious Practices',
        'Rites of Passage',
        'B8/JHS2 2.1.1 Explain rites of passage and identify the moral lessons in them.',
        'Describe how marriage is contracted in the three major religions.',
        'Marriage rites in the three major religions',
        resources.worship
      ),
      week(
        8,
        'Religious Practices',
        'Rites of Passage',
        'B8/JHS2 2.1.1 Explain rites of passage and identify the moral lessons in them.',
        'Identify moral lessons and responsibilities in marriage.',
        'Moral lessons from marriage rites',
        resources.worship
      ),
      week(
        9,
        'Religious Practices',
        'Rites of Passage',
        'B8/JHS2 2.1.1 Explain rites of passage and identify the moral lessons in them.',
        'Describe death rites in the three major religions.',
        'Death rites in the three major religions',
        resources.worship
      ),
      week(
        10,
        'Religious Practices',
        'Rites of Passage',
        'B8/JHS2 2.1.1 Explain rites of passage and identify the moral lessons in them.',
        'Explain the importance of death rites and support for the bereaved.',
        'Importance of death rites',
        resources.worship
      ),
      week(
        11,
        'Religious Practices',
        'Rites of Passage',
        'B8/JHS2 2.1.1 Explain rites of passage and identify the moral lessons in them.',
        'Identify the moral lessons in rites of passage.',
        'Moral lessons in rites of passage',
        resources.worship
      ),
      week(
        12,
        'Religious Practices',
        'Rites of Passage',
        'B8/JHS2 2.1.1 Explain rites of passage and identify the moral lessons in them.',
        'Apply lessons from rites of passage to personal behaviour.',
        'Applying lessons from rites of passage',
        resources.worship
      ),
    ],
  },
  {
    subject: 'RME',
    classLevel: 'B8',
    term: 'Term 2',
    title: 'B8 RME Scheme of Work - Term 2',
    weeks: [
      week(
        1,
        'The Family and the Community',
        'Authority and Obedience',
        'B8/JHS2 3.1.1 Identify and explain the importance of obeying authority.',
        'Explain the meaning of authority and obedience.',
        'Meaning of authority and obedience',
        resources.family
      ),
      week(
        2,
        'The Family and the Community',
        'Authority and Obedience',
        'B8/JHS2 3.1.1 Identify and explain the importance of obeying authority.',
        'Identify types and sources of authority at home, school, community and nation.',
        'Types and sources of authority',
        resources.family
      ),
      week(
        3,
        'The Family and the Community',
        'Authority and Obedience',
        'B8/JHS2 3.1.1 Identify and explain the importance of obeying authority.',
        'Explain reasons why rules and regulations should be obeyed.',
        'Why rules and regulations should be obeyed',
        resources.family
      ),
      week(
        4,
        'The Family and the Community',
        'Authority and Obedience',
        'B8/JHS2 3.1.1 Identify and explain the importance of obeying authority.',
        'Demonstrate how to apply rules and regulations in daily life.',
        'Applying rules and regulations in daily life',
        resources.family
      ),
      week(
        5,
        'The Family and the Community',
        'Authority and Obedience',
        'B8/JHS2 3.1.1 Identify and explain the importance of obeying authority.',
        'Discuss the benefits of obedience and the consequences of disobedience.',
        'Benefits of obedience and consequences of disobedience',
        resources.family
      ),
      week(
        6,
        'Religious Leaders and Personalities',
        'Prophets and Caliphs',
        'B8/JHS2 4.1.1 Identify and explain the moral lessons that can be learned from the exemplary lives of the Prophets and Caliphs.',
        'Identify selected prophets and caliphs in the major religions.',
        'Selected prophets and caliphs',
        resources.leadership
      ),
      week(
        7,
        'Religious Leaders and Personalities',
        'Prophets and Caliphs',
        'B8/JHS2 4.1.1 Identify and explain the moral lessons that can be learned from the exemplary lives of the Prophets and Caliphs.',
        'Describe the missions and key contributions of selected prophets.',
        'Missions of selected prophets',
        resources.leadership
      ),
      week(
        8,
        'Religious Leaders and Personalities',
        'Prophets and Caliphs',
        'B8/JHS2 4.1.1 Identify and explain the moral lessons that can be learned from the exemplary lives of the Prophets and Caliphs.',
        'Describe the roles of selected caliphs and other religious leaders.',
        'Roles of selected caliphs',
        resources.leadership
      ),
      week(
        9,
        'Religious Leaders and Personalities',
        'Prophets and Caliphs',
        'B8/JHS2 4.1.1 Identify and explain the moral lessons that can be learned from the exemplary lives of the Prophets and Caliphs.',
        'Examine the exemplary qualities in the lives of the prophets and caliphs.',
        'Exemplary qualities of prophets and caliphs',
        resources.leadership
      ),
      week(
        10,
        'Religious Leaders and Personalities',
        'Prophets and Caliphs',
        'B8/JHS2 4.1.1 Identify and explain the moral lessons that can be learned from the exemplary lives of the Prophets and Caliphs.',
        'Identify moral lessons such as courage, sacrifice, humility and patriotism.',
        'Moral lessons from prophets and caliphs',
        resources.leadership
      ),
      week(
        11,
        'Religious Leaders and Personalities',
        'Prophets and Caliphs',
        'B8/JHS2 4.1.1 Identify and explain the moral lessons that can be learned from the exemplary lives of the Prophets and Caliphs.',
        'Demonstrate how to apply lessons from the lives of prophets and caliphs.',
        'Applying lessons from prophets and caliphs',
        resources.leadership
      ),
      week(
        12,
        'Religious Leaders and Personalities',
        'Prophets and Caliphs',
        'B8/JHS2 4.1.1 Identify and explain the moral lessons that can be learned from the exemplary lives of the Prophets and Caliphs.',
        'Present project work on the mission and example of selected prophets and caliphs.',
        'Project presentation on prophets and caliphs',
        resources.leadership
      ),
    ],
  },
  {
    subject: 'RME',
    classLevel: 'B8',
    term: 'Term 3',
    title: 'B8 RME Scheme of Work - Term 3',
    weeks: [
      week(
        1,
        'Ethics and Moral Life',
        'Moral Teachings in the Three Major Religions in Ghana',
        'B8/JHS2 5.1.1 Exemplify the moral teachings from the Bible, Qur’an and Oral Traditions.',
        'Identify major moral teachings from the Bible, Qur’an and Oral Traditions.',
        'Moral teachings from the three major religions',
        resources.ethics
      ),
      week(
        2,
        'Ethics and Moral Life',
        'Moral Teachings in the Three Major Religions in Ghana',
        'B8/JHS2 5.1.1 Exemplify the moral teachings from the Bible, Qur’an and Oral Traditions.',
        'Explain moral teachings on honesty, respect, peace and love.',
        'Honesty, respect, peace and love',
        resources.ethics
      ),
      week(
        3,
        'Ethics and Moral Life',
        'Moral Teachings in the Three Major Religions in Ghana',
        'B8/JHS2 5.1.1 Exemplify the moral teachings from the Bible, Qur’an and Oral Traditions.',
        'Discuss moral teachings on self-control, chastity and humility.',
        'Self-control, chastity and humility',
        resources.ethics
      ),
      week(
        4,
        'Ethics and Moral Life',
        'Moral Teachings in the Three Major Religions in Ghana',
        'B8/JHS2 5.1.1 Exemplify the moral teachings from the Bible, Qur’an and Oral Traditions.',
        'Demonstrate how to apply moral teachings in daily life.',
        'Applying moral teachings in daily life',
        resources.ethics
      ),
      week(
        5,
        'Religion and Economic Life',
        'Money',
        'B8/JHS2 6.1.1 Plan the wise use of money.',
        'Explain the term money and its usefulness.',
        'Meaning and usefulness of money',
        resources.economic
      ),
      week(
        6,
        'Religion and Economic Life',
        'Money',
        'B8/JHS2 6.1.1 Plan the wise use of money.',
        'Identify honest ways of acquiring money.',
        'Honest ways of acquiring money',
        resources.economic
      ),
      week(
        7,
        'Religion and Economic Life',
        'Money',
        'B8/JHS2 6.1.1 Plan the wise use of money.',
        'Discuss appropriate ways of using money.',
        'Appropriate ways of using money',
        resources.economic
      ),
      week(
        8,
        'Religion and Economic Life',
        'Money',
        'B8/JHS2 6.1.1 Plan the wise use of money.',
        'Discuss savings, social security and the benefits of prudent financial planning.',
        'Saving, social security and prudent financial planning',
        resources.economic
      ),
      week(
        9,
        'Religion and Economic Life',
        'Bribery and Corruption',
        'B8/JHS2 6.2.1 Explain the need to avoid bribery and corruption and the ways to do so.',
        'Explain the terms bribery and corruption.',
        'Meaning of bribery and corruption',
        resources.economic
      ),
      week(
        10,
        'Religion and Economic Life',
        'Bribery and Corruption',
        'B8/JHS2 6.2.1 Explain the need to avoid bribery and corruption and the ways to do so.',
        'Identify the causes and effects of bribery and corruption.',
        'Causes and effects of bribery and corruption',
        resources.economic
      ),
      week(
        11,
        'Religion and Economic Life',
        'Bribery and Corruption',
        'B8/JHS2 6.2.1 Explain the need to avoid bribery and corruption and the ways to do so.',
        'Explain why bribery and corruption should be avoided.',
        'Why bribery and corruption should be avoided',
        resources.economic
      ),
      week(
        12,
        'Religion and Economic Life',
        'Bribery and Corruption',
        'B8/JHS2 6.2.1 Explain the need to avoid bribery and corruption and the ways to do so.',
        'Examine moral values that can help address bribery and corruption.',
        'Moral values against bribery and corruption',
        resources.economic
      ),
    ],
  },
];

export const rmeB9Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'RME',
    classLevel: 'B9',
    term: 'Term 1',
    title: 'B9 RME Scheme of Work - Term 1',
    weeks: [
      week(
        1,
        'God, His Creation and Attributes',
        'The Purpose and Usefulness of God’s Creation',
        'B9/JHS3 1.1.1 Describe and explain the purpose and usefulness of God’s creation.',
        'Identify the purpose and usefulness of God’s creation.',
        'Purpose and usefulness of God’s creation',
        resources.scriptures
      ),
      week(
        2,
        'God, His Creation and Attributes',
        'The Purpose and Usefulness of God’s Creation',
        'B9/JHS3 1.1.1 Describe and explain the purpose and usefulness of God’s creation.',
        'Explain how creation reveals the nature and wisdom of God.',
        'How creation reveals the nature of God',
        resources.scriptures
      ),
      week(
        3,
        'God, His Creation and Attributes',
        'The Purpose and Usefulness of God’s Creation',
        'B9/JHS3 1.1.1 Describe and explain the purpose and usefulness of God’s creation.',
        'Discuss human responsibility toward God’s creation.',
        'Human responsibility toward creation',
        resources.scriptures
      ),
      week(
        4,
        'God, His Creation and Attributes',
        'The Environment',
        'B9/JHS3 1.2.1 Explain why it is important to care for the environment and how to do so.',
        'Describe human activities that destroy the environment.',
        'Human activities that destroy the environment',
        resources.scriptures
      ),
      week(
        5,
        'God, His Creation and Attributes',
        'The Environment',
        'B9/JHS3 1.2.1 Explain why it is important to care for the environment and how to do so.',
        'Identify how indigenous Ghanaian culture helps in taking care of the environment.',
        'Indigenous Ghanaian care for the environment',
        resources.scriptures
      ),
      week(
        6,
        'God, His Creation and Attributes',
        'The Environment',
        'B9/JHS3 1.2.1 Explain why it is important to care for the environment and how to do so.',
        'Discuss reasons for taking care of the environment.',
        'Reasons for caring for the environment',
        resources.scriptures
      ),
      week(
        7,
        'God, His Creation and Attributes',
        'The Environment',
        'B9/JHS3 1.2.1 Explain why it is important to care for the environment and how to do so.',
        'Demonstrate practical ways of protecting the environment.',
        'Practical ways of protecting the environment',
        resources.scriptures
      ),
      week(
        8,
        'Religious Practices',
        'Religious Festivals',
        'B9/JHS3 2.1.1 Understand the relevance of, and the need to participate in, religious festivals.',
        'State the meaning and types of festivals.',
        'Meaning and types of festivals',
        resources.worship
      ),
      week(
        9,
        'Religious Practices',
        'Religious Festivals',
        'B9/JHS3 2.1.1 Understand the relevance of, and the need to participate in, religious festivals.',
        'Describe activities in festivals celebrated in the three major religions.',
        'Activities in religious festivals',
        resources.worship
      ),
      week(
        10,
        'Religious Practices',
        'Religious Festivals',
        'B9/JHS3 2.1.1 Understand the relevance of, and the need to participate in, religious festivals.',
        'Explain the social and religious importance of festivals.',
        'Social and religious importance of festivals',
        resources.worship
      ),
      week(
        11,
        'Religious Practices',
        'Religious Festivals',
        'B9/JHS3 2.1.1 Understand the relevance of, and the need to participate in, religious festivals.',
        'Identify moral lessons from festivals.',
        'Moral lessons from festivals',
        resources.worship
      ),
      week(
        12,
        'Religious Practices',
        'Religious Festivals',
        'B9/JHS3 2.1.1 Understand the relevance of, and the need to participate in, religious festivals.',
        'Relate festival values to unity, sharing and community development.',
        'Applying lessons from festivals',
        resources.worship
      ),
    ],
  },
  {
    subject: 'RME',
    classLevel: 'B9',
    term: 'Term 2',
    title: 'B9 RME Scheme of Work - Term 2',
    weeks: [
      week(
        1,
        'The Family and the Community',
        'Religion and Social Cohesion',
        'B9/JHS3 3.1.1 Identify and apply ways people with different religions can co-exist peacefully.',
        'Identify characteristics of tolerant and intolerant communities.',
        'Tolerant and intolerant communities',
        resources.family
      ),
      week(
        2,
        'The Family and the Community',
        'Religion and Social Cohesion',
        'B9/JHS3 3.1.1 Identify and apply ways people with different religions can co-exist peacefully.',
        'Explain reasons why religious intolerance occurs.',
        'Causes of religious intolerance',
        resources.family
      ),
      week(
        3,
        'The Family and the Community',
        'Religion and Social Cohesion',
        'B9/JHS3 3.1.1 Identify and apply ways people with different religions can co-exist peacefully.',
        'Discuss the effects of religious intolerance on society and the individual.',
        'Effects of religious intolerance',
        resources.family
      ),
      week(
        4,
        'The Family and the Community',
        'Religion and Social Cohesion',
        'B9/JHS3 3.1.1 Identify and apply ways people with different religions can co-exist peacefully.',
        'Identify ways in which people of different religions can live peacefully together.',
        'Ways of promoting peaceful co-existence',
        resources.family
      ),
      week(
        5,
        'The Family and the Community',
        'Religion and Social Cohesion',
        'B9/JHS3 3.1.1 Identify and apply ways people with different religions can co-exist peacefully.',
        'Explain the need for people of different religions to live in harmony.',
        'Need for inter-religious harmony',
        resources.family
      ),
      week(
        6,
        'The Family and the Community',
        'Religion and Social Cohesion',
        'B9/JHS3 3.1.1 Identify and apply ways people with different religions can co-exist peacefully.',
        'Demonstrate practical conflict-prevention and peacebuilding behaviours.',
        'Peacebuilding and conflict prevention',
        resources.family
      ),
      week(
        7,
        'Religious Leaders and Personalities',
        'Women in Religion and Leadership Positions',
        'B9/JHS3 4.1.1 Recognise the leadership role of women in society.',
        'Identify key women in the three major religions and describe their contributions.',
        'Key women in religion and their contributions',
        resources.leadership
      ),
      week(
        8,
        'Religious Leaders and Personalities',
        'Women in Religion and Leadership Positions',
        'B9/JHS3 4.1.1 Recognise the leadership role of women in society.',
        'Discuss the moral lessons from the lives of women in religion.',
        'Moral lessons from women in religion',
        resources.leadership
      ),
      week(
        9,
        'Religious Leaders and Personalities',
        'Women in Religion and Leadership Positions',
        'B9/JHS3 4.1.1 Recognise the leadership role of women in society.',
        'Describe practical roles women play in religious development and leadership.',
        'Women in religious leadership',
        resources.leadership
      ),
      week(
        10,
        'Religious Leaders and Personalities',
        'Women in Religion and Leadership Positions',
        'B9/JHS3 4.1.1 Recognise the leadership role of women in society.',
        'Identify the contribution of women to the development of Ghana.',
        'Women and national development',
        resources.leadership
      ),
      week(
        11,
        'Religious Leaders and Personalities',
        'Women in Religion and Leadership Positions',
        'B9/JHS3 4.1.1 Recognise the leadership role of women in society.',
        'Challenge stereotypes that limit the participation of women in leadership.',
        'Challenging stereotypes about women in leadership',
        resources.leadership
      ),
      week(
        12,
        'Religious Leaders and Personalities',
        'Women in Religion and Leadership Positions',
        'B9/JHS3 4.1.1 Recognise the leadership role of women in society.',
        'Promote respect, equity and responsible leadership by women and men alike.',
        'Promoting respect and responsible leadership',
        resources.leadership
      ),
    ],
  },
  {
    subject: 'RME',
    classLevel: 'B9',
    term: 'Term 3',
    title: 'B9 RME Scheme of Work - Term 3',
    weeks: [
      week(
        1,
        'Ethics and Moral Life',
        'Reward, Punishment and Repentance',
        'B9/JHS3 5.1.1 Demonstrate an understanding that good deeds attract reward but bad deeds attract punishment.',
        'Describe the basis for good deeds and reward.',
        'Good deeds and reward',
        resources.ethics
      ),
      week(
        2,
        'Ethics and Moral Life',
        'Reward, Punishment and Repentance',
        'B9/JHS3 5.1.1 Demonstrate an understanding that good deeds attract reward but bad deeds attract punishment.',
        'Identify examples of good deeds in family, school and community life.',
        'Examples of good deeds',
        resources.ethics
      ),
      week(
        3,
        'Ethics and Moral Life',
        'Reward, Punishment and Repentance',
        'B9/JHS3 5.1.1 Demonstrate an understanding that good deeds attract reward but bad deeds attract punishment.',
        'Explain the importance of rewarding good behaviour.',
        'Importance of rewarding good behaviour',
        resources.ethics
      ),
      week(
        4,
        'Ethics and Moral Life',
        'Reward, Punishment and Repentance',
        'B9/JHS3 5.1.1 Demonstrate an understanding that good deeds attract reward but bad deeds attract punishment.',
        'Identify and explain acts that attract punishment.',
        'Acts that attract punishment',
        resources.ethics
      ),
      week(
        5,
        'Ethics and Moral Life',
        'Reward, Punishment and Repentance',
        'B9/JHS3 5.1.1 Demonstrate an understanding that good deeds attract reward but bad deeds attract punishment.',
        'Discuss the reasons for punishment and the need for law and order.',
        'Reasons for punishment',
        resources.ethics
      ),
      week(
        6,
        'Ethics and Moral Life',
        'Reward, Punishment and Repentance',
        'B9/JHS3 5.1.1 Demonstrate an understanding that good deeds attract reward but bad deeds attract punishment.',
        'Explain the meaning and stages of repentance.',
        'Meaning and stages of repentance',
        resources.ethics
      ),
      week(
        7,
        'Ethics and Moral Life',
        'Reward, Punishment and Repentance',
        'B9/JHS3 5.1.1 Demonstrate an understanding that good deeds attract reward but bad deeds attract punishment.',
        'Discuss the importance of repentance, forgiveness and reconciliation.',
        'Repentance, forgiveness and reconciliation',
        resources.ethics
      ),
      week(
        8,
        'Religion and Economic Life',
        'Time and Leisure',
        'B9/JHS3 6.1.1 Develop skills in managing time profitably.',
        'Explain the meaning of time, leisure and idleness.',
        'Meaning of time, leisure and idleness',
        resources.economic
      ),
      week(
        9,
        'Religion and Economic Life',
        'Time and Leisure',
        'B9/JHS3 6.1.1 Develop skills in managing time profitably.',
        'Demonstrate how to plan and use time wisely.',
        'Planning and using time wisely',
        resources.economic
      ),
      week(
        10,
        'Religion and Economic Life',
        'Time and Leisure',
        'B9/JHS3 6.1.1 Develop skills in managing time profitably.',
        'Identify teachings on time management in the three major religions.',
        'Religious teachings on time management',
        resources.economic
      ),
      week(
        11,
        'Religion and Economic Life',
        'Time and Leisure',
        'B9/JHS3 6.1.1 Develop skills in managing time profitably.',
        'Discuss profitable and unprofitable uses of leisure.',
        'Profitable use of leisure',
        resources.economic
      ),
      week(
        12,
        'Religion and Economic Life',
        'Time and Leisure',
        'B9/JHS3 6.1.1 Develop skills in managing time profitably.',
        'Prepare personal plans for balancing work, study, leisure and service.',
        'Balancing work, study, leisure and service',
        resources.economic
      ),
    ],
  },
];
