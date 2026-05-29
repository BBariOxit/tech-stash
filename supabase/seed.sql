-- ==========================================
-- TECH-STASH SUPABASE SEED DATA SCRIPT
-- Description: Inserts sample data for all tables
-- ==========================================

-- Disable triggers temporarily during seed (Supabase standard)
SET session_replication_role = 'replica';

-- Clear existing data (in case there's any)
TRUNCATE public.comment_likes, public.comments, public.snippet_tags, public.snippets, public.post_tags, public.posts, public.tags, public.languages, public.profiles, public.level_borders, public.avatar_frames RESTART IDENTITY;

-- 1. Insert avatar_frames
INSERT INTO public.avatar_frames (id, name, css_class, is_premium, required_level) VALUES
('e9c614ff-2e65-4286-90fd-16625890c29f', 'Default Frame', 'frame-default', false, 0),
('a7a972c7-080f-48d6-95ff-5e263d91eb68', 'Bronze Warrior', 'frame-bronze', false, 5),
('38ddf01b-c6b7-4c4f-9e79-05a8cc1b3fd7', 'Silver Mage', 'frame-silver', false, 10),
('a8cb9293-1fdc-4a37-9be7-e5df4e2808c1', 'Gold Dragon', 'frame-gold', true, 15),
('ff3e1981-b286-4e56-b072-f5f419b4f2c8', 'Diamond Legend', 'frame-diamond', true, 20);

-- 2. Insert level_borders
INSERT INTO public.level_borders (id, name, css_class, image_url, min_level) VALUES
('4f74d0fe-c725-4c07-ae7c-2b28cf9b3f36', 'Newbie', 'border-newbie', NULL, 1),
('1a4fa8b2-5714-4ca8-98e3-4de0de423c14', 'Apprentice', 'border-apprentice', NULL, 5),
('6e9b422a-f88d-4cb0-a292-0b29ffbe772b', 'Expert', 'border-expert', NULL, 10),
('4e37dd2b-232f-48e0-a7d0-128b98dc8a84', 'Master', 'border-master', NULL, 20),
('54a613f1-d7f4-42b7-a36c-2f22e86be0b1', 'Grandmaster', 'border-grandmaster', NULL, 30);

-- 3. Insert profiles (Author Thai Bao as admin, and some other demo profiles)
INSERT INTO public.profiles (id, full_name, avatar_url, github_url, role, bio, level, coin, current_frame_id) VALUES
('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'Thai Bao', 'https://github.com/BBariOxit.png', 'https://github.com/BBariOxit', 'admin', 'Mình là một Full-stack Developer. Đây là nơi mình lưu trữ các bài viết, code snippets, và những thứ học được từ thực chiến — không có gì giả tạo, chỉ có code thật và vấn đề thật.', 10, 500, '38ddf01b-c6b7-4c4f-9e79-05a8cc1b3fd7'),
('11111111-1111-1111-1111-111111111111', 'Lập Trình Viên Ẩn Danh', 'https://api.dicebear.com/7.x/bottts/svg?seed=ninja', NULL, 'user', 'Chỉ là một chú coder đam mê gõ phím dạo kiếm cơm.', 2, 50, 'e9c614ff-2e65-4286-90fd-16625890c29f'),
('22222222-2222-2222-2222-222222222222', 'Nguyễn Văn A', 'https://api.dicebear.com/7.x/adventurer/svg?seed=anv', NULL, 'user', 'Junior React Developer học hỏi cái mới mỗi ngày.', 5, 120, 'a7a972c7-080f-48d6-95ff-5e263d91eb68');

-- 4. Insert languages
INSERT INTO public.languages (id, name, slug) VALUES
('4b5b7e28-3e4b-4bda-91bb-bc98ab0be9e9', 'TypeScript', 'typescript'),
('4a480a82-f38b-4a55-8ee6-5775f0a2fb47', 'JavaScript', 'javascript'),
('5a557c66-9b57-41fe-8b1e-cc7dfba8d387', 'HTML', 'html'),
('d6006f15-84ab-4b24-9b2f-47cf33dbcb5b', 'CSS', 'css'),
('cc0c0ea9-75ab-4c28-be9c-7ab0e2b96cc6', 'SQL', 'sql'),
('7cb9cbbf-1b8f-4ba6-8600-4b8cb6e2dfeb', 'Docker', 'docker');

-- 5. Insert tags
INSERT INTO public.tags (id, name, slug) VALUES
('fa8436ee-ec48-4cb5-ae01-44fa12ea4cde', 'DevOps', 'devops'),
('9790be4b-70c8-47bc-bbbb-f260bc4b8408', 'VPS', 'vps'),
('cfdb87f5-207d-4cb0-bf5d-be224f8d55ff', 'Rant', 'rant'),
('c8ee8ef4-6b80-4823-93cf-6bdfba6b0e8b', 'Next.js', 'nextjs'),
('77e7422f-d78c-4a1e-84b2-29ee4bbcc51d', 'React', 'react'),
('1bdfba2f-f446-4cb6-bb21-1bdf7fbe8b55', 'Supabase', 'supabase'),
('7cf02fb6-8800-4b6a-9bb7-bc4e8e192ff1', 'Security', 'security'),
('7990ff52-47fc-4e6a-9f5b-6fbeab84be99', 'Tailwind', 'tailwind'),
('b0bc293d-dceb-47e1-a083-d5d1cbe5be89', 'CSS', 'css'),
('2231ffba-4bba-4e00-84a1-bdfc98af0be9', 'TypeScript', 'typescript'),
('4e28cdba-cbba-4aa7-bdf2-cc98abda0be9', 'Docker', 'docker'),
('8ba4fa8b-5714-4ca8-98e3-4de0de423c14', 'DSA', 'dsa');

-- 6. Insert posts (7 posts: 6 dummy posts + 1 DSA post)
INSERT INTO public.posts (id, title, excerpt, content, slug, thumbnail, reading_time, featured, published, language, author_id, language_id, created_at) VALUES
(
    '0a84fcff-1f5b-4c4f-9e79-bc20db91cfb5',
    'Hành trình cấu xé với VPS Oracle và cái kết',
    'Tưởng free là ngon, ai ngờ Oracle nó terminate instance không báo trước. Đây là toàn bộ drama và cách mình recover lại production.',
    '<h2>Tưởng Free Mà Ngon À? Không Dễ Đâu!</h2><p>Lúc đầu nghe anh em đồn Oracle cho Always Free VPS cấu hình ARM 4 cores, 24GB RAM, mình nghĩ: "Quá ngon, chuyển hết mấy cái side project qua đây chạy cho tiết kiệm". Y như rằng, đăng ký thành công là mình migrate ngay con web Next.js + Postgres sang.</p><p>Chạy mượt mà được tầm 2 tháng, tự nhiên một ngày đẹp trời, app sập. Vào check Oracle Cloud thì thấy báo lỗi "Instance terminated". Không một email cảnh báo. Không một lời giải thích. Data đi tong, config bay màu. Cảm giác lúc đó kiểu: <strong>WTF Oracle?!</strong></p><h3>Bài Học Rút Ra</h3><ul><li><strong>Không bao giờ tin tưởng hoàn toàn vào đồ free:</strong> Bất cứ dịch vụ nào Always Free cũng có rủi ro bị khóa tài khoản hoặc thu hồi tài nguyên mà không cần lý do.</li><li><strong>Backup là sinh mệnh:</strong> Nếu hôm trước đó mình không cấu hình cronjob backup database đẩy lên S3 thì giờ chắc khóc thét rồi.</li><li><strong>Học cách viết Infrastructure as Code (IaC):</strong> Nhờ có Ansible playbook viết sẵn, mình chỉ mất 2 tiếng để deploy lại toàn bộ stack lên một con VPS mới mua bên Hetzner.</li></ul><p>Nói chung là đồ free có cái giá của nó. Nếu project có user thật và data quan trọng, hãy bỏ ra vài đô một tháng mua VPS đàng hoàng mà xài. Oracle Cloud có thể để test, nhưng production thì <em>say no</em>!</p>',
    'hanh-trinh-cau-xe-vps-oracle',
    '/thumbnails/oracle-vps.jpg',
    8,
    true,
    true,
    'Vietnamese',
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    '4a480a82-f38b-4a55-8ee6-5775f0a2fb47',
    '2025-04-18 10:00:00+07'
),
(
    '0a84fcff-1f5b-4c4f-9e79-bc20db91cfb6',
    'Next.js App Router: Data Fetching patterns mày nên biết',
    'Server Components, Suspense, parallel fetching — breakdown chi tiết cách xài đúng để không bị re-render điên loạn.',
    '<h2>Đừng Dùng useEffect Nữa!</h2><p>Với Next.js App Router (từ v13 trở đi), cách chúng ta fetch data đã thay đổi hoàn toàn so với thời Pages Router. Nếu bạn vẫn đang dùng <code>useEffect</code> để gọi API trong React component, bạn đang tự làm chậm ứng dụng của mình.</p><h3>1. Server Components vs Client Components</h3><p>Mặc định, mọi component trong App Router đều là Server Component. Điều này có nghĩa là bạn có thể biến component thành <code>async function</code> và fetch data trực tiếp bên trong nó!</p><pre><code>// app/page.tsx\nexport default async function Page() {\n  const data = await fetch(''https://api.example.com/...'').then(r => r.json());\n  return &lt;div&gt;{data.title}&lt;/div&gt;;\n}</code></pre><h3>2. Streaming và Suspense</h3><p>Thay vì bắt người dùng chờ toàn bộ trang load xong mới hiển thị (Waterfall), hãy dùng <code>Suspense</code> để bọc các component lấy dữ liệu chậm. UI sẽ render ngay lập tức với một fallback (ví dụ như skeleton loading), sau đó nội dung thật sẽ được stream xuống sau.</p><h3>3. Parallel Fetching</h3><p>Nếu trang của bạn cần gọi nhiều API không phụ thuộc vào nhau, đừng dùng <code>await</code> cho từng cái một. Hãy dùng <code>Promise.all</code> để fetch song song!</p><p>App Router mang lại trải nghiệm DX cực tốt nhưng đòi hỏi mindset khác biệt. Hãy làm quen với việc đẩy logic fetch data lên server nhiều nhất có thể nhé.</p>',
    'nextjs-app-router-data-fetching',
    '/thumbnails/nextjs-data.jpg',
    6,
    false,
    true,
    'Vietnamese',
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    '4b5b7e28-3e4b-4bda-91bb-bc98ab0be9e9',
    '2025-04-10 10:00:00+07'
),
(
    '0a84fcff-1f5b-4c4f-9e79-bc20db91cfb7',
    'Cấu hình Supabase RLS đúng cách để không bị lộ data',
    'Row Level Security là thứ mà 90% dev bỏ qua khi mới dùng Supabase. Đây là cách setup đúng từ đầu.',
    '<h2>RLS Là Gì Mà Phải Cài?</h2><p>Row Level Security (RLS) của PostgreSQL (và Supabase) cho phép bạn giới hạn ai được quyền đọc/ghi dữ liệu ở cấp độ <strong>từng dòng</strong> trong bảng. Rất nhiều bạn khi mới dùng Supabase lấy key <code>anon</code> public ra frontend mà quên bật RLS, dẫn đến ai cũng có thể query hoặc xóa sạch database của bạn bằng vài dòng code JS.</p><h3>Các Bước Cấu Hình Chuẩn</h3><ol><li><strong>Enable RLS trên mọi bảng:</strong> Bấm vào table trong dashboard Supabase, góc phải trên cùng luôn có nút Enable RLS. Bật ngay và luôn.</li><li><strong>Viết Policy cho Read (SELECT):</strong> Nếu bảng chứa dữ liệu public (như bài viết blog), bạn viết một policy cho phép <code>SELECT</code> với tất cả mọi người (<code>true</code>). Nếu bảng chứa thông tin cá nhân (như profile), policy phải là <code>auth.uid() = user_id</code>.</li><li><strong>Viết Policy cho Write (INSERT/UPDATE/DELETE):</strong> Tương tự, chỉ cho phép user tự sửa dữ liệu của chính họ.</li></ol><h3>Đừng Tin Tưởng Frontend!</h3><p>Quy tắc bất thành văn trong bảo mật: <em>Luôn kiểm tra quyền truy cập ở phía backend/database</em>. Việc ẩn nút "Delete" trên UI không ngăn được một người rành tech dùng cURL hoặc console để gửi request. RLS là chốt chặn cuối cùng bảo vệ dữ liệu của bạn.</p>',
    'supabase-rls-setup',
    '/thumbnails/supabase-rls.jpg',
    5,
    false,
    true,
    'Vietnamese',
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    'cc0c0ea9-75ab-4c28-be9c-7ab0e2b96cc6',
    '2025-04-02 10:00:00+07'
),
(
    '0a84fcff-1f5b-4c4f-9e79-bc20db91cfb8',
    'Migration từ Tailwind v3 sang v4: Cái gì thay đổi?',
    'CSS-first config, @theme directive, không còn tailwind.config.ts — đây là những điểm mày cần chú ý khi nâng cấp.',
    '<h2>Tạm Biệt tailwind.config.js</h2><p>Tailwind CSS v4 là một bản cập nhật lớn, đánh dấu sự chuyển đổi từ cấu hình bằng JavaScript sang cấu hình bằng CSS (CSS-first config). Điều này giúp việc tích hợp trở nên cực kỳ đơn giản.</p><h3>1. Cấu Hình Bằng @theme</h3><p>Bây giờ, mọi cấu hình màu sắc, font, spacing... đều được khai báo trực tiếp trong file CSS chính của bạn thông qua directive <code>@theme</code>.</p><pre><code>@import "tailwindcss";\n\n@theme {\n  --color-brand: #3b82f6;\n  --font-heading: "Inter", sans-serif;\n}</code></pre><h3>2. Tốc Độ Compile Nhanh Hơn</h3><p>Với engine mới được viết lại một phần bằng Rust (Lightning CSS), Tailwind v4 compile cực nhanh, cảm giác gần như tức thời khi bạn save file. Không còn độ trễ khó chịu khi dev nữa.</p><h3>Lưu Ý Khi Nâng Cấp</h3><p>Dù có công cụ tự động migration, bạn vẫn nên kiểm tra lại các plugin cũ hoặc cấu hình phức tạp (như custom variants), vì một số cách viết cũ đã bị loại bỏ hoặc thay thế.</p>',
    'tailwind-v4-migration',
    '/thumbnails/tailwind-v4.jpg',
    4,
    false,
    true,
    'Vietnamese',
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    'd6006f15-84ab-4b24-9b2f-47cf33dbcb5b',
    '2025-03-25 10:00:00+07'
),
(
    '0a84fcff-1f5b-4c4f-9e79-bc20db91cfb9',
    '5 TypeScript tips giúp code sạch hơn mà ít người biết',
    'satisfies operator, template literal types, infer keyword — mấy cái này mình dùng hàng ngày mà ít thấy ai nhắc tới.',
    '<h2>Viết TypeScript Đừng Như Viết AnyScript</h2><p>Nếu bạn chỉ dùng interface và string/number cơ bản, bạn mới sử dụng được 20% sức mạnh của TypeScript. Dưới đây là những tính năng nâng cao giúp type-checking chặt chẽ hơn.</p><h3>1. satisfies Operator</h3><p>Thay vì dùng type annotation (<code>const config: Config = {...}</code>) khiến type inference bị thu hẹp, hãy dùng <code>satisfies</code>. Nó kiểm tra object có đúng cấu trúc không, nhưng vẫn giữ nguyên kiểu hẹp nhất có thể của từng thuộc tính.</p><h3>2. Template Literal Types</h3><p>Bạn có thể tạo ra các kiểu dữ liệu từ chuỗi nội suy. Ví dụ: <code>type Event = \`on\${Capitalize&lt;Action&gt;}\`</code>. Rất tiện để gõ chặt các hàm xử lý sự kiện hoặc định tuyến.</p><h3>3. Utility Types Mở Rộng</h3><p>Thay vì tự viết lại, hãy tận dụng <code>Record</code>, <code>Pick</code>, <code>Omit</code>, và <code>Extract</code>. Kết hợp chúng với <code>infer</code> trong Conditional Types, bạn có thể giải nén type từ bất kỳ Promise hay Array phức tạp nào.</p>',
    'typescript-tips-2025',
    '/thumbnails/typescript-tips.jpg',
    7,
    false,
    true,
    'Vietnamese',
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    '4b5b7e28-3e4b-4bda-91bb-bc98ab0be9e9',
    '2025-03-15 10:00:00+07'
),
(
    '0a84fcff-1f5b-4c4f-9e79-bc20db91cfba',
    'Docker Compose setup cho local dev environment chuẩn không cần chỉnh',
    'Môi trường dev của mình: Next.js + Postgres + Redis + Mailhog, tất cả trong một docker-compose.yml.',
    '<h2>Ngừng Việc Cài Cắm Trực Tiếp Lên Máy Tính!</h2><p>Mình từng có thói quen cài Node, Postgres, Redis... trực tiếp lên máy. Hậu quả là sau vài tháng, máy rác và xung đột version liên miên (dự án này cần Node 14, dự án kia Node 20). Docker Compose là vị cứu tinh.</p><h3>File docker-compose.yml Chân Ái</h3><p>Chỉ với một file, bạn khai báo tất cả dịch vụ cần thiết. Mọi người trong team chỉ cần pull code về và chạy <code>docker-compose up -d</code> là có ngay một môi trường y hệt nhau, không còn câu "Works on my machine" nữa.</p><h3>Các Dịch Vụ Cần Có</h3><ul><li><strong>App:</strong> Chạy code chính (mount volume để hot-reload).</li><li><strong>Database:</strong> Postgres/MySQL (nhớ map port và dùng volume để không mất data khi tắt container).</li><li><strong>Cache:</strong> Redis (nếu dự án cần).</li><li><strong>Email:</strong> Mailhog (bắt email gửi đi lúc test, không bị spam ra ngoài).</li></ul><p>Setup ban đầu hơi mất thời gian, nhưng tin mình đi, nó sẽ tiết kiệm cho bạn hàng trăm giờ debug lỗi môi trường sau này!</p>',
    'docker-compose-dev-setup',
    '/thumbnails/docker-compose.jpg',
    5,
    false,
    true,
    'Vietnamese',
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    '7cb9cbbf-1b8f-4ba6-8600-4b8cb6e2dfeb',
    '2025-03-05 10:00:00+07'
),
(
    '0a84fcff-1f5b-4c4f-9e79-bc20db91cfbb',
    'Giải ngố thuật toán Đệ Quy (Recursion) cho anh em gà mờ',
    'Tất tần tật về đệ quy: Base case, Call Stack, và tại sao nó lại gây tràn bộ nhớ Stack Overflow nếu làm sai.',
    '<h2>Đệ quy là gì?</h2><p>Đệ quy đơn giản là một hàm tự gọi lại chính nó. Nghe thì có vẻ vô tận nhưng thực ra nó có điểm dừng.</p><h3>Công thức của Đệ Quy</h3><p>Mỗi hàm đệ quy luôn có 2 phần chính:</p><ul><li><strong>Base case (Trường hợp cơ sở):</strong> Điều kiện dừng để thoát khỏi vòng lặp vô tận.</li><li><strong>Recursive case (Trường hợp đệ quy):</strong> Nơi hàm tự gọi lại chính nó với dữ liệu nhỏ hơn.</li></ul><pre><code>function factorial(n) {\n  if (n <= 1) return 1; // Base case\n  return n * factorial(n - 1); // Recursive case\n}</code></pre><h3>Hậu quả của Stack Overflow</h3><p>Nếu bạn quên viết base case hoặc điều kiện dừng không bao giờ đạt được, Call Stack của trình duyệt/Node.js sẽ bị quá tải, dẫn đến lỗi Stack Overflow nổi tiếng.</p>',
    'giai-ngo-de-quy',
    '/thumbnails/recursion.jpg',
    5,
    false,
    true,
    'Vietnamese',
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    '4b5b7e28-3e4b-4bda-91bb-bc98ab0be9e9',
    '2025-05-10 10:00:00+07'
);

-- 7. Insert post_tags
INSERT INTO public.post_tags (post_id, tag_id) VALUES
-- Oracle VPS: DevOps, VPS, Rant
('0a84fcff-1f5b-4c4f-9e79-bc20db91cfb5', 'fa8436ee-ec48-4cb5-ae01-44fa12ea4cde'),
('0a84fcff-1f5b-4c4f-9e79-bc20db91cfb5', '9790be4b-70c8-47bc-bbbb-f260bc4b8408'),
('0a84fcff-1f5b-4c4f-9e79-bc20db91cfb5', 'cfdb87f5-207d-4cb0-bf5d-be224f8d55ff'),
-- Next.js Data Fetching: Next.js, React
('0a84fcff-1f5b-4c4f-9e79-bc20db91cfb6', 'c8ee8ef4-6b80-4823-93cf-6bdfba6b0e8b'),
('0a84fcff-1f5b-4c4f-9e79-bc20db91cfb6', '77e7422f-d78c-4a1e-84b2-29ee4bbcc51d'),
-- Supabase RLS: Supabase, Security
('0a84fcff-1f5b-4c4f-9e79-bc20db91cfb7', '1bdfba2f-f446-4cb6-bb21-1bdf7fbe8b55'),
('0a84fcff-1f5b-4c4f-9e79-bc20db91cfb7', '7cf02fb6-8800-4b6a-9bb7-bc4e8e192ff1'),
-- Tailwind v4: Tailwind, CSS
('0a84fcff-1f5b-4c4f-9e79-bc20db91cfb8', '7990ff52-47fc-4e6a-9f5b-6fbeab84be99'),
('0a84fcff-1f5b-4c4f-9e79-bc20db91cfb8', 'b0bc293d-dceb-47e1-a083-d5d1cbe5be89'),
-- TypeScript tips: TypeScript
('0a84fcff-1f5b-4c4f-9e79-bc20db91cfb9', '2231ffba-4bba-4e00-84a1-bdfc98af0be9'),
-- Docker Compose: Docker, DevOps
('0a84fcff-1f5b-4c4f-9e79-bc20db91cfba', '4e28cdba-cbba-4aa7-bdf2-cc98abda0be9'),
('0a84fcff-1f5b-4c4f-9e79-bc20db91cfba', 'fa8436ee-ec48-4cb5-ae01-44fa12ea4cde'),
-- Recursion: DSA, TypeScript
('0a84fcff-1f5b-4c4f-9e79-bc20db91cfbb', '8ba4fa8b-5714-4ca8-98e3-4de0de423c14'),
('0a84fcff-1f5b-4c4f-9e79-bc20db91cfbb', '2231ffba-4bba-4e00-84a1-bdfc98af0be9');

-- 8. Insert snippets (3 snippets)
INSERT INTO public.snippets (id, title, description, code, language, slug, filename, published, author_id, language_id, created_at) VALUES
(
    '1a84fcff-1f5b-4c4f-9e79-bc20db91cf01',
    'useLocalStorage Hook',
    'A React state hook that persists the state in localStorage.',
    'import { useState, useEffect } from "react";\n\nexport function useLocalStorage<T>(key: string, initialValue: T) {\n  const [storedValue, setStoredValue] = useState<T>(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch (error) {\n      console.log(error);\n      return initialValue;\n    }\n  });\n\n  const setValue = (value: T | ((val: T) => T)) => {\n    try {\n      const valueToStore = value instanceof Function ? value(storedValue) : value;\n      setStoredValue(valueToStore);\n      window.localStorage.setItem(key, JSON.stringify(valueToStore));\n    } catch (error) {\n      console.log(error);\n    }\n  };\n\n  return [storedValue, setValue] as const;\n}',
    'TypeScript',
    'use-local-storage-hook',
    'useLocalStorage.ts',
    true,
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    '4b5b7e28-3e4b-4bda-91bb-bc98ab0be9e9',
    '2025-05-15 12:00:00+07'
),
(
    '1a84fcff-1f5b-4c4f-9e79-bc20db91cf02',
    'Debounce utility',
    'Creates a debounced function that delays invoking func until after wait milliseconds have elapsed since the last time the debounced function was invoked.',
    'export function debounce(func, wait) {\n  let timeout;\n  return function executedFunction(...args) {\n    const later = () => {\n      clearTimeout(timeout);\n      func(...args);\n    };\n    clearTimeout(timeout);\n    timeout = setTimeout(later, wait);\n  };\n}',
    'JavaScript',
    'debounce-utility',
    'debounce.js',
    true,
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    '4a480a82-f38b-4a55-8ee6-5775f0a2fb47',
    '2025-05-14 12:00:00+07'
),
(
    '1a84fcff-1f5b-4c4f-9e79-bc20db91cf03',
    'Supabase Server Client Creator',
    'A helper function to create a Next.js Server Actions Supabase client.',
    'import { createServerClient } from "@supabase/ssr";\nimport { cookies } from "next/headers";\n\nexport async function createClient() {\n  const cookieStore = await cookies();\n\n  return createServerClient(\n    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,\n    {\n      cookies: {\n        getAll() {\n          return cookieStore.getAll();\n        },\n        setAll(cookiesToSet) {\n          try {\n            cookiesToSet.forEach(({ name, value, options }) =>\n              cookieStore.set(name, value, options)\n            );\n          } catch {\n            // Handled in middleware\n          }\n        },\n      },\n    }\n  );\n}',
    'TypeScript',
    'supabase-server-client',
    'supabase.ts',
    true,
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    '4b5b7e28-3e4b-4bda-91bb-bc98ab0be9e9',
    '2025-05-13 12:00:00+07'
);

-- 9. Insert snippet_tags
INSERT INTO public.snippet_tags (snippet_id, tag_id) VALUES
('1a84fcff-1f5b-4c4f-9e79-bc20db91cf01', '2231ffba-4bba-4e00-84a1-bdfc98af0be9'), -- TS tag
('1a84fcff-1f5b-4c4f-9e79-bc20db91cf01', '77e7422f-d78c-4a1e-84b2-29ee4bbcc51d'), -- React tag
('1a84fcff-1f5b-4c4f-9e79-bc20db91cf03', '2231ffba-4bba-4e00-84a1-bdfc98af0be9'), -- TS tag
('1a84fcff-1f5b-4c4f-9e79-bc20db91cf03', '1bdfba2f-f446-4cb6-bb21-1bdf7fbe8b55'); -- Supabase tag

-- 10. Insert comments (A thread on Oracle VPS post)
INSERT INTO public.comments (id, post_id, profile_id, content, parent_id, created_at) VALUES
(
    '2a84fcff-1f5b-4c4f-9e79-bc20db91cf01',
    '0a84fcff-1f5b-4c4f-9e79-bc20db91cfb5',
    '22222222-2222-2222-2222-222222222222',
    'Bài viết hay quá anh ơi! Em cũng từng bị nó bay màu con VPS không báo trước y hệt luôn, drama thực sự.',
    NULL,
    '2025-04-18 11:30:00+07'
),
(
    '2a84fcff-1f5b-4c4f-9e79-bc20db91cf02',
    '0a84fcff-1f5b-4c4f-9e79-bc20db91cfb5',
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    'Haha, chia buồn với em nhé. Dùng đồ free Oracle thì phải chấp nhận sống chung với lũ thôi.',
    '2a84fcff-1f5b-4c4f-9e79-bc20db91cf01',
    '2025-04-18 11:45:00+07'
),
(
    '2a84fcff-1f5b-4c4f-9e79-bc20db91cf03',
    '0a84fcff-1f5b-4c4f-9e79-bc20db91cfb5',
    '11111111-1111-1111-1111-111111111111',
    'May mà có bài viết này cảnh tỉnh, đang định chuyển web bán hàng lên Oracle Free. Thôi bỏ túi mấy chục k mua VPS Việt Nam chạy cho lành.',
    NULL,
    '2025-04-19 09:15:00+07'
);

-- 11. Insert comment_likes
INSERT INTO public.comment_likes (comment_id, profile_id) VALUES
('2a84fcff-1f5b-4c4f-9e79-bc20db91cf01', '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'),
('2a84fcff-1f5b-4c4f-9e79-bc20db91cf01', '11111111-1111-1111-1111-111111111111'),
('2a84fcff-1f5b-4c4f-9e79-bc20db91cf02', '22222222-2222-2222-2222-222222222222');

-- Re-enable triggers
SET session_replication_role = 'origin';
