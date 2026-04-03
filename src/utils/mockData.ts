export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'Like New' | 'Good' | 'Fair' | 'Used';
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerBranch: string;
  sellerYear: string;
  sellerVerified: boolean;
  sellerAvatar: string;
  collegeCode: string;
  collegeName: string;
  semester?: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: string;
  itemPrice: number;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantVerified: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

// Mock data for colleges
export const COLLEGES = [
  { code: 'DBIT', name: 'Don Bosco Institute of Technology' },
  { code: 'VJTI', name: 'Veermata Jijabai Technological Institute' },
  { code: 'SPIT', name: 'Sardar Patel Institute of Technology' },
  { code: 'TSEC', name: 'Thadomal Shahani Engineering College' },
  { code: 'KJ', name: 'K.J. Somaiya College of Engineering' },
];

export const CATEGORIES = [
  'Textbooks',
  'Lab Equipment',
  'Calculators',
  'Notebooks',
  'Lab Coats & Aprons',
  'Stationery',
  'Electronics',
  'Other'
];

export const BRANCHES = [
  'Computer Engineering',
  'Information Technology',
  'Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'EXTC',
  'AI & Data Science'
];

export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const SEMESTERS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];

// Mock items data
export const getMockItems = (collegeCode: string): Item[] => {
  return [
    {
      id: '1',
      title: 'Engineering Mathematics III Textbook',
      description: 'Well-maintained textbook for Engineering Mathematics III. All pages intact, minimal highlighting. Perfect for Sem 3 students.',
      price: 250,
      category: 'Textbooks',
      condition: 'Good',
      images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80'],
      sellerId: `${collegeCode}.2023001`,
      sellerName: 'Priya Sharma',
      sellerBranch: 'Computer Engineering',
      sellerYear: '3rd Year',
      sellerVerified: true,
      sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
      collegeCode,
      collegeName: COLLEGES.find(c => c.code === collegeCode)?.name || '',
      semester: 'Sem 3',
      createdAt: '2026-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Scientific Calculator - Casio FX-991ES',
      description: 'Casio FX-991ES Plus scientific calculator. Fully functional, with original box and manual. Battery included.',
      price: 450,
      category: 'Calculators',
      condition: 'Like New',
      images: ['https://images.unsplash.com/photo-1611261746962-414b2f1b0a83?w=800&q=80'],
      sellerId: `${collegeCode}.2023002`,
      sellerName: 'Rahul Desai',
      sellerBranch: 'Electronics Engineering',
      sellerYear: '4th Year',
      sellerVerified: true,
      sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
      collegeCode,
      collegeName: COLLEGES.find(c => c.code === collegeCode)?.name || '',
      createdAt: '2026-01-14T14:20:00Z'
    },
    {
      id: '3',
      title: 'White Lab Coat - Medium Size',
      description: 'Clean white lab coat, medium size. Used for one semester only. Properly maintained and washed.',
      price: 180,
      category: 'Lab Coats & Aprons',
      condition: 'Good',
      images: ['https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80'],
      sellerId: `${collegeCode}.2026003`,
      sellerName: 'Aisha Khan',
      sellerBranch: 'Mechanical Engineering',
      sellerYear: '2nd Year',
      sellerVerified: false,
      sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha',
      collegeCode,
      collegeName: COLLEGES.find(c => c.code === collegeCode)?.name || '',
      createdAt: '2026-01-13T09:15:00Z'
    },
    {
      id: '4',
      title: 'Data Structures and Algorithms - Complete Set',
      description: 'Complete set including textbook, reference book, and solved question papers. Great condition.',
      price: 600,
      category: 'Textbooks',
      condition: 'Good',
      images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80'],
      sellerId: `${collegeCode}.2022004`,
      sellerName: 'Vikram Patil',
      sellerBranch: 'Information Technology',
      sellerYear: '4th Year',
      sellerVerified: true,
      sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
      collegeCode,
      collegeName: COLLEGES.find(c => c.code === collegeCode)?.name || '',
      semester: 'Sem 4',
      createdAt: '2026-01-12T16:45:00Z'
    },
    {
      id: '5',
      title: 'Arduino Uno R3 with Components Kit',
      description: 'Arduino Uno R3 board with jumper wires, breadboard, LEDs, resistors, and sensors. Perfect for mini projects.',
      price: 800,
      category: 'Electronics',
      condition: 'Like New',
      images: ['https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&q=80'],
      sellerId: `${collegeCode}.2023005`,
      sellerName: 'Sneha Joshi',
      sellerBranch: 'EXTC',
      sellerYear: '3rd Year',
      sellerVerified: true,
      sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha',
      collegeCode,
      collegeName: COLLEGES.find(c => c.code === collegeCode)?.name || '',
      createdAt: '2026-01-11T11:30:00Z'
    },
    {
      id: '6',
      title: 'Engineering Drawing Instruments Box',
      description: 'Complete set of drawing instruments including compass, divider, protractor, set squares. Rarely used.',
      price: 350,
      category: 'Lab Equipment',
      condition: 'Like New',
      images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80'],
      sellerId: `${collegeCode}.2026006`,
      sellerName: 'Arjun Mehta',
      sellerBranch: 'Civil Engineering',
      sellerYear: '2nd Year',
      sellerVerified: false,
      sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
      collegeCode,
      collegeName: COLLEGES.find(c => c.code === collegeCode)?.name || '',
      createdAt: '2026-01-10T13:00:00Z'
    },
    {
      id: '7',
      title: 'Physics Practical Journal and Manual',
      description: 'Complete physics practical journal with all experiments done. Includes practical manual and observation book.',
      price: 120,
      category: 'Notebooks',
      condition: 'Good',
      images: ['https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&q=80'],
      sellerId: `${collegeCode}.2023007`,
      sellerName: 'Neha Rao',
      sellerBranch: 'Electrical Engineering',
      sellerYear: '2nd Year',
      sellerVerified: true,
      sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neha',
      collegeCode,
      collegeName: COLLEGES.find(c => c.code === collegeCode)?.name || '',
      semester: 'Sem 1',
      createdAt: '2026-01-09T10:00:00Z'
    },
    {
      id: '8',
      title: 'Database Management Systems Textbook',
      description: 'DBMS textbook by Elmasri and Navathe. Some notes written in margins but overall excellent condition.',
      price: 300,
      category: 'Textbooks',
      condition: 'Fair',
      images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80'],
      sellerId: `${collegeCode}.2023008`,
      sellerName: 'Karan Singh',
      sellerBranch: 'Computer Engineering',
      sellerYear: '3rd Year',
      sellerVerified: true,
      sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=karan',
      collegeCode,
      collegeName: COLLEGES.find(c => c.code === collegeCode)?.name || '',
      semester: 'Sem 5',
      createdAt: '2026-01-08T15:20:00Z'
    }
  ];
};

// Mock chats data
export const getMockChats = (userId: string, collegeCode: string): Chat[] => {
  return [
    {
      id: 'chat1',
      itemId: '1',
      itemTitle: 'Engineering Mathematics III Textbook',
      itemImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
      itemPrice: 250,
      participantId: `${collegeCode}.2023001`,
      participantName: 'Priya Sharma',
      participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
      participantVerified: true,
      lastMessage: 'Yes, it\'s still available. We can meet at the library.',
      lastMessageTime: '2026-01-18T14:30:00Z',
      unreadCount: 1
    },
    {
      id: 'chat2',
      itemId: '2',
      itemTitle: 'Scientific Calculator - Casio FX-991ES',
      itemImage: 'https://images.unsplash.com/photo-1611261746962-414b2f1b0a83?w=400&q=80',
      itemPrice: 450,
      participantId: `${collegeCode}.2023002`,
      participantName: 'Rahul Desai',
      participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
      participantVerified: true,
      lastMessage: 'I can give you a small discount if you buy today.',
      lastMessageTime: '2026-01-17T11:15:00Z',
      unreadCount: 0
    }
  ];
};
