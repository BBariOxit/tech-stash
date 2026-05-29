# Hướng Dẫn Cấu Hình Cơ Sở Dữ Liệu Supabase

Tài liệu này hướng dẫn bạn cách áp dụng các tệp tin SQL để khởi tạo cấu trúc bảng (schema) và dữ liệu mẫu (seed) trên Supabase cho dự án **Tech Stash**.

---

## 📁 Danh sách tệp tin SQL
1. **`schema.sql`**: Chứa toàn bộ câu lệnh khởi tạo bảng, thiết lập khóa ngoại, các giá trị mặc định, và cấu hình Row Level Security (RLS) cùng các chính sách bảo mật (Policies) tương ứng.
2. **`seed.sql`**: Chứa dữ liệu mẫu phong phú bao gồm các bài viết, ngôn ngữ lập trình, thẻ bài viết (tags), khung ảnh đại diện (avatar frames), biên giới cấp độ (level borders), các tài khoản mẫu, cùng các bình luận và lượt thích để bạn kiểm thử.

---

## 🛠️ Các cách áp dụng (Deploy)

### Cách 1: Sử dụng Supabase Dashboard (Khuyên dùng - Nhanh nhất)
1. Truy cập vào **[Supabase Dashboard](https://supabase.com/dashboard)** và chọn dự án của bạn.
2. Từ thanh menu bên trái, chọn biểu tượng **SQL Editor**.
3. Bấm **New query** để mở một trình soạn thảo truy vấn mới.
4. Mở tệp tin `schema.sql`, sao chép toàn bộ nội dung của nó và dán vào SQL Editor trên Supabase, sau đó nhấn nút **Run** ở góc dưới cùng bên phải.
5. Tạo tiếp một truy vấn mới (**New query**), sao chép toàn bộ nội dung của tệp `seed.sql`, dán vào và nhấn **Run** để nạp dữ liệu mẫu vào cơ sở dữ liệu của bạn.

---

### Cách 2: Sử dụng Supabase CLI (Dành cho môi trường Local Development)
Nếu bạn đang chạy Supabase cục bộ thông qua Docker và sử dụng CLI, hãy thực hiện các bước sau:

1. Đặt các tệp tin migrations hoặc schema vào thư mục thích hợp hoặc chạy trực tiếp bằng lệnh `supabase db execute`:
   ```bash
   # Chạy schema để tạo cấu trúc bảng
   supabase db execute --file supabase/schema.sql

   # Chạy seed để nạp dữ liệu mẫu
   supabase db execute --file supabase/seed.sql
   ```

2. Hoặc bạn cũng có thể đưa `schema.sql` vào thư mục `supabase/migrations/` và đổi tên thành một migration hợp lệ (ví dụ: `20260529000000_init.sql`), sau đó đưa dữ liệu trong `seed.sql` vào `supabase/seed.sql` mặc định của Supabase CLI để chạy tự động mỗi khi reset cơ sở dữ liệu:
   ```bash
   supabase db reset
   ```

---

## 🔒 Row Level Security (RLS) & Bảo Mật
Dự án đã được bật sẵn **Row Level Security (RLS)** trên tất cả 11 bảng để bảo vệ an toàn thông tin:
* Các bài viết (`posts`), snippets (`snippets`), và bình luận (`comments`) được công khai cho tất cả mọi người đọc (`SELECT`).
* Việc thêm, sửa, xóa dữ liệu yêu cầu xác thực người dùng dựa trên token và quyền hạn (`auth.uid() = author_id`).
* Hãy cấu hình Supabase Auth chính xác để đồng bộ hóa hồ sơ người dùng thông qua hàm đồng bộ `syncProfileFromAuth` được viết sẵn trong dự án của bạn!
