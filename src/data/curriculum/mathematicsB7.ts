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
  number: ['Textbook', 'Counters', 'Number cards', 'Graph sheet'],
  fractions: ['Fraction strips', 'Counters', 'Textbook'],
  algebra: ['Graph book', 'Ruler', 'Textbook'],
  geometry: ['Ruler', 'Compass', 'Protractor', 'Graph book'],
  data: ['Questionnaire sheets', 'Graph book', 'Calculator', 'Textbook'],
};

export const mathematicsB7Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'Mathematics',
    classLevel: 'B7',
    term: 'Term 1',
    title: 'B7 Mathematics Scheme of Work - Term 1',
    weeks: [
      {
        week: 1,
        strand: 'Number',
        subStrand: 'Number and Numeration Systems',
        contentStandard:
          'B7.1.1.1 Demonstrate understanding and the use of place value for expressing quantities recorded as base ten numerals, as well as rounding these to given decimal places and significant figures.',
        indicator:
          'B7.1.1.1.1-1.2 Model number quantities beyond 1,000,000,000 and compare or order large whole numbers.',
        topic: 'Place value and ordering large numbers',
        resources: resources.number,
      },
      {
        week: 2,
        strand: 'Number',
        subStrand: 'Number and Numeration Systems',
        contentStandard:
          'B7.1.1.1 Demonstrate understanding and the use of place value for expressing quantities recorded as base ten numerals, as well as rounding these to given decimal places and significant figures.',
        indicator:
          'B7.1.1.1.3-1.5 Round whole numbers and decimals and express decimal numerals to significant figures.',
        topic: 'Rounding whole numbers, decimals and significant figures',
        resources: resources.number,
      },
      {
        week: 3,
        strand: 'Number',
        subStrand: 'Number Operations',
        contentStandard:
          'B7.1.2.1 Apply mental mathematics strategies and number properties used to solve problems.',
        indicator:
          'B7.1.2.1.1-1.3 Multiply and divide by powers of 10, apply mental strategies, and solve number-operation word problems.',
        topic: 'Mental mathematics and powers of ten',
        resources: resources.number,
      },
      {
        week: 4,
        strand: 'Number',
        subStrand: 'Number Operations',
        contentStandard:
          'B7.1.2.2 Demonstrate an understanding of addition, subtraction, multiplication and division of whole numbers and decimal numbers to solve problems.',
        indicator:
          'B7.1.2.2.1-2.2 Add, subtract, multiply and divide whole numbers and decimals in context.',
        topic: 'Operations with whole numbers and decimals',
        resources: resources.number,
      },
      {
        week: 5,
        strand: 'Number',
        subStrand: 'Number Operations',
        contentStandard:
          'B7.1.2.3 Demonstrate understanding and the use of powers of natural numbers in solving problems.',
        indicator:
          'B7.1.2.3.1-2.3.5 Illustrate repeated factors, use index notation, and apply powers in problem solving.',
        topic: 'Powers of natural numbers',
        resources: resources.number,
      },
      {
        week: 6,
        strand: 'Number',
        subStrand: 'Fractions, Decimals and Percentages',
        contentStandard:
          'B7.1.3.1 Simplify, compare and order a mixture of positive fractions by changing all to equivalent fractions, decimals or percentages.',
        indicator:
          'B7.1.3.1.1-1.2 Determine benchmark fraction-decimal-percent equivalents and compare or order them.',
        topic: 'Equivalent fractions, decimals and percentages',
        resources: resources.fractions,
      },
      {
        week: 7,
        strand: 'Number',
        subStrand: 'Fractions, Decimals and Percentages',
        contentStandard:
          'B7.1.3.2 Demonstrate an understanding of the process of addition and subtraction of fractions and apply this in solving problems.',
        indicator:
          'B7.1.3.2.1-1.2 Add and subtract unlike or mixed fractions and solve related word problems.',
        topic: 'Addition and subtraction of fractions',
        resources: resources.fractions,
      },
      {
        week: 8,
        strand: 'Number',
        subStrand: 'Fractions, Decimals and Percentages',
        contentStandard:
          'B7.1.3.3 Demonstrate an understanding of the process of multiplying and dividing positive fractions and apply this in solving problems.',
        indicator:
          'B7.1.3.3.1-3.3 Multiply or divide fractions and find fractions of quantities.',
        topic: 'Multiplication and division of fractions',
        resources: resources.fractions,
      },
      {
        week: 9,
        strand: 'Number',
        subStrand: 'Number: Ratios and Proportion',
        contentStandard:
          'B7.1.4.1 Demonstrate an understanding of the concept of ratios and its relationship to fractions and use it to solve problems that involve rates, ratios and proportional reasoning.',
        indicator:
          'B7.1.4.1.1-1.2 Find ratios, describe ratio relationships, and use unit rates in context.',
        topic: 'Ratio language and unit rates',
        resources: resources.fractions,
      },
      {
        week: 10,
        strand: 'Number',
        subStrand: 'Number: Ratios and Proportion',
        contentStandard:
          'B7.1.4.1 Demonstrate an understanding of the concept of ratios and its relationship to fractions and use it to solve problems that involve rates, ratios and proportional reasoning.',
        indicator:
          'B7.1.4.1.3-1.5 Make tables of equivalent ratios and solve proportional reasoning problems, including percentages as rates.',
        topic: 'Equivalent ratios and proportional reasoning',
        resources: resources.fractions,
      },
      {
        week: 11,
        strand: 'Algebra',
        subStrand: 'Patterns and Relations',
        contentStandard:
          'B7.2.1.1 Derive the rule for a set of points of a relation, draw a table of values to graph the relation in a number plane and make predictions about subsequent elements of the relation.',
        indicator:
          'B7.2.1.1.1-1.2 Extend relations and describe their rules using mathematical language.',
        topic: 'Extending patterns and describing rules',
        resources: resources.algebra,
      },
      {
        week: 12,
        strand: 'Algebra',
        subStrand: 'Patterns and Relations',
        contentStandard:
          'B7.2.1.1 Derive the rule for a set of points of a relation, draw a table of values to graph the relation in a number plane and make predictions about subsequent elements of the relation.',
        indicator:
          'B7.2.1.1.3-1.4 Identify rules, draw tables of values, and graph relations on the number plane.',
        topic: 'Tables of values and graphing relations',
        resources: resources.algebra,
      },
    ],
  },
  {
    subject: 'Mathematics',
    classLevel: 'B7',
    term: 'Term 2',
    title: 'B7 Mathematics Scheme of Work - Term 2',
    weeks: [
      {
        week: 1,
        strand: 'Algebra',
        subStrand: 'Algebraic Expressions',
        contentStandard:
          'B7.2.2.1 Simplify algebraic expressions involving the four basic operations and substituting values to evaluate algebraic expressions.',
        indicator:
          'B7.2.2.1.1 Create simple algebraic expressions from statements and real-life situations.',
        topic: 'Forming algebraic expressions',
        resources: resources.algebra,
      },
      {
        week: 2,
        strand: 'Algebra',
        subStrand: 'Algebraic Expressions',
        contentStandard:
          'B7.2.2.1 Simplify algebraic expressions involving the four basic operations and substituting values to evaluate algebraic expressions.',
        indicator:
          'B7.2.2.1.2 Perform addition and subtraction of algebraic expressions.',
        topic: 'Addition and subtraction of algebraic expressions',
        resources: resources.algebra,
      },
      {
        week: 3,
        strand: 'Algebra',
        subStrand: 'Algebraic Expressions',
        contentStandard:
          'B7.2.2.1 Simplify algebraic expressions involving the four basic operations and substituting values to evaluate algebraic expressions.',
        indicator:
          'B7.2.2.1.3 Perform multiplication and division of algebraic expressions.',
        topic: 'Multiplication and division of algebraic expressions',
        resources: resources.algebra,
      },
      {
        week: 4,
        strand: 'Algebra',
        subStrand: 'Algebraic Expressions',
        contentStandard:
          'B7.2.2.1 Simplify algebraic expressions involving the four basic operations and substituting values to evaluate algebraic expressions.',
        indicator:
          'B7.2.2.1.4-1.5 Substitute values and use operation properties to simplify expressions.',
        topic: 'Evaluating and simplifying algebraic expressions',
        resources: resources.algebra,
      },
      {
        week: 5,
        strand: 'Algebra',
        subStrand: 'Variables and Equations',
        contentStandard:
          'B7.2.3.1 Demonstrate an understanding of linear equations by modelling problems as linear equations and solving them concretely, pictorially, and symbolically.',
        indicator:
          'B7.2.3.1.1 Translate word problems to linear equations in one variable and vice versa.',
        topic: 'Translating word problems into equations',
        resources: resources.algebra,
      },
      {
        week: 6,
        strand: 'Algebra',
        subStrand: 'Variables and Equations',
        contentStandard:
          'B7.2.3.1 Demonstrate an understanding of linear equations by modelling problems as linear equations and solving them concretely, pictorially, and symbolically.',
        indicator:
          'B7.2.3.1.2-1.4 Model and solve linear equations in one variable.',
        topic: 'Solving linear equations',
        resources: resources.algebra,
      },
      {
        week: 7,
        strand: 'Geometry and Measurement',
        subStrand: 'Shape and Space',
        contentStandard:
          'B7.3.1.1 Demonstrate understanding of angles including adjacent, vertically opposite, complementary and supplementary angles and use them to solve problems.',
        indicator:
          'B7.3.1.1.1-1.2 Measure, classify and relate angles.',
        topic: 'Classifying angles and angle relationships',
        resources: resources.geometry,
      },
      {
        week: 8,
        strand: 'Geometry and Measurement',
        subStrand: 'Shape and Space',
        contentStandard:
          'B7.3.1.2 Demonstrate understanding of geometric constructions using straight edge and compasses.',
        indicator:
          'B7.3.1.2.1-1.3 Construct perpendiculars, perpendicular bisectors and angle bisectors.',
        topic: 'Basic geometric constructions',
        resources: resources.geometry,
      },
      {
        week: 9,
        strand: 'Geometry and Measurement',
        subStrand: 'Shape and Space',
        contentStandard:
          'B7.3.1.2 Demonstrate understanding of geometric constructions using straight edge and compasses.',
        indicator:
          'B7.3.1.2.4-1.7 Construct special angles and identify perpendicular or parallel line relationships.',
        topic: 'Constructing special angles',
        resources: resources.geometry,
      },
      {
        week: 10,
        strand: 'Geometry and Measurement',
        subStrand: 'Measurement',
        contentStandard:
          'B7.3.2.1 Demonstrate the ability to find the perimeter of plane shapes including circles using the concept of pi to find the circumference of a circle.',
        indicator:
          'B7.3.2.1.1-1.3 Calculate perimeters and circumference using π.',
        topic: 'Perimeter and circumference',
        resources: resources.geometry,
      },
      {
        week: 11,
        strand: 'Geometry and Measurement',
        subStrand: 'Measurement',
        contentStandard:
          'B7.3.2.2 Derive the formula for determining the area of a triangle and use it to solve problems.',
        indicator:
          'B7.3.2.2.1 Derive and use the area formula for triangles.',
        topic: 'Area of triangles',
        resources: resources.geometry,
      },
      {
        week: 12,
        strand: 'Geometry and Measurement',
        subStrand: 'Measurement and Position/Transformation',
        contentStandard:
          'B7.3.2.3 Demonstrate understanding of bearing and vectors, and B7.3.3.1 perform transformations on the coordinate plane.',
        indicator:
          'B7.3.2.3.1-3.5 and B7.3.3.1.1-1.4 Explore bearings, vectors, reflections, translations and congruence.',
        topic: 'Bearings, vectors and transformations',
        resources: resources.geometry,
      },
    ],
  },
  {
    subject: 'Mathematics',
    classLevel: 'B7',
    term: 'Term 3',
    title: 'B7 Mathematics Scheme of Work - Term 3',
    weeks: [
      {
        week: 1,
        strand: 'Handling Data',
        subStrand: 'Data',
        contentStandard:
          'B7.4.1.1 Select, justify and use appropriate methods to collect data and analyse it to solve or pose problems.',
        indicator:
          'B7.4.1.1.1 Select and justify methods for collecting quantitative and qualitative data.',
        topic: 'Methods of data collection',
        resources: resources.data,
      },
      {
        week: 2,
        strand: 'Handling Data',
        subStrand: 'Data',
        contentStandard:
          'B7.4.1.1 Select, justify and use appropriate methods to collect data and analyse it to solve or pose problems.',
        indicator:
          'B7.4.1.1.2 Design and administer questionnaires for data collection.',
        topic: 'Questionnaires and surveys',
        resources: resources.data,
      },
      {
        week: 3,
        strand: 'Handling Data',
        subStrand: 'Data',
        contentStandard:
          'B7.4.1.1 Select, justify and use appropriate methods to collect data and analyse it to solve or pose problems.',
        indicator:
          'B7.4.1.1.3 Organise and present data in tables and tally charts.',
        topic: 'Organising data in tables and tallies',
        resources: resources.data,
      },
      {
        week: 4,
        strand: 'Handling Data',
        subStrand: 'Data',
        contentStandard:
          'B7.4.1.1 Select, justify and use appropriate methods to collect data and analyse it to solve or pose problems.',
        indicator:
          'B7.4.1.1.3-1.4 Present data using bar graphs, pictographs and line graphs.',
        topic: 'Bar graphs, pictographs and line graphs',
        resources: resources.data,
      },
      {
        week: 5,
        strand: 'Handling Data',
        subStrand: 'Data',
        contentStandard:
          'B7.4.1.1 Select, justify and use appropriate methods to collect data and analyse it to solve or pose problems.',
        indicator:
          'B7.4.1.1.4 Present and interpret data using frequency tables, charts and graphs.',
        topic: 'Frequency tables and chart interpretation',
        resources: resources.data,
      },
      {
        week: 6,
        strand: 'Handling Data',
        subStrand: 'Data',
        contentStandard:
          'B7.4.1.1 Select, justify and use appropriate methods to collect data and analyse it to solve or pose problems.',
        indicator:
          'B7.4.1.1.4 Use graphs and tables to answer questions and solve problems.',
        topic: 'Interpreting data to solve problems',
        resources: resources.data,
      },
      {
        week: 7,
        strand: 'Handling Data',
        subStrand: 'Data',
        contentStandard:
          'B7.4.1.2 Determine the measures of central tendency for a given ungrouped data and use it to solve problems.',
        indicator:
          'B7.4.1.2.1 Calculate and interpret the mean of ungrouped data.',
        topic: 'Mean of ungrouped data',
        resources: resources.data,
      },
      {
        week: 8,
        strand: 'Handling Data',
        subStrand: 'Data',
        contentStandard:
          'B7.4.1.2 Determine the measures of central tendency for a given ungrouped data and use it to solve problems.',
        indicator:
          'B7.4.1.2.2 Calculate and interpret the median of data.',
        topic: 'Median of data sets',
        resources: resources.data,
      },
      {
        week: 9,
        strand: 'Handling Data',
        subStrand: 'Data',
        contentStandard:
          'B7.4.1.2 Determine the measures of central tendency for a given ungrouped data and use it to solve problems.',
        indicator:
          'B7.4.1.2.3 Determine and interpret mode, and compare mean, median and mode.',
        topic: 'Mode and comparing central tendencies',
        resources: resources.data,
      },
      {
        week: 10,
        strand: 'Handling Data',
        subStrand: 'Chance or Probability',
        contentStandard:
          'B7.4.2.1 Identify the sample space for a probability experiment involving single events and express probabilities to solve problems.',
        indicator:
          'B7.4.2.1.1 Demonstrate understanding of impossible, possible and certain events.',
        topic: 'Likelihood of events',
        resources: resources.data,
      },
      {
        week: 11,
        strand: 'Handling Data',
        subStrand: 'Chance or Probability',
        contentStandard:
          'B7.4.2.1 Identify the sample space for a probability experiment involving single events and express probabilities to solve problems.',
        indicator:
          'B7.4.2.1.2-1.3 Classify outcomes and calculate probabilities as fractions, decimals, percentages or ratios.',
        topic: 'Single-event probability',
        resources: resources.data,
      },
      {
        week: 12,
        strand: 'Handling Data',
        subStrand: 'Chance or Probability',
        contentStandard:
          'B7.4.2.1 Identify the sample space for a probability experiment involving single events and express probabilities to solve problems.',
        indicator:
          'B7.4.2.1.3-1.4 Use sample spaces and probability values to solve contextual problems.',
        topic: 'Sample space and probability problem solving',
        resources: resources.data,
      },
    ],
  },
];
