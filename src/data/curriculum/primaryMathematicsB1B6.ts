import type { ClassLevel } from '@/types/lessonPlan';
import type { SchemeWeek } from '@/types/scheme';
import type { ExplicitCurriculumTerm } from './mathematicsB7';

type TopicTuple = [strand: string, subStrand: string, topic: string];

const resourcesByStrand = {
  Number: ['Counters', 'Number cards', 'Base-ten blocks', 'Mathematics textbook'],
  Algebra: ['Pattern blocks', 'Counters', 'Charts', 'Mathematics textbook'],
  'Geometry and Measurement': ['Ruler', 'Shapes', 'Clock model', 'Mathematics textbook'],
  Data: ['Tally charts', 'Graph sheets', 'Picture cards', 'Mathematics textbook'],
} as const;

function makeWeek(
  classLevel: ClassLevel,
  week: number,
  strand: TopicTuple[0],
  subStrand: TopicTuple[1],
  topic: TopicTuple[2]
): SchemeWeek {
  const resources = resourcesByStrand[strand as keyof typeof resourcesByStrand] ?? [
    'Mathematics textbook',
  ];

  return {
    week,
    strand,
    subStrand,
    topic,
    contentStandard: `${classLevel} ${strand}: Demonstrate understanding of ${subStrand.toLowerCase()}.`,
    indicator: `Explore and apply ${topic.toLowerCase()} in context.`,
    resources: [...resources],
  };
}

function buildTerm(
  classLevel: ClassLevel,
  term: string,
  topics: TopicTuple[]
): ExplicitCurriculumTerm {
  return {
    subject: 'Mathematics',
    classLevel,
    term,
    title: `${classLevel} Mathematics Scheme of Work - ${term}`,
    weeks: topics.map((item, index) =>
      makeWeek(classLevel, index + 1, item[0], item[1], item[2])
    ),
  };
}

const b1Term1: TopicTuple[] = [
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Counting and representing numbers 0 to 20'],
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Counting, reading and writing numbers to 50'],
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Comparing groups and quantities'],
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Ordering numbers and using ordinal positions'],
  ['Number', 'Operations', 'Composing and decomposing numbers within 10'],
  ['Number', 'Operations', 'Addition as joining within 10'],
  ['Number', 'Operations', 'Subtraction as taking away within 10'],
  ['Number', 'Operations', 'Addition and subtraction within 20'],
  ['Geometry and Measurement', 'Shapes and Space', 'Identifying common 2D shapes'],
  ['Geometry and Measurement', 'Shapes and Space', 'Positional language and movement'],
  ['Algebra', 'Patterns and Relationships', 'Repeating patterns with objects and pictures'],
  ['Data', 'Collection and Organisation of Data', 'Sorting, classifying and counting objects'],
];

const b1Term2: TopicTuple[] = [
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Counting and representing numbers 0 to 100'],
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Skip counting in 2s, 5s and 10s'],
  ['Number', 'Operations', 'Addition within 20 using concrete materials'],
  ['Number', 'Operations', 'Subtraction within 20 using concrete materials'],
  ['Number', 'Operations', 'Adding and subtracting within 100 without regrouping'],
  ['Algebra', 'Equality and Number Sentences', 'Equal to and not equal to'],
  ['Geometry and Measurement', 'Measurement of Length, Mass and Capacity', 'Comparing length using non-standard units'],
  ['Geometry and Measurement', 'Measurement of Length, Mass and Capacity', 'Comparing mass and capacity informally'],
  ['Geometry and Measurement', 'Time and Money', 'Telling time to the hour'],
  ['Geometry and Measurement', 'Time and Money', 'Recognising Ghana coins and notes'],
  ['Data', 'Collection and Organisation of Data', 'Collecting class data with tallies'],
  ['Data', 'Interpretation of Data', 'Reading simple pictographs'],
];

const b1Term3: TopicTuple[] = [
  ['Number', 'Fractions', 'Halves and quarters in familiar objects'],
  ['Number', 'Operations', 'Solving simple addition and subtraction stories'],
  ['Algebra', 'Patterns and Relationships', 'Extending and creating repeating patterns'],
  ['Geometry and Measurement', 'Shapes and Space', 'Identifying common 3D objects'],
  ['Geometry and Measurement', 'Shapes and Space', 'Combining and separating shapes'],
  ['Geometry and Measurement', 'Time and Money', 'Days of the week and months of the year'],
  ['Geometry and Measurement', 'Measurement of Length, Mass and Capacity', 'Comparing and ordering measurable attributes'],
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Number review to 100'],
  ['Number', 'Operations', 'Mental addition and subtraction practice'],
  ['Data', 'Collection and Organisation of Data', 'Gathering data from the environment'],
  ['Data', 'Interpretation of Data', 'Interpreting pictographs and class charts'],
  ['Algebra', 'Patterns and Relationships', 'Integrated review of patterns and numbers'],
];

const b2Term1: TopicTuple[] = [
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Reading, writing and representing numbers to 100'],
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Place value in tens and ones'],
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Comparing and ordering numbers to 100'],
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Counting and skip counting to 200'],
  ['Number', 'Operations', 'Addition within 100'],
  ['Number', 'Operations', 'Subtraction within 100'],
  ['Number', 'Operations', 'Using mental strategies for addition and subtraction'],
  ['Algebra', 'Equality and Number Sentences', 'Equal to and not equal to in number sentences'],
  ['Geometry and Measurement', 'Shapes and Space', '2D and 3D shapes in the environment'],
  ['Geometry and Measurement', 'Shapes and Space', 'Symmetry in simple shapes and objects'],
  ['Algebra', 'Patterns and Relationships', 'Number and shape patterns'],
  ['Data', 'Collection and Organisation of Data', 'Tally marks and picture graphs'],
];

const b2Term2: TopicTuple[] = [
  ['Number', 'Operations', 'Addition with regrouping within 100'],
  ['Number', 'Operations', 'Subtraction with regrouping within 100'],
  ['Number', 'Operations', 'Multiplication as repeated addition'],
  ['Number', 'Operations', 'Division as sharing and grouping'],
  ['Number', 'Fractions', 'Halves, thirds and quarters'],
  ['Number', 'Fractions', 'Fractions of sets and shapes'],
  ['Geometry and Measurement', 'Measurement of Length', 'Measuring length in centimetres and metres'],
  ['Geometry and Measurement', 'Measurement of Mass and Capacity', 'Estimating and measuring mass and capacity informally'],
  ['Geometry and Measurement', 'Time and Money', 'Telling time to half hour and quarter hour'],
  ['Geometry and Measurement', 'Time and Money', 'Money totals and simple change'],
  ['Data', 'Interpretation of Data', 'Reading and discussing simple bar charts'],
  ['Algebra', 'Patterns and Relationships', 'Patterns in addition and multiplication'],
];

const b2Term3: TopicTuple[] = [
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Numbers to 1000'],
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Place value in hundreds, tens and ones'],
  ['Number', 'Operations', 'Addition and subtraction within 1000 without regrouping'],
  ['Number', 'Operations', 'Introduction to multiplication facts'],
  ['Algebra', 'Patterns and Relationships', 'Function machines and input-output patterns'],
  ['Geometry and Measurement', 'Shapes and Space', 'Lines, turns and simple angles'],
  ['Geometry and Measurement', 'Measurement', 'Estimating and comparing perimeter informally'],
  ['Geometry and Measurement', 'Time and Calendar', 'Reading calendars and time sequences'],
  ['Data', 'Collection and Organisation of Data', 'Collecting and organising survey data'],
  ['Data', 'Interpretation of Data', 'Drawing and interpreting pictographs and bar charts'],
  ['Number', 'Fractions', 'Comparing simple fractions'],
  ['Number', 'Review', 'Integrated review of B2 number and measurement skills'],
];

const b3Term1: TopicTuple[] = [
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Reading and writing numbers to 1000'],
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Place value to 1000'],
  ['Number', 'Counting, Representation, Cardinality and Ordinality', 'Comparing and ordering numbers to 1000'],
  ['Number', 'Operations', 'Addition within 1000'],
  ['Number', 'Operations', 'Subtraction within 1000'],
  ['Number', 'Operations', 'Multiplication facts in 2s, 5s and 10s'],
  ['Number', 'Operations', 'Division as inverse of multiplication'],
  ['Number', 'Fractions', 'Equivalent fractions using models'],
  ['Algebra', 'Patterns and Relationships', 'Growing patterns and skip counting rules'],
  ['Geometry and Measurement', 'Shapes and Space', '2D shape properties'],
  ['Geometry and Measurement', 'Shapes and Space', '3D shape properties'],
  ['Data', 'Collection and Organisation of Data', 'Representing data with charts'],
];

const b3Term2: TopicTuple[] = [
  ['Number', 'Number Operations', 'Multiplying 2-digit numbers by 1-digit numbers'],
  ['Number', 'Number Operations', 'Dividing using sharing and grouping strategies'],
  ['Number', 'Fractions', 'Comparing and ordering simple fractions'],
  ['Number', 'Fractions', 'Adding and subtracting like fractions'],
  ['Number', 'Decimals', 'Tenths using concrete and pictorial models'],
  ['Algebra', 'Equality and Number Sentences', 'Unknowns in simple number sentences'],
  ['Algebra', 'Patterns and Relationships', 'Tables and charts for patterns'],
  ['Geometry and Measurement', 'Measurement of Length and Perimeter', 'Perimeter using standard units'],
  ['Geometry and Measurement', 'Measurement of Area', 'Area using square units'],
  ['Geometry and Measurement', 'Time and Money', 'Telling time to five minutes'],
  ['Data', 'Interpretation of Data', 'Interpreting bar graphs'],
  ['Number', 'Operations Review', 'Problem solving with the four operations'],
];

const b3Term3: TopicTuple[] = [
  ['Number', 'Positive and Negative Numbers', 'Positive and negative in real-life contexts'],
  ['Number', 'Decimals', 'Tenths and hundredths in context'],
  ['Algebra', 'Patterns and Relationships', 'Number patterns with addition and subtraction'],
  ['Algebra', 'Patterns and Relationships', 'Describing rules in patterns'],
  ['Geometry and Measurement', 'Symmetry and Transformations', 'Lines of symmetry in shapes'],
  ['Geometry and Measurement', 'Measurement of Mass and Capacity', 'Estimating and measuring mass and capacity'],
  ['Geometry and Measurement', 'Time and Calendar', 'Elapsed time in simple contexts'],
  ['Data', 'Collection and Organisation of Data', 'Collecting data through simple surveys'],
  ['Data', 'Interpretation of Data', 'Choosing suitable charts for data'],
  ['Number', 'Fractions and Decimals', 'Linking fractions to decimals'],
  ['Geometry and Measurement', 'Review of Shapes and Measurement', 'Integrated geometry and measurement review'],
  ['Number', 'Review', 'Integrated review of B3 mathematics'],
];

const b4Term1: TopicTuple[] = [
  ['Number', 'Number and Numeration Systems', 'Place value and quantities to 100,000'],
  ['Number', 'Number and Numeration Systems', 'Comparing and ordering whole numbers to 100,000'],
  ['Number', 'Number and Numeration Systems', 'Rounding whole numbers'],
  ['Number', 'Number and Numeration Systems', 'Skip counting in 50s and 100s'],
  ['Number', 'Roman Numerals', 'Roman numerals up to 30'],
  ['Number', 'Number Operations', 'Basic multiplication facts up to 12 x 12'],
  ['Number', 'Number Operations', 'Multi-digit addition and subtraction'],
  ['Number', 'Number Operations', 'Multiplication of multi-digit numbers by 1-digit numbers'],
  ['Number', 'Number Operations', 'Division with remainders in context'],
  ['Number', 'Fractions', 'Comparing and ordering fractions'],
  ['Number', 'Fractions', 'Adding and subtracting like fractions'],
  ['Number', 'Fractions, Decimals and Percentages', 'Decimals and percentages as hundredths'],
];

const b4Term2: TopicTuple[] = [
  ['Algebra', 'Patterns and Relationships', 'Patterns in tables and charts'],
  ['Algebra', 'Patterns and Relationships', 'Translating between concrete patterns and tables'],
  ['Algebra', 'Patterns and Relationships', 'Extending patterns to solve problems'],
  ['Algebra', 'Unknowns, Expressions and Equations', 'Writing equations with unknowns'],
  ['Algebra', 'Unknowns, Expressions and Equations', 'Solving one-step equations concretely and pictorially'],
  ['Geometry and Measurement', '2D and 3D Shapes', 'Lines of symmetry in regular and irregular shapes'],
  ['Geometry and Measurement', '2D and 3D Shapes', 'Properties of polygons and solids'],
  ['Geometry and Measurement', 'Measurement of Length and Perimeter', 'Perimeter of rectangles and composite shapes'],
  ['Geometry and Measurement', 'Measurement of Area', 'Area using square units and rectangles'],
  ['Geometry and Measurement', 'Measurement of Time', 'Time in hours and minutes on analogue and digital clocks'],
  ['Geometry and Measurement', 'Measurement of Money', 'Money calculations in practical situations'],
  ['Data', 'Data Collection and Representation', 'Constructing and reading frequency tables and bar charts'],
];

const b4Term3: TopicTuple[] = [
  ['Number', 'Fractions, Decimals and Percentages', 'Rounding decimals to tenths and hundredths'],
  ['Number', 'Fractions, Decimals and Percentages', 'Adding and subtracting decimals'],
  ['Number', 'Fractions, Decimals and Percentages', 'Percent as related to hundredths'],
  ['Number', 'Fractions, Decimals and Percentages', 'Comparing common fractions, decimals and percentages'],
  ['Geometry and Measurement', 'Measurement', 'Length, mass and capacity problem solving'],
  ['Geometry and Measurement', 'Measurement', 'Area and perimeter review'],
  ['Data', 'Interpretation of Data', 'Interpreting graphs and answering questions from data'],
  ['Data', 'Interpretation of Data', 'Collecting and representing real-life data'],
  ['Algebra', 'Patterns and Relationships', 'Review of pattern rules and equations'],
  ['Number', 'Operations Review', 'Mixed operations with whole numbers and fractions'],
  ['Geometry and Measurement', 'Review', 'Integrated geometry and measurement review'],
  ['Number', 'Review', 'Integrated review of B4 mathematics'],
];

const b5Term1: TopicTuple[] = [
  ['Number', 'Number and Numeration Systems', 'Large whole numbers and place value'],
  ['Number', 'Number and Numeration Systems', 'Comparing, ordering and rounding large numbers'],
  ['Number', 'Number Operations', 'Addition and subtraction of large whole numbers'],
  ['Number', 'Number Operations', 'Multiplication by 2-digit numbers'],
  ['Number', 'Number Operations', 'Long division with remainders'],
  ['Number', 'Fractions', 'Equivalent fractions and mixed numbers'],
  ['Number', 'Fractions', 'Adding and subtracting fractions and mixed numbers'],
  ['Number', 'Fractions', 'Multiplying whole numbers by fractions'],
  ['Number', 'Fractions', 'Multiplying fractions by whole numbers'],
  ['Number', 'Decimals and Percentages', 'Decimals as fractions and place value'],
  ['Number', 'Decimals and Percentages', 'Adding and subtracting decimals'],
  ['Number', 'Decimals and Percentages', 'Percentages in practical contexts'],
];

const b5Term2: TopicTuple[] = [
  ['Algebra', 'Patterns and Relationships', 'Number patterns with multiple operations'],
  ['Algebra', 'Patterns and Relationships', 'Input-output tables and rules'],
  ['Algebra', 'Unknowns, Expressions and Equations', 'Writing and solving one-step equations'],
  ['Algebra', 'Unknowns, Expressions and Equations', 'Creating and solving word problems with unknowns'],
  ['Geometry and Measurement', '2D Shapes and Angles', 'Properties of triangles and quadrilaterals'],
  ['Geometry and Measurement', '2D Shapes and Angles', 'Measuring and classifying angles'],
  ['Geometry and Measurement', '2D Shapes and Angles', 'Drawing angles with a protractor'],
  ['Geometry and Measurement', 'Measurement of Length and Perimeter', 'Perimeter problems with composite shapes'],
  ['Geometry and Measurement', 'Measurement of Area and Volume', 'Area of rectangles and squares'],
  ['Geometry and Measurement', 'Measurement of Time', 'Elapsed time and timetables'],
  ['Data', 'Data Representation', 'Bar graphs and line plots'],
  ['Data', 'Data Interpretation', 'Interpreting charts and solving data problems'],
];

const b5Term3: TopicTuple[] = [
  ['Number', 'Decimals and Percentages', 'Multiplying and dividing decimals by powers of ten'],
  ['Number', 'Fractions, Decimals and Percentages', 'Converting among fractions, decimals and percentages'],
  ['Number', 'Fractions, Decimals and Percentages', 'Percentage of quantities'],
  ['Geometry and Measurement', 'Measurement of Mass, Capacity and Volume', 'Mass, capacity and volume in practical contexts'],
  ['Geometry and Measurement', 'Measurement of Length', 'Metric conversions'],
  ['Geometry and Measurement', 'Measurement', 'Area and perimeter review in practical tasks'],
  ['Data', 'Data Collection', 'Conducting surveys and recording data'],
  ['Data', 'Data Analysis', 'Comparing and discussing data sets'],
  ['Algebra', 'Patterns and Relationships', 'Review of patterns and functional thinking'],
  ['Number', 'Operations Review', 'Mixed operations with whole numbers, fractions and decimals'],
  ['Geometry and Measurement', 'Review', 'Integrated geometry and measurement review'],
  ['Number', 'Review', 'Integrated review of B5 mathematics'],
];

const b6Term1: TopicTuple[] = [
  ['Number', 'Number and Numeration Systems', 'Whole numbers, place value and rounding'],
  ['Number', 'Number Operations', 'Operations with large whole numbers'],
  ['Number', 'Factors and Multiples', 'Factors, multiples, prime and composite numbers'],
  ['Number', 'Fractions', 'Equivalent fractions and simplest form'],
  ['Number', 'Fractions', 'Operations with fractions and mixed numbers'],
  ['Number', 'Decimals', 'Operations with decimals'],
  ['Number', 'Percentages', 'Percentages and percentage change'],
  ['Number', 'Ratios and Proportion', 'Ratio concept and simplest form'],
  ['Number', 'Ratios and Proportion', 'Ratio, rate and proportion problems'],
  ['Algebra', 'Patterns and Relationships', 'Extending and generalising number patterns'],
  ['Algebra', 'Unknowns, Expressions and Equations', 'Expressions and one-step equations'],
  ['Algebra', 'Unknowns, Expressions and Equations', 'Solving equations from word problems'],
];

const b6Term2: TopicTuple[] = [
  ['Geometry and Measurement', '2D Shapes and Angles', 'Properties of polygons'],
  ['Geometry and Measurement', '2D Shapes and Angles', 'Measuring and constructing angles'],
  ['Geometry and Measurement', 'Transformations and Symmetry', 'Reflection, rotation and translation'],
  ['Geometry and Measurement', 'Measurement of Length and Perimeter', 'Perimeter of complex shapes'],
  ['Geometry and Measurement', 'Measurement of Area', 'Area of rectangles, triangles and composite figures'],
  ['Geometry and Measurement', 'Measurement of Volume', 'Volume of cubes and cuboids'],
  ['Geometry and Measurement', 'Time', 'Elapsed time and timetables'],
  ['Geometry and Measurement', 'Mass, Capacity and Speed', 'Practical measurement problems'],
  ['Data', 'Data Collection and Representation', 'Tally charts, bar charts and line graphs'],
  ['Data', 'Data Analysis', 'Mean, mode and range in simple data sets'],
  ['Data', 'Data Interpretation', 'Drawing conclusions from data'],
  ['Algebra', 'Patterns and Relationships', 'Using tables and graphs for patterns'],
];

const b6Term3: TopicTuple[] = [
  ['Number', 'Ratios and Proportion', 'Ratio and proportion review in real-life contexts'],
  ['Number', 'Fractions, Decimals and Percentages', 'Application of fractions, decimals and percentages'],
  ['Algebra', 'Unknowns, Expressions and Equations', 'Multi-step number problems with equations'],
  ['Geometry and Measurement', 'Review of Shapes and Measurement', 'Integrated geometry and measurement review'],
  ['Data', 'Data Interpretation', 'Comparing and evaluating data displays'],
  ['Number', 'Problem Solving', 'Problem solving with the four operations'],
  ['Number', 'Problem Solving', 'Financial literacy with money, discount and change'],
  ['Geometry and Measurement', 'Problem Solving', 'Problem solving with area, perimeter and volume'],
  ['Data', 'Project Data Task', 'Collecting, representing and interpreting project data'],
  ['Algebra', 'Patterns and Relationships', 'Integrated review of algebraic thinking'],
  ['Number', 'Review', 'Integrated review of B6 mathematics'],
  ['Number', 'Transition to JHS', 'Upper primary mathematics consolidation for JHS readiness'],
];

export const primaryMathematicsTerms: ExplicitCurriculumTerm[] = [
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
