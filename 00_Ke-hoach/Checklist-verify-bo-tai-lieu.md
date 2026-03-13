---
title: "Checklist verify bộ tài liệu training Pano2VR"
slug: "checklist-verify-bo-tai-lieu"
version: "v1.0 – Pano2VR 7.1"
last_update: "2026-03-13"
---

# Checklist verify bộ tài liệu training Pano2VR

## 1. Mục đích

- File này dùng để kiểm tra chất lượng bộ tài liệu trước khi:
  - đưa vào training nội bộ,
  - bàn giao cho người dạy,
  - hoặc cập nhật theo version mới của Pano2VR.

Checklist này không chỉ kiểm tra nội dung chữ, mà còn kiểm tra:
- khả năng thực hành lại trong phần mềm,
- độ nhất quán giữa các file,
- và độ chính xác của link/video tham khảo.

## 2. Trạng thái verify đề xuất

Mỗi bài hoặc mỗi phần có thể gán một trạng thái:

| Trạng thái | Ý nghĩa |
|---|---|
| `Draft` | Mới viết xong, chưa review |
| `Reviewed` | Đã đọc soát nội dung |
| `Tested in Pano2VR` | Đã làm lại thao tác trong phần mềm |
| `Video refs checked` | Đã kiểm tra link video / timestamp |
| `Verified for training` | Đã sẵn sàng dùng để training |

## 3. Quy trình verify chuẩn

### Bước 1 – Desk review

Mục tiêu:
- kiểm tra nội dung chữ,
- cấu trúc bài,
- link tham khảo,
- và độ rõ ràng của hướng dẫn.

### Bước 2 – Hands-on review

Mục tiêu:
- mở Pano2VR,
- làm lại thao tác theo bài,
- xác nhận bài có thể dùng để thực hành thật.

### Bước 3 – Cross-file review

Mục tiêu:
- kiểm tra bài hiện tại có khớp với bài trước/sau không,
- tránh mâu thuẫn thuật ngữ hoặc quy trình.

### Bước 4 – Final verify

Mục tiêu:
- chốt trạng thái cuối,
- ghi lại note chỉnh sửa nếu cần,
- quyết định bài đã sẵn sàng cho training hay chưa.

## 4. Checklist verify cho từng file bài học

Sử dụng bảng dưới đây cho mỗi file `.md`:

| Hạng mục | Pass/Fail | Ghi chú |
|---|---|---|
| Tên file đúng quy ước |  |  |
| Frontmatter có `title`, `slug`, `version`, `last_update` |  |  |
| Cấu trúc bài đúng template chung |  |  |
| Mục tiêu bài học rõ và khớp nội dung |  |  |
| Thuật ngữ Anh/Việt dùng nhất quán |  |  |
| Tên panel/menu/nút đúng với Pano2VR 7.1 |  |  |
| Nội dung không lặp quá nhiều với bài khác |  |  |
| Tài liệu tham khảo còn truy cập được |  |  |
| Video tham khảo đúng bài, đúng chủ đề |  |  |
| Timestamp video đúng nội dung |  |  |
| Bài tập cuối bài phù hợp với nội dung bài |  |  |

## 5. Checklist verify thực hành trong Pano2VR

Áp dụng cho các bài có thao tác cụ thể như:
- workflow,
- hotspots,
- skin,
- export,
- map,
- patching.

| Hạng mục | Pass/Fail | Ghi chú |
|---|---|---|
| Làm lại được đúng các bước trong bài |  |  |
| Không có bước bị thiếu điều kiện tiên quyết |  |  |
| Không có bước gây hiểu nhầm hoặc phải đoán |  |  |
| Kết quả thực tế khớp mô tả trong bài |  |  |
| Screenshot/video tham khảo (nếu có) vẫn đúng logic hiện tại |  |  |
| Bài có thể dùng cho người mới mà không cần giải thích thêm quá nhiều |  |  |

## 6. Checklist verify theo workflow xuyên suốt

Đây là checklist quan trọng nhất để xác nhận bộ tài liệu hoạt động như một chuỗi hoàn chỉnh.

### 6.1. Chuẩn bị project mẫu

- Có một bộ ảnh panorama mẫu cố định.
- Có thư mục project sạch để test.
- Có output folder riêng cho verify.

### 6.2. Chạy lại workflow hoàn chỉnh

Tick từng bước:

- [ ] Tạo project mới
- [ ] Import pano / node
- [ ] Điền `Title` và `User Data`
- [ ] Đặt `Initial View`
- [ ] Kiểm tra `North Offset` nếu cần
- [ ] Patch cơ bản
- [ ] Tạo point hotspot
- [ ] Tạo polygon hotspot
- [ ] Link node đúng tuyến
- [ ] Tạo skin cơ bản
- [ ] Thêm title / logo / thumbnails
- [ ] Tạo popup hoặc panel đơn giản
- [ ] Tạo Web Output
- [ ] Preview bằng local server
- [ ] Kiểm tra tour chạy ổn trên browser

### 6.3. Điều kiện pass cho workflow

- Không bị kẹt bước nào nếu chỉ dựa vào tài liệu.
- Người verify không cần đoán logic thao tác chính.
- Output cuối mở được và dùng được.

## 7. Checklist verify tính nhất quán toàn bộ bộ tài liệu

| Hạng mục | Pass/Fail | Ghi chú |
|---|---|---|
| Tất cả file cùng version nền (`Pano2VR 7.1`) |  |  |
| Cách đặt tên file thống nhất |  |  |
| Cấu trúc heading giữa các bài đồng đều |  |  |
| Thuật ngữ `Skin`, `Hotspot`, `Node`, `FoV`, `Tour Browser` dùng nhất quán |  |  |
| Các bài nâng cao có tham chiếu lại bài nền tảng khi cần |  |  |
| Không có bài nào thiếu `Tài liệu tham khảo` |  |  |
| Không có bài nào thiếu `Video tham khảo` nếu đã có mapping video phù hợp |  |  |

## 8. Checklist verify link ngoài

| Hạng mục | Pass/Fail | Ghi chú |
|---|---|---|
| Link docs Ggnome mở được |  |  |
| Link YouTube / webinar mở được |  |  |
| Timestamp còn đúng nội dung |  |  |
| Không có video bị private / mất truy cập ngoài dự kiến |  |  |
| File mapping video tổng đã cập nhật đủ playlist hiện có |  |  |

## 9. Thứ tự ưu tiên verify cho bộ hiện tại

Đề xuất thứ tự:

1. `Phần 3 – Workflow cơ bản`
2. `Phần 4 – Hotspots`
3. `Phần 5 – Skin và Giao diện`
4. `Phần 6 – Export`
5. `Phần 1.3 – What's New`
6. `Phần 7 – Nâng cao`
7. `File mapping video tổng`

Lý do:
- Phần 3 đến 6 là trục xương sống của quy trình làm tour thật.
- Nếu các phần này ổn, các phần còn lại sẽ dễ kiểm tra hơn.

## 10. Mẫu log verify

Có thể copy mẫu này cho từng file hoặc từng vòng review:

```text
File:
Người verify:
Ngày:
Version Pano2VR test:

Desk review:
- Kết quả:
- Vấn đề phát hiện:

Hands-on review:
- Kết quả:
- Bước bị vướng:

Video refs:
- Link OK / Not OK:
- Timestamp OK / Not OK:

Kết luận:
- Draft / Reviewed / Tested in Pano2VR / Video refs checked / Verified for training

Ghi chú chỉnh sửa tiếp theo:
```

## 11. Khuyến nghị vận hành

- Mỗi khi thêm bài mới:
  - ít nhất phải qua `Desk review`.
- Mỗi khi chỉnh bài có thao tác:
  - phải qua `Hands-on review`.
- Mỗi khi thêm video/timestamp:
  - phải qua `Video refs checked`.
- Trước khi dùng để training chính thức:
  - toàn bộ các bài trọng tâm phải đạt `Verified for training`.

## 12. File liên quan nên dùng kèm

- `_template_bai-hoc.md`
- `Tham-khao-video-tu-2-playlist.md`
- toàn bộ các bài trong `03_Workflow-Co-ban`, `04_Hotspots`, `05_Skin-va-Giao-dien`, `06_Export`

## 13. Gợi ý bước tiếp theo

- Sau checklist tổng này, nên tạo thêm:
  - một file `Bang-theo-doi-trang-thai-verify.md`
  - hoặc một bảng progress theo từng file để team tick trực tiếp.
