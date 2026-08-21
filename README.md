# BibleLex — Tra cứu tiếng Hê-bơ-rơ & Hy-lạp, nghiên cứu Kinh Thánh

> Công cụ nghiên cứu Kinh Thánh nguyên ngữ (Hê-bơ-rơ Cựu Ước & Hy-lạp Tân Ước) với
> tra cứu số **Strong's**, **Interlinear Bible** (song ngữ nguyên ngữ – Việt/Anh),
> phân tích hình thái học (morphology) và tham chiếu chéo từ vựng.
>
> **Mã nguồn mở – Giấy phép MIT.**

---

## ✨ Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| **Tra cứu Strong's** | Nhập `G1234` (Hy-lạp) hoặc `H1254` (Hê-bơ-rơ) để xem định nghĩa gốc, phiên âm, cách dịch KJV, nguồn gốc từ nguyên. |
| **Interlinear Bible** | Cựu Ước hiển thị **Hebrew (WLC)**, Tân Ước hiển thị **Hy-lạp (SBLGNT)** — từng từ gắn số Strong's, phiên âm, parsing và nghĩa tiếng Anh. Hỗ trợ hiển thị RTL cho tiếng Hê-bơ-rơ. |
| **Nghiên cứu từ vựng** | Thống kê số lần xuất hiện, phân bố theo sách, dạng ngữ pháp (thì/thể/khí/trường hợp/số/người/giống), và mạng lưới tham chiếu chéo. |
| **Chủ đề & Cross-reference** | Liên kết đồng nghĩa / trái nghĩa / gốc từ / từ phái sinh được trích tự động từ trường etymology & derivation của Strong's. |
| **Tìm kiếm** | Tìm nhanh theo số Strong's, từ vựng, hoặc chủ đề. |

---

## 🗂️ Nguồn dữ liệu (Public Domain / CC-BY-SA)

Toàn bộ dữ liệu đều từ các nguồn **công cộng**, không vi phạm bản quyền:

| Dữ liệu | Nguồn | Giấy phép |
|---------|-------|-----------|
| Strong's Hebrew & Greek Dictionaries | [openscriptures/strongs](https://github.com/openscriptures/strongs) | CC-BY-SA |
| Hebrew Old Testament (WLC – Westminster Leningrad Codex) | [openscriptures/morphhb](https://github.com/openscriptures/morphhb) | Public Domain |
| Greek New Testament (SBLGNT + morphology) | [morphgnt/sblgnt](https://github.com/morphgnt/sblgnt) | CC-BY-SA (morphology) |

> **Ghi chú:** Bản dữ liệu mặc định đi kèm bao gồm **định nghĩa Strong's** và **cách dịch KJV**.
> Các trường mở rộng (Thayer's, BDB, LSJ, TDK) đã được định nghĩa sẵn trong schema
> (`StrongEntry.thayersDef`, `bdbDef`, `lsjDef`, `tdk`) và có thể bổ sung sau mà không
> cần thay đổi cấu trúc.

---

## 🚀 Cài đặt & chạy

### Yêu cầu
- Node.js ≥ 20.9
- npm (đi kèm với Node.js)

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Chuẩn bị dữ liệu (tải & chuyển đổi từ nguồn công cộng)
```bash
npm run prepare:data
```
Kết quả được lưu vào `data/`:
- `strongs.json` — từ điển Strong's (Hê-bơ-rơ + Hy-lạp)
- `hebrew.json` — Cựu Ước (WLC) với từng từ gắn Strong's & parsing
- `greek.json` — Tân Ước (SBLGNT) với từng từ gắn Strong's & parsing
- `morphology.json` — tổng hợp các dạng hình thái học

### 3. Tạo cơ sở dữ liệu & nhập dữ liệu
```bash
npm run db:generate      # sinh Prisma Client
npm run db:push          # tạo schema SQLite (và sinh client)
npm run import:data      # nhập dữ liệu vào SQLite
```

### 4. Chạy ứng dụng
```bash
npm run dev
```
Mở [http://localhost:3000](http://localhost:3000) (khi chạy local). Bản triển khai chính thức: https://biblelex.app

> **Môi trường bị hạn chế mạng:** nếu `npm run dev`/`start` bị crash với lỗi
> `os.networkInterfaces` / `getifaddrs` (errno 13), hãy chạy kèm tiền tố:
> `NODE_OPTIONS="--require ./scripts/patch-network.cjs" npm run dev`.
> File `scripts/patch-network.cjs` là mẹo vá phòng hờ, hoàn toàn không ảnh hưởng trên máy bình thường.

---

## 🧱 Công nghệ

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** + **Tailwind CSS v4**
- **Prisma** + **SQLite** (cơ sở dữ liệu nhẹ, không cần server)
- **next-themes** (sáng/tối), **lucide-react** (icon)

---

## 📁 Cấu trúc dự án

```
bible-study-app/
├── prisma/
│   └── schema.prisma          # Mô hình dữ liệu (StrongEntry, Verse, VerseWord, Morphology, ...)
├── scripts/
│   ├── prepare-data.mjs       # Tải & chuyển đổi dữ liệu công cộng → JSON
│   ├── import-data.ts         # Nhập JSON vào SQLite
│   └── patch-network.cjs      # (tùy chọn) vá os.networkInterfaces cho môi trường bị chặn getifaddrs
├── src/
│   ├── app/
│   │   ├── strongs/           # Tra cứu số Strong's
│   │   ├── interlinear/       # Kinh Thánh song ngữ nguyên ngữ
│   │   ├── word-study/        # Nghiên cứu từ vựng chuyên sâu
│   │   ├── topics/            # Chủ đề & tham chiếu chéo
│   │   └── search/            # Tìm kiếm
│   ├── components/            # UI components
│   └── lib/                   # Tiện ích & truy vấn DB
└── data/                      # Dữ liệu đã chuẩn bị (sinh ra bởi prepare-data)
```

---

## 🤝 Đóng góp

Đây là dự án mã nguồn mở. Mọi đóng góp — mã nguồn, dữ liệu, bản dịch, hay báo lỗi —
đều được chào đón. Hãy tạo Pull Request hoặc Issue trên kho lưu trữ.

## 📄 Giấy phép

Dự án phát hành dưới **Giấy phép MIT**. Xem file [LICENSE](./LICENSE).
