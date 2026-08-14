# PIPELINE — Portfolio (puditc.github.io)

> มาตรฐานเดียวกันทุกโปรเจ็คใต้ Crafnia: push → smoke → security · เว็บเป็น static ล้วน ไม่มี build step

- **เว็บจริง: https://puditc.github.io/**
- `.github/workflows/ci.yml` — ทุก push/PR เข้า `main`: **smoke** = `node scripts/check-links.mjs` (ทุกลิงก์ในเครื่องของ `site/` ต้องชี้ไปยังไฟล์ที่มีอยู่จริง) · **security** = gitleaks
- `.github/workflows/deploy.yml` — ทุก push เข้า `main`: publish `./site` ขึ้น branch `gh-pages` ตรง ๆ ไม่ติดตั้ง dependency ไม่ build
- ดูผลรัน: https://github.com/PuditC/puditc.github.io/actions
- ✅ **rename repo เรียบร้อย 2026-08-14:** `oampudit.github.io` → `puditc.github.io` ให้ตรงกับ handle `PuditC` (user-site จะเสิร์ฟที่ root ก็ต่อเมื่อชื่อตรงกัน) · GitHub redirect ลิงก์เก่าให้อัตโนมัติ แต่ **ห้ามพึ่ง redirect ระยะยาว** — redirect จะพังทันทีถ้ามีใครไปจด repo ชื่อ `oampudit.github.io` ขึ้นมาใหม่ · ชื่อโฟลเดอร์ในเครื่องยังเป็นของเดิม ไม่กระทบอะไร
- ⬜ **ค้างอยู่:** โค้ด React เดิม (`src/`, `public/`, dependencies ใน `package.json`) ยังอยู่ในเครื่องแต่ไม่ถูก deploy แล้ว — รอ owner เคาะว่าจะลบทิ้งเมื่อไหร่
