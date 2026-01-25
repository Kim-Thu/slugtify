# ⚡ Slugify Master

**Slugify Master** là một bộ công cụ mạnh mẽ giúp chuẩn hóa dữ liệu, bao gồm đổi tên tệp tin hàng loạt chuẩn SEO và dọn dẹp mã nguồn HTML chuyên nghiệp. Dự án được xây dựng với kiến trúc hiện đại, tuân thủ nguyên tắc SOLID và tối ưu hiệu suất tối đa.

---

## 🚀 Tính năng chính

### 1. Công cụ Rename (Slugify)
*   Đổi tên hàng loạt tệp tin và thư mục.
*   Tự động loại bỏ dấu tiếng Việt, chuyển thành chữ thường và xóa ký tự đặc biệt.
*   Hỗ trợ Naming Pattern: `{slug}` (tên gốc làm sạch) và `{n}` (đánh số thứ tự).
*   Chế độ Preview cực nhanh trước khi áp dụng thay đổi thật sự.

![Slugify Main Tool](assets/slugify_main.png)

### 2. HTML Cleaner (Dọn dẹp mã nguồn)
*   **Xử lý Tệp tin**: Quét và làm sạch mã rác trong hàng loạt file HTML/HTM.
*   **Dán Trực tiếp**: Chuyển đổi nội dung từ Word, Website (Rich Text) sang mã HTML chuẩn hóa.
*   **SEO Link Control**: Tự động gắn `target="_blank"` và `rel="nofollow"` cho các liên kết ngoại khối.
*   **Cấu hình linh hoạt**: Hơn 15 tùy chọn làm sạch (xóa scripts, styles, classes, empty tags, thay table bằng div...).

![HTML Cleaner File Mode](assets/html_cleaner_file.png)
![HTML Cleaner Paste Mode](assets/html_cleaner_paste.png)

---

## 🛠 Công nghệ sử dụng

*   **Backend**: Python, FastAPI, BeautifulSoup4 (Logic xử lý HTML).
*   **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons, Framer Motion.
*   **Editor**: React Quill, CodeMirror (Dành cho preview mã nguồn).
*   **Kiến trúc**: SOLID, Strategy Pattern, Client-Server Tách biệt.

---

## 📥 Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
*   Python 3.9+
*   Node.js 18+
*   NPM hoặc Yarn

### 2. Cài đặt Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Trên Windows dùng: .\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*Backend sẽ chạy tại: http://localhost:8000*

### 3. Cài đặt Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend sẽ chạy tại: http://localhost:3000*

---

## 📖 Hướng dẫn sử dụng

1.  **Chuyển đổi Ngôn ngữ**: Sử dụng nút gạt **VN/EN** trên Header để thay đổi giao diện.
2.  **Đổi tên File**:
    *   Chọn thư mục hoặc tệp tin nguồn.
    *   Nhập mẫu tên tại ô "Naming Pattern" (ví dụ: `san-pham-{n}`).
    *   Kiểm tra bảng Preview và nhấn "Áp dụng thay đổi".
3.  **Làm sạch HTML**:
    *   Dán nội dung vào ô bên trái hoặc chọn file HTML.
    *   Cấu hình các tùy chọn làm sạch ở bảng dưới cùng.
    *   Nhấn "Làm sạch" và copy kết quả mã nguồn đã được tối ưu.

---

## 🛡 Bảo mật & Tối ưu
*   Hệ thống ngăn chặn tấn công **Directory Traversal** bằng cơ chế kiểm tra đường dẫn an toàn.
*   Mã nguồn Frontend được tối ưu SEO với đầy đủ Metadata và Semantic HTML.
*   Sử dụng **Fast Refresh** và **Dynamic Imports** để tăng tốc độ phản hồi.

---

**Made with ❤️ by Kim Thu**
