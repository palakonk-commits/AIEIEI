// levels.js

export const LEVELS = [
  {
    id: 1, icon: 'ShieldQuestion', label: 'ขั้นที่ 1',
    title: 'การประเมินเบื้องต้น',
    type: 'choice-all-correct',
    desc: 'เลือกระเบียบวิธีเพื่อดำเนินการต่อ ระบบจะยอมรับการตัดสินใจของคุณ',
    question: 'คุณพร้อมที่จะเริ่มต้นกระบวนการหรือไม่?',
    choices: [
      { text: 'ยืนยันและดำเนินการ', ok: true },
      { text: 'ข้ามขั้นและดำเนินการต่อ', ok: true },
      { text: 'รับทราบข้อตกลง', ok: true },
      { text: 'อนุมัติการเข้าถึง', ok: true },
    ],
    clue: 'หมู',
  },
  {
    id: 2, icon: 'Hash', label: 'ขั้นที่ 2',
    title: 'ตรรกะเชิงคณิตศาสตร์',
    type: 'choice-hidden-5th',
    desc: 'วิเคราะห์โครงสร้างข้อมูลอย่างละเอียด บางตัวแปรอาจถูกซ่อนไว้ในระบบ',
    question: 'หาก 5 + 5 = 10\nจงประเมินค่า: 20 + 20',
    choices: [
      { text: '30', ok: false },
      { text: '50', ok: false },
      { text: '100', ok: false },
      { text: '20', ok: false },
    ],
    hiddenChoice: { text: '40', ok: true },
    clue: 'พาหนะเฉพาะตัว',
  },
  {
    id: 3, icon: 'Terminal', label: 'ขั้นที่ 3',
    title: 'ชุดคำสั่งที่ถูกเข้ารหัส',
    type: 'choice-pin-unlock',
    desc: 'ตรวจพบการเข้ารหัสลับ ระบุรหัสผ่าน PIN 6 หลักเพื่อปลดล็อกตัวเลือก',
    pinLength: 6,
    question: 'วิเคราะห์ชุดคำสั่ง: print("Code")\nจงระบุภาษาและผลลัพธ์ที่ได้',
    choices: [
      { text: 'Python — ผลลัพธ์: "Code"', ok: true },
      { text: 'C++ — ผลลัพธ์: "Code"', ok: false },
      { text: 'HTML — ผลลัพธ์: "Code"', ok: false },
    ],
    clue: '15',
  },
  {
    id: 4, icon: 'Database', label: 'ขั้นที่ 4',
    title: 'การแยกตัวแปรข้อมูล',
    type: 'choice-image-reveal',
    desc: 'ประมวลผลข้อมูลจำลองด้านล่าง และระบุตำแหน่งของตัวแปร',
    codeSnippet: 'name = "Code"\nprint(name)',
    question: 'องค์ประกอบใดทำหน้าที่เป็นตัวแปรในระบบนี้?',
    choices: [
      { text: 'Code', ok: false },
      { text: 'name', ok: true },
      { text: 'print', ok: false },
    ],
    revealImage: '/level4.jpg',
    clue: 'บุคคลสำคัญ',
  },
  {
    id: 5, icon: 'Camera', label: 'ขั้นที่ 5',
    title: 'การยืนยันทางกายภาพ',
    type: 'upload',
    desc: 'ส่งมอบหลักฐานทางภาพถ่ายที่เกี่ยวข้องกับเป้าหมายเพื่ออนุมัติขั้นสุดท้าย',
    question: 'อัปโหลดภาพถ่ายเพื่อประมวลผลการยืนยัน',
    choices: [],
    revealImages: ['/level5-1.jpg', '/level5-2.png', '/level5-3.jpg'],
    clue: 'เรื่องราว',
  },
];

export const ALL_CLUES = [
  { icon: 'Fingerprint', text: 'หมู' },
  { icon: 'Car', text: 'พาหนะเฉพาะตัว' },
  { icon: 'Hash', text: '15' },
  { icon: 'Users', text: 'บุคคลสำคัญ' },
  { icon: 'Star', text: 'เรื่องราว' },
];
