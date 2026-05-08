import type { ExplicitCurriculumTerm } from './mathematicsB7';

const resources = {
  hardware: ['Computer lab', 'Projector', 'Input/output device samples', 'Computing textbook'],
  software: ['Computer lab', 'MS Office or equivalent', 'Projector', 'Sample files'],
  internet: ['Internet connection', 'Browser', 'Email account', 'Projector'],
  coding: ['Scratch or Snap', 'Flowchart sheets', 'Computer lab', 'Projector'],
};

export const computingB7Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'Computing',
    classLevel: 'B7',
    term: 'Term 1',
    title: 'B7 Computing Scheme of Work - Term 1',
    weeks: [
      {
        week: 1,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B7.1.1.1 Examine the parts of a computer.',
        indicator:
          'B7.1.1.1.1 Discuss fourth-generation computers and identify the microchip and processor architecture.',
        topic: 'Fourth-generation computers and processor basics',
        resources: resources.hardware,
      },
      {
        week: 2,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B7.1.1.1 Examine the parts of a computer.',
        indicator:
          'B7.1.1.1.2 Demonstrate understanding in the use of input devices.',
        topic: 'Input devices and their uses',
        resources: resources.hardware,
      },
      {
        week: 3,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B7.1.1.1 Examine the parts of a computer.',
        indicator:
          'B7.1.1.1.3 Examine the uses of output devices such as graphing plotters and projectors.',
        topic: 'Output devices and their uses',
        resources: resources.hardware,
      },
      {
        week: 4,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B7.1.1.1 Examine the parts of a computer.',
        indicator:
          'B7.1.1.1.4 Examine hard drives, optical discs and storage drives.',
        topic: 'Storage devices and storage media',
        resources: resources.hardware,
      },
      {
        week: 5,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B7.1.1.2 Demonstrate the use of the features of the Windows desktop.',
        indicator:
          'B7.1.1.2.1 Discover the latest Windows operating system interface and taskbar features.',
        topic: 'Windows desktop features and taskbar tools',
        resources: resources.hardware,
      },
      {
        week: 6,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B7.1.1.2 Demonstrate the use of the features of the Windows desktop.',
        indicator:
          'B7.1.1.2.2 Practise file management techniques and user account concepts.',
        topic: 'File and folder management',
        resources: resources.hardware,
      },
      {
        week: 7,
        strand: 'Introduction to Computing',
        subStrand: 'Technology in the Community',
        contentStandard: 'B7.1.2.1 Demonstrate the use of technology in the community.',
        indicator:
          'B7.1.2.1.1 Describe examples of technology tools for learning in school subjects.',
        topic: 'Technology tools for learning',
        resources: resources.hardware,
      },
      {
        week: 8,
        strand: 'Introduction to Computing',
        subStrand: 'Technology in the Community',
        contentStandard: 'B7.1.2.1 Demonstrate the use of technology in the community.',
        indicator:
          'B7.1.2.1.2-1.3 Demonstrate technology tools and discuss their benefits in learning.',
        topic: 'Using technology tools in learning',
        resources: resources.hardware,
      },
      {
        week: 9,
        strand: 'Introduction to Computing',
        subStrand: 'Technology in the Community',
        contentStandard: 'B7.1.2.1 Demonstrate the use of technology in the community.',
        indicator:
          'B7.1.2.1.4 Examine the negative impact of computers and computer use on the environment.',
        topic: 'Environmental impact of computers',
        resources: resources.hardware,
      },
      {
        week: 10,
        strand: 'Introduction to Computing',
        subStrand: 'Technology in the Community',
        contentStandard: 'B7.1.2.1 Demonstrate the use of technology in the community.',
        indicator:
          'B7.1.2.1.5-1.6 Propose environmentally responsible practices and create a component from disposed computer parts.',
        topic: 'Responsible e-waste management and recycling ideas',
        resources: resources.hardware,
      },
      {
        week: 11,
        strand: 'Introduction to Computing',
        subStrand: 'Health and Safety in the Use of ICT Tools',
        contentStandard: 'B7.1.3.1 Demonstrate how to apply health and safety measures in using ICT tools.',
        indicator:
          'B7.1.3.1.1-1.2 Describe health and safety measures and current regulatory requirements.',
        topic: 'Health and safety when using ICT tools',
        resources: resources.hardware,
      },
      {
        week: 12,
        strand: 'Introduction to Computing',
        subStrand: 'Health and Safety in the Use of ICT Tools',
        contentStandard: 'B7.1.3.1 Demonstrate how to apply health and safety measures in using ICT tools.',
        indicator:
          'B7.1.3.1.3-1.4 Demonstrate health and safety practices and explore workstation safety measures.',
        topic: 'Safe workstation practices',
        resources: resources.hardware,
      },
    ],
  },
  {
    subject: 'Computing',
    classLevel: 'B7',
    term: 'Term 2',
    title: 'B7 Computing Scheme of Work - Term 2',
    weeks: [
      {
        week: 1,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Word Processing',
        contentStandard: 'B7.2.1.1 Demonstrate how to use word processing software.',
        indicator:
          'B7.2.1.1.1 Explain the importance of word processing software.',
        topic: 'Importance of word processing software',
        resources: resources.software,
      },
      {
        week: 2,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Word Processing',
        contentStandard: 'B7.2.1.1 Demonstrate how to use word processing software.',
        indicator:
          'B7.2.1.1.2 Explore the interface of a word processor.',
        topic: 'Word processor interface and basic tools',
        resources: resources.software,
      },
      {
        week: 3,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Word Processing',
        contentStandard: 'B7.2.1.1 Demonstrate how to use word processing software.',
        indicator:
          'B7.2.1.1.3-1.4 Demonstrate tabs, formatting, spell check and content editing.',
        topic: 'Basic text formatting and editing in word processing',
        resources: resources.software,
      },
      {
        week: 4,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Presentation Software',
        contentStandard: 'B7.2.2.1 Demonstrate how to use Microsoft PowerPoint.',
        indicator:
          'B7.2.2.1.1 Explain the importance of presentation software.',
        topic: 'Importance of presentation software',
        resources: resources.software,
      },
      {
        week: 5,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Presentation Software',
        contentStandard: 'B7.2.2.1 Demonstrate how to use Microsoft PowerPoint.',
        indicator:
          'B7.2.2.1.2 Explore features of the PowerPoint interface.',
        topic: 'PowerPoint interface, themes and templates',
        resources: resources.software,
      },
      {
        week: 6,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Presentation Software',
        contentStandard: 'B7.2.2.1 Demonstrate how to use Microsoft PowerPoint.',
        indicator:
          'B7.2.2.1.3 Demonstrate how to use special characters and insert tools in a presentation.',
        topic: 'Creating simple slide presentations',
        resources: resources.software,
      },
      {
        week: 7,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Electronic Spreadsheet',
        contentStandard: 'B7.2.3.1 Demonstrate how to use the spreadsheet.',
        indicator:
          'B7.2.3.1.1 Explain the importance of electronic spreadsheets.',
        topic: 'Importance of electronic spreadsheets',
        resources: resources.software,
      },
      {
        week: 8,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Electronic Spreadsheet',
        contentStandard: 'B7.2.3.1 Demonstrate how to use the spreadsheet.',
        indicator:
          'B7.2.3.1.2 Explore the features of the spreadsheet interface and basic data operations.',
        topic: 'Spreadsheet interface and entering data',
        resources: resources.software,
      },
      {
        week: 9,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Electronic Spreadsheet',
        contentStandard: 'B7.2.3.1 Demonstrate how to use the spreadsheet.',
        indicator:
          'B7.2.3.1.3-1.4 Set cell datatypes and apply text alignment, merge, wrap, borders and shades.',
        topic: 'Formatting worksheet cells',
        resources: resources.software,
      },
      {
        week: 10,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Electronic Spreadsheet',
        contentStandard: 'B7.2.3.2 Demonstrate how to format a worksheet.',
        indicator:
          'B7.2.3.2.1-2.3 Adjust margins, headers, footers, page orientation and use Autofill.',
        topic: 'Worksheet page setup and Autofill',
        resources: resources.software,
      },
      {
        week: 11,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Electronic Spreadsheet',
        contentStandard: 'B7.2.3.3 Demonstrate how to use spreadsheet formula.',
        indicator:
          'B7.2.3.3.1 Demonstrate how to create formulas.',
        topic: 'Creating simple spreadsheet formulas',
        resources: resources.software,
      },
      {
        week: 12,
        strand: 'Communication Networks',
        subStrand: 'Computer Networks',
        contentStandard: 'B7.3.1.1 Identify the concept of computer networking for global communications.',
        indicator:
          'B7.3.1.1.1 Draw diagrams to illustrate features of network topologies.',
        topic: 'Network hardware and network topologies',
        resources: resources.internet,
      },
    ],
  },
  {
    subject: 'Computing',
    classLevel: 'B7',
    term: 'Term 3',
    title: 'B7 Computing Scheme of Work - Term 3',
    weeks: [
      {
        week: 1,
        strand: 'Communication Networks',
        subStrand: 'Computer Networks',
        contentStandard: 'B7.3.1.1 Identify the concept of computer networking for global communications.',
        indicator:
          'B7.3.1.1.2-1.3 Describe types of networks and discuss entrepreneurial opportunities in networking.',
        topic: 'Types of networks and networking opportunities',
        resources: resources.internet,
      },
      {
        week: 2,
        strand: 'Communication Networks',
        subStrand: 'Internet and Social Media',
        contentStandard: 'B7.3.2.1 Demonstrate the use of social networking and electronic mail.',
        indicator:
          'B7.3.2.1.1 Identify the various types and uses of social media sites.',
        topic: 'Social media types and their uses',
        resources: resources.internet,
      },
      {
        week: 3,
        strand: 'Communication Networks',
        subStrand: 'Internet and Social Media',
        contentStandard: 'B7.3.2.1 Demonstrate the use of social networking and electronic mail.',
        indicator:
          'B7.3.2.1.2 Demonstrate the use of email features such as attachments and address book.',
        topic: 'Using electronic mail effectively',
        resources: resources.internet,
      },
      {
        week: 4,
        strand: 'Communication Networks',
        subStrand: 'Information Security',
        contentStandard: 'B7.3.3.1 Recognise data threats and means of protection.',
        indicator:
          'B7.3.3.1.1 Identify common threats and discuss protection techniques.',
        topic: 'Basic information security and data protection',
        resources: resources.internet,
      },
      {
        week: 5,
        strand: 'Communication Networks',
        subStrand: 'Web Technologies',
        contentStandard: 'B7.3.4.1 Demonstrate the use of a web browser.',
        indicator:
          'B7.3.4.1.1 Explore web browser features and navigation.',
        topic: 'Web browsing and online information access',
        resources: resources.internet,
      },
      {
        week: 6,
        strand: 'Computational Thinking',
        subStrand: 'Introduction to Programming',
        contentStandard: 'B7.4.1.1 Show an understanding of the concept of programming.',
        indicator:
          'B7.4.1.1.1 Demonstrate the correct use of programming terminologies.',
        topic: 'Programming terminologies',
        resources: resources.coding,
      },
      {
        week: 7,
        strand: 'Computational Thinking',
        subStrand: 'Introduction to Programming',
        contentStandard: 'B7.4.1.1 Show an understanding of the concept of programming.',
        indicator:
          'B7.4.1.1.2 Demonstrate understanding in the use of data types.',
        topic: 'Data types in programming',
        resources: resources.coding,
      },
      {
        week: 8,
        strand: 'Computational Thinking',
        subStrand: 'Introduction to Programming',
        contentStandard: 'B7.4.1.1 Show an understanding of the concept of programming.',
        indicator:
          'B7.4.1.1.3 Demonstrate the use of constants and variables.',
        topic: 'Constants and variables',
        resources: resources.coding,
      },
      {
        week: 9,
        strand: 'Computational Thinking',
        subStrand: 'Algorithm',
        contentStandard: 'B7.4.2.1 Analyse the correct step-by-step procedure in solving any real-world problem.',
        indicator:
          'B7.4.2.1.1 Understand sequence, selection and iteration and the meanings of algorithm, decomposition and abstraction.',
        topic: 'Sequence, selection, iteration and algorithms',
        resources: resources.coding,
      },
      {
        week: 10,
        strand: 'Computational Thinking',
        subStrand: 'Algorithm',
        contentStandard: 'B7.4.2.1 Analyse the correct step-by-step procedure in solving any real-world problem.',
        indicator:
          'B7.4.2.1.2 Perform a linear search.',
        topic: 'Linear search and ordered data',
        resources: resources.coding,
      },
      {
        week: 11,
        strand: 'Computational Thinking',
        subStrand: 'Robotics',
        contentStandard: 'B7.4.3.1 Discuss robot intelligence concepts.',
        indicator:
          'B7.4.3.1.1 Review the various applications of robotic machines in society.',
        topic: 'Applications of robots in society',
        resources: resources.coding,
      },
      {
        week: 12,
        strand: 'Computational Thinking',
        subStrand: 'Artificial Intelligence',
        contentStandard: 'B7.4.4.1 Discuss artificial intelligence concepts.',
        indicator:
          'B7.4.4.1.1 Discuss the application of various areas of artificial intelligence.',
        topic: 'Introduction to artificial intelligence concepts',
        resources: resources.coding,
      },
    ],
  },
];

export const computingB8Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'Computing',
    classLevel: 'B8',
    term: 'Term 1',
    title: 'B8 Computing Scheme of Work - Term 1',
    weeks: [
      {
        week: 1,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B8.1.1.1 Identify parts of a computer and technology tools.',
        indicator:
          'B8.1.1.1.1 Discuss the fifth generation of computers with emphasis on quantum computing.',
        topic: 'Fifth-generation computers and quantum computing',
        resources: resources.hardware,
      },
      {
        week: 2,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B8.1.1.1 Identify parts of a computer and technology tools.',
        indicator:
          'B8.1.1.1.2 Demonstrate understanding of direct data entry devices.',
        topic: 'Direct data entry devices and QR codes',
        resources: resources.hardware,
      },
      {
        week: 3,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B8.1.1.1 Identify parts of a computer and technology tools.',
        indicator:
          'B8.1.1.1.3 Examine the uses of modern output devices including 3D and Braille printers.',
        topic: 'Advanced output devices',
        resources: resources.hardware,
      },
      {
        week: 4,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B8.1.1.1 Identify parts of a computer and technology tools.',
        indicator:
          'B8.1.1.1.4 Describe flash memory, SSDs, hybrid drives and related storage systems.',
        topic: 'Modern storage systems',
        resources: resources.hardware,
      },
      {
        week: 5,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B8.1.1.2 Demonstrate the use of the desktop features.',
        indicator:
          'B8.1.1.2.1 Explore the use of the Charms bar.',
        topic: 'Desktop navigation and Charms bar',
        resources: resources.hardware,
      },
      {
        week: 6,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B8.1.1.2 Demonstrate the use of the desktop features.',
        indicator:
          'B8.1.1.2.2 Practise file management techniques such as drive management.',
        topic: 'Drive management and file system maintenance',
        resources: resources.hardware,
      },
      {
        week: 7,
        strand: 'Introduction to Computing',
        subStrand: 'Technology in the Community',
        contentStandard: 'B8.1.2.1 Demonstrate the use of technology in the community.',
        indicator:
          'B8.1.2.1.1 Discuss adaptive and assistive technologies that improve accessibility.',
        topic: 'Adaptive and assistive technologies',
        resources: resources.hardware,
      },
      {
        week: 8,
        strand: 'Introduction to Computing',
        subStrand: 'Technology in the Community',
        contentStandard: 'B8.1.2.1 Demonstrate the use of technology in the community.',
        indicator:
          'B8.1.2.1.2 Describe how portable computing devices affect everyday life.',
        topic: 'Portable computing devices in daily life',
        resources: resources.hardware,
      },
      {
        week: 9,
        strand: 'Introduction to Computing',
        subStrand: 'Technology in the Community',
        contentStandard: 'B8.1.2.1 Demonstrate the use of technology in the community.',
        indicator:
          'B8.1.2.1.3 Explain the issues associated with online services.',
        topic: 'Issues associated with online services',
        resources: resources.hardware,
      },
      {
        week: 10,
        strand: 'Introduction to Computing',
        subStrand: 'Health and Safety in the Use of ICT Tools',
        contentStandard: 'B8.1.3.1 Demonstrate how to apply health and safety measures in using ICT tools.',
        indicator:
          'B8.1.3.1.1 Discuss health issues at workstations.',
        topic: 'Health issues at computer workstations',
        resources: resources.hardware,
      },
      {
        week: 11,
        strand: 'Introduction to Computing',
        subStrand: 'Health and Safety in the Use of ICT Tools',
        contentStandard: 'B8.1.3.1 Demonstrate how to apply health and safety measures in using ICT tools.',
        indicator:
          'B8.1.3.1.2 Discuss safety measures in risk reduction at workstations.',
        topic: 'Risk reduction and workstation safety',
        resources: resources.hardware,
      },
      {
        week: 12,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Word Processing',
        contentStandard: 'B8.2.1.1 Demonstrate how to use Microsoft Word.',
        indicator:
          'B8.2.1.1.1 Demonstrate how to create tables and hyperlinks.',
        topic: 'Tables and hyperlinks in word processing',
        resources: resources.software,
      },
    ],
  },
  {
    subject: 'Computing',
    classLevel: 'B8',
    term: 'Term 2',
    title: 'B8 Computing Scheme of Work - Term 2',
    weeks: [
      {
        week: 1,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Word Processing',
        contentStandard: 'B8.2.1.1 Demonstrate how to use Microsoft Word.',
        indicator:
          'B8.2.1.1.2 Demonstrate how to merge, split, add formulas, borders and shades.',
        topic: 'Advanced table editing in word processing',
        resources: resources.software,
      },
      {
        week: 2,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Word Processing',
        contentStandard: 'B8.2.1.1 Demonstrate how to use Microsoft Word.',
        indicator:
          'B8.2.1.1.3 Demonstrate how to format a page, headers, footers and orientation.',
        topic: 'Page formatting in word processing',
        resources: resources.software,
      },
      {
        week: 3,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Presentation',
        contentStandard: 'B8.2.2.1 Demonstrate how to use presentation software.',
        indicator:
          'B8.2.2.1.1-2.2.1.3 Create and format presentation slides.',
        topic: 'Developing and formatting presentations',
        resources: resources.software,
      },
      {
        week: 4,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Desktop Publishing',
        contentStandard: 'B8.2.3.1 Demonstrate how to use desktop publishing software.',
        indicator:
          'B8.2.3.1.1 Explain the importance of desktop publishing software.',
        topic: 'Introduction to desktop publishing',
        resources: resources.software,
      },
      {
        week: 5,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Desktop Publishing',
        contentStandard: 'B8.2.3.1 Demonstrate how to use desktop publishing software.',
        indicator:
          'B8.2.3.1.2 Create and save a new desktop publishing document.',
        topic: 'Creating documents in desktop publishing',
        resources: resources.software,
      },
      {
        week: 6,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Desktop Publishing',
        contentStandard: 'B8.2.3.1 Demonstrate how to use desktop publishing software.',
        indicator:
          'B8.2.3.1.3 Demonstrate the use of commands under the ribbons and tabs.',
        topic: 'Desktop publishing ribbons and commands',
        resources: resources.software,
      },
      {
        week: 7,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Desktop Publishing',
        contentStandard: 'B8.2.3.1 Demonstrate how to use desktop publishing software.',
        indicator:
          'B8.2.3.1.4-2.3.1.7 Change orientation and margins, modify pictures and text, and create a publisher document.',
        topic: 'Designing flyers and simple publications',
        resources: resources.software,
      },
      {
        week: 8,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Electronic Spreadsheet',
        contentStandard: 'B8.2.4.1 Demonstrate how to use the spreadsheet.',
        indicator:
          'B8.2.4.1.1 Perform operations using functions and built-in functions.',
        topic: 'Using built-in spreadsheet functions',
        resources: resources.software,
      },
      {
        week: 9,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Electronic Spreadsheet',
        contentStandard: 'B8.2.4.1 Demonstrate how to use the spreadsheet.',
        indicator:
          'B8.2.4.1.2 Demonstrate how to create complex formulas.',
        topic: 'Complex formulas in spreadsheets',
        resources: resources.software,
      },
      {
        week: 10,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Electronic Spreadsheet',
        contentStandard: 'B8.2.4.1 Demonstrate how to use the spreadsheet.',
        indicator:
          'B8.2.4.1.3 Demonstrate how to copy formulas and use references.',
        topic: 'Copying formulas and cell referencing',
        resources: resources.software,
      },
      {
        week: 11,
        strand: 'Communication Networks',
        subStrand: 'Computer Networks',
        contentStandard: 'B8.3.1.1 Identify the concept of computer networking for global communication.',
        indicator:
          'B8.3.1.1.1 Describe the data communication models for networks.',
        topic: 'OSI model and data communication',
        resources: resources.internet,
      },
      {
        week: 12,
        strand: 'Communication Networks',
        subStrand: 'Computer Networks',
        contentStandard: 'B8.3.1.1 Identify the concept of computer networking for global communication.',
        indicator:
          'B8.3.1.1.2 Describe the Internet, World Wide Web and IP addresses.',
        topic: 'Internet, WWW and IP addressing',
        resources: resources.internet,
      },
    ],
  },
  {
    subject: 'Computing',
    classLevel: 'B8',
    term: 'Term 3',
    title: 'B8 Computing Scheme of Work - Term 3',
    weeks: [
      {
        week: 1,
        strand: 'Communication Networks',
        subStrand: 'Internet and Social Media',
        contentStandard: 'B8.3.2.1 Demonstrate the use of social networking and electronic mail.',
        indicator:
          'B8.3.2.1.1 Identify the various types of social media sites and use email attachments and address book.',
        topic: 'Photo sharing, video sharing and email tools',
        resources: resources.internet,
      },
      {
        week: 2,
        strand: 'Communication Networks',
        subStrand: 'Information Security',
        contentStandard: 'B8.3.3.1 Recognise data threats and the means of protection.',
        indicator:
          'B8.3.3.1.1 Identify threats and protective measures in digital environments.',
        topic: 'Digital threats and safe practices',
        resources: resources.internet,
      },
      {
        week: 3,
        strand: 'Communication Networks',
        subStrand: 'Web Technologies',
        contentStandard: 'B8.3.4.1 Demonstrate the use of web technologies.',
        indicator:
          'B8.3.4.1.1 Explore website structures and browser-supported web tools.',
        topic: 'Basic web technologies and online tools',
        resources: resources.internet,
      },
      {
        week: 4,
        strand: 'Computational Thinking',
        subStrand: 'Introduction to Programming',
        contentStandard: 'B8.4.1.1 Show an understanding of the concept of programming.',
        indicator:
          'B8.4.1.1.1 Explore programming constructs and coding environments.',
        topic: 'Programming environments and coding basics',
        resources: resources.coding,
      },
      {
        week: 5,
        strand: 'Computational Thinking',
        subStrand: 'Algorithm',
        contentStandard: 'B8.4.2.1 Analyse the correct step-by-step procedure in solving any real-world problem.',
        indicator:
          'B8.4.2.1.1 Apply variables, expressions, assignment statements and operator precedence order.',
        topic: 'Variables, expressions and BODMAS in programming',
        resources: resources.coding,
      },
      {
        week: 6,
        strand: 'Computational Thinking',
        subStrand: 'Algorithm',
        contentStandard: 'B8.4.2.1 Analyse the correct step-by-step procedure in solving any real-world problem.',
        indicator:
          'B8.4.2.1.2 Describe and use sequence, selection and iteration statements in a programme.',
        topic: 'Flow of control in programming',
        resources: resources.coding,
      },
      {
        week: 7,
        strand: 'Computational Thinking',
        subStrand: 'Robotics',
        contentStandard: 'B8.4.3.1 Discuss robot intelligence concepts.',
        indicator:
          'B8.4.3.1.1 Describe the principles underlying the operation of robot components.',
        topic: 'Robot components, controllers and sensors',
        resources: resources.coding,
      },
      {
        week: 8,
        strand: 'Computational Thinking',
        subStrand: 'Robotics',
        contentStandard: 'B8.4.3.1 Discuss robot intelligence concepts.',
        indicator:
          'B8.4.3.1.1 Describe how sensors are used in real-life scenarios.',
        topic: 'Sensors and their real-life applications',
        resources: resources.coding,
      },
      {
        week: 9,
        strand: 'Computational Thinking',
        subStrand: 'Artificial Intelligence',
        contentStandard: 'B8.4.4.1 Discuss artificial intelligence concepts.',
        indicator:
          'B8.4.4.1.1 Discuss artificial neural networks and compare intelligence in humans, animals and machines.',
        topic: 'Artificial neural networks and kinds of intelligence',
        resources: resources.coding,
      },
      {
        week: 10,
        strand: 'Computational Thinking',
        subStrand: 'Artificial Intelligence',
        contentStandard: 'B8.4.4.1 Discuss artificial intelligence concepts.',
        indicator:
          'B8.4.4.1.1 Discuss strong and weak artificial intelligence and mixed reality ideas.',
        topic: 'Strong and weak AI, holograms and mixed reality',
        resources: resources.coding,
      },
      {
        week: 11,
        strand: 'Computational Thinking',
        subStrand: 'Algorithm / Programming',
        contentStandard: 'B8.4.2.1 and B8.4.1.1 strengthen computational thinking through problem solving.',
        indicator:
          'B8.4.2.1.1-1.2 Use program symbols and structured steps to solve a real-life problem.',
        topic: 'Structured problem solving with program symbols',
        resources: resources.coding,
      },
      {
        week: 12,
        strand: 'Computational Thinking',
        subStrand: 'Project and Consolidation',
        contentStandard: 'B8 computational thinking strands are applied in a practical project.',
        indicator:
          'Apply robotics, AI and algorithm concepts in a simple project presentation.',
        topic: 'Computational thinking project and review',
        resources: resources.coding,
      },
    ],
  },
];

export const computingB9Terms: ExplicitCurriculumTerm[] = [
  {
    subject: 'Computing',
    classLevel: 'B9',
    term: 'Term 1',
    title: 'B9 Computing Scheme of Work - Term 1',
    weeks: [
      {
        week: 1,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B9.1.1.1 Identify parts of a computer and technology tools.',
        indicator:
          'B9.1.1.1.1 Discuss the trends in the next generation of computers.',
        topic: 'Next-generation computers and future trends',
        resources: resources.hardware,
      },
      {
        week: 2,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B9.1.1.1 Identify parts of a computer and technology tools.',
        indicator:
          'B9.1.1.1.2 Examine the concept of perceptual computing.',
        topic: 'Perceptual computing',
        resources: resources.hardware,
      },
      {
        week: 3,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B9.1.1.1 Identify parts of a computer and technology tools.',
        indicator:
          'B9.1.1.1.3 Discuss the uses of modern output devices such as wearable displays and e-books.',
        topic: 'Wearable displays, e-paper and e-books',
        resources: resources.hardware,
      },
      {
        week: 4,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B9.1.1.1 Identify parts of a computer and technology tools.',
        indicator:
          'B9.1.1.1.4 Describe network, cloud and holographic storage systems.',
        topic: 'Cloud storage and large-scale storage systems',
        resources: resources.hardware,
      },
      {
        week: 5,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B9.1.1.2 Demonstrate the use of the desktop.',
        indicator:
          'B9.1.1.2.1 Explore personalisation of the computer.',
        topic: 'Desktop personalisation',
        resources: resources.hardware,
      },
      {
        week: 6,
        strand: 'Introduction to Computing',
        subStrand: 'Components of Computers and Computer Systems',
        contentStandard: 'B9.1.1.2 Demonstrate the use of the desktop.',
        indicator:
          'B9.1.1.2.2 Identify and use file management techniques involving drivers and hardware.',
        topic: 'Device drivers and plug-and-play hardware',
        resources: resources.hardware,
      },
      {
        week: 7,
        strand: 'Introduction to Computing',
        subStrand: 'Technology in the Community (Communication)',
        contentStandard: 'B9.1.2.1 Demonstrate the use of technology in the community.',
        indicator:
          'B9.1.2.1.1 Evaluate problems in the community that can be solved with technology.',
        topic: 'Community problems and technology solutions',
        resources: resources.hardware,
      },
      {
        week: 8,
        strand: 'Introduction to Computing',
        subStrand: 'Technology in the Community (Communication)',
        contentStandard: 'B9.1.2.1 Demonstrate the use of technology in the community.',
        indicator:
          'B9.1.2.1.2 Propose solutions to identified problems.',
        topic: 'Proposing technology-based solutions',
        resources: resources.hardware,
      },
      {
        week: 9,
        strand: 'Introduction to Computing',
        subStrand: 'Technology in the Community (Communication)',
        contentStandard: 'B9.1.2.1 Demonstrate the use of technology in the community.',
        indicator:
          'B9.1.2.1.3 Design the selected solution.',
        topic: 'Designing a community technology solution',
        resources: resources.hardware,
      },
      {
        week: 10,
        strand: 'Introduction to Computing',
        subStrand: 'Health and Safety in the Use of ICT Tools',
        contentStandard: 'B9.1.3.1 Demonstrate how to apply health and safety measures in using ICT tools.',
        indicator:
          'B9.1.3.1.1 Evaluate health issues at workstations.',
        topic: 'Ergonomics and workstation health',
        resources: resources.hardware,
      },
      {
        week: 11,
        strand: 'Introduction to Computing',
        subStrand: 'Health and Safety in the Use of ICT Tools',
        contentStandard: 'B9.1.3.1 Demonstrate how to apply health and safety measures in using ICT tools.',
        indicator:
          'B9.1.3.1.2 Evaluate safety risk reduction issues at workstations.',
        topic: 'Heat, lighting and safety risk reduction',
        resources: resources.hardware,
      },
      {
        week: 12,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Word Processing',
        contentStandard: 'B9.2.1.1 Demonstrate how to use Microsoft Word for multimedia.',
        indicator:
          'B9.2.1.1.1 Demonstrate how to add pictures, screenshots and screen clipping.',
        topic: 'Images and screenshots in word processing',
        resources: resources.software,
      },
    ],
  },
  {
    subject: 'Computing',
    classLevel: 'B9',
    term: 'Term 2',
    title: 'B9 Computing Scheme of Work - Term 2',
    weeks: [
      {
        week: 1,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Word Processing',
        contentStandard: 'B9.2.1.1 Demonstrate how to use Microsoft Word for multimedia.',
        indicator:
          'B9.2.1.1.2 Demonstrate the use of SmartArt.',
        topic: 'Using SmartArt in documents',
        resources: resources.software,
      },
      {
        week: 2,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Word Processing',
        contentStandard: 'B9.2.1.1 Demonstrate how to use Microsoft Word for multimedia.',
        indicator:
          'B9.2.1.1.3 Demonstrate how to add multimedia, charts and hyperlinks.',
        topic: 'Multimedia, charts and hyperlinks in Word',
        resources: resources.software,
      },
      {
        week: 3,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Presentation',
        contentStandard: 'B9.2.2.1 Demonstrate how to use Microsoft PowerPoint for multimedia.',
        indicator:
          'B9.2.2.1.1 Demonstrate how to add pictures and insert screenshots.',
        topic: 'Pictures and screenshots in PowerPoint',
        resources: resources.software,
      },
      {
        week: 4,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Presentation',
        contentStandard: 'B9.2.2.1 Demonstrate how to use Microsoft PowerPoint for multimedia.',
        indicator:
          'B9.2.2.1.2 Demonstrate how to animate slides in a presentation.',
        topic: 'Slide transitions and animations',
        resources: resources.software,
      },
      {
        week: 5,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Presentation',
        contentStandard: 'B9.2.2.1 Demonstrate how to use Microsoft PowerPoint for multimedia.',
        indicator:
          'B9.2.2.1.3 Demonstrate how to add multimedia, tables and charts.',
        topic: 'Multimedia, tables and charts in presentations',
        resources: resources.software,
      },
      {
        week: 6,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Desktop Publishing',
        contentStandard: 'B9.2.3.1 Critique a desktop published document.',
        indicator:
          'B9.2.3.1.1 Create and present a desktop published document.',
        topic: 'Creating advanced desktop publishing documents',
        resources: resources.software,
      },
      {
        week: 7,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Desktop Publishing',
        contentStandard: 'B9.2.3.1 Critique a desktop published document.',
        indicator:
          'B9.2.3.1.2-2.3.1.3 Describe and evaluate a desktop published document.',
        topic: 'Evaluating desktop publishing layout and design',
        resources: resources.software,
      },
      {
        week: 8,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Electronic Spreadsheet',
        contentStandard: 'B9.2.4.1 Demonstrate how to use spreadsheet advanced operations.',
        indicator:
          'B9.2.4.1.1 Perform data filtering, sorting and validation.',
        topic: 'Data tables, validation, filtering and sorting',
        resources: resources.software,
      },
      {
        week: 9,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Electronic Spreadsheet',
        contentStandard: 'B9.2.4.1 Demonstrate how to use spreadsheet advanced operations.',
        indicator:
          'B9.2.4.1.2 Demonstrate how to use styles, themes, templates and macros.',
        topic: 'Spreadsheet styles, templates and macros',
        resources: resources.software,
      },
      {
        week: 10,
        strand: 'Productivity Software',
        subStrand: 'Introduction to Electronic Spreadsheet',
        contentStandard: 'B9.2.4.1 Demonstrate how to use spreadsheet advanced operations.',
        indicator:
          'B9.2.4.1.3 Demonstrate the use of data tables, pivot tables, charts and pivot charts.',
        topic: 'Pivot tables and pivot charts',
        resources: resources.software,
      },
      {
        week: 11,
        strand: 'Communication Networks',
        subStrand: 'Computer Networks',
        contentStandard: 'B9.3.1.1 Know the concept of computer networking for global communications.',
        indicator:
          'B9.3.1.1.1 Discuss types of e-commerce and the cashless society.',
        topic: 'E-commerce and the cashless society',
        resources: resources.internet,
      },
      {
        week: 12,
        strand: 'Communication Networks',
        subStrand: 'Computer Networks',
        contentStandard: 'B9.3.1.1 Know the concept of computer networking for global communications.',
        indicator:
          'B9.3.1.1.2 Justify eLearning potentials.',
        topic: 'eLearning and collaborative online platforms',
        resources: resources.internet,
      },
    ],
  },
  {
    subject: 'Computing',
    classLevel: 'B9',
    term: 'Term 3',
    title: 'B9 Computing Scheme of Work - Term 3',
    weeks: [
      {
        week: 1,
        strand: 'Communication Networks',
        subStrand: 'Internet and Social Media',
        contentStandard: 'B9.3.2.1 Demonstrate the use of social networking and electronic mail.',
        indicator:
          'B9.3.2.1.1 Identify the advantages and risks in the use of social media platforms.',
        topic: 'Social media benefits, risks and email response tools',
        resources: resources.internet,
      },
      {
        week: 2,
        strand: 'Communication Networks',
        subStrand: 'Information Security',
        contentStandard: 'B9.3.3.1 Recognise data threats and the means of protection.',
        indicator:
          'B9.3.3.1.1 Discuss cyberbullying, cyberstalking, digital footprint and digital shadow.',
        topic: 'Cyberbullying, cyberstalking and digital footprint',
        resources: resources.internet,
      },
      {
        week: 3,
        strand: 'Communication Networks',
        subStrand: 'Information Security',
        contentStandard: 'B9.3.3.1 Recognise data threats and the means of protection.',
        indicator:
          'B9.3.3.1.2 Explain ten information hacking techniques on the internet environment.',
        topic: 'Common hacking techniques and awareness',
        resources: resources.internet,
      },
      {
        week: 4,
        strand: 'Communication Networks',
        subStrand: 'Web Technologies',
        contentStandard: 'B9.3.4.1 Demonstrate the use of a web browser for blogging.',
        indicator:
          'B9.3.4.1.1 Examine the importance of creating blogs.',
        topic: 'Importance of blogs',
        resources: resources.internet,
      },
      {
        week: 5,
        strand: 'Communication Networks',
        subStrand: 'Web Technologies',
        contentStandard: 'B9.3.4.1 Demonstrate the use of a web browser for blogging.',
        indicator:
          'B9.3.4.1.2 Develop a blog for the school or a social club.',
        topic: 'Developing a school or club blog',
        resources: resources.internet,
      },
      {
        week: 6,
        strand: 'Communication Networks',
        subStrand: 'Web Technologies',
        contentStandard: 'B9.3.4.1 Demonstrate the use of a web browser for blogging.',
        indicator:
          'B9.3.4.1.3 Explore the steps in publishing a blog.',
        topic: 'Publishing and sharing a blog',
        resources: resources.internet,
      },
      {
        week: 7,
        strand: 'Computational Thinking',
        subStrand: 'Introduction to Programming',
        contentStandard: 'B9.4.1.1 Show an understanding of the concept of programming.',
        indicator:
          'B9.4.1.1.1 Describe the conversion of decimal into binary data type for computer processing.',
        topic: 'Number systems and binary conversion',
        resources: resources.coding,
      },
      {
        week: 8,
        strand: 'Computational Thinking',
        subStrand: 'Introduction to Programming',
        contentStandard: 'B9.4.1.1 Show an understanding of the concept of programming.',
        indicator:
          'B9.4.1.1.2 Identify the different tools accessible in integrated development environments.',
        topic: 'Integrated development environments and coding tools',
        resources: resources.coding,
      },
      {
        week: 9,
        strand: 'Computational Thinking',
        subStrand: 'Algorithm',
        contentStandard: 'B9.4.2.1 Analyse the correct step-by-step procedure in solving any real-world problem.',
        indicator:
          'B9.4.2.1.1 Write a programme using flowchart and pseudocode algorithm with sequence, selection and iteration.',
        topic: 'Flowcharts, pseudocode and algorithm design',
        resources: resources.coding,
      },
      {
        week: 10,
        strand: 'Computational Thinking',
        subStrand: 'Algorithm',
        contentStandard: 'B9.4.2.1 Analyse the correct step-by-step procedure in solving any real-world problem.',
        indicator:
          'B9.4.2.1.2 Translate a flowchart algorithm to pseudocode and vice versa.',
        topic: 'Translating between flowcharts and pseudocode',
        resources: resources.coding,
      },
      {
        week: 11,
        strand: 'Computational Thinking',
        subStrand: 'Robotics',
        contentStandard: 'B9.4.3.1 Discuss robot intelligence concepts.',
        indicator:
          'B9.4.3.1.1 Construct a robot artefact using available components or emulator software.',
        topic: 'Constructing and simulating robots',
        resources: resources.coding,
      },
      {
        week: 12,
        strand: 'Computational Thinking',
        subStrand: 'Artificial Intelligence',
        contentStandard: 'B9.4.4.1 Discuss artificial intelligence concepts.',
        indicator:
          'B9.4.4.1.1 Describe expert systems as classical artificial intelligence and demonstrate simple machine learning ideas.',
        topic: 'Expert systems and machine learning basics',
        resources: resources.coding,
      },
    ],
  },
];
