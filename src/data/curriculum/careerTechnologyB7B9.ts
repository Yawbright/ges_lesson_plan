import type { ExplicitCurriculumTerm } from './mathematicsB7';

const resources = {
  safety: ['Career Technology textbook', 'Safety posters', 'First aid box', 'Demonstration tools'],
  materials: ['Material samples', 'Food samples', 'Charts', 'Career Technology textbook'],
  tools: ['Workshop tools', 'Measuring tools', 'Kitchen tools', 'Demonstration materials'],
  technology: ['Models', 'Simple circuit kit', 'Structure diagrams', 'Projector'],
  design: ['Sketch pad', 'Pencils', 'Design brief cards', 'Sample products'],
  enterprise: ['Business cards', 'Case studies', 'Budget sheets', 'Career Technology textbook'],
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

export const careerTechnologyB7Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'Career Technology',
    classLevel: 'B7',
    term: 'Term 1',
    title: 'B7 Career Technology Scheme of Work - Term 1',
    weeks: [
      week(
        1,
        'Health and Safety',
        'Personal Hygiene and Food Hygiene',
        'B7/JHS1.1.1 Demonstrate knowledge of personal hygiene and food hygiene.',
        'Explain the importance of personal hygiene in everyday living and practical work.',
        'Personal hygiene and its importance',
        resources.safety
      ),
      week(
        2,
        'Health and Safety',
        'Personal Hygiene and Food Hygiene',
        'B7/JHS1.1.1 Demonstrate knowledge of personal hygiene and food hygiene.',
        'Demonstrate hygienic practices before, during and after practical activities.',
        'Personal hygiene practices in practical work',
        resources.safety
      ),
      week(
        3,
        'Health and Safety',
        'Personal Hygiene and Food Hygiene',
        'B7/JHS1.1.1 Demonstrate knowledge of personal hygiene and food hygiene.',
        'Explain the need for food hygiene and safe food handling.',
        'Food hygiene and safe food handling',
        resources.safety
      ),
      week(
        4,
        'Health and Safety',
        'Personal, Workshop and Food Laboratory Safety',
        'B7/JHS1.1.2 Demonstrate knowledge of preventing accidents in the workshop/site and laboratory.',
        'Describe accidents that can occur in the workshop, site and food laboratory.',
        'Accidents in the workshop, site and laboratory',
        resources.safety
      ),
      week(
        5,
        'Health and Safety',
        'Personal, Workshop and Food Laboratory Safety',
        'B7/JHS1.1.2 Demonstrate knowledge of preventing accidents in the workshop/site and laboratory.',
        'Identify causes of accidents and unsafe practices in practical environments.',
        'Causes of accidents and unsafe practices',
        resources.safety
      ),
      week(
        6,
        'Health and Safety',
        'Personal, Workshop and Food Laboratory Safety',
        'B7/JHS1.1.2 Demonstrate knowledge of preventing accidents in the workshop/site and laboratory.',
        'Demonstrate safety rules and emergency responses in workshop and laboratory settings.',
        'Safety rules and emergency responses',
        resources.safety
      ),
      week(
        7,
        'Materials for Production',
        'Compliant Materials',
        'B7/JHS1.2.1 Demonstrate knowledge of basic concept of compliant materials.',
        'Describe compliant materials and identify examples.',
        'Meaning and examples of compliant materials',
        resources.materials
      ),
      week(
        8,
        'Materials for Production',
        'Compliant Materials',
        'B7/JHS1.2.1 Demonstrate knowledge of basic concept of compliant materials.',
        'Distinguish types of compliant materials such as paper, card and textiles.',
        'Types of compliant materials',
        resources.materials
      ),
      week(
        9,
        'Materials for Production',
        'Resistant Materials',
        'B7/JHS1.2.2 Demonstrate knowledge of basic concept of resistant materials.',
        'Describe resistant materials and identify examples.',
        'Meaning and examples of resistant materials',
        resources.materials
      ),
      week(
        10,
        'Materials for Production',
        'Resistant Materials',
        'B7/JHS1.2.2 Demonstrate knowledge of basic concept of resistant materials.',
        'Classify resistant materials into plastics, wood, metals and other groups.',
        'Types of resistant materials',
        resources.materials
      ),
      week(
        11,
        'Materials for Production',
        'Smart and Modern Materials',
        'B7/JHS1.2.3 Demonstrate understanding of the properties of smart and modern materials.',
        'Explain the properties of smart and modern materials.',
        'Properties of smart and modern materials',
        resources.materials
      ),
      week(
        12,
        'Materials for Production',
        'Food Commodities (Animal and Plant Sources)',
        'B7/JHS1.2.4 Demonstrate understanding of food commodities from animal and plant sources.',
        'Classify food commodities according to animal and plant sources.',
        'Food commodities from animal and plant sources',
        resources.materials
      ),
    ],
  },
  {
    subject: 'Career Technology',
    classLevel: 'B7',
    term: 'Term 2',
    title: 'B7 Career Technology Scheme of Work - Term 2',
    weeks: [
      week(
        1,
        'Tools, Equipment and Processes',
        'Measuring and Marking Out',
        'B7/JHS1.3.1 Demonstrate understanding of measuring and marking out tools and equipment.',
        'Identify measuring and marking out tools used in different practical areas.',
        'Measuring and marking out tools',
        resources.tools
      ),
      week(
        2,
        'Tools, Equipment and Processes',
        'Measuring and Marking Out',
        'B7/JHS1.3.1 Demonstrate understanding of measuring and marking out tools and equipment.',
        'Use measuring and marking out tools correctly in practical tasks.',
        'Using measuring and marking out tools',
        resources.tools
      ),
      week(
        3,
        'Tools, Equipment and Processes',
        'Cutting/Shaping',
        'B7/JHS1.3.2 Demonstrate understanding of cutting and shaping tools and equipment.',
        'Identify cutting and shaping tools and equipment in practical work.',
        'Cutting and shaping tools',
        resources.tools
      ),
      week(
        4,
        'Tools, Equipment and Processes',
        'Cutting/Shaping',
        'B7/JHS1.3.2 Demonstrate understanding of cutting and shaping tools and equipment.',
        'Demonstrate basic use of cutting and shaping tools safely.',
        'Using cutting and shaping tools safely',
        resources.tools
      ),
      week(
        5,
        'Tools, Equipment and Processes',
        'Joining and Assembling',
        'B7/JHS1.3.3 Demonstrate understanding of joining and assembling processes.',
        'Identify joining and assembling tools, materials and techniques.',
        'Joining and assembling techniques',
        resources.tools
      ),
      week(
        6,
        'Tools, Equipment and Processes',
        'Kitchen Essentials',
        'B7/JHS1.3.4 Demonstrate understanding of kitchen essentials.',
        'Identify kitchen tools, utensils and equipment for food preparation.',
        'Kitchen tools and essentials',
        resources.tools
      ),
      week(
        7,
        'Tools, Equipment and Processes',
        'Kitchen Essentials',
        'B7/JHS1.3.4 Demonstrate understanding of kitchen essentials.',
        'Explain the uses and care of kitchen essentials.',
        'Uses and care of kitchen essentials',
        resources.tools
      ),
      week(
        8,
        'Tools, Equipment and Processes',
        'Finishes and Finishing',
        'B7/JHS1.3.5 Demonstrate understanding of finishes and finishing.',
        'Explain the meaning and importance of finishes and finishing.',
        'Meaning and importance of finishing',
        resources.tools
      ),
      week(
        9,
        'Technology',
        'Simple Structures and Mechanisms, Electric and Electronic Systems',
        'B7/JHS1.4.1 Demonstrate understanding of simple structures and mechanisms and basic electric/electronic systems.',
        'Identify simple structures and mechanisms in the environment.',
        'Simple structures and mechanisms in the environment',
        resources.technology
      ),
      week(
        10,
        'Technology',
        'Simple Structures and Mechanisms, Electric and Electronic Systems',
        'B7/JHS1.4.1 Demonstrate understanding of simple structures and mechanisms and basic electric/electronic systems.',
        'Explain basic electric and electronic systems in simple products.',
        'Basic electric and electronic systems',
        resources.technology
      ),
      week(
        11,
        'Technology',
        'Simple Structures and Mechanisms, Electric and Electronic Systems',
        'B7/JHS1.4.1 Demonstrate understanding of simple structures and mechanisms and basic electric/electronic systems.',
        'Relate structures and systems to everyday problem solving.',
        'Applying simple technology to everyday problems',
        resources.technology
      ),
      week(
        12,
        'Tools, Equipment and Processes',
        'Review of Processes and Technology',
        'Integrated review of practical tools, equipment and technology.',
        'Review major processes, tools and simple systems covered in the term.',
        'Integrated review of tools, equipment and technology',
        resources.tools
      ),
    ],
  },
  {
    subject: 'Career Technology',
    classLevel: 'B7',
    term: 'Term 3',
    title: 'B7 Career Technology Scheme of Work - Term 3',
    weeks: [
      week(
        1,
        'Designing and Making of Artefacts/Products',
        'Communicating Designs',
        'B7/JHS1.5.1 Demonstrate knowledge and skills in communicating designs.',
        'Explain the importance of communicating design ideas.',
        'Communicating design ideas',
        resources.design
      ),
      week(
        2,
        'Designing and Making of Artefacts/Products',
        'Communicating Designs',
        'B7/JHS1.5.1 Demonstrate knowledge and skills in communicating designs.',
        'Use sketches and simple symbols to communicate designs.',
        'Sketching and symbols in design communication',
        resources.design
      ),
      week(
        3,
        'Designing and Making of Artefacts/Products',
        'Designing',
        'B7/JHS1.5.2 Demonstrate knowledge and skills in designing.',
        'Identify problems and write simple design briefs.',
        'Identifying problems and writing design briefs',
        resources.design
      ),
      week(
        4,
        'Designing and Making of Artefacts/Products',
        'Designing',
        'B7/JHS1.5.2 Demonstrate knowledge and skills in designing.',
        'Generate and select ideas for solving design problems.',
        'Generating and selecting design ideas',
        resources.design
      ),
      week(
        5,
        'Designing and Making of Artefacts/Products',
        'Planning for Making Artefacts/Products',
        'B7/JHS1.5.3 Demonstrate knowledge and skills in planning for making artefacts/products.',
        'Plan materials, tools and steps for making products.',
        'Planning materials, tools and steps',
        resources.design
      ),
      week(
        6,
        'Designing and Making of Artefacts/Products',
        'Planning for Making Artefacts/Products',
        'B7/JHS1.5.3 Demonstrate knowledge and skills in planning for making artefacts/products.',
        'Prepare simple production plans for artefacts and food products.',
        'Simple production planning',
        resources.design
      ),
      week(
        7,
        'Designing and Making of Artefacts/Products',
        'Making Artefacts from Compliant, Resistant Materials and Food Ingredients',
        'B7/JHS1.5.4 Demonstrate knowledge and skills in making artefacts/products.',
        'Make simple artefacts using compliant materials and food ingredients.',
        'Making simple artefacts from compliant materials and food ingredients',
        resources.design
      ),
      week(
        8,
        'Designing and Making of Artefacts/Products',
        'Making Artefacts from Compliant, Resistant Materials and Food Ingredients',
        'B7/JHS1.5.4 Demonstrate knowledge and skills in making artefacts/products.',
        'Make simple artefacts using resistant materials and apply finishing.',
        'Making simple artefacts from resistant materials',
        resources.design
      ),
      week(
        9,
        'Entrepreneurial Skills',
        'Career Pathways and Career Opportunities',
        'B7/JHS1.6.1 Demonstrate understanding of career pathways and opportunities.',
        'Identify career pathways related to Career Technology.',
        'Career pathways in Career Technology',
        resources.enterprise
      ),
      week(
        10,
        'Entrepreneurial Skills',
        'Career Pathways and Career Opportunities',
        'B7/JHS1.6.1 Demonstrate understanding of career pathways and opportunities.',
        'Describe skills, interests and attitudes needed for selected careers.',
        'Skills and attitudes for career opportunities',
        resources.enterprise
      ),
      week(
        11,
        'Entrepreneurial Skills',
        'Establishing and Managing a Small Business Enterprise',
        'B7/JHS1.6.2 Demonstrate understanding of establishing and managing a small business enterprise.',
        'Explain the meaning and features of small business enterprise.',
        'Meaning and features of a small business enterprise',
        resources.enterprise
      ),
      week(
        12,
        'Entrepreneurial Skills',
        'Establishing and Managing a Small Business Enterprise',
        'B7/JHS1.6.2 Demonstrate understanding of establishing and managing a small business enterprise.',
        'Discuss basic steps in starting and managing a simple enterprise.',
        'Basic steps in starting and managing an enterprise',
        resources.enterprise
      ),
    ],
  },
];

export const careerTechnologyB8Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'Career Technology',
    classLevel: 'B8',
    term: 'Term 1',
    title: 'B8 Career Technology Scheme of Work - Term 1',
    weeks: [
      week(1, 'Health and Safety', 'Personal Hygiene and Food Hygiene', 'B8/JHS2.1.1 Demonstrate understanding of personal hygiene and food hygiene.', 'Review and apply personal hygiene and food hygiene practices in practical settings.', 'Applying personal and food hygiene practices', resources.safety),
      week(2, 'Health and Safety', 'Personal, Workshop and Food Laboratory Safety', 'B8/JHS2.1.2 Demonstrate understanding of personal, workshop and food laboratory safety.', 'Explain and apply safety signs, rules and procedures in practical environments.', 'Safety signs, rules and procedures', resources.safety),
      week(3, 'Health and Safety', 'Environment', 'B8/JHS2.1.3 Demonstrate understanding of environmental cleanliness and safety.', 'Discuss environmental sanitation and its relevance to practical work.', 'Environmental sanitation and safety', resources.safety),
      week(4, 'Materials for Production', 'Compliant Materials', 'B8/JHS2.2.1 Demonstrate understanding of compliant materials.', 'Describe properties and uses of compliant materials in production.', 'Properties and uses of compliant materials', resources.materials),
      week(5, 'Materials for Production', 'Compliant Materials', 'B8/JHS2.2.1 Demonstrate understanding of compliant materials.', 'Select compliant materials for simple products.', 'Selecting compliant materials for products', resources.materials),
      week(6, 'Materials for Production', 'Resistant Materials', 'B8/JHS2.2.2 Demonstrate understanding of resistant materials.', 'Describe properties and uses of resistant materials.', 'Properties and uses of resistant materials', resources.materials),
      week(7, 'Materials for Production', 'Resistant Materials', 'B8/JHS2.2.2 Demonstrate understanding of resistant materials.', 'Select resistant materials for simple products.', 'Selecting resistant materials for products', resources.materials),
      week(8, 'Materials for Production', 'Smart and Modern Materials', 'B8/JHS2.2.3 Demonstrate understanding of smart and modern materials.', 'Explain factors that affect smart and modern materials.', 'Factors affecting smart and modern materials', resources.materials),
      week(9, 'Materials for Production', 'Smart and Modern Materials', 'B8/JHS2.2.3 Demonstrate understanding of smart and modern materials.', 'Relate smart and modern materials to practical uses in everyday life.', 'Uses of smart and modern materials', resources.materials),
      week(10, 'Materials for Production', 'Food Commodities (Animal and Plant Sources)', 'B8/JHS2.2.4 Demonstrate understanding of food commodities.', 'Explain the functions of food commodities in the body.', 'Functions of food commodities', resources.materials),
      week(11, 'Materials for Production', 'Food Commodities (Animal and Plant Sources)', 'B8/JHS2.2.4 Demonstrate understanding of food commodities.', 'Classify foods by their nutritional functions.', 'Classifying foods by nutritional functions', resources.materials),
      week(12, 'Materials for Production', 'Review of Materials for Production', 'Integrated review of materials for production.', 'Review materials, properties, uses and food commodities covered in the term.', 'Integrated review of materials for production', resources.materials),
    ],
  },
  {
    subject: 'Career Technology',
    classLevel: 'B8',
    term: 'Term 2',
    title: 'B8 Career Technology Scheme of Work - Term 2',
    weeks: [
      week(1, 'Tools, Equipment and Processes', 'Measuring and Marking Out', 'B8/JHS2.3.1 Demonstrate understanding of measuring and marking out.', 'Select and use measuring and marking out tools for practical tasks.', 'Selecting and using measuring and marking tools', resources.tools),
      week(2, 'Tools, Equipment and Processes', 'Measuring and Marking Out', 'B8/JHS2.3.1 Demonstrate understanding of measuring and marking out.', 'Demonstrate accuracy in measuring and marking processes.', 'Accuracy in measuring and marking', resources.tools),
      week(3, 'Tools, Equipment and Processes', 'Cutting/Shaping', 'B8/JHS2.3.2 Demonstrate understanding of cutting and shaping.', 'Identify and use cutting and shaping tools in different trade areas.', 'Cutting and shaping across trade areas', resources.tools),
      week(4, 'Tools, Equipment and Processes', 'Cutting/Shaping', 'B8/JHS2.3.2 Demonstrate understanding of cutting and shaping.', 'Sketch, label and discuss uses of cutting and shaping tools.', 'Uses of cutting and shaping tools', resources.tools),
      week(5, 'Tools, Equipment and Processes', 'Joining and Assembling', 'B8/JHS2.3.3 Demonstrate understanding of joining and assembling.', 'Apply joining and assembling methods in simple practical tasks.', 'Joining and assembling methods', resources.tools),
      week(6, 'Tools, Equipment and Processes', 'Kitchen Essentials', 'B8/JHS2.3.4 Demonstrate understanding of kitchen essentials.', 'Select and use appropriate kitchen essentials for food preparation.', 'Selecting and using kitchen essentials', resources.tools),
      week(7, 'Tools, Equipment and Processes', 'Finishes and Finishing', 'B8/JHS2.3.5 Demonstrate understanding of finishes and finishing.', 'Describe finishing processes and their uses in products.', 'Finishing processes and their uses', resources.tools),
      week(8, 'Technology', 'Simple Structures and Mechanisms, Electric and Electronic Systems', 'B8/JHS2.4.1 Demonstrate understanding of simple structures and systems.', 'Explain the functions of simple structures and mechanisms.', 'Functions of simple structures and mechanisms', resources.technology),
      week(9, 'Technology', 'Simple Structures and Mechanisms, Electric and Electronic Systems', 'B8/JHS2.4.1 Demonstrate understanding of simple structures and systems.', 'Demonstrate understanding of electric and electronic systems in everyday products.', 'Electric and electronic systems in everyday products', resources.technology),
      week(10, 'Technology', 'Simple Structures and Mechanisms, Electric and Electronic Systems', 'B8/JHS2.4.1 Demonstrate understanding of simple structures and systems.', 'Relate technology systems to design and production needs.', 'Technology systems in design and production', resources.technology),
      week(11, 'Tools, Equipment and Processes', 'Integrated Practical Review', 'Integrated review of tools, equipment and technology systems.', 'Review practical processes, tools and systems across trade areas.', 'Integrated practical review', resources.tools),
      week(12, 'Technology', 'Integrated Systems Review', 'Integrated systems review.', 'Summarise simple structures, mechanisms and basic systems learned in the term.', 'Integrated systems review', resources.technology),
    ],
  },
  {
    subject: 'Career Technology',
    classLevel: 'B8',
    term: 'Term 3',
    title: 'B8 Career Technology Scheme of Work - Term 3',
    weeks: [
      week(1, 'Designing and Making of Artefacts/Products', 'Communicating Design', 'B8/JHS2.5.1.1 Demonstrate understanding of drawing plane figures and solid objects using drawing instruments.', 'B8/JHS2.5.1.1.1 Draw plane figures using instruments; B8/JHS2.5.1.1.2 Draw objects in pictorial using instruments.', 'Drawing plane figures and pictorial objects using instruments', resources.design),
      week(2, 'Designing and Making of Artefacts/Products', 'Designing', 'B8/JHS2.5.2 Demonstrate knowledge and skills in designing.', 'Write design briefs from observed problem situations.', 'Writing design briefs from problem situations', resources.design),
      week(3, 'Designing and Making of Artefacts/Products', 'Designing', 'B8/JHS2.5.2 Demonstrate knowledge and skills in designing.', 'Research design problems and analyse information gathered.', 'Researching and analysing design problems', resources.design),
      week(4, 'Designing and Making of Artefacts/Products', 'Designing', 'B8/JHS2.5.2 Demonstrate knowledge and skills in designing.', 'Write design specifications and justify them.', 'Writing and justifying design specifications', resources.design),
      week(5, 'Designing and Making of Artefacts/Products', 'Planning for Making Artefacts/Products', 'B8/JHS2.5.3 Demonstrate knowledge and skills in planning for making artefacts/products.', 'Develop production plans and schedules for making products.', 'Production planning and scheduling', resources.design),
      week(6, 'Designing and Making of Artefacts/Products', 'Planning for Making Artefacts/Products', 'B8/JHS2.5.3 Demonstrate knowledge and skills in planning for making artefacts/products.', 'Estimate material needs and sequence of operations.', 'Estimating materials and sequencing operations', resources.design),
      week(7, 'Designing and Making of Artefacts/Products', 'Making Artefacts from Compliant, Resistant Materials and Food Ingredients', 'B8/JHS2.5.4 Demonstrate knowledge and skills in making artefacts/products.', 'Make simple products using planned designs and selected materials.', 'Making products from planned designs', resources.design),
      week(8, 'Designing and Making of Artefacts/Products', 'Making Artefacts from Compliant, Resistant Materials and Food Ingredients', 'B8/JHS2.5.4 Demonstrate knowledge and skills in making artefacts/products.', 'Appraise finished products and suggest improvements.', 'Appraising and improving finished products', resources.design),
      week(9, 'Entrepreneurial Skills', 'Career Pathways and Career Opportunities', 'B8/JHS2.6.1 Demonstrate understanding of career pathways and opportunities.', 'Explore career opportunities related to practical and technical fields.', 'Exploring career opportunities in practical fields', resources.enterprise),
      week(10, 'Entrepreneurial Skills', 'Establishing and Managing a Small Business Enterprise', 'B8/JHS2.6.2 Demonstrate understanding of establishing and managing micro and small business enterprises.', 'Explain micro, small and medium-sized business enterprises.', 'Micro, small and medium-sized enterprises', resources.enterprise),
      week(11, 'Entrepreneurial Skills', 'Establishing and Managing a Small Business Enterprise', 'B8/JHS2.6.2 Demonstrate understanding of establishing and managing micro and small business enterprises.', 'Discuss steps in setting up and managing small enterprises.', 'Steps in setting up and managing small enterprises', resources.enterprise),
      week(12, 'Entrepreneurial Skills', 'Establishing and Managing a Small Business Enterprise', 'B8/JHS2.6.2 Demonstrate understanding of establishing and managing micro and small business enterprises.', 'Classify known local businesses and reflect on enterprise ideas.', 'Classifying local businesses and enterprise ideas', resources.enterprise),
    ],
  },
];

export const careerTechnologyB9Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'Career Technology',
    classLevel: 'B9',
    term: 'Term 1',
    title: 'B9 Career Technology Scheme of Work - Term 1',
    weeks: [
      week(1, 'Health and Safety', 'Personal Hygiene and Food Hygiene', 'B9/JHS3.1.1 Demonstrate advanced understanding of personal hygiene and food hygiene.', 'Apply personal and food hygiene practices consistently in practical environments.', 'Applying advanced hygiene practices', resources.safety),
      week(2, 'Health and Safety', 'Personal, Workshop and Food Laboratory Safety', 'B9/JHS3.1.2 Demonstrate skills related to personal, workshop and laboratory safety.', 'Describe procedures for reporting accidents and unsafe practices.', 'Reporting accidents and unsafe practices', resources.safety),
      week(3, 'Health and Safety', 'Personal, Workshop and Food Laboratory Safety', 'B9/JHS3.1.2 Demonstrate skills related to personal, workshop and laboratory safety.', 'Demonstrate safe responses and responsibilities in practical settings.', 'Safe responses and responsibilities', resources.safety),
      week(4, 'Materials for Production', 'Compliant Materials', 'B9/JHS3.2.1 Demonstrate skills in selecting compliant materials for making products and artefacts.', 'Discuss factors influencing the selection of compliant materials.', 'Selecting compliant materials', resources.materials),
      week(5, 'Materials for Production', 'Compliant Materials', 'B9/JHS3.2.1 Demonstrate skills in selecting compliant materials for making products and artefacts.', 'Demonstrate processes involved in working with compliant materials.', 'Processes in working with compliant materials', resources.materials),
      week(6, 'Materials for Production', 'Resistant Materials', 'B9/JHS3.2.2 Demonstrate skills in selecting resistant materials for making products and artefacts.', 'Discuss factors influencing the selection of resistant materials.', 'Selecting resistant materials', resources.materials),
      week(7, 'Materials for Production', 'Resistant Materials', 'B9/JHS3.2.2 Demonstrate skills in selecting resistant materials for making products and artefacts.', 'Demonstrate processes involved in working with resistant materials.', 'Processes in working with resistant materials', resources.materials),
      week(8, 'Materials for Production', 'Smart and Modern Materials', 'B9/JHS3.2.3 Demonstrate understanding of using smart and modern materials for making products/artefacts.', 'Discuss reasons for using smart and modern materials in production.', 'Using smart and modern materials in production', resources.materials),
      week(9, 'Materials for Production', 'Smart and Modern Materials', 'B9/JHS3.2.3 Demonstrate understanding of using smart and modern materials for making products/artefacts.', 'Make prototypes or projects using smart and modern materials.', 'Making prototypes with smart and modern materials', resources.materials),
      week(10, 'Materials for Production', 'Food Commodities (Animal and Plant Sources)', 'B9/JHS3.2.4 Demonstrate skills in selecting food commodities and planning meals.', 'Discuss how to select food commodities for meal preparation.', 'Selecting food commodities for meal preparation', resources.materials),
      week(11, 'Materials for Production', 'Food Commodities (Animal and Plant Sources)', 'B9/JHS3.2.4 Demonstrate skills in selecting food commodities and planning meals.', 'Discuss basic food requirements for different members of the family.', 'Meal planning for different family members', resources.materials),
      week(12, 'Materials for Production', 'Integrated Materials Review', 'Integrated review of materials for production and food planning.', 'Review material selection, smart materials and food planning concepts.', 'Integrated materials and food planning review', resources.materials),
    ],
  },
  {
    subject: 'Career Technology',
    classLevel: 'B9',
    term: 'Term 2',
    title: 'B9 Career Technology Scheme of Work - Term 2',
    weeks: [
      week(1, 'Tools, Equipment and Processes', 'Measuring and Marking Out', 'B9/JHS3.3.1 Demonstrate understanding of measuring and marking out tools and processes.', 'Select tools and processes for accurate measuring and marking out.', 'Advanced measuring and marking out', resources.tools),
      week(2, 'Tools, Equipment and Processes', 'Measuring and Marking Out', 'B9/JHS3.3.1 Demonstrate understanding of measuring and marking out tools and processes.', 'Apply measuring and marking out techniques in product planning.', 'Applying measuring and marking techniques', resources.tools),
      week(3, 'Tools, Equipment and Processes', 'Cutting/Shaping', 'B9/JHS3.3.2 Demonstrate understanding of cutting/shaping tools and equipment used for making artefacts/products.', 'Discuss tools and equipment used for cutting and shaping across trade areas.', 'Cutting and shaping across trade areas', resources.tools),
      week(4, 'Tools, Equipment and Processes', 'Cutting/Shaping', 'B9/JHS3.3.2 Demonstrate understanding of cutting/shaping tools and equipment used for making artefacts/products.', 'Demonstrate cutting and shaping techniques and tool care.', 'Cutting, shaping and tool care', resources.tools),
      week(5, 'Tools, Equipment and Processes', 'Joining and Assembling', 'B9/JHS3.3.3 Demonstrate understanding of joining and assembling processes.', 'Apply joining and assembling processes to practical products.', 'Applying joining and assembling processes', resources.tools),
      week(6, 'Tools, Equipment and Processes', 'Kitchen Essentials', 'B9/JHS3.3.4 Demonstrate understanding of kitchen essentials.', 'Use kitchen essentials efficiently in food preparation tasks.', 'Efficient use of kitchen essentials', resources.tools),
      week(7, 'Tools, Equipment and Processes', 'Finishes and Finishing', 'B9/JHS3.3.5 Demonstrate understanding of finishes and finishing.', 'Apply finishing processes to improve artefacts and products.', 'Applying finishes and finishing', resources.tools),
      week(8, 'Technology', 'Simple Structures and Mechanisms, Electric and Electronic Systems', 'B9/JHS3.4.1 Demonstrate understanding of structures and systems in practical technology.', 'Explain structure-function relationships in products and artefacts.', 'Structure-function relationships in products', resources.technology),
      week(9, 'Technology', 'Simple Structures and Mechanisms, Electric and Electronic Systems', 'B9/JHS3.4.1 Demonstrate understanding of structures and systems in practical technology.', 'Discuss electric and electronic components in simple systems.', 'Electric and electronic components in simple systems', resources.technology),
      week(10, 'Technology', 'Simple Structures and Mechanisms, Electric and Electronic Systems', 'B9/JHS3.4.1 Demonstrate understanding of structures and systems in practical technology.', 'Apply simple technological systems to problem solving in the environment.', 'Applying simple technological systems', resources.technology),
      week(11, 'Tools, Equipment and Processes', 'Integrated Practical Systems Review', 'Integrated review of tools, equipment and systems.', 'Review tools, techniques and systems for practical production.', 'Integrated practical systems review', resources.tools),
      week(12, 'Technology', 'Integrated Technology Review', 'Integrated technology review.', 'Summarise structures, mechanisms and system applications from the term.', 'Integrated technology review', resources.technology),
    ],
  },
  {
    subject: 'Career Technology',
    classLevel: 'B9',
    term: 'Term 3',
    title: 'B9 Career Technology Scheme of Work - Term 3',
    weeks: [
      week(1, 'Designing and Making of Artefacts/Products', 'Communicating Designs', 'B9/JHS3.5.1 Demonstrate knowledge and skills in communicating designs.', 'Use detailed sketches, notes and symbols to communicate design solutions.', 'Detailed communication of design solutions', resources.design),
      week(2, 'Designing and Making of Artefacts/Products', 'Designing', 'B9/JHS3.5.2 Demonstrate knowledge of designing.', 'Identify user requirements from community problem situations.', 'Identifying user requirements', resources.design),
      week(3, 'Designing and Making of Artefacts/Products', 'Designing', 'B9/JHS3.5.2 Demonstrate knowledge of designing.', 'Analyse problem situations and write suitable design briefs.', 'Analysing problems and writing design briefs', resources.design),
      week(4, 'Designing and Making of Artefacts/Products', 'Designing', 'B9/JHS3.5.2 Demonstrate knowledge of designing.', 'Develop design specifications from analysed user needs.', 'Developing design specifications', resources.design),
      week(5, 'Designing and Making of Artefacts/Products', 'Planning for Making Artefacts/Products', 'B9/JHS3.5.3 Demonstrate knowledge and skills in planning for making artefacts/products.', 'Prepare detailed plans for making products and artefacts.', 'Detailed planning for making products', resources.design),
      week(6, 'Designing and Making of Artefacts/Products', 'Planning for Making Artefacts/Products', 'B9/JHS3.5.3 Demonstrate knowledge and skills in planning for making artefacts/products.', 'Sequence operations and estimate resources for production.', 'Sequencing operations and estimating resources', resources.design),
      week(7, 'Designing and Making of Artefacts/Products', 'Making Artefacts from Compliant, Resistant Materials and Food Ingredients', 'B9/JHS3.5.4 Demonstrate knowledge and skills in making artefacts/products.', 'Make products using selected materials and planned processes.', 'Making products from selected materials', resources.design),
      week(8, 'Designing and Making of Artefacts/Products', 'Making Artefacts from Compliant, Resistant Materials and Food Ingredients', 'B9/JHS3.5.4 Demonstrate knowledge and skills in making artefacts/products.', 'Evaluate finished products against design criteria.', 'Evaluating finished products against design criteria', resources.design),
      week(9, 'Entrepreneurial Skills', 'Career Pathways and Career Opportunities', 'B9/JHS3.6.1 Demonstrate understanding of career pathways and opportunities.', 'Analyse career pathways and opportunities in technical and vocational fields.', 'Analysing career pathways and opportunities', resources.enterprise),
      week(10, 'Entrepreneurial Skills', 'Establishing and Managing a Small Business Enterprise', 'B9/JHS3.6.2 Demonstrate understanding of establishing and managing a small business enterprise.', 'Describe how to start and run a small business.', 'Starting and running a small business', resources.enterprise),
      week(11, 'Entrepreneurial Skills', 'Establishing and Managing a Small Business Enterprise', 'B9/JHS3.6.2 Demonstrate understanding of establishing and managing a small business enterprise.', 'Explain licensing, registration and naming of businesses in Ghana.', 'Business naming, licensing and registration', resources.enterprise),
      week(12, 'Entrepreneurial Skills', 'Establishing and Managing a Small Business Enterprise', 'B9/JHS3.6.2 Demonstrate understanding of establishing and managing a small business enterprise.', 'Prepare a simple plan for a small business enterprise.', 'Preparing a simple business plan', resources.enterprise),
    ],
  },
];
