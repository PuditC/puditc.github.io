# PIPELINE — Portfolio (oampudit.github.io)

> มาตรฐานเดียวกันทุกโปรเจ็คใต้ Crafnia: push → smoke → security · การ deploy ขึ้น GitHub Pages ใช้กลไกเดิมของ repo (ไม่แตะ)

- `.github/workflows/ci.yml` — ทุก push/PR เข้า `main`: **smoke** = `npm run build` + `npm test` (CRA) · **security** = gitleaks
- ดูผลรัน: https://github.com/PuditC/oampudit.github.io/actions
- ⚠️ **เรื่องใหญ่กว่า CI:** repo ชื่อ `oampudit.github.io` แต่ handle GitHub เปลี่ยนเป็น `PuditC` แล้ว — เว็บ Pages แบบ user-site จะเสิร์ฟที่ root ก็ต่อเมื่อชื่อ repo ตรงกับ handle → ควร **rename repo เป็น `PuditC.github.io`** (Settings → General → Repository name) แล้วเว็บจะย้ายไป https://puditc.github.io เอง (ลิงก์เดิม oampudit.github.io จะใช้ไม่ได้ — ถ้ามีที่ไหนลิงก์มาให้อัปเดตด้วย เช่นในเรซูเม่)
