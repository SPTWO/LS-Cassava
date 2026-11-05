# LS Cassava: ລະບົບຕິດຕາມການດຳເນີນທຸລະກິດ ຜະລິດ-ສົ່ງອອກ ແປ້ງມັນຕົ້ນ

ເວັບໄຊ (GitHub Pages) + ຖານຂໍ້ມູນ Supabase. ທຸກຄົນຕ້ອງເຂົ້າລະບົບດ້ວຍ **ຊື່ຜູ້ໃຊ້ + ລະຫັດ** ທີ່ຜູ້ດູແລສ້າງໃຫ້ໃນ Supabase.

- **admin** (ຜູ້ດູແລ): ນຳເຂົ້າໄຟລ໌ Excel, ບັນທຶກເບີກ/ຊຳລະເງິນກູ້, ແກ້ອັດຕາແລກປ່ຽນ
- **viewer** (ຜູ້ເບິ່ງ): ເບິ່ງໄດ້ທຸກໜ້າ ແລະ ດຶງ Report, ແກ້ໄຂຫຍັງບໍ່ໄດ້

---

## ຕັ້ງຄ່າເທື່ອທຳອິດ (ເຮັດຄັ້ງດຽວ)

### 1. ສ້າງຕາຕະລາງໃນ Supabase
1. ເປີດ Supabase → ໂປຣເຈັກ → **SQL Editor** → **New query**
2. ກັອບປີ້ເນື້ອໃນໄຟລ໌ `supabase/schema.sql` ທັງໝົດ ວາງ ແລ້ວກົດ **Run**
3. ເຮັດຄືກັນກັບໄຟລ໌ `supabase/seed.sql` (ແຜນລະດູ 2026-27, ສັນຍາ, ເງິນກູ້, ຄ່າຕັ້ງ)

### 2. ປິດການສະໝັກເອງ
**Authentication → Sign In / Providers** (ຫຼື **Settings**) → ປິດ **Allow new users to sign up**.
ຫຼັງຈາກປິດແລ້ວ ຈະມີແຕ່ບັນຊີທີ່ຜູ້ດູແລສ້າງໃຫ້ເທົ່ານັ້ນ ທີ່ເຂົ້າລະບົບໄດ້.

### 3. ສ້າງຜູ້ໃຊ້ (ບໍ່ຕ້ອງໃຊ້ອີເມວແທ້)
**Authentication → Users → Add user → Create new user**
- Email: `ຊື່ຜູ້ໃຊ້@ls.local`, ຕົວຢ່າງ `somchai@ls.local`
- Password: ລະຫັດທີ່ຕ້ອງການ
- ໝາຍຖືກ **Auto Confirm User**

ຕອນເຂົ້າລະບົບ ໃຫ້ພິມສະເພາະ `somchai` ກັບລະຫັດ. ລະບົບຈະຕື່ມ `@ls.local` ໃຫ້ເອງ.
ບັນຊີໃໝ່ທຸກບັນຊີເປັນ **viewer** ກ່ອນ.

### 4. ກຳນົດຜູ້ດູແລ (admin)
**Table Editor → user_roles** → ແຖວຂອງຜູ້ໃຊ້ນັ້ນ → ປ່ຽນ `role` ຈາກ `viewer` ເປັນ `admin` → Save.

### 5. ເປີດເວັບໄຊ (GitHub Pages)
1. GitHub repo → **Settings → Pages** → Source: **GitHub Actions**
2. ທຸກຄັ້ງທີ່ push ເຂົ້າ `main` ເວັບຈະອັບເດດເອງ (ເບິ່ງສະຖານະໃນແຖບ **Actions**)
3. ລິ້ງເວັບ: `https://sptwo.github.io/LS-Cassava/`

> ຖ້າ repo ເປັນ **Private**, GitHub Pages ຕ້ອງໃຊ້ແພັກເກັດ GitHub Pro/Team.
> ຖ້າບໍ່ມີ ໃຫ້ຕັ້ງ repo ເປັນ **Public** ໄດ້: ໃນ code ບໍ່ມີຂໍ້ມູນທຸລະກິດ.
> ຂໍ້ມູນທັງໝົດຢູ່ໃນ Supabase ແລະ ເບິ່ງໄດ້ສະເພາະຄົນທີ່ login ແລ້ວ (Row Level Security).

### 6. ນຳເຂົ້າຂໍ້ມູນຄັ້ງທຳອິດ
ເຂົ້າລະບົບດ້ວຍບັນຊີ admin → ແຖບ **ນຳເຂົ້າ Excel** → ເລືອກໄຟລ໌ `04._Summary_Monthly_Report_...xlsx` → ກວດຜົນ → **ບັນທຶກ**.

---

## ການໃຊ້ງານປະຈຳອາທິດ
1. admin ເຂົ້າ **ນຳເຂົ້າ Excel** → ເລືອກໄຟລ໌ 04 ສະບັບລ່າສຸດ → **ບັນທຶກ**
   - ລະບົບຈະຮູ້ Sheet ເອງ (3.1/3.2 ເກັບຊື້, 4.1/4.2 ຜະລິດ, 5.1/5.2 ອອກສາງ, 2.1/2.2 ສົ່ງອອກ, 2.3 ສັນຍາ, Cost of SNK/MN)
   - ຂໍ້ມູນລະດູນີ້ຂອງ Sheet ທີ່ພົບ ຈະຖືກ **ແທນທີ່** ດ້ວຍໄຟລ໌ໃໝ່ (ບໍ່ຊ້ຳກັນ)
2. ຖ້າມີການເບີກ/ຊຳລະເງິນກູ້ → ແຖບ **ພັນທະໜີ້ສິນ** → ບັນທຶກລາຍການ
3. ຖ້າແຜນປ່ຽນ → ນຳເຂົ້າໄຟລ໌ Projection (Sheet `PL Projection (V2)`) ໄດ້ທີ່ໜ້າດຽວກັນ

## ເພີ່ມ / ລຶບ / ປ່ຽນລະຫັດ ຜູ້ໃຊ້
- ເພີ່ມ: ເຮັດຕາມຂໍ້ 3 (ແລະ ຂໍ້ 4 ຖ້າເປັນ admin)
- ປ່ຽນລະຫັດ: Authentication → Users → ເລືອກຜູ້ໃຊ້ → Reset/Update password
- ລຶບ: Authentication → Users → Delete user

## ຄວາມປອດໄພ
- `anon key` ໃນ `js/config.js` ເປັນ key ສາທາລະນະ ໃສ່ໃນ code ໄດ້
- **ຫ້າມ** ໃສ່ `service_role key` ຫຼື ລະຫັດຖານຂໍ້ມູນ ໃນ code ຫຼື ສົ່ງໃຫ້ໃຜ
- Supabase ແພັກເກັດຟຣີ ຈະຢຸດໂປຣເຈັກ ຖ້າບໍ່ມີການໃຊ້ງານ 7 ມື້.
  Workflow `keepalive.yml` ຈະເອີ້ນຖານຂໍ້ມູນທຸກ 3 ມື້ ເພື່ອບໍ່ໃຫ້ຢຸດ.

## ໂຄງສ້າງໄຟລ໌
```
index.html              ໜ້າເວັບ
js/config.js            ຄ່າເຊື່ອມຕໍ່ Supabase
js/app.js               ລະບົບທັງໝົດ (ອ່ານຂໍ້ມູນ, ນຳເຂົ້າ Excel, Report, ໜີ້ສິນ, login)
assets/                 ໂລໂກ້ ແລະ ຮູບ
supabase/schema.sql     ສ້າງຕາຕະລາງ + ສິດ (RLS)
supabase/seed.sql       ຂໍ້ມູນເລີ່ມຕົ້ນ (ແຜນ, ສັນຍາ, ເງິນກູ້)
.github/workflows/      deploy ເວັບ + keep-alive
```
