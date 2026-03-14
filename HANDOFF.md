# Pano2VR Training UI – Handoff Document

## 🎯 Mục tiêu Project

Xây dựng website tĩnh (HTML/JS/CSS) để trình bày tài liệu training phần mềm Pano2VR (phần mềm tạo VR Tour).

**Tính năng chính:**
- Đọc nội dung từ file Markdown trong Git
- Khi cập nhật file .md trên Git → tự động đồng bộ nội dung trên web
- Giao diện đẹp, dễ sử dụng, responsive

---

## ✅ Những Component Đã Hoàn Thành (Trong Pencil)

### Layout Chính (pano2vr-training-ui.pen)
- **Header** (58px)
  - Menu button
  - Logo + branding (Pano2VR Training)
  - Search bar

- **Sidebar** (270px)
  - Navigation menu với phân cấp theo Phần
  - Phần 1 (Giới thiệu) – đã expand
    - 1.1 Giới thiệu Pano2VR (active)
    - 1.2 Cài đặt và khởi động
    - 1.3 Có gì mới (What's New)
  - Phần 2-5 (collapse) – sẵn sàng expand

- **Content Area**
  - Metadata bar (độ dài bài, yêu cầu, version)
  - Article card (nội dung bài học chính)
  - Bottom navigation (Bài trước / Bài tiếp theo)

- **Color Scheme**
  - Header: #1a3a5c (navy xanh)
  - Sidebar: #1e2a38 (đen-xanh)
  - Content: #f5f7fa (xám nhạt)
  - Accent: #4fc3f7 (cyan)

---

## 🚧 Đang Làm Dở / TODO

### Design (Pencil)
- [ ] Hoàn thiện screenshot của design hiện tại
- [ ] Tạo variants khác (dark mode nếu cần)
- [ ] Fine-tune spacing, typography
- [ ] Thêm animated icons khi expand/collapse sections

### Development (HTML/JS/CSS)
- [ ] Chuyển design Pencil → HTML/CSS
- [ ] Xây dựng JavaScript để:
  - Đọc file Markdown từ Git (fetch API)
  - Parse Markdown → HTML
  - Render dynamic sidebar menu từ dữ liệu
  - Handle navigation giữa các bài
  - Implement search functionality
- [ ] Responsive design cho mobile/tablet
- [ ] Error handling & loading states

### Git Integration
- [ ] Auto-refresh content khi file .md thay đổi (webhook hoặc polling)
- [ ] Cache strategy
- [ ] Fallback khi không có kết nối

---

## 📁 File Structure Hiện Tại

```
Pano2VR/
├── .claude/                              # Claude Code settings
├── 00_Ke-hoach/                          # Planning docs
│   ├── Bang-theo-doi-trang-thai-verify.md
│   ├── Checklist-verify-bo-tai-lieu.md
│   ├── Tham-khao-video-tu-2-playlist.md
│   └── _template_bai-hoc.md
├── 01_Gioi-thieu/                        # Phần 1
│   ├── 1.1_Gioi-thieu-Pano2VR.md
│   ├── 1.2_Cai-dat-va-khoi-dong.md
│   └── 1.3_Co-gi-moi-Whats-New.md
├── 02_Workspace/                         # Phần 2 (9 bài)
├── 03_Workflow-Co-ban/                   # Phần 3 (9 bài)
├── 04_Hotspots/                          # Phần 4 (5 bài)
├── 05_Skin-va-Giao-dien/                # Phần 5 (5 bài)
├── 06_Export/                           # Phần 6 (7 bài)
├── 07_Nang-cao/                         # Phần 7 (12 bài)
├── pano2vr-training-ui.pen              # Design file (Pencil)
├── HANDOFF.md                           # Tài liệu này
└── index.html                           # (TBD) Main web page
```

**Tổng cộng:** 54 file Markdown (50+ bài học)

---

## 🎨 Design Decisions Quan Trọng

### 1. **Layout Pattern: Sidebar + Content**
- Sidebar cố định (270px) - để người dùng không mất ngữ cảnh menu
- Content area scroll độc lập → bài học không bị ẩn bởi intro
- Bottom navigation → dễ dàng đi qua các bài

### 2. **Color Palette**
| Màu | Hex | Dùng cho | Lý do |
|------|-----|----------|-------|
| Navy | #1a3a5c | Header | Professional, calm |
| Dark Navy | #1e2a38 | Sidebar | Contrast với content |
| Cyan | #4fc3f7 | Accent/Active | Eye-catching, tech-forward |
| Light Gray | #f5f7fa | Background | Comfortable to read |
| White | #ffffff | Card background | Clean separation |

### 3. **Typography**
- Font: Inter (default sans-serif)
- Heading (H1): 22px, bold, #1a3a5c
- Heading (H2): 15px, bold, #1a3a5c
- Body: 14px, regular, #333333, line-height 1.7
- Meta text: 11-12px, gray

### 4. **Navigation Behavior**
- **Expand/Collapse**: Mỗi Phần có thể mở/đóng
- **Active state**: Left border 3px cyan + light background
- **Hover state**: Slight background change

### 5. **Content Protection**
- Metadata bar (dài bài, yêu cầu, version) → giúp context
- Note boxes (#f0f8ff) → highlighted warnings/tips
- Article card (border, padding) → visual separation

---

## 🔧 Next Steps

1. **Validate design** → Take screenshot in Pencil
2. **Code structure** → index.html + main.js + styles.css
3. **Fetch markdown** → Build parser (showdown.js hoặc remark)
4. **Dynamic menu** → Generate sidebar từ folder structure
5. **Navigation** → Link các bài, track progress
6. **Polish** → Responsive, error states, animations

---

**Created:** 2026-03-14
**Status:** Design phase (Pencil) → Development phase (soon)
