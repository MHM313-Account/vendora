# 🚀 Vendora — Vercel Deployment Guide (اردو گائیڈ)

یہ گائیڈ آپ کو سکھائے گی کہ آپ **Vendora** کو **Vercel** پر بالکل مفت (100% Free) کیسے لائیو کر سکتے ہیں تاکہ آپ اپنے موبائل فون یا کسی بھی لیپ ٹاپ سے 24 گھنٹے اپنی دکان چلا سکیں۔

---

## 📋 ضروری چیزیں:
1. ایک **GitHub** اکاؤنٹ (مفت)
2. ایک **Vercel** اکاؤنٹ (مفت، سیدھا GitHub سے لاگ ان کریں: [vercel.com](https://vercel.com))

---

## ⚡ مرحلہ 1: کوڈ کو GitHub پر اپلوڈ کرنا (صرف ایک بار)

اپنے لیپ ٹاپ پر ٹرمینل یا کمانڈ پرامپٹ میں یہ 3 کمانڈز چلائیں:

```bash
git add .
git commit -m "Vendora ready for Vercel deployment"
```

اب [GitHub.com](https://github.com) پر جائیں، **New Repository** بنائیں (نام رکھیں: `vendora`)، اور یہ دو کمانڈز چلائیں:

```bash
git remote add origin https://github.com/YOUR_USERNAME/vendora.git
git push -u origin main
```

*(نوٹ: `YOUR_USERNAME` کی جگہ اپنا گٹ ہب یوزر نیم لکھیں)*

---

## 🌐 مرحلہ 2: Vercel پر 1-کلک میں لائیو کرنا

1. [vercel.com](https://vercel.com) پر جائیں اور **"Log in with GitHub"** دبائیں۔
2. **"Add New Project"** پر کلک کریں۔
3. اپنی `vendora` والی ریپوزٹری کے سامنے **"Import"** کا بٹن دبائیں۔
4. **Build and Output Settings** میں:
   - Framework Preset: **Vite** خودکار منتخب ہوگا۔
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. نیچے نیلا بٹن دبائیں: **"Deploy"**! 🚀

صرف **30 سے 40 سیکنڈ** کے اندر Vercel آپ کی پوری ایپ کو لائیو کر دے گا اور آپ کو ایک لائیو لنک مل جائے گا:
👉 `https://vendora-yourname.vercel.app`

اب آپ اس لنک کو اپنے موبائل، ٹیبلٹ یا کسی بھی کمپیوٹر پر کھول کر پورا اسٹور چلا سکتے ہیں!

---

## 💾 مرحلہ 3 (اختیاری مگر زبردست): مستقل کلاؤڈ ڈیٹا بیس (Turso Free SQLite)

کیونکہ Vercel سرور لیس ہے، اگر آپ چاہتے ہیں کہ آپ کا ڈیٹا زندگی بھر کلاؤڈ پر مستقل محفوظ رہے (چاہے 5 سال تک لیپ ٹاپ آن نہ بھی ہو):

1. [turso.tech](https://turso.tech) پر جائیں اور GitHub سے لاگ ان کریں۔ (کوئی کریڈٹ کارڈ نہیں چاہیے)
2. **"Create Database"** دبائیں (نام رکھیں: `vendora-db`)۔
3. آپ کو 2 چیزیں ملیں گی:
   - **Database URL:** (جیسے `libsql://vendora-db-username.turso.io`)
   - **Auth Token:** (ایک لمبا خفیہ کوڈ)
4. Vercel ڈیش بورڈ پر جائیں -> اپنے پروجیکٹ کی **Settings** -> **Environment Variables** میں جائیں اور یہ دو ویلیوز ڈال دیں:
   - `TURSO_DATABASE_URL` = (آپ کا ڈیٹا بیس یو آر ایل)
   - `TURSO_AUTH_TOKEN` = (آپ کا ٹوکن)
5. **Redeploy** دبائیں۔ اب آپ کا سارا ڈیٹا ہمیشہ کے لیے محفوظ اور لائیو ہو گیا!
