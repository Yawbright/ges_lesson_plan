import type { ClassLevel } from '@/types/lessonPlan';
import type { SchemeWeek } from '@/types/scheme';
import type { ExplicitCurriculumTerm } from './mathematicsB7';

type TopicTuple = [strand: string, subStrand: string, topic: string];

const resourcesByStrand = {
  'Introduction to Computing': ['Computer lab', 'Projector', 'Computer parts samples', 'Computing textbook'],
  'Word Processing': ['Computer lab', 'Word processor', 'Sample files', 'Projector'],
  Presentation: ['Computer lab', 'Presentation software', 'Projector', 'Sample slides'],
  'Programming and Databases': ['Computer lab', 'Flowchart sheets', 'Database examples', 'Projector'],
  'Internet and Social Media': ['Internet connection', 'Web browser', 'Projector', 'Email account'],
  'Health and Safety in Using ICT Tools': ['Computer lab rules chart', 'Posters', 'Projector', 'Computing textbook'],
} as const;

function makeWeek(
  classLevel: ClassLevel,
  week: number,
  strand: TopicTuple[0],
  subStrand: TopicTuple[1],
  topic: TopicTuple[2]
): SchemeWeek {
  const resources = resourcesByStrand[strand as keyof typeof resourcesByStrand] ?? [
    'Computing textbook',
  ];

  return {
    week,
    strand,
    subStrand,
    topic,
    contentStandard: `${classLevel} ${strand}: Demonstrate understanding and practical skill in ${subStrand.toLowerCase()}.`,
    indicator: `Explore and apply ${topic.toLowerCase()} through guided computer activities and discussion.`,
    resources: [...resources],
  };
}

function buildTerm(
  classLevel: ClassLevel,
  term: string,
  topics: TopicTuple[]
): ExplicitCurriculumTerm {
  return {
    subject: 'Computing',
    classLevel,
    term,
    title: `${classLevel} Computing Scheme of Work - ${term}`,
    weeks: topics.map((item, index) =>
      makeWeek(classLevel, index + 1, item[0], item[1], item[2])
    ),
  };
}

const b4Term1: TopicTuple[] = [
  ['Introduction to Computing', 'Generation of Computers and Parts of a Computer and Other Gadgets', 'Generations of computers and simple computer history'],
  ['Introduction to Computing', 'Generation of Computers and Parts of a Computer and Other Gadgets', 'Main parts of a computer and common gadgets'],
  ['Introduction to Computing', 'Generation of Computers and Parts of a Computer and Other Gadgets', 'Input, output and storage devices'],
  ['Introduction to Computing', 'Introduction to MS-Windows Interface', 'Introduction to the Windows desktop and icons'],
  ['Introduction to Computing', 'Introduction to MS-Windows Interface', 'Using windows, folders and the taskbar'],
  ['Introduction to Computing', 'Introduction to MS-Windows Interface', 'Opening, closing and switching between applications'],
  ['Introduction to Computing', 'Data, Sources and Usage', 'What data is and where data comes from'],
  ['Introduction to Computing', 'Data, Sources and Usage', 'Uses of data in school and daily life'],
  ['Introduction to Computing', 'Technology in the Community (Communication)', 'Technology tools used for communication'],
  ['Introduction to Computing', 'Technology in the Community (Communication)', 'Technology in homes, school and the community'],
  ['Presentation', 'Introduction to MS-PowerPoint (Tabs and Ribbons of MS-PowerPoint)', 'PowerPoint interface and slide basics'],
  ['Word Processing', 'Introduction to Word Processing (Tabs and Ribbons of Word Processing)', 'Word processing interface and simple text entry'],
];

const b4Term2: TopicTuple[] = [
  ['Introduction to Computing', 'Generation of Computers and Parts of a Computer and Other Gadgets', 'Functions of computer parts and gadgets'],
  ['Introduction to Computing', 'Introduction to MS-Windows Interface', 'Managing files and folders in Windows'],
  ['Introduction to Computing', 'Data, Sources and Usage', 'Collecting and organising simple data'],
  ['Introduction to Computing', 'Technology in the Community (Communication)', 'Benefits of communication technology'],
  ['Presentation', 'Introduction to MS-PowerPoint (Tabs and Ribbons of MS-PowerPoint)', 'Creating simple slides with text'],
  ['Presentation', 'Introduction to MS-PowerPoint (Tabs and Ribbons of MS-PowerPoint)', 'Formatting slides and inserting simple objects'],
  ['Presentation', 'Introduction to MS-PowerPoint (Tabs and Ribbons of MS-PowerPoint)', 'Presenting a simple slide show'],
  ['Word Processing', 'Introduction to Word Processing (Tabs and Ribbons of Word Processing)', 'Typing, editing and saving text in word processing'],
  ['Word Processing', 'Introduction to Word Processing (Tabs and Ribbons of Word Processing)', 'Formatting text and simple page setup'],
  ['Introduction to Computing', 'Technology in the Community (Communication)', 'Responsible use of technology in communication'],
  ['Introduction to Computing', 'Project Work', 'Mini project using Windows, PowerPoint or Word'],
  ['Introduction to Computing', 'Review', 'Review of B4 computing concepts and practical skills'],
];

const b4Term3: TopicTuple[] = [
  ['Introduction to Computing', 'Generation of Computers and Parts of a Computer and Other Gadgets', 'Review of computer generations and parts'],
  ['Introduction to Computing', 'Introduction to MS-Windows Interface', 'Review of Windows navigation skills'],
  ['Introduction to Computing', 'Data, Sources and Usage', 'Simple data activities and interpretation'],
  ['Introduction to Computing', 'Technology in the Community (Communication)', 'Communication technologies in the local community'],
  ['Presentation', 'Introduction to MS-PowerPoint (Tabs and Ribbons of MS-PowerPoint)', 'Designing a short class presentation'],
  ['Presentation', 'Introduction to MS-PowerPoint (Tabs and Ribbons of MS-PowerPoint)', 'Improving presentation with layout and simple effects'],
  ['Word Processing', 'Introduction to Word Processing (Tabs and Ribbons of Word Processing)', 'Creating simple school documents in Word'],
  ['Word Processing', 'Introduction to Word Processing (Tabs and Ribbons of Word Processing)', 'Editing and printing simple documents'],
  ['Introduction to Computing', 'Practical Activities', 'Hands-on practice across Windows, PowerPoint and Word'],
  ['Introduction to Computing', 'Project Work', 'Simple computing project and presentation'],
  ['Introduction to Computing', 'Review', 'Preparation and review of major B4 computing topics'],
  ['Introduction to Computing', 'Integrated Review', 'End-of-year B4 computing consolidation'],
];

const b5Term1: TopicTuple[] = [
  ['Introduction to Computing', 'Generation of Computers and Parts of a Computer and Other Gadgets', 'Review of computer generations and devices'],
  ['Introduction to Computing', 'Introduction to MS-Windows Interface', 'Advanced Windows navigation and settings basics'],
  ['Introduction to Computing', 'Data, Sources and Usage', 'Types of data and how data is used'],
  ['Introduction to Computing', 'Technology in the Community (Communication)', 'Communication technologies and their impact'],
  ['Presentation', 'Introduction to MS-PowerPoint (Tabs and Ribbons of MS-PowerPoint)', 'PowerPoint tools and slide design'],
  ['Presentation', 'Introduction to MS-PowerPoint (Tabs and Ribbons of MS-PowerPoint)', 'Creating slides with images, shapes and text'],
  ['Word Processing', 'Introduction to Word Processing (Tabs and Ribbons of Word Processing)', 'Word processing tools and interface review'],
  ['Word Processing', 'Introduction to Word Processing (Tabs and Ribbons of Word Processing)', 'Formatting, editing and saving documents'],
  ['Programming and Databases', 'Introduction to Databases, Algorithm and Programming', 'What databases, algorithms and programs are'],
  ['Programming and Databases', 'Introduction to Electronic Spreadsheet (Tabs and Ribbons Manipulation)', 'Spreadsheet interface and cell basics'],
  ['Programming and Databases', 'Introduction to Electronic Spreadsheet (Tabs and Ribbons Manipulation)', 'Entering simple data into spreadsheets'],
  ['Introduction to Computing', 'Review', 'Review of B5 introduction, presentation and word processing'],
];

const b5Term2: TopicTuple[] = [
  ['Internet and Social Media', 'Network Overview', 'What a network is and common types of networks'],
  ['Internet and Social Media', 'Web Browsers and Web Pages', 'Using a web browser and understanding web pages'],
  ['Internet and Social Media', 'Surfing the World Wide Web', 'Safe browsing and finding information online'],
  ['Internet and Social Media', 'Favourite Places and Search Engine', 'Bookmarks, favourite places and search engines'],
  ['Internet and Social Media', 'Using Online Forms', 'Completing simple online forms'],
  ['Internet and Social Media', 'Customizing Your Browser', 'Changing basic browser settings'],
  ['Internet and Social Media', 'Electronic Email', 'Introduction to email and email parts'],
  ['Internet and Social Media', 'Internet of Things (IoT)', 'Introduction to connected devices and IoT'],
  ['Internet and Social Media', 'Digital Literacy', 'Responsible digital behaviour and understanding digital information'],
  ['Internet and Social Media', 'Digital Literacy', 'Evaluating information and staying safe online'],
  ['Health and Safety in Using ICT Tools', 'Health and Safety in Using ICT Tools', 'Posture, safety and care when using ICT tools'],
  ['Computing', 'Review', 'Review of B5 internet, social media and safety topics'],
];

const b5Term3: TopicTuple[] = [
  ['Presentation', 'Introduction to MS-PowerPoint (Tabs and Ribbons of MS-PowerPoint)', 'Building a complete presentation project'],
  ['Word Processing', 'Introduction to Word Processing (Tabs and Ribbons of Word Processing)', 'Typing and formatting longer documents'],
  ['Programming and Databases', 'Introduction to Databases, Algorithm and Programming', 'Simple algorithms in everyday activities'],
  ['Programming and Databases', 'Introduction to Databases, Algorithm and Programming', 'Creating simple step-by-step instructions and flow ideas'],
  ['Programming and Databases', 'Introduction to Electronic Spreadsheet (Tabs and Ribbons Manipulation)', 'Using rows, columns and simple calculations in spreadsheets'],
  ['Internet and Social Media', 'Electronic Email', 'Writing and sending simple emails safely'],
  ['Internet and Social Media', 'Digital Literacy', 'Digital footprints and online responsibility'],
  ['Health and Safety in Using ICT Tools', 'Health and Safety in Using ICT Tools', 'Safe lab behaviour and protecting equipment'],
  ['Computing', 'Practical Activities', 'Hands-on practice across office tools and internet use'],
  ['Computing', 'Project Work', 'Mini project using presentation, word processing or spreadsheets'],
  ['Computing', 'Review', 'Review of B5 practical skills and theory'],
  ['Computing', 'Integrated Review', 'End-of-year B5 computing consolidation'],
];

const b6Term1: TopicTuple[] = [
  ['Introduction to Computing', 'Generation of Computers and Parts of a Computer and Other Gadgets', 'Review of generations, devices and gadgets'],
  ['Introduction to Computing', 'Introduction to MS-Windows Interface', 'Windows features, settings and file organisation'],
  ['Introduction to Computing', 'Data, Sources and Usage', 'Data collection, sources and responsible use'],
  ['Introduction to Computing', 'Data, Sources and Usage', 'Importance of data in modern society'],
  ['Introduction to Computing', 'Technology in the Community', 'Technology use in work, school and community life'],
  ['Presentation', 'Introduction to MS-PowerPoint', 'Advanced slide creation and design basics'],
  ['Word Processing', 'Introduction to MS-Word Processing', 'Word processing for reports and letters'],
  ['Programming and Databases', 'Introduction to Databases, Algorithm and Programming Languages', 'Programming ideas, algorithms and simple logic'],
  ['Programming and Databases', 'Introduction to Databases, Algorithm and Programming Languages', 'Databases and storing information electronically'],
  ['Programming and Databases', 'Introduction to Electronic Spreadsheet', 'Spreadsheets for tables and simple formulas'],
  ['Programming and Databases', 'Introduction to Electronic Spreadsheet', 'Formatting and organising spreadsheet data'],
  ['Computing', 'Review', 'Review of B6 introduction, productivity and programming basics'],
];

const b6Term2: TopicTuple[] = [
  ['Internet and Social Media', 'Network Overview', 'Networks and how devices communicate'],
  ['Internet and Social Media', 'Web Browsers and Web Pages', 'Understanding websites and web pages'],
  ['Internet and Social Media', 'Surfing the World Wide Web', 'Searching, browsing and evaluating web content'],
  ['Internet and Social Media', 'Favourite Places and Search Engine', 'Using search engines and managing favourite places'],
  ['Internet and Social Media', 'Using Online Forms', 'Using online forms for information and registration'],
  ['Internet and Social Media', 'Customizing Your Browser', 'Customising browser settings and tools'],
  ['Internet and Social Media', 'Electronic Email', 'Email communication and attachment basics'],
  ['Internet and Social Media', 'Internet of Things (IoT)', 'IoT devices in home, school and society'],
  ['Internet and Social Media', 'Digital Literacy', 'Digital literacy, online sources and responsible use'],
  ['Internet and Social Media', 'Internet Etiquette', 'Internet etiquette and respectful online behaviour'],
  ['Health and Safety in Using ICT Tools', 'Health and Safety in Using ICT Tools', 'Health, safety and ergonomic practices in ICT use'],
  ['Computing', 'Review', 'Review of B6 internet, digital literacy and safety topics'],
];

const b6Term3: TopicTuple[] = [
  ['Presentation', 'Introduction to MS-PowerPoint', 'Creating an effective multi-slide presentation'],
  ['Word Processing', 'Introduction to MS-Word Processing', 'Preparing letters, reports and formatted documents'],
  ['Programming and Databases', 'Introduction to Databases, Algorithm and Programming Languages', 'Designing simple algorithms and pseudocode ideas'],
  ['Programming and Databases', 'Introduction to Databases, Algorithm and Programming Languages', 'Storing and retrieving simple data'],
  ['Programming and Databases', 'Introduction to Electronic Spreadsheet', 'Using simple formulas and organising data in spreadsheets'],
  ['Internet and Social Media', 'Digital Literacy', 'Responsible use of digital tools for learning'],
  ['Internet and Social Media', 'Internet Etiquette', 'Safe, respectful and productive internet behaviour'],
  ['Health and Safety in Using ICT Tools', 'Health and Safety in Using ICT Tools', 'Review of safety, maintenance and responsible use of ICT tools'],
  ['Computing', 'Practical Activities', 'Integrated practical tasks across presentation, word processing and spreadsheets'],
  ['Computing', 'Project Work', 'Final computing project and presentation'],
  ['Computing', 'Transition to JHS', 'Upper primary computing readiness for JHS'],
  ['Computing', 'Integrated Review', 'End-of-year B6 computing consolidation'],
];

export const primaryComputingTerms: ExplicitCurriculumTerm[] = [
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
