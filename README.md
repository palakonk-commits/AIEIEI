<div align="center">
  <h1>🎮 AIEIEI (Interactive Escape Room)</h1>
  <p><i>แอปพลิเคชันเว็บแบบอินเทอร์แอกทีฟสำหรับเกมตะลุยด่านและไขปริศนา</i></p>

  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
  ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
  ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
  ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
  ![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
</div>

<br/>

ยินดีต้อนรับสู่โปรเจกต์ **AIEIEI!** 🎈 โปรเจกต์นี้เป็นแอปพลิเคชันเว็บแบบอินเทอร์แอกทีฟ ซึ่งมีโครงสร้างเป็นด่านต่างๆ (Levels) เช่น ด่านแก้ปริศนา, เลือกคำตอบ, เขาวงกต, ฯลฯ พร้อมด้วยระบบจัดการผ่านหน้าแอดมิน โดยแบ่งเป็นส่วน Frontend และ Backend อย่างชัดเจน

---

## 🏗️ โครงสร้างโปรเจกต์ (Project Structure)
- **🎨 Frontend (`src/`)**: 
  - พัฒนาด้วย **React** และ **Vite.js** ⚡
  - ควบคู่กับ **Framer Motion** สำหรับหน้าต่างแอนิเมชันสุดลื่นไหล และ **React Router** สำหรับการจัดการหน้าเว็บ
  - มีด่านต่างๆ (Levels) ให้ผจญภัย เช่น `AILevel.jsx`, `MazeLevel.jsx`, `CipherLevel.jsx` 🧩
  - หน้าแอดมิน (`AdminPage.jsx`) สำหรับควบคุมและจัดการระดับของเกมหรือข้อมูลต่างๆ ⚙️
- **⚙️ Backend (`server/`)**: 
  - พัฒนาด้วย **Node.js** ใช้งาน **Express.js** 
  - ต่อกับฐานข้อมูล **PostgreSQL** 🐘
  - รองรับ package อย่าง `multer` สำหรับจัดการอัปโหลดไฟล์ และ `cors` จัดการนโยบายข้ามโดเมน 🌐

---

## 📋 ข้อกำหนดก่อนการติดตั้ง (Prerequisites)
ก่อนเริ่มลงมือติดตั้ง กรุณาเตรียมโปรแกรมเหล่านี้ในเครื่องคุณ:
1. 🟢 [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป)
2. 🗄️ [PostgreSQL](https://www.postgresql.org/) (สำหรับระบบฐานข้อมูล)
3. 📦 เครื่องมือจัดการแพ็กเกจ: `npm` หรือ `yarn`

---

## 🚀 ขั้นตอนการติดตั้งและรันโปรเจกต์

### ⚙️ 1. การตั้งค่า Backend
1. เปิด Terminal และเข้าไปที่โฟลเดอร์ `server/`
   ```powershell
   cd server
   ```
2. ติดตั้ง Dependencies ที่จำเป็น
   ```powershell
   npm install
   ```
3. ตั้งค่าระบบฐานข้อมูล (Database) และตัวแปรแวดล้อม:
   สร้างไฟล์ `.env` ในโฟลเดอร์ `server/` เพื่อใส่ค่าการเชื่อมต่อฐานข้อมูล Postgres ตัวอย่าง:
   ```env
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=aieiei_db
   ```
4. สตาร์ท Backend Server
   ```powershell
   npm run dev
   ```
   > 💡 *หมายเหตุ: API จะรันรอรับ Request จากระบบ Frontend ส่วนใหญ่จะทำงานอยู่บน `http://localhost:3000` (หรือ Port อื่นที่คุณตั้งค่าไว้).*

### 🎨 2. การตั้งค่า Frontend
1. เปิด Terminal ใหม่ (คู่ขนานกับ Backend) และอยู่ในโฟลเดอร์หลักของโปรเจกต์ (`c:\Dev Code\Eoi`)
2. ติดตั้ง Dependencies
   ```powershell
   npm install
   ```
3. ตั้งค่าตัวแปรแวดล้อม: สร้างไฟล์ `.env` เพื่อคอนฟิกลิงก์เรียก API Backend 
   ```env
   VITE_API_URL=http://localhost:3000
   ```
4. สตาร์ท Frontend (โหมดนักพัฒนา)
   ```powershell
   npm run dev
   ```
   > 🎉 *เสร็จสิ้น! คุณสามารถเข้าใช้งานแอปพลิเคชันได้ที่ `http://localhost:5173` ผ่านเบราว์เซอร์*

---

## 🎮 สอนการใช้งานเบื้องต้น (How it works)

### 🏃‍♂️ ส่วนฝั่งผู้เล่น (Player Modes)
เข้าชมเว็บไซต์ผ่านหน้าแรก คุณจะได้พบกับระบบการเล่นเกมแบบด่านต่อด่าน (Levels) ให้พิชิตปริศนาหรือผ่านเงื่อนไขในแต่ละฉาก เช่น:
- 🌀 **Maze**: เดินหลบสิ่งกีดขวางในเขาวงกต
- 🔐 **Cipher**: ไขรหัสลับและรหัสผ่าน
- 🤖 **AI Level**: ตอบโต้กับ AI ตามเงื่อนไขของด่านให้สำเร็จ

### 👑 ส่วนฝั่งแอดมิน (Admin Control)
คุณสามารถเข้าสู่หน้าแบบ `AdminPage` ควบคู่กับแท็บเมนู `AdminSidebar` เพื่อ:
- จัดการและแก้ไขเนื้อหา / เพิ่มหรือปรับแต่งด่าน 📝
- ตรวจสอบความคืบหน้าของฝั่งผู้เล่น
- อนุมัติการเข้าถึงให้ผู้ใช้

### 💅 สไตล์ที่จัดวาง (Styling Pattern)
ไฟล์ส่วนใหญ่ใช้ **CSS Modules** (`.module.css`) ซึ่งทำให้การเขียน CSS แต่ละหน้าต่างไม่ต้องกลัวว่าคลาส (Class Name) จะไปชนหรือทับกัน ช่วยให้การออกแบบตัวเกมดูเป็นสัดส่วนครับ

---

## 🛠️ คำสั่งต่างๆ ที่น่าสนใจ (Scripts)

| คำสั่ง | รายละเอียด |
|--------|----------------------------------------------------|
| `npm run dev` | สตาร์ท Development Server ของฝั่งนั้นๆ |
| `npm run build` | สร้างโค้ดหน้าบ้าน (Production Build) ฝั่ง Frontend |
| `npm run lint` | ตรวจสอบคุณภาพโค้ดด้วยเครื่องมือ ESLint |
| `npm run preview` | เปิดพรีวิวแอปของ Production ที่ build แล้ว |

---

> **📌 ข้อมูลเพิ่มเติม:** 
> หากต้องการแก้ข้อมูลด่านและการตั้งค่าระบบเลเวลต่างๆ สามารถเข้าไปยังโฟลเดอร์ **`src/components/Levels/`** และตั้งค่า Data ด่านได้ที่ **`src/data/levels.js`** ส่วน API ทั้งหมดถูกจัดการที่โฟลเดอร์ **`server/`**

<br/>
<div align="center">
  <b>Happy Coding & Have Fun playing AIEIEI! 🎉</b>
</div>
