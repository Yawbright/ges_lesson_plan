import type { ClassLevel } from '@/types/lessonPlan';
import type { SchemeWeek } from '@/types/scheme';

export interface ExplicitCurriculumTerm {
  subject: string;
  classLevel: ClassLevel;
  term: string;
  title: string;
  weeks: SchemeWeek[];
}

const resources = {
  matter: ['Science textbook', 'Charts', 'Samples of solids, liquids and gases'],
  cells: ['Microscope', 'Charts', 'Magnifier', 'Drawing book'],
  agriculture: ['School garden', 'Manure samples', 'Farm tools', 'Community observation notes'],
  systems: ['Science textbook', 'Charts', 'Models', 'Videos'],
  energy: ['Torch', 'Magnets', 'Simple circuit kit', 'Charts'],
  environment: ['Posters', 'Community case studies', 'Science textbook', 'Project notebook'],
};

export const scienceB7Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'Science',
    classLevel: 'B7',
    term: 'Term 1',
    title: 'B7 Science Scheme of Work - Term 1',
    weeks: [
      {
        week: 1,
        strand: 'Diversity of Matter',
        subStrand: 'Materials',
        contentStandard:
          'B7/JHS1.1.1.1 Recognise materials as important resources for providing human needs.',
        indicator:
          'B7/JHS1.1.1.1.1 Classify materials into liquids, solids and gases.',
        topic: 'Classification of materials into solids, liquids and gases',
        resources: resources.matter,
      },
      {
        week: 2,
        strand: 'Diversity of Matter',
        subStrand: 'Materials',
        contentStandard:
          'B7/JHS1.1.1.1 Recognise materials as important resources for providing human needs.',
        indicator:
          'B7/JHS1.1.1.1.2 Discuss the importance of liquids in the life of humans.',
        topic: 'Importance and preservation of liquids in human life',
        resources: resources.matter,
      },
      {
        week: 3,
        strand: 'Diversity of Matter',
        subStrand: 'Materials',
        contentStandard:
          'B7/JHS1.1.1.1 Recognise materials as important resources for providing human needs.',
        indicator:
          'B7/JHS1.1.1.1.3 Discuss the importance of specific solids to life.',
        topic: 'Useful solids in the environment and their preservation',
        resources: resources.matter,
      },
      {
        week: 4,
        strand: 'Diversity of Matter',
        subStrand: 'Materials',
        contentStandard:
          'B7/JHS1.1.1.2 Understand the periodic table as different elements made up of metals, non-metals and noble gases arranged in an order.',
        indicator:
          'B7/JHS1.1.1.2.1 Demonstrate the orderly arrangement of metals, non-metals and noble gases in the periodic table.',
        topic: 'Introduction to the periodic table and the first 20 elements',
        resources: ['Periodic table chart', 'Science textbook', 'Element cards'],
      },
      {
        week: 5,
        strand: 'Diversity of Matter',
        subStrand: 'Living Cells',
        contentStandard:
          'B7/JHS1.1.2.1 Demonstrate understanding of the structure of organisms and functions of cells in living systems.',
        indicator:
          'B7/JHS1.1.2.1.1 Describe the structure and function of living cells of an animal.',
        topic: 'Animal cell structure, organelles and functions',
        resources: resources.cells,
      },
      {
        week: 6,
        strand: 'Diversity of Matter',
        subStrand: 'Living Cells',
        contentStandard:
          'B7/JHS1.1.2.1 Demonstrate understanding of the structure of organisms and functions of cells in living systems.',
        indicator:
          'B7/JHS1.1.2.1.2 State the functions of each organelle in a plant cell.',
        topic: 'Plant cell structure and functions of organelles',
        resources: resources.cells,
      },
      {
        week: 7,
        strand: 'Cycles',
        subStrand: 'Earth Science',
        contentStandard:
          'B7/JHS1.2.1.1 Recognise that the water cycle is an example of repeated patterns of change in nature and understand how it occurs.',
        indicator:
          'B7/JHS1.2.1.1.1 Explain how the water cycle occurs as a repeated pattern in nature.',
        topic: 'Stages of the water cycle',
        resources: ['Water cycle chart', 'Videos', 'Science textbook'],
      },
      {
        week: 8,
        strand: 'Cycles',
        subStrand: 'Earth Science',
        contentStandard:
          'B7/JHS1.2.1.1 Recognise that the water cycle is an example of repeated patterns of change in nature and understand how it occurs.',
        indicator:
          'B7/JHS1.2.1.1.2 Describe the importance of the water cycle in nature.',
        topic: 'Importance of the water cycle in communities and ecosystems',
        resources: ['Water cycle chart', 'Community examples', 'Science textbook'],
      },
      {
        week: 9,
        strand: 'Cycles',
        subStrand: 'Life Cycle of Organisms',
        contentStandard:
          'B7/JHS1.2.2.1 Demonstrate understanding of the life cycle of the housefly and its effect on humans.',
        indicator:
          'B7/JHS1.2.2.1.1 Describe the stages in the life cycle of the housefly.',
        topic: 'Life cycle of the housefly',
        resources: ['Charts', 'Pictures', 'Science textbook'],
      },
      {
        week: 10,
        strand: 'Cycles',
        subStrand: 'Life Cycle of Organisms',
        contentStandard:
          'B7/JHS1.2.2.1 Demonstrate understanding of the life cycle of the housefly and its effect on humans.',
        indicator:
          'B7/JHS1.2.2.1.2 Discuss the activities of the housefly as a menace to humans and show how to reduce the effects of those activities.',
        topic: 'Housefly as a disease carrier and its control',
        resources: ['Posters', 'Community sanitation examples', 'Science textbook'],
      },
      {
        week: 11,
        strand: 'Cycles',
        subStrand: 'Crop Production',
        contentStandard:
          'B7/JHS1.2.3.1 Demonstrate understanding of the different plant nutrients and their application in school farming.',
        indicator:
          'B7/JHS1.2.3.1.1 Observe and list plant nutrient sources and categorise them into organic and inorganic nutrient sources.',
        topic: 'Organic and inorganic plant nutrients',
        resources: resources.agriculture,
      },
      {
        week: 12,
        strand: 'Cycles',
        subStrand: 'Crop Production',
        contentStandard:
          'B7/JHS1.2.3.1 Demonstrate understanding of the different plant nutrients and their application in school farming.',
        indicator:
          'B7/JHS1.2.3.1.2 Describe the physical characteristics of different plant nutrients and how each is applied to plants in the field.',
        topic: 'Application of plant nutrients in school gardening',
        resources: resources.agriculture,
      },
    ],
  },
  {
    subject: 'Science',
    classLevel: 'B7',
    term: 'Term 2',
    title: 'B7 Science Scheme of Work - Term 2',
    weeks: [
      {
        week: 1,
        strand: 'Cycles',
        subStrand: 'Animal Production',
        contentStandard:
          'B7/JHS1.2.4.1 Demonstrate an understanding of the differences among domestic animals such as ruminants, monogastrics and poultry.',
        indicator:
          'B7/JHS1.2.4.1.1 Examine and list domestic animals in the community.',
        topic: 'Domestic animals and their breeds in the community',
        resources: resources.agriculture,
      },
      {
        week: 2,
        strand: 'Cycles',
        subStrand: 'Animal Production',
        contentStandard:
          'B7/JHS1.2.4.1 Demonstrate an understanding of the differences among domestic animals such as ruminants, monogastrics and poultry.',
        indicator:
          'B7/JHS1.2.4.1.2 Show the differences and similarities among domestic animals.',
        topic: 'Ruminants, monogastrics and poultry',
        resources: resources.agriculture,
      },
      {
        week: 3,
        strand: 'Cycles',
        subStrand: 'Animal Production',
        contentStandard:
          'B7/JHS1.2.4.2 Show an understanding of the usefulness of the different types of animals for domestic and commercial purposes.',
        indicator:
          'B7/JHS1.2.4.2.1-2.2 Discuss, write and compare the domestic and commercial uses of different types of animals.',
        topic: 'Uses of animals for domestic and commercial purposes',
        resources: resources.agriculture,
      },
      {
        week: 4,
        strand: 'Systems',
        subStrand: 'The Human Body System',
        contentStandard:
          'B7/JHS1.3.1.1 Show an understanding of the concept of food, and the process of digestion and appreciate its importance in humans.',
        indicator:
          'B7/JHS1.3.1.1.1 Explain the concept of food and the need for humans to eat.',
        topic: 'Food, nutrients and the need for feeding',
        resources: resources.systems,
      },
      {
        week: 5,
        strand: 'Systems',
        subStrand: 'The Human Body System',
        contentStandard:
          'B7/JHS1.3.1.1 Show an understanding of the concept of food, and the process of digestion and appreciate its importance in humans.',
        indicator:
          'B7/JHS1.3.1.1.2 Examine what happens to food at the stages of digestion in humans.',
        topic: 'Digestive system and stages of digestion',
        resources: resources.systems,
      },
      {
        week: 6,
        strand: 'Systems',
        subStrand: 'The Human Body System',
        contentStandard:
          'B7/JHS1.3.1.1 Show an understanding of the concept of food, and the process of digestion and appreciate its importance in humans.',
        indicator:
          'B7/JHS1.3.1.1.3 Identify the end products of digestion and explain absorption in humans.',
        topic: 'End products of digestion and absorption',
        resources: resources.systems,
      },
      {
        week: 7,
        strand: 'Systems',
        subStrand: 'The Solar System',
        contentStandard:
          'B7/JHS1.3.2.1 Demonstrate knowledge of the inner planets of the solar system and understand their movement in the system.',
        indicator:
          'B7/JHS1.3.2.1.1 Identify the inner planets of the solar system and describe their properties.',
        topic: 'The inner planets of the solar system',
        resources: resources.systems,
      },
      {
        week: 8,
        strand: 'Systems',
        subStrand: 'The Solar System',
        contentStandard:
          'B7/JHS1.3.2.1 Demonstrate knowledge of the inner planets of the solar system and understand their movement in the system.',
        indicator:
          'B7/JHS1.3.2.1.2 Discuss the properties and relative motions of Mercury and Venus.',
        topic: 'Mercury and Venus: properties and movement',
        resources: resources.systems,
      },
      {
        week: 9,
        strand: 'Systems',
        subStrand: 'Ecosystem',
        contentStandard:
          'B7/JHS1.3.3.1 Recognise the components of and interdependences in an ecosystem, and appreciate their interactions.',
        indicator:
          'B7/JHS1.3.3.1.1 Analyse the components of ecosystems and identify the interactions within.',
        topic: 'Components and categories of ecosystems',
        resources: resources.systems,
      },
      {
        week: 10,
        strand: 'Systems',
        subStrand: 'Ecosystem',
        contentStandard:
          'B7/JHS1.3.3.1 Recognise the components of and interdependences in an ecosystem, and appreciate their interactions.',
        indicator:
          'B7/JHS1.3.3.1.1 Analyse the components of ecosystems and identify the interactions within.',
        topic: 'Interdependence among living and non-living components in ecosystems',
        resources: resources.systems,
      },
      {
        week: 11,
        strand: 'Systems',
        subStrand: 'Farming Systems',
        contentStandard:
          'B7/JHS1.3.4.1 Demonstrate an understanding of the differences among the various farming systems.',
        indicator:
          'B7/JHS1.3.4.1.1 Examine and discuss the differences among the various farming systems.',
        topic: 'Types and characteristics of farming systems',
        resources: resources.agriculture,
      },
      {
        week: 12,
        strand: 'Systems',
        subStrand: 'Farming Systems',
        contentStandard:
          'B7/JHS1.3.4.1 Demonstrate an understanding of the differences among the various farming systems.',
        indicator:
          'B7/JHS1.3.4.1.2-1.3 Categorise different farming systems and discuss their usefulness.',
        topic: 'Classifying farming systems and evaluating their usefulness',
        resources: resources.agriculture,
      },
    ],
  },
  {
    subject: 'Science',
    classLevel: 'B7',
    term: 'Term 3',
    title: 'B7 Science Scheme of Work - Term 3',
    weeks: [
      {
        week: 1,
        strand: 'Forces and Energy',
        subStrand: 'Energy',
        contentStandard:
          'B7/JHS1.4.1.1 Demonstrate an understanding of the concept of energy and forms of energy.',
        indicator:
          'B7/JHS1.4.1.1.1 Identify the various forms of energy and show their sources.',
        topic: 'Forms and sources of energy',
        resources: resources.energy,
      },
      {
        week: 2,
        strand: 'Forces and Energy',
        subStrand: 'Energy',
        contentStandard:
          'B7/JHS1.4.1.1 Demonstrate an understanding of the concept of energy and forms of energy.',
        indicator:
          'B7/JHS1.4.1.1.2 Explain daily applications of forms of energy.',
        topic: 'Applications of energy in daily life',
        resources: resources.energy,
      },
      {
        week: 3,
        strand: 'Forces and Energy',
        subStrand: 'Energy',
        contentStandard:
          'B7/JHS1.4.1.2 Demonstrate an understanding of the concept of heat transfer and its applications in life.',
        indicator:
          'B7/JHS1.4.1.2.1 Explain and demonstrate how heat is transferred in various media.',
        topic: 'Heat transfer in solids, liquids and gases',
        resources: resources.energy,
      },
      {
        week: 4,
        strand: 'Forces and Energy',
        subStrand: 'Energy',
        contentStandard:
          'B7/JHS1.4.1.3 Demonstrate understanding of characteristics of light, such as travelling in a straight line, reflection, refraction and dispersion.',
        indicator:
          'B7/JHS1.4.1.3.1 Demonstrate how light travels in a straight line and how it can be reflected, refracted and dispersed.',
        topic: 'Properties of light: reflection, refraction and dispersion',
        resources: resources.energy,
      },
      {
        week: 5,
        strand: 'Forces and Energy',
        subStrand: 'Electricity and Electronics',
        contentStandard:
          'B7/JHS1.4.2.1 Demonstrate understanding of forms of electricity, its generation and effects on the environment.',
        indicator:
          'B7/JHS1.4.2.1.1-2.1.2 Describe forms of electricity generation and explain their effects on the environment.',
        topic: 'Electricity generation and environmental effects',
        resources: resources.energy,
      },
      {
        week: 6,
        strand: 'Forces and Energy',
        subStrand: 'Electricity and Electronics',
        contentStandard:
          'B7/JHS1.4.2.2 Demonstrate knowledge of how to assemble and explain the functions of basic electronic components and their interdependence in an electronic circuit.',
        indicator:
          'B7/JHS1.4.2.2.1-2.2.3 Assemble basic electronic circuits and explain the roles of LEDs, resistors, diodes and inductors.',
        topic: 'Basic electronic components and simple circuits',
        resources: resources.energy,
      },
      {
        week: 7,
        strand: 'Forces and Energy',
        subStrand: 'Conversion and Conservation of Energy',
        contentStandard:
          'B7/JHS1.4.3.1 Demonstrate an understanding of the principle of conservation and conversion of energy and their application in real life situations.',
        indicator:
          'B7/JHS1.4.3.1.1-3.1.3 Explain conservation of energy, conversion of energy and how energy is conserved for future use.',
        topic: 'Conservation and conversion of energy',
        resources: resources.energy,
      },
      {
        week: 8,
        strand: 'Forces and Energy',
        subStrand: 'Force and Motion',
        contentStandard:
          'B7/JHS1.4.4.1 Examine the concept of motion, Newton\'s first law of motion, magnetic force in relation to motion and understand their applications to life.',
        indicator:
          'B7/JHS1.4.4.1.1-4.4.1.3 Understand unbalanced forces, state Newton\'s first law and discuss its applications.',
        topic: 'Force, motion and Newton\'s first law',
        resources: resources.energy,
      },
      {
        week: 9,
        strand: 'Forces and Energy',
        subStrand: 'Force and Motion',
        contentStandard:
          'B7/JHS1.4.4.1 Examine the concept of motion, Newton\'s first law of motion, magnetic force in relation to motion and understand their applications to life.',
        indicator:
          'B7/JHS1.4.4.1.4 and B7/JHS1.4.4.2.1 Demonstrate the behaviour of magnets and identify simple machines.',
        topic: 'Magnets and simple machines',
        resources: resources.energy,
      },
      {
        week: 10,
        strand: 'Forces and Energy',
        subStrand: 'Force and Motion / Agricultural Tools',
        contentStandard:
          'B7/JHS1.4.4.2 Recognise some simple machines and show understanding of their efficiency in doing work, and B7/JHS1.4.5.1 demonstrate knowledge and skills in handling and maintenance of simple agricultural tools.',
        indicator:
          'B7/JHS1.4.4.2.2-4.4.2.3 and B7/JHS1.4.5.1.1-4.5.1.2 Describe levers, machine efficiency, and the handling and maintenance of agricultural tools.',
        topic: 'Levers, machine efficiency and agricultural tools',
        resources: resources.agriculture,
      },
      {
        week: 11,
        strand: 'Humans and the Environment',
        subStrand: 'Waste Management / Human Health',
        contentStandard:
          'B7/JHS1.5.1.1 Exhibit knowledge and skill of scientific basis for management practices of waste in the environment, and B7/JHS1.5.2.1 demonstrate knowledge of common deficiency diseases of humans.',
        indicator:
          'B7/JHS1.5.1.1.1 and B7/JHS1.5.2.1.1 Apply good waste management practices and explain nutrient deficiency diseases, their symptoms and prevention.',
        topic: 'Waste management and common deficiency diseases',
        resources: resources.environment,
      },
      {
        week: 12,
        strand: 'Humans and the Environment',
        subStrand: 'Human Health / Science and Industry / Climate Change / Understanding the Environment',
        contentStandard:
          'B7/JHS1.5.2.2, B7/JHS1.5.3.1, B7/JHS1.5.4.1 and B7/JHS1.5.5.1 explore viral diseases, science careers, sustainable energy choices, and organisms in different landforms.',
        indicator:
          'B7/JHS1.5.2.2.1, B7/JHS1.5.3.1.1, B7/JHS1.5.4.1.1 and B7/JHS1.5.5.1.1-1.2 explain viral diseases, identify science careers, discuss sustainable energy choices, and describe plants and animals in different landforms.',
        topic: 'Viral diseases, science careers, climate change and life in different landforms',
        resources: resources.environment,
      },
    ],
  },
];
