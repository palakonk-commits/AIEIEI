// levels.js

export const LEVELS = [
  {
    id: 1, emoji: '🌈', label: 'ระดับ 1',
    title: 'คำถามเบื้องต้น',
    type: 'choice-all-correct',
    desc: 'ตอบคำถามนี้ตามใจเลย ไม่มีผิด!',
    question: 'คุณเป็นเกย์หรือไม่?',
    choices: [
      { text: '🏳️‍🌈 เป็นเกย์', ok: true },
      { text: '🙅 ไม่เป็นเกย์', ok: true },
      { text: '💜 ชอบเกย์', ok: true },
      { text: '❤️ รักเกย์', ok: true },
    ],
    clue: '🐷 หมู',
  },
  {
    id: 2, emoji: '🔢', label: 'ระดับ 2',
    title: 'คิดเลขหน่อย',
    type: 'choice-hidden-5th',
    desc: 'ดูดีๆ มีตัวเลือกที่ถูกซ่อนอยู่...',
    question: '5 + 5 = 10\nแล้ว 20 + 20 = เท่าไหร่?',
    choices: [
      { text: '30', ok: false },
      { text: '50', ok: false },
      { text: '100', ok: false },
      { text: '20', ok: false },
    ],
    hiddenChoice: { text: '40', ok: true },
    clue: '🚗 รถเราไม่เหมือนใครอยู่แล้ว',
  },
  {
    id: 3, emoji: '💻', label: 'ระดับ 3',
    title: 'โค้ดลึกลับ',
    type: 'choice-pin-unlock',
    desc: 'ตัวเลือกถูกซ่อนไว้! พิมพ์ PIN 6 ตัวเพื่อปลดล็อค',
    pinLength: 6,
    question: 'เมื่อคุณเขียนโค้ด print("เกย์")\nมันคือโค้ดภาษาอะไร และผลลัพธ์คืออะไร?',
    choices: [
      { text: '🐍 ภาษา Python — ผลลัพธ์คือ "เกย์"', ok: true },
      { text: '⚙️ ภาษา C++ — ผลลัพธ์คือ "เกย์"', ok: false },
      { text: '🌐 ภาษา HTML — ผลลัพธ์คือ "เกย์"', ok: false },
    ],
    clue: '🔢 15',
  },
  {
    id: 4, emoji: '🧑‍💻', label: 'ระดับ 4',
    title: 'ตัวแปรคืออะไร?',
    type: 'choice-image-reveal',
    desc: 'อ่านโค้ดด้านล่างแล้วตอบว่าตัวแปรคืออะไร',
    codeSnippet: 'name = "เกย์"\nprint(name)',
    question: 'ในโค้ดนี้ ตัวแปรคืออะไร?',
    choices: [
      { text: '🏳️‍🌈 เกย์', ok: false },
      { text: '📦 name', ok: true },
      { text: '🖨️ print', ok: false },
    ],
    revealImage: '/level4.jpg',
    clue: 'รูปนี้หมายถึงอ่ะไรนะ!',
  },
  {
    id: 5, emoji: '\uD83D\uDCF8', label: '\u0E23\u0E30\u0E14\u0E31\u0E1A 5',
    title: '\u0E16\u0E48\u0E32\u0E22\u0E23\u0E39\u0E1B\u0E23\u0E38\u0E48\u0E19\u0E1E\u0E35\u0E48',
    type: 'upload',
    desc: '\u0E16\u0E48\u0E32\u0E22\u0E23\u0E39\u0E1B\u0E04\u0E39\u0E48\u0E01\u0E31\u0E1A\u0E23\u0E38\u0E48\u0E19\u0E1E\u0E35\u0E48\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E41\u0E25\u0E49\u0E27\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14 \u0E23\u0E2D\u0E23\u0E38\u0E48\u0E19\u0E1E\u0E35\u0E48\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34!',
    question: '\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E23\u0E39\u0E1B\u0E16\u0E48\u0E32\u0E22\u0E04\u0E39\u0E48\u0E01\u0E31\u0E1A\u0E23\u0E38\u0E48\u0E19\u0E1E\u0E35\u0E48',
    choices: [],
    revealImages: ['/level5-1.jpg', '/level5-2.png', '/level5-3.jpg'],
    clue: '\uD83C\uDF1F story',
  },
];

export const ALL_CLUES = [
  { icon: '🐷', text: 'หมู' },
  { icon: '🚗', text: 'รถเราไม่เหมือนใครอยู่แล้ว' },
  { icon: '🔢', text: '15' },
  { icon: '👥', text: 'คนที่โดดเด่นคือ...' },
  { icon: '🌟', text: 'story' },
];
