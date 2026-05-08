import type { ClassLevel } from '@/types/lessonPlan';
import type { SchemeWeek } from '@/types/scheme';
import type { ExplicitCurriculumTerm } from './mathematicsB7';

type TopicTuple = [strand: string, subStrand: string, topic: string];

const resourcesByStrand = {
  'Diversity of Matter': ['Science textbook', 'Charts', 'Local specimens', 'Observation notebook'],
  Cycles: ['Science textbook', 'Weather chart', 'Nature walk notes', 'Pictures'],
  Systems: ['Science textbook', 'Charts', 'Models', 'Pictures'],
  'Forces and Energy': ['Science textbook', 'Simple apparatus', 'Charts', 'Demonstration materials'],
  'Humans and the Environment': ['Science textbook', 'Posters', 'Community examples', 'Project notebook'],
} as const;

function makeWeek(
  classLevel: ClassLevel,
  week: number,
  strand: TopicTuple[0],
  subStrand: TopicTuple[1],
  topic: TopicTuple[2]
): SchemeWeek {
  const resources = resourcesByStrand[strand as keyof typeof resourcesByStrand] ?? [
    'Science textbook',
  ];

  return {
    week,
    strand,
    subStrand,
    topic,
    contentStandard: `${classLevel} ${strand}: Demonstrate understanding of ${subStrand.toLowerCase()} in everyday life.`,
    indicator: `Explore and explain ${topic.toLowerCase()} using observation, discussion and simple activities.`,
    resources: [...resources],
  };
}

function buildTerm(
  classLevel: ClassLevel,
  term: string,
  topics: TopicTuple[]
): ExplicitCurriculumTerm {
  return {
    subject: 'Science',
    classLevel,
    term,
    title: `${classLevel} Primary Science Scheme of Work - ${term}`,
    weeks: topics.map((item, index) =>
      makeWeek(classLevel, index + 1, item[0], item[1], item[2])
    ),
  };
}

const b1Term1: TopicTuple[] = [
  ['Diversity of Matter', 'Living and Non-Living Things', 'Observing different things in the environment'],
  ['Diversity of Matter', 'Living and Non-Living Things', 'Identifying plants and animals in the locality'],
  ['Diversity of Matter', 'Living and Non-Living Things', 'Grouping things into living and non-living'],
  ['Diversity of Matter', 'Materials', 'Naming common materials in the home and school'],
  ['Diversity of Matter', 'Materials', 'Grouping materials by colour, shape, size and texture'],
  ['Diversity of Matter', 'Materials', 'Uses of common everyday materials'],
  ['Cycles', 'Earth Science', 'Repeated natural events such as day and night'],
  ['Cycles', 'Earth Science', 'The sun as the main source of light to the earth'],
  ['Cycles', 'Earth Science', 'Mist, puddles and disappearance of water after rain'],
  ['Systems', 'The Human Body Systems', 'External parts of the human body'],
  ['Systems', 'Ecosystem', 'Places where living things live: land, air and water'],
  ['Systems', 'Ecosystem', 'Matching living things to their habitats'],
];

const b1Term2: TopicTuple[] = [
  ['Forces and Energy', 'Sources and Forms of Energy', 'Meaning of energy and uses of energy'],
  ['Forces and Energy', 'Sources and Forms of Energy', 'Hot and cold in everyday life'],
  ['Forces and Energy', 'Sources and Forms of Energy', 'Simple sources of light and heat'],
  ['Forces and Energy', 'Electricity and Electronics', 'Common electrical and electronic devices'],
  ['Forces and Energy', 'Electricity and Electronics', 'Uses of simple electronic devices at home and school'],
  ['Forces and Energy', 'Forces and Movement', 'Force as a push or a pull'],
  ['Forces and Energy', 'Forces and Movement', 'Moving objects by pushing and pulling'],
  ['Humans and the Environment', 'Personal Hygiene and Sanitation', 'Why bathing is important'],
  ['Humans and the Environment', 'Personal Hygiene and Sanitation', 'How to clean the teeth properly'],
  ['Humans and the Environment', 'Personal Hygiene and Sanitation', 'Keeping the body and clothing clean'],
  ['Humans and the Environment', 'Diseases', 'Common skin diseases and their causes'],
  ['Humans and the Environment', 'Diseases', 'Preventing skin infections through cleanliness'],
];

const b1Term3: TopicTuple[] = [
  ['Humans and the Environment', 'Science and Industry', 'Technologies in the immediate environment'],
  ['Humans and the Environment', 'Science and Industry', 'How simple tools help people work'],
  ['Humans and the Environment', 'Climate Change', 'Weather changes in the environment'],
  ['Humans and the Environment', 'Climate Change', 'Caring for plants, animals and the environment'],
  ['Diversity of Matter', 'Review', 'Living and non-living things review'],
  ['Diversity of Matter', 'Review', 'Materials and their uses review'],
  ['Cycles', 'Review', 'Day and night and water changes review'],
  ['Systems', 'Review', 'Body parts and habitats review'],
  ['Forces and Energy', 'Review', 'Energy, heat, devices and force review'],
  ['Humans and the Environment', 'Review', 'Personal hygiene and disease prevention review'],
  ['Humans and the Environment', 'Project Work', 'Simple class project on keeping the environment clean'],
  ['Science', 'Integrated Review', 'Integrated B1 science consolidation'],
];

const b2Term1: TopicTuple[] = [
  ['Diversity of Matter', 'Living and Non-Living Things', 'Basic structure of plants: roots, stem, leaves and flowers'],
  ['Diversity of Matter', 'Living and Non-Living Things', 'Basic structure of animals: head, trunk and limbs'],
  ['Diversity of Matter', 'Living and Non-Living Things', 'Grouping things into living and non-living'],
  ['Diversity of Matter', 'Materials', 'Common properties of materials'],
  ['Diversity of Matter', 'Materials', 'Sorting materials by soft, hard, rough and smooth'],
  ['Diversity of Matter', 'Materials', 'Choosing materials for simple uses'],
  ['Cycles', 'Earth Science', 'Dry season and rainy season as cyclic events'],
  ['Cycles', 'Earth Science', 'Sources of light to the earth'],
  ['Cycles', 'Earth Science', 'Effects of the sun in everyday life'],
  ['Systems', 'The Human Body Systems', 'Functions of the eyes, ears, nose, tongue and skin'],
  ['Systems', 'The Solar System', 'The sun as the main source of light and warmth'],
  ['Systems', 'The Solar System', 'Daytime and nighttime sky observations'],
];

const b2Term2: TopicTuple[] = [
  ['Forces and Energy', 'Sources and Forms of Energy', 'Everyday applications of energy'],
  ['Forces and Energy', 'Sources and Forms of Energy', 'How objects become hot or cold'],
  ['Forces and Energy', 'Sources and Forms of Energy', 'Safe uses of heat and light'],
  ['Forces and Energy', 'Electricity and Electronics', 'Simple electrical appliances and their uses'],
  ['Forces and Energy', 'Electricity and Electronics', 'Safety around electric devices'],
  ['Forces and Energy', 'Forces and Movement', 'Pushes and pulls in games and work'],
  ['Forces and Energy', 'Forces and Movement', 'Effects of force on moving and resting objects'],
  ['Humans and the Environment', 'Personal Hygiene and Sanitation', 'Keeping the body clean and healthy'],
  ['Humans and the Environment', 'Personal Hygiene and Sanitation', 'Keeping classrooms and school compound clean'],
  ['Humans and the Environment', 'Diseases', 'Causes and prevention of ringworm'],
  ['Humans and the Environment', 'Diseases', 'Common water-borne diseases and their prevention'],
  ['Humans and the Environment', 'Diseases', 'Healthy habits for disease prevention'],
];

const b2Term3: TopicTuple[] = [
  ['Humans and the Environment', 'Science and Industry', 'Technological devices in the community'],
  ['Humans and the Environment', 'Science and Industry', 'Food processing methods for consumption'],
  ['Humans and the Environment', 'Climate Change', 'Simple effects of weather change on people and places'],
  ['Humans and the Environment', 'Climate Change', 'Ways to protect the environment'],
  ['Diversity of Matter', 'Review', 'Review of plants, animals and materials'],
  ['Cycles', 'Review', 'Review of seasons, sunlight and the earth'],
  ['Systems', 'Review', 'Review of body parts and the sun'],
  ['Forces and Energy', 'Review', 'Review of energy, electricity and forces'],
  ['Humans and the Environment', 'Review', 'Review of sanitation and disease prevention'],
  ['Science', 'Project Work', 'Simple investigation of clean and unsafe environments'],
  ['Science', 'Practical Activities', 'Simple sorting, observing and measuring activities'],
  ['Science', 'Integrated Review', 'Integrated B2 science consolidation'],
];

const b3Term1: TopicTuple[] = [
  ['Diversity of Matter', 'Living and Non-Living Things', 'Classifying living things by life processes'],
  ['Diversity of Matter', 'Living and Non-Living Things', 'Plants and animals as major groups of living things'],
  ['Diversity of Matter', 'Materials', 'Uses of everyday materials linked to their properties'],
  ['Diversity of Matter', 'Materials', 'Selecting suitable materials for specific purposes'],
  ['Cycles', 'Earth Science', 'Day and night, wet and dry seasons'],
  ['Cycles', 'Earth Science', 'Importance of the sun to the earth'],
  ['Cycles', 'Life Cycles of Organisms', 'Germination of maize and bean seeds'],
  ['Cycles', 'Life Cycles of Organisms', 'Conditions needed for germination and plant growth'],
  ['Systems', 'The Human Body Systems', 'How body parts work together to perform activities'],
  ['Systems', 'The Solar System', 'The sun, earth and moon as parts of the solar system'],
  ['Systems', 'Ecosystem', 'Simple relationships between living things and their environment'],
  ['Systems', 'Ecosystem', 'Food, water and shelter in habitats'],
];

const b3Term2: TopicTuple[] = [
  ['Forces and Energy', 'Sources and Forms of Energy', 'Light as a form of energy'],
  ['Forces and Energy', 'Sources and Forms of Energy', 'Heat as a form of energy and its sources'],
  ['Forces and Energy', 'Sources and Forms of Energy', 'Uses of light and heat energy'],
  ['Forces and Energy', 'Electricity and Electronics', 'Simple circuits and electrical sources'],
  ['Forces and Energy', 'Electricity and Electronics', 'Electronic devices used in daily life'],
  ['Forces and Energy', 'Forces and Movement', 'How force changes the speed or direction of movement'],
  ['Forces and Energy', 'Forces and Movement', 'Friction in everyday activities'],
  ['Humans and the Environment', 'Personal Hygiene and Sanitation', 'Ways of keeping the environment clean'],
  ['Humans and the Environment', 'Personal Hygiene and Sanitation', 'Sanitation habits in the home and school'],
  ['Humans and the Environment', 'Diseases', 'Prevention of common skin diseases'],
  ['Humans and the Environment', 'Diseases', 'Air-borne diseases and how they spread'],
  ['Humans and the Environment', 'Diseases', 'Preventing disease through safe habits'],
];

const b3Term3: TopicTuple[] = [
  ['Humans and the Environment', 'Science and Industry', 'Ways food gets spoiled'],
  ['Humans and the Environment', 'Science and Industry', 'Methods of preserving food'],
  ['Humans and the Environment', 'Climate Change', 'Simple climate and weather changes in the locality'],
  ['Humans and the Environment', 'Climate Change', 'Planting and caring for the environment'],
  ['Diversity of Matter', 'Review', 'Review of living things and materials'],
  ['Cycles', 'Review', 'Review of earth science and life cycles'],
  ['Systems', 'Review', 'Review of body systems, solar system and ecosystems'],
  ['Forces and Energy', 'Review', 'Review of light, heat, electricity and movement'],
  ['Humans and the Environment', 'Review', 'Review of sanitation, diseases and food spoilage'],
  ['Science', 'Practical Activities', 'Observation and germination project review'],
  ['Science', 'Project Work', 'Class project on environmental cleanliness'],
  ['Science', 'Integrated Review', 'Integrated B3 science consolidation'],
];

const b4Term1: TopicTuple[] = [
  ['Diversity of Matter', 'Living and Non-Living Things', 'Classifying animals into insects, birds, mammals and reptiles'],
  ['Diversity of Matter', 'Living and Non-Living Things', 'Life processes of animals: movement, nutrition and reproduction'],
  ['Diversity of Matter', 'Living and Non-Living Things', 'Physical features and uses of major animal groups'],
  ['Diversity of Matter', 'Materials', 'Mixtures of solids and liquids in daily life'],
  ['Diversity of Matter', 'Materials', 'Liquid-liquid mixtures and ways of separating them'],
  ['Diversity of Matter', 'Materials', 'Choosing separation methods for simple mixtures'],
  ['Cycles', 'Earth Science', 'Cyclic movements in the environment'],
  ['Cycles', 'Earth Science', 'Objects in the sky during day and night'],
  ['Cycles', 'Earth Science', 'Evaporation and transpiration in the water cycle'],
  ['Cycles', 'Life Cycles of Organisms', 'Stages in the life cycle of flowering plants'],
  ['Cycles', 'Life Cycles of Organisms', 'Growth and development in living organisms'],
  ['Science', 'Review', 'Review of matter and cycles concepts'],
];

const b4Term2: TopicTuple[] = [
  ['Systems', 'The Human Body Systems', 'Organs of the digestive system and their functions'],
  ['Systems', 'The Human Body Systems', 'Digestion and absorption of food'],
  ['Systems', 'The Solar System', 'The sun at the centre of the solar system'],
  ['Systems', 'The Solar System', 'Planets and their movement around the sun'],
  ['Systems', 'Ecosystem', 'Interactions among organisms and their surroundings'],
  ['Systems', 'Ecosystem', 'Simple food chains in the environment'],
  ['Forces and Energy', 'Sources and Forms of Energy', 'Effects of heat on change of state'],
  ['Forces and Energy', 'Sources and Forms of Energy', 'Practical uses of heat and light'],
  ['Forces and Energy', 'Electricity and Electronics', 'Uses of electricity in the home and school'],
  ['Forces and Energy', 'Electricity and Electronics', 'Safe use of electricity'],
  ['Forces and Energy', 'Forces and Movement', 'How forces cause movement and change'],
  ['Forces and Energy', 'Forces and Movement', 'Balanced and unbalanced actions in simple motion'],
];

const b4Term3: TopicTuple[] = [
  ['Humans and the Environment', 'Personal Hygiene and Sanitation', 'How to care for self and the environment'],
  ['Humans and the Environment', 'Personal Hygiene and Sanitation', 'Waste management for a clean environment'],
  ['Humans and the Environment', 'Diseases', 'Causes, symptoms and prevention of measles'],
  ['Humans and the Environment', 'Diseases', 'Causes, symptoms and prevention of malaria'],
  ['Humans and the Environment', 'Science and Industry', 'Useful technologies in the community'],
  ['Humans and the Environment', 'Science and Industry', 'Science ideas behind simple tools and machines'],
  ['Humans and the Environment', 'Climate Change', 'Changes in weather and climate in the locality'],
  ['Humans and the Environment', 'Climate Change', 'Actions that help protect the environment'],
  ['Science', 'Practical Activities', 'Simple experiments on mixtures and heat'],
  ['Science', 'Review', 'Review of systems and energy concepts'],
  ['Science', 'Project Work', 'Class project on sanitation or waste management'],
  ['Science', 'Integrated Review', 'Integrated B4 science consolidation'],
];

const b5Term1: TopicTuple[] = [
  ['Diversity of Matter', 'Living and Non-Living Things', 'Life processes of living things'],
  ['Diversity of Matter', 'Living and Non-Living Things', 'Differences among living, dead and non-living things'],
  ['Diversity of Matter', 'Materials', 'Classifying materials by their properties'],
  ['Diversity of Matter', 'Materials', 'Reversible and irreversible changes'],
  ['Diversity of Matter', 'Materials', 'Examples of physical and chemical changes in simple terms'],
  ['Cycles', 'Earth Science', 'How day and night are formed'],
  ['Cycles', 'Earth Science', 'Benefits of the sun to the earth'],
  ['Cycles', 'Earth Science', 'Evaporation and condensation in the water cycle'],
  ['Cycles', 'Life Cycles of Organisms', 'Life cycles of common insects and animals'],
  ['Cycles', 'Life Cycles of Organisms', 'Life cycles and growth in plants'],
  ['Science', 'Review', 'Review of matter and cycles in B5'],
  ['Science', 'Practical Activities', 'Observation and change activities'],
];

const b5Term2: TopicTuple[] = [
  ['Systems', 'The Human Body Systems', 'Parts of the respiratory system'],
  ['Systems', 'The Human Body Systems', 'Functions of the respiratory organs'],
  ['Systems', 'The Solar System', 'Components of the solar system'],
  ['Systems', 'The Solar System', 'Relative positions of the sun, earth and moon'],
  ['Systems', 'Ecosystem', 'Relationships among organisms in ecosystems'],
  ['Systems', 'Ecosystem', 'Effects of human activities on ecosystems'],
  ['Forces and Energy', 'Sources and Forms of Energy', 'Transformation of energy from one form to another'],
  ['Forces and Energy', 'Sources and Forms of Energy', 'Using electricity efficiently in the home'],
  ['Forces and Energy', 'Electricity and Electronics', 'Simple electrical connections and devices'],
  ['Forces and Energy', 'Forces and Movement', 'Speed, direction and control of movement'],
  ['Forces and Energy', 'Forces and Movement', 'Simple machines and force in work'],
  ['Science', 'Review', 'Review of systems and energy in B5'],
];

const b5Term3: TopicTuple[] = [
  ['Humans and the Environment', 'Personal Hygiene and Sanitation', 'Why clothes should be washed regularly'],
  ['Humans and the Environment', 'Personal Hygiene and Sanitation', 'Keeping washrooms clean'],
  ['Humans and the Environment', 'Diseases', 'Causes and prevention of selected communicable diseases'],
  ['Humans and the Environment', 'Diseases', 'Community health habits and prevention'],
  ['Humans and the Environment', 'Science and Industry', 'Food processing and preservation in the community'],
  ['Humans and the Environment', 'Science and Industry', 'Science in farming, cooking and local industry'],
  ['Humans and the Environment', 'Climate Change', 'Human activities that affect climate and environment'],
  ['Humans and the Environment', 'Climate Change', 'Tree planting, waste reduction and environmental care'],
  ['Science', 'Practical Activities', 'Simple project on food preservation or cleanliness'],
  ['Science', 'Review', 'Review of personal hygiene and disease prevention'],
  ['Science', 'Project Work', 'Community science awareness activity'],
  ['Science', 'Integrated Review', 'Integrated B5 science consolidation'],
];

const b6Term1: TopicTuple[] = [
  ['Diversity of Matter', 'Living and Non-Living Things', 'Classifying plants based on their root systems'],
  ['Diversity of Matter', 'Living and Non-Living Things', 'Functions of roots, stems, leaves and flowers'],
  ['Diversity of Matter', 'Materials', 'Properties of metals such as lustre and malleability'],
  ['Diversity of Matter', 'Materials', 'Properties and uses of metals and non-metals'],
  ['Diversity of Matter', 'Materials', 'Selecting materials for practical uses'],
  ['Cycles', 'Earth Science', 'Relative sizes of the earth and the sun'],
  ['Cycles', 'Earth Science', 'How rain falls from clouds'],
  ['Cycles', 'Earth Science', 'The water cycle and cloud formation'],
  ['Cycles', 'Life Cycles of Organisms', 'Life processes and reproduction in organisms'],
  ['Cycles', 'Life Cycles of Organisms', 'Growth and survival of organisms in their habitats'],
  ['Science', 'Review', 'Review of diversity of matter and cycles in B6'],
  ['Science', 'Practical Activities', 'Observation and weather activities'],
];

const b6Term2: TopicTuple[] = [
  ['Systems', 'The Human Body Systems', 'Functions of the excretory system in humans'],
  ['Systems', 'The Human Body Systems', 'Organs of the excretory system and waste removal'],
  ['Systems', 'The Solar System', 'Difference between a star, a planet and a satellite'],
  ['Systems', 'The Solar System', 'The place of the earth in the solar system'],
  ['Systems', 'Ecosystem', 'Balance and interdependence in ecosystems'],
  ['Systems', 'Ecosystem', 'Environmental effects of disrupting ecosystems'],
  ['Forces and Energy', 'Sources and Forms of Energy', 'Renewable and non-renewable sources of energy'],
  ['Forces and Energy', 'Sources and Forms of Energy', 'Conserving energy resources'],
  ['Forces and Energy', 'Sources and Forms of Energy', 'Measuring temperature using a thermometer'],
  ['Forces and Energy', 'Electricity and Electronics', 'Electrical safety and responsible energy use'],
  ['Forces and Energy', 'Forces and Movement', 'Force, motion and simple measurement activities'],
  ['Science', 'Review', 'Review of systems and energy in B6'],
];

const b6Term3: TopicTuple[] = [
  ['Humans and the Environment', 'Personal Hygiene and Sanitation', 'Causes and effects of foul body odour'],
  ['Humans and the Environment', 'Personal Hygiene and Sanitation', 'Ways of minimising waste'],
  ['Humans and the Environment', 'Diseases', 'Causes, symptoms and prevention of eczema'],
  ['Humans and the Environment', 'Diseases', 'Prevention of meningitis and other common diseases'],
  ['Humans and the Environment', 'Science and Industry', 'Scientific principles behind local technologies'],
  ['Humans and the Environment', 'Science and Industry', 'Science, technology and improvement of community life'],
  ['Humans and the Environment', 'Climate Change', 'Climate change effects on health and livelihood'],
  ['Humans and the Environment', 'Climate Change', 'Actions for environmental sustainability'],
  ['Science', 'Practical Activities', 'Simple project on sanitation, waste or energy conservation'],
  ['Science', 'Review', 'Review of disease prevention and environmental care'],
  ['Science', 'Transition to JHS', 'Upper primary science readiness for JHS'],
  ['Science', 'Integrated Review', 'Integrated B6 science consolidation'],
];

export const primaryScienceTerms: ExplicitCurriculumTerm[] = [
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
