import type { ExplicitCurriculumTerm } from './scienceB7';

const resources = {
  matter: ['Science textbook', 'Charts', 'Laboratory apparatus', 'Samples from the environment'],
  cells: ['Microscope', 'Charts', 'Slides', 'Drawing book'],
  agriculture: ['School garden', 'Farm tools', 'Manure samples', 'Community observation notes'],
  systems: ['Science textbook', 'Charts', 'Models', 'Videos'],
  energy: ['Simple circuit kit', 'Magnets', 'Torch', 'Charts'],
  environment: ['Posters', 'Project notebook', 'Community case studies', 'Science textbook'],
};

export const scienceB8Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'Science',
    classLevel: 'B8',
    term: 'Term 1',
    title: 'B8 Science Scheme of Work - Term 1',
    weeks: [
      {
        week: 1,
        strand: 'Diversity of Matter',
        subStrand: 'Materials',
        contentStandard:
          'B8/JHS2.1.1.1 Demonstrate understanding of mixtures and methods of separating mixtures.',
        indicator:
          'B8/JHS2.1.1.1.1-1.2 Distinguish among mixtures, colloids and suspensions and design processes for separating mixtures.',
        topic: 'Types of mixtures and methods of separation',
        resources: resources.matter,
      },
      {
        week: 2,
        strand: 'Diversity of Matter',
        subStrand: 'Materials',
        contentStandard:
          'B8/JHS2.1.1.2 Demonstrate understanding of atoms and the atomic structure of elements in the periodic table.',
        indicator:
          'B8/JHS2.1.1.2.1 Describe atoms as composed of sub-atomic particles.',
        topic: 'Atomic structure and sub-atomic particles',
        resources: resources.matter,
      },
      {
        week: 3,
        strand: 'Diversity of Matter',
        subStrand: 'Living Cells',
        contentStandard:
          'B8/JHS2.1.2.1 Demonstrate an understanding of the types of cells and their structure in relation to different organisms.',
        indicator:
          'B8/JHS2.1.2.1.1 Examine and describe the structure of prokaryotic and eukaryotic cells.',
        topic: 'Prokaryotic and eukaryotic cells',
        resources: resources.cells,
      },
      {
        week: 4,
        strand: 'Diversity of Matter',
        subStrand: 'Living Cells',
        contentStandard:
          'B8/JHS2.1.2.1 Demonstrate an understanding of the types of cells and their structure in relation to different organisms.',
        indicator:
          'B8/JHS2.1.2.1.2 Classify organisms as prokaryotic or eukaryotic based on cell type.',
        topic: 'Classifying organisms by cell type',
        resources: resources.cells,
      },
      {
        week: 5,
        strand: 'Cycles',
        subStrand: 'Earth Science',
        contentStandard:
          'B8/JHS2.2.1.1 Demonstrate understanding of the carbon cycle and its role in the environment.',
        indicator:
          'B8/JHS2.2.1.1.1 Explain the process of the carbon cycle.',
        topic: 'The carbon cycle',
        resources: resources.systems,
      },
      {
        week: 6,
        strand: 'Cycles',
        subStrand: 'Earth Science',
        contentStandard:
          'B8/JHS2.2.1.1 Demonstrate understanding of the carbon cycle and its role in the environment.',
        indicator:
          'B8/JHS2.2.1.1.2 Describe the role of the carbon cycle in the environment.',
        topic: 'Importance of the carbon cycle',
        resources: resources.systems,
      },
      {
        week: 7,
        strand: 'Cycles',
        subStrand: 'Life Cycle of Organisms',
        contentStandard:
          'B8/JHS2.2.2.1 Demonstrate the life cycle of the Anopheles mosquito and how its effects can be managed.',
        indicator:
          'B8/JHS2.2.2.1.1 Describe the life cycle and economic importance of the Anopheles mosquito.',
        topic: 'Life cycle of the Anopheles mosquito',
        resources: resources.systems,
      },
      {
        week: 8,
        strand: 'Cycles',
        subStrand: 'Life Cycle of Organisms',
        contentStandard:
          'B8/JHS2.2.2.1 Demonstrate the life cycle of the Anopheles mosquito and how its effects can be managed.',
        indicator:
          'B8/JHS2.2.2.1.2 Discuss the impact of the Anopheles mosquito on humans and how it can be controlled.',
        topic: 'Mosquito control and malaria prevention',
        resources: resources.systems,
      },
      {
        week: 9,
        strand: 'Cycles',
        subStrand: 'Crop Production',
        contentStandard:
          'B8/JHS2.2.3.1 Demonstrate knowledge and skills in planting crops on different seed beds.',
        indicator:
          'B8/JHS2.2.3.1.1 Explore the different seed beds for planting crops.',
        topic: 'Types of seed beds for crop production',
        resources: resources.agriculture,
      },
      {
        week: 10,
        strand: 'Cycles',
        subStrand: 'Crop Production',
        contentStandard:
          'B8/JHS2.2.3.1 Demonstrate knowledge and skills in planting crops on different seed beds.',
        indicator:
          'B8/JHS2.2.3.1.2 Plant different types of crops on different seed beds.',
        topic: 'Planting crops on appropriate seed beds',
        resources: resources.agriculture,
      },
      {
        week: 11,
        strand: 'Cycles',
        subStrand: 'Crop Production',
        contentStandard:
          'B8/JHS2.2.3.2 Demonstrate understanding of the differences in crops grown on different seed beds.',
        indicator:
          'B8/JHS2.2.3.2.1 Compare differences in height, size and flowering of crops grown in different seed beds.',
        topic: 'Comparing crop growth on different seed beds',
        resources: resources.agriculture,
      },
      {
        week: 12,
        strand: 'Cycles',
        subStrand: 'Animal Production',
        contentStandard:
          'B8/JHS2.2.4.1-2.4.2 Recognise the different types of feed for animals and understand the importance of feed and water.',
        indicator:
          'B8/JHS2.2.4.1.1 and B8/JHS2.2.4.2.1 Compare animal feeds and explain the importance of water and feed to growth.',
        topic: 'Animal feed and the importance of water for growth',
        resources: resources.agriculture,
      },
    ],
  },
  {
    subject: 'Science',
    classLevel: 'B8',
    term: 'Term 2',
    title: 'B8 Science Scheme of Work - Term 2',
    weeks: [
      {
        week: 1,
        strand: 'Systems',
        subStrand: 'The Human Body System',
        contentStandard:
          'B8/JHS2.3.1.1 Demonstrate understanding of body systems and their functions.',
        indicator:
          'B8/JHS2.3.1.1.1 Identify major parts and functions of the selected body system.',
        topic: 'Selected body systems and their functions',
        resources: resources.systems,
      },
      {
        week: 2,
        strand: 'Systems',
        subStrand: 'The Human Body System',
        contentStandard:
          'B8/JHS2.3.1.1 Demonstrate understanding of body systems and their functions.',
        indicator:
          'B8/JHS2.3.1.1.2 Explain how the selected body system supports life.',
        topic: 'How body systems support life processes',
        resources: resources.systems,
      },
      {
        week: 3,
        strand: 'Systems',
        subStrand: 'The Solar System',
        contentStandard:
          'B8/JHS2.3.2.1 Demonstrate knowledge of the outer planets of the solar system.',
        indicator:
          'B8/JHS2.3.2.1.1 Identify the outer planets and describe their properties.',
        topic: 'Outer planets of the solar system',
        resources: resources.systems,
      },
      {
        week: 4,
        strand: 'Systems',
        subStrand: 'Ecosystem',
        contentStandard:
          'B8/JHS2.3.3.1 Demonstrate an understanding of the interdependence of organisms in an ecosystem.',
        indicator:
          'B8/JHS2.3.3.1.1 Explore the feeding relationships within an ecosystem.',
        topic: 'Food chains, food webs and energy flow',
        resources: resources.systems,
      },
      {
        week: 5,
        strand: 'Systems',
        subStrand: 'Farming Systems',
        contentStandard:
          'B8/JHS2.3.4.1 Demonstrate understanding of crop, animal and land combinations under farming systems.',
        indicator:
          'B8/JHS2.3.4.1.1 Identify and describe the combinations used in different farming systems.',
        topic: 'Crop, animal and land combinations in farming systems',
        resources: resources.agriculture,
      },
      {
        week: 6,
        strand: 'Systems',
        subStrand: 'Farming Systems',
        contentStandard:
          'B8/JHS2.3.4.1 Demonstrate understanding of crop, animal and land combinations under farming systems.',
        indicator:
          'B8/JHS2.3.4.1.2 Discuss the usefulness of the crops and animals involved in farming systems.',
        topic: 'Usefulness of crops and animals in farming systems',
        resources: resources.agriculture,
      },
      {
        week: 7,
        strand: 'Forces and Energy',
        subStrand: 'Energy',
        contentStandard:
          'B8/JHS2.4.1.1 Demonstrate the skill to evaluate the conversion of energy from one form to another.',
        indicator:
          'B8/JHS2.4.1.1.1-1.2 Describe energy conversion and discuss its importance.',
        topic: 'Energy conversion and its importance',
        resources: resources.energy,
      },
      {
        week: 8,
        strand: 'Forces and Energy',
        subStrand: 'Energy',
        contentStandard:
          'B8/JHS2.4.1.2 Show an understanding of renewable and non-renewable sources of energy.',
        indicator:
          'B8/JHS2.4.1.2.1 Describe renewable and non-renewable forms of energy.',
        topic: 'Renewable and non-renewable energy sources',
        resources: resources.energy,
      },
      {
        week: 9,
        strand: 'Forces and Energy',
        subStrand: 'Energy',
        contentStandard:
          'B8/JHS2.4.1.2 Show an understanding of renewable and non-renewable sources of energy.',
        indicator:
          'B8/JHS2.4.1.2.2 Demonstrate how to manage renewable energy sources sustainably.',
        topic: 'Managing renewable energy sustainably',
        resources: resources.energy,
      },
      {
        week: 10,
        strand: 'Forces and Energy',
        subStrand: 'Energy',
        contentStandard:
          'B8/JHS2.4.1.3 Demonstrate an understanding of the relationship between heat and temperature.',
        indicator:
          'B8/JHS2.4.1.3.1 Discuss the differences and relationship between heat and temperature.',
        topic: 'Heat and temperature',
        resources: resources.energy,
      },
      {
        week: 11,
        strand: 'Forces and Energy',
        subStrand: 'Electricity and Electronics',
        contentStandard:
          'B8/JHS2.4.2.1-2.4.2.2 Demonstrate knowledge of electricity transmission and capacitor functions in circuits.',
        indicator:
          'B8/JHS2.4.2.1.1 and B8/JHS2.4.2.2.1 Explain electricity transmission and capacitor behaviour in DC circuits.',
        topic: 'Electricity transmission and capacitors in circuits',
        resources: resources.energy,
      },
      {
        week: 12,
        strand: 'Forces and Energy',
        subStrand: 'Conversion and Conservation of Energy',
        contentStandard:
          'B8/JHS2.4.3.1 Evaluate the impact of conversion of energy and energy conservation on the environment.',
        indicator:
          'B8/JHS2.4.3.1.1 Explain the importance of conversion of energy and energy conservation in daily life.',
        topic: 'Energy conservation and environmental impact',
        resources: resources.energy,
      },
    ],
  },
  {
    subject: 'Science',
    classLevel: 'B8',
    term: 'Term 3',
    title: 'B8 Science Scheme of Work - Term 3',
    weeks: [
      {
        week: 1,
        strand: 'Forces and Energy',
        subStrand: 'Force and Motion',
        contentStandard:
          'B8/JHS2.4.4.1 Demonstrate the production of magnets and the application of magnetic force and Newton\'s second law.',
        indicator:
          'B8/JHS2.4.4.1.1 Demonstrate simple ways of making magnets and their applications.',
        topic: 'Producing magnets and applying magnetic force',
        resources: resources.energy,
      },
      {
        week: 2,
        strand: 'Forces and Energy',
        subStrand: 'Force and Motion',
        contentStandard:
          'B8/JHS2.4.4.1 Demonstrate the production of magnets and the application of magnetic force and Newton\'s second law.',
        indicator:
          'B8/JHS2.4.4.1.2 Explain the relationship between magnetic force and Newton\'s second law of motion.',
        topic: 'Magnetic force and Newton\'s second law',
        resources: resources.energy,
      },
      {
        week: 3,
        strand: 'Forces and Energy',
        subStrand: 'Force and Motion',
        contentStandard:
          'B8/JHS2.4.4.2 Demonstrate understanding of complex machines and how they work.',
        indicator:
          'B8/JHS2.4.4.2.1 Identify complex machines and describe their functions in life.',
        topic: 'Complex machines and their functions',
        resources: resources.energy,
      },
      {
        week: 4,
        strand: 'Forces and Energy',
        subStrand: 'Agricultural Tools',
        contentStandard:
          'B8/JHS2.4.5.1 Demonstrate knowledge and skills in the use of basic and simple agricultural tools.',
        indicator:
          'B8/JHS2.4.5.1.1-1.2 Show, discuss and use simple agricultural tools for basic on-farm activities.',
        topic: 'Using agricultural tools for on-farm activities',
        resources: resources.agriculture,
      },
      {
        week: 5,
        strand: 'Humans and the Environment',
        subStrand: 'Waste Management',
        contentStandard:
          'B8/JHS2.5.1.1 Demonstrate knowledge of waste management systems and apply them in the environment.',
        indicator:
          'B8/JHS2.5.1.1.1-1.2 Explain sustainable waste management practices and apply them in a community.',
        topic: 'Sustainable waste management practices',
        resources: resources.environment,
      },
      {
        week: 6,
        strand: 'Humans and the Environment',
        subStrand: 'Human Health',
        contentStandard:
          'B8/JHS2.5.2.1 Demonstrate knowledge of communicable diseases of humans.',
        indicator:
          'B8/JHS2.5.2.1.1 Explain the symptoms, effects and prevention of common communicable diseases.',
        topic: 'Communicable diseases and their prevention',
        resources: resources.environment,
      },
      {
        week: 7,
        strand: 'Humans and the Environment',
        subStrand: 'Human Health',
        contentStandard:
          'B8/JHS2.5.2.2 Demonstrate knowledge of selected bacterial diseases of humans.',
        indicator:
          'B8/JHS2.5.2.2.1 Explain the nature of bacterial diseases such as food poisoning, gonorrhoea and meningitis.',
        topic: 'Bacterial diseases of humans',
        resources: resources.environment,
      },
      {
        week: 8,
        strand: 'Humans and the Environment',
        subStrand: 'Science and Industry',
        contentStandard:
          'B8/JHS2.5.3.1 Demonstrate how science and technology improve industry and everyday life.',
        indicator:
          'B8/JHS2.5.3.1.1 Identify science-related technologies and their contribution to life and industry.',
        topic: 'Science, technology and industry in everyday life',
        resources: resources.environment,
      },
      {
        week: 9,
        strand: 'Humans and the Environment',
        subStrand: 'Climate Change and Green Economy',
        contentStandard:
          'B8/JHS2.5.4.1 Demonstrate an understanding of the effects of climate change in the world and greening efforts.',
        indicator:
          'B8/JHS2.5.4.1.1 Explain the concept of climate change and its effect on the environment.',
        topic: 'Climate change and its effects',
        resources: resources.environment,
      },
      {
        week: 10,
        strand: 'Humans and the Environment',
        subStrand: 'Understanding the Environment',
        contentStandard:
          'B8/JHS2.5.5.1 Demonstrate understanding of differences among soils and plant parts in different environments.',
        indicator:
          'B8/JHS2.5.5.1.1-1.2 Discuss physical properties of soils and their importance in crop production.',
        topic: 'Soil types, properties and crop production',
        resources: resources.environment,
      },
      {
        week: 11,
        strand: 'Humans and the Environment',
        subStrand: 'Understanding the Environment',
        contentStandard:
          'B8/JHS2.5.6.1 Recognise the different types of rocks as origins of soils.',
        indicator:
          'B8/JHS2.5.6.1.1 Observe and describe different types of rocks as origins of soils.',
        topic: 'Rocks as origins of soils',
        resources: resources.environment,
      },
      {
        week: 12,
        strand: 'Humans and the Environment',
        subStrand: 'Understanding the Environment',
        contentStandard:
          'B8/JHS2.5.5.1 and B8/JHS2.5.6.1 connect soils, roots and rocks to plant growth in the environment.',
        indicator:
          'B8/JHS2.5.5.1.2 and B8/JHS2.5.6.1.1 Analyse soil water content and connect rock weathering to soil formation.',
        topic: 'Soil, roots and rock weathering in plant growth',
        resources: resources.environment,
      },
    ],
  },
];

export const scienceB9Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'Science',
    classLevel: 'B9',
    term: 'Term 1',
    title: 'B9 Science Scheme of Work - Term 1',
    weeks: [
      {
        week: 1,
        strand: 'Diversity of Matter',
        subStrand: 'Materials',
        contentStandard:
          'B9/JHS3.1.1.1 Show an understanding of formation of binary chemical compounds and their uses.',
        indicator:
          'B9/JHS3.1.1.1.1-1.2 Identify binary chemical compounds, discuss their uses and explain their formation.',
        topic: 'Binary chemical compounds and their uses',
        resources: resources.matter,
      },
      {
        week: 2,
        strand: 'Diversity of Matter',
        subStrand: 'Materials',
        contentStandard:
          'B9/JHS3.1.1.2 Demonstrate knowledge of atomic bonding in the formation of chemical compounds.',
        indicator:
          'B9/JHS3.1.1.2.1 Recognise that chemical bonds result from attraction between atoms.',
        topic: 'Atomic bonding in compounds',
        resources: resources.matter,
      },
      {
        week: 3,
        strand: 'Diversity of Matter',
        subStrand: 'Living Cells',
        contentStandard:
          'B9/JHS3.1.2.1 Demonstrate knowledge of specialised cells of dicotyledonous plants and humans.',
        indicator:
          'B9/JHS3.1.2.1.1 Discuss specialised cells and how they are formed in dicotyledonous plants and humans.',
        topic: 'Specialised cells in plants and humans',
        resources: resources.cells,
      },
      {
        week: 4,
        strand: 'Diversity of Matter',
        subStrand: 'Living Cells',
        contentStandard:
          'B9/JHS3.1.2.1 Demonstrate knowledge of specialised cells of dicotyledonous plants and humans.',
        indicator:
          'B9/JHS3.1.2.1.2 Examine the functions of specialised cells in dicotyledonous plants.',
        topic: 'Functions of specialised plant and human cells',
        resources: resources.cells,
      },
      {
        week: 5,
        strand: 'Cycles',
        subStrand: 'Earth Sciences',
        contentStandard:
          'B9/JHS3.2.1.1 Demonstrate an understanding of the nitrogen cycle as a repeated pattern in nature.',
        indicator:
          'B9/JHS3.2.1.1.1 Explain the process of the nitrogen cycle.',
        topic: 'The nitrogen cycle',
        resources: resources.systems,
      },
      {
        week: 6,
        strand: 'Cycles',
        subStrand: 'Earth Sciences',
        contentStandard:
          'B9/JHS3.2.1.1 Demonstrate an understanding of the nitrogen cycle as a repeated pattern in nature.',
        indicator:
          'B9/JHS3.2.1.1.1 Explain the relationship between the nitrogen cycle and the environment.',
        topic: 'Nitrogen cycle and the environment',
        resources: resources.systems,
      },
      {
        week: 7,
        strand: 'Cycles',
        subStrand: 'Life Cycle of Organisms',
        contentStandard:
          'B9/JHS3.2.2.1 Demonstrate an understanding of the life cycle of the grasshopper and its effects on humans.',
        indicator:
          'B9/JHS3.2.2.1.1 Describe the life cycle of the grasshopper as incomplete metamorphosis.',
        topic: 'Life cycle of the grasshopper',
        resources: resources.systems,
      },
      {
        week: 8,
        strand: 'Cycles',
        subStrand: 'Life Cycle of Organisms',
        contentStandard:
          'B9/JHS3.2.2.1 Demonstrate an understanding of the life cycle of the grasshopper and its effects on humans.',
        indicator:
          'B9/JHS3.2.2.1.1 Compare incomplete metamorphosis in grasshopper with housefly and mosquito.',
        topic: 'Incomplete metamorphosis and effects of grasshoppers',
        resources: resources.systems,
      },
      {
        week: 9,
        strand: 'Cycles',
        subStrand: 'Crop Production',
        contentStandard:
          'B9/JHS3.2.3.1 Show an understanding of differences in maturities of crops grown in different soils and seed beds.',
        indicator:
          'B9/JHS3.2.3.1.1 Observe and describe differences in maturation of crops grown in different soils and seed beds.',
        topic: 'Maturity stages of crops in different soils and seed beds',
        resources: resources.agriculture,
      },
      {
        week: 10,
        strand: 'Cycles',
        subStrand: 'Crop Production',
        contentStandard:
          'B9/JHS3.2.3.2 Demonstrate knowledge of uses of different crops at different maturity stages.',
        indicator:
          'B9/JHS3.2.3.2.1 Observe and record the uses of different crops at different maturity stages.',
        topic: 'Uses of crops at different maturity stages',
        resources: resources.agriculture,
      },
      {
        week: 11,
        strand: 'Cycles',
        subStrand: 'Animal Production',
        contentStandard:
          'B9/JHS3.2.4.1 Demonstrate understanding of the preparation of feed for domestic and commercial animals.',
        indicator:
          'B9/JHS3.2.4.1.1 List ingredients and methods of preparing feed for animals.',
        topic: 'Preparation of animal feed',
        resources: resources.agriculture,
      },
      {
        week: 12,
        strand: 'Cycles',
        subStrand: 'Animal Production',
        contentStandard:
          'B9/JHS3.2.4.2 Demonstrate skills and knowledge of feeding domestic and commercial animals.',
        indicator:
          'B9/JHS3.2.4.2.1 Describe and select appropriate feed for animals.',
        topic: 'Selecting appropriate feed for domestic and commercial animals',
        resources: resources.agriculture,
      },
    ],
  },
  {
    subject: 'Science',
    classLevel: 'B9',
    term: 'Term 2',
    title: 'B9 Science Scheme of Work - Term 2',
    weeks: [
      {
        week: 1,
        strand: 'Systems',
        subStrand: 'The Human Body System',
        contentStandard:
          'B9/JHS3.3.1.1 Demonstrate understanding of the blood circulatory system and its relationship with the respiratory system.',
        indicator:
          'B9/JHS3.3.1.1.1 Explain the concept of the circulatory system and the functions of its parts.',
        topic: 'The circulatory system and its parts',
        resources: resources.systems,
      },
      {
        week: 2,
        strand: 'Systems',
        subStrand: 'The Human Body System',
        contentStandard:
          'B9/JHS3.3.1.1 Demonstrate understanding of the blood circulatory system and its relationship with the respiratory system.',
        indicator:
          'B9/JHS3.3.1.1.1 Describe diseases of the circulatory system and their prevention.',
        topic: 'Health challenges of the circulatory system',
        resources: resources.systems,
      },
      {
        week: 3,
        strand: 'Systems',
        subStrand: 'The Human Body System',
        contentStandard:
          'B9/JHS3.3.1.1 Demonstrate understanding of the blood circulatory system and its relationship with the respiratory system.',
        indicator:
          'B9/JHS3.3.1.1.2 Explain respiration and how the respiratory and circulatory systems complement each other.',
        topic: 'Respiration and the link between respiratory and circulatory systems',
        resources: resources.systems,
      },
      {
        week: 4,
        strand: 'Systems',
        subStrand: 'The Solar System',
        contentStandard:
          'B9/JHS3.3.2.1 Demonstrate knowledge of non-planetary bodies in the solar system.',
        indicator:
          'B9/JHS3.3.2.1.1 Understand the movement of non-planetary bodies in the solar system.',
        topic: 'Comets, asteroids and other non-planetary bodies',
        resources: resources.systems,
      },
      {
        week: 5,
        strand: 'Systems',
        subStrand: 'Ecosystem',
        contentStandard:
          'B9/JHS3.3.3.1 Recognise the interdependence of organisms in an ecosystem and appreciate their interaction.',
        indicator:
          'B9/JHS3.3.3.1.1 Conduct research into the composition of an ecosystem and discuss interdependence.',
        topic: 'Interdependence and balance in ecosystems',
        resources: resources.systems,
      },
      {
        week: 6,
        strand: 'Systems',
        subStrand: 'Farming Systems',
        contentStandard:
          'B9/JHS3.3.4.1 Demonstrate knowledge and skills in the preparation of manure from animal and plant waste.',
        indicator:
          'B9/JHS3.3.4.1.1 List and explain the different plant and animal waste used in preparing manure.',
        topic: 'Preparing manure from plant and animal waste',
        resources: resources.agriculture,
      },
      {
        week: 7,
        strand: 'Forces and Energy',
        subStrand: 'Energy',
        contentStandard:
          'B9/JHS3.4.1.1 Show understanding of conservation of energy and ways of conserving energy.',
        indicator:
          'B9/JHS3.4.1.1.1-1.1.2 List ways to conserve energy and explain their importance.',
        topic: 'Energy conservation in daily life',
        resources: resources.energy,
      },
      {
        week: 8,
        strand: 'Forces and Energy',
        subStrand: 'Energy',
        contentStandard:
          'B9/JHS3.4.1.2 Demonstrate understanding in calculations involving energy and light applications.',
        indicator:
          'B9/JHS3.4.1.2.1 Explain how to calculate energy consumed over a period of time.',
        topic: 'Calculating electrical energy consumption',
        resources: resources.energy,
      },
      {
        week: 9,
        strand: 'Forces and Energy',
        subStrand: 'Energy',
        contentStandard:
          'B9/JHS3.4.1.2-4.1.3 Explore applications of light energy in life.',
        indicator:
          'B9/JHS3.4.1.2.2-1.2.4 and B9/JHS3.4.1.3.1 Describe image formation in cameras, shadows, eclipses and refraction.',
        topic: 'Light energy: cameras, shadows, eclipses and refraction',
        resources: resources.energy,
      },
      {
        week: 10,
        strand: 'Forces and Energy',
        subStrand: 'Electricity and Electronics',
        contentStandard:
          'B9/JHS3.4.2.1 Construct electrical circuits and perform simple electrical calculations.',
        indicator:
          'B9/JHS3.4.2.1.1 Demonstrate transformation of electrical energy in series and parallel circuits and perform circuit calculations.',
        topic: 'Series and parallel circuits',
        resources: resources.energy,
      },
      {
        week: 11,
        strand: 'Forces and Energy',
        subStrand: 'Electricity and Electronics',
        contentStandard:
          'B9/JHS3.4.2.2 Demonstrate understanding of forward and reverse bias and electronic components.',
        indicator:
          'B9/JHS3.4.2.2.1 Describe forward and reverse bias and explain the behaviour of LEDs, diodes, resistors and capacitors.',
        topic: 'Forward bias, reverse bias and component behaviour',
        resources: resources.energy,
      },
      {
        week: 12,
        strand: 'Forces and Energy',
        subStrand: 'Conversion and Conservation of Energy',
        contentStandard:
          'B9/JHS3.4.3.1 Show an understanding of conversion and conservation of energy and their application to life.',
        indicator:
          'B9/JHS3.4.3.1.1-3.1.2 Describe conversion and conservation of energy and their applications.',
        topic: 'Applications of energy conversion and conservation',
        resources: resources.energy,
      },
    ],
  },
  {
    subject: 'Science',
    classLevel: 'B9',
    term: 'Term 3',
    title: 'B9 Science Scheme of Work - Term 3',
    weeks: [
      {
        week: 1,
        strand: 'Forces and Energy',
        subStrand: 'Force and Motion',
        contentStandard:
          'B9/JHS3.4.4.1 Demonstrate understanding of pressure and how pressure acts in everyday life.',
        indicator:
          'B9/JHS3.4.4.1.1 Explain the concept of pressure and show how pressure relates to force.',
        topic: 'Pressure and its application in everyday life',
        resources: resources.energy,
      },
      {
        week: 2,
        strand: 'Forces and Energy',
        subStrand: 'Force and Motion',
        contentStandard:
          'B9/JHS3.4.4.2 Demonstrate understanding of Newton\'s third law of motion and its application in life.',
        indicator:
          'B9/JHS3.4.4.2.1 Explain the importance of Newton\'s third law of motion in life.',
        topic: 'Newton\'s third law of motion',
        resources: resources.energy,
      },
      {
        week: 3,
        strand: 'Forces and Energy',
        subStrand: 'Agricultural Tools',
        contentStandard:
          'B9/JHS3.4.5.1 Demonstrate knowledge and skills in making simple agricultural tools.',
        indicator:
          'B9/JHS3.4.5.1.1-1.3 Identify materials, explain processes and manufacture simple agricultural tools.',
        topic: 'Making simple agricultural tools',
        resources: resources.agriculture,
      },
      {
        week: 4,
        strand: 'Humans and the Environment',
        subStrand: 'Waste Management',
        contentStandard:
          'B9/JHS3.5.1.1-5.1.2 Demonstrate understanding of scientific and innovative waste management practices.',
        indicator:
          'B9/JHS3.5.1.1.1 and B9/JHS3.5.1.2.1 Investigate scientific methods of waste management and describe innovative approaches.',
        topic: 'Scientific and innovative waste management',
        resources: resources.environment,
      },
      {
        week: 5,
        strand: 'Humans and the Environment',
        subStrand: 'Human Health',
        contentStandard:
          'B9/JHS3.5.2.1 Demonstrate knowledge of common non-communicable diseases of humans.',
        indicator:
          'B9/JHS3.5.2.1.1 Explain symptoms, effects and prevention of non-communicable diseases and their risk factors.',
        topic: 'Non-communicable diseases and risk factors',
        resources: resources.environment,
      },
      {
        week: 6,
        strand: 'Humans and the Environment',
        subStrand: 'Human Health',
        contentStandard:
          'B9/JHS3.5.2.2 Demonstrate understanding of the relationship of health and disease.',
        indicator:
          'B9/JHS3.5.2.2.1-2.2 Explain health and disease and identify common diseases in the environment.',
        topic: 'Health, disease and community disease control',
        resources: resources.environment,
      },
      {
        week: 7,
        strand: 'Humans and the Environment',
        subStrand: 'Science and Industry',
        contentStandard:
          'B9/JHS3.5.3.1 Analyse scientific concepts, principles and processes applied in industries.',
        indicator:
          'B9/JHS3.5.3.1.1 Investigate scientific concepts and processes involved in industries.',
        topic: 'Science concepts in industry',
        resources: resources.environment,
      },
      {
        week: 8,
        strand: 'Humans and the Environment',
        subStrand: 'Science and Industry',
        contentStandard:
          'B9/JHS3.5.3.2 Demonstrate understanding of the concept of industry and technologies in indigenous and western industries.',
        indicator:
          'B9/JHS3.5.3.2.1 Explain the concept of industry and distinguish between modern and indigenous industries.',
        topic: 'Modern and indigenous industries',
        resources: resources.environment,
      },
      {
        week: 9,
        strand: 'Humans and the Environment',
        subStrand: 'Climate Change and Green Economy',
        contentStandard:
          'B9/JHS3.5.4.1 Demonstrate understanding of natural and human factors that influence climate change and green economy.',
        indicator:
          'B9/JHS3.5.4.1.1 Examine natural and human factors that influence climate change.',
        topic: 'Factors influencing climate change and green economy',
        resources: resources.environment,
      },
      {
        week: 10,
        strand: 'Humans and the Environment',
        subStrand: 'Climate Change and Green Economy',
        contentStandard:
          'B9/JHS3.5.4.2 Evaluate the effectiveness of initiatives that address climate change and green economy.',
        indicator:
          'B9/JHS3.5.4.2.1 Assess climate change and green economy initiatives in Ghana and other countries.',
        topic: 'Evaluating climate change initiatives',
        resources: resources.environment,
      },
      {
        week: 11,
        strand: 'Humans and the Environment',
        subStrand: 'Understanding the Environment',
        contentStandard:
          'B9/JHS3.5.5.1 Demonstrate knowledge and skills in the use of plant roots, stems, leaves, flowers and fruits.',
        indicator:
          'B9/JHS3.5.5.1.1 Show and list the uses of different plant parts for agricultural and non-agricultural purposes.',
        topic: 'Uses of plant parts in agriculture and everyday life',
        resources: resources.environment,
      },
      {
        week: 12,
        strand: 'Humans and the Environment',
        subStrand: 'Understanding the Environment',
        contentStandard:
          'B9/JHS3.5.5.1 Demonstrate knowledge and skills in the use of plant parts in the environment.',
        indicator:
          'B9/JHS3.5.5.1.1 Connect plant parts to agriculture, housing, medicine, tools and cultural uses.',
        topic: 'Plant parts as community resources',
        resources: resources.environment,
      },
    ],
  },
];
