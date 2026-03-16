// levels.js

export const LEVELS = [
  {
    id: 1, icon: 'ShieldQuestion', label: 'Phase 1',
    title: 'Initial Assessment',
    type: 'choice-all-correct',
    desc: 'Select an approach to proceed. No wrong answers.',
    question: 'Are you ready to initiate the sequence?',
    choices: [
      { text: 'Yes, proceed.', ok: true },
      { text: 'No, but proceed anyway.', ok: true },
      { text: 'Acknowledge.', ok: true },
      { text: 'Confirm.', ok: true },
    ],
    clue: 'Pork',
  },
  {
    id: 2, icon: 'Hash', label: 'Phase 2',
    title: 'Mathematical Logic',
    type: 'choice-hidden-5th',
    desc: 'Observe the options closely. Some variables are concealed.',
    question: '5 + 5 = 10\nEvaluate: 20 + 20',
    choices: [
      { text: '30', ok: false },
      { text: '50', ok: false },
      { text: '100', ok: false },
      { text: '20', ok: false },
    ],
    hiddenChoice: { text: '40', ok: true },
    clue: 'Unique Vehicle',
  },
  {
    id: 3, icon: 'Terminal', label: 'Phase 3',
    title: 'Encrypted Syntax',
    type: 'choice-pin-unlock',
    desc: 'Bypass required. Enter the 6-digit PIN to reveal choices.',
    pinLength: 6,
    question: 'Analyze string: print("Code")\nIdentify language and output.',
    choices: [
      { text: 'Python — Output: "Code"', ok: true },
      { text: 'C++ — Output: "Code"', ok: false },
      { text: 'HTML — Output: "Code"', ok: false },
    ],
    clue: '15',
  },
  {
    id: 4, icon: 'Database', label: 'Phase 4',
    title: 'Variable Isolation',
    type: 'choice-image-reveal',
    desc: 'Review the snippet below. Identify the variable.',
    codeSnippet: 'name = "Code"\nprint(name)',
    question: 'Which component represents the variable?',
    choices: [
      { text: 'Code', ok: false },
      { text: 'name', ok: true },
      { text: 'print', ok: false },
    ],
    revealImage: '/level4.jpg',
    clue: 'Analyze the image.',
  },
  {
    id: 5, icon: 'Camera', label: 'Phase 5',
    title: 'Visual Confirmation',
    type: 'upload',
    desc: 'Submit photographic evidence associated with the target.',
    question: 'Upload verification photo here.',
    choices: [],
    revealImages: ['/level5-1.jpg', '/level5-2.png', '/level5-3.jpg'],
    clue: 'Story',
  },
];

export const ALL_CLUES = [
  { icon: 'Fingerprint', text: 'Pork' },
  { icon: 'Car', text: 'Unique Vehicle' },
  { icon: 'Hash', text: '15' },
  { icon: 'Users', text: 'Prominent Figure' },
  { icon: 'Star', text: 'Story' },
];
