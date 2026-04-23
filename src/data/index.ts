import type { Post } from "@/lib/posts";


// Nav & Footer Links
export const dummyNavLinks = [
  { id: "home", href: "/", label: "Home" },
  { id: "blog", href: "/blog", label: "Blog" },
  { id: "snippets", href: "/snippets", label: "Snippets" },
  { id: "about", href: "/about", label: "About" },
];

export const dummyFooterLinks = [
  { id: "blog", href: "/blog", label: "Blog" },
  { id: "snippets", href: "/snippets", label: "Snippets" },
  { id: "about", href: "/about", label: "About" },
  { id: "rss", href: "/rss.xml", label: "RSS" },
];

// Site Configuration
export const dummySiteConfig = {
  author: "Thai Bao",
  role: "Full-stack Developer",
  greeting: "Hi, I'm",
  welcomeText: "Welcome to my",
  siteName: "Tech Stash.",
  description: "Mình là một Full-stack Developer. Đây là nơi mình lưu trữ các bài viết, code snippets, và những thứ học được từ thực chiến — không có gì giả tạo, chỉ có code thật và vấn đề thật.",
  github: "https://github.com/thaibao",
  twitter: "https://twitter.com/thaibao",
  emailPlaceholder: "mày@example.com",
};

// Dummy Posts (To be moved to Database)
export const dummyPosts: Post[] = [
  {
    slug: "hanh-trinh-cau-xe-vps-oracle",
    title: "Hành trình cấu xé với VPS Oracle và cái kết",
    excerpt: "Tưởng free là ngon, ai ngờ Oracle nó terminate instance không báo trước. Đây là toàn bộ drama và cách mình recover lại production.",
    date: "2025-04-18",
    tags: ["DevOps", "VPS", "Rant"],
    thumbnail: "/thumbnails/oracle-vps.jpg",
    readTime: "8 min read",
    featured: true,
    content: `
      <h2>Tưởng Free Mà Ngon À? Không Dễ Đâu!</h2>
      <p>Lúc đầu nghe anh em đồn Oracle cho Always Free VPS cấu hình ARM 4 cores, 24GB RAM, mình nghĩ: "Quá ngon, chuyển hết mấy cái side project qua đây chạy cho tiết kiệm". Y như rằng, đăng ký thành công là mình migrate ngay con web Next.js + Postgres sang.</p>
      <p>Chạy mượt mà được tầm 2 tháng, tự nhiên một ngày đẹp trời, app sập. Vào check Oracle Cloud thì thấy báo lỗi "Instance terminated". Không một email cảnh báo. Không một lời giải thích. Data đi tong, config bay màu. Cảm giác lúc đó kiểu: <strong>WTF Oracle?!</strong></p>
      
      <h3>Bài Học Rút Ra</h3>
      <ul>
        <li><strong>Không bao giờ tin tưởng hoàn toàn vào đồ free:</strong> Bất cứ dịch vụ nào Always Free cũng có rủi ro bị khóa tài khoản hoặc thu hồi tài nguyên mà không cần lý do.</li>
        <li><strong>Backup là sinh mệnh:</strong> Nếu hôm trước đó mình không cấu hình cronjob backup database đẩy lên S3 thì giờ chắc khóc thét rồi.</li>
        <li><strong>Học cách viết Infrastructure as Code (IaC):</strong> Nhờ có Ansible playbook viết sẵn, mình chỉ mất 2 tiếng để deploy lại toàn bộ stack lên một con VPS mới mua bên Hetzner.</li>
      </ul>
      <p>Nói chung là đồ free có cái giá của nó. Nếu project có user thật và data quan trọng, hãy bỏ ra vài đô một tháng mua VPS đàng hoàng mà xài. Oracle Cloud có thể để test, nhưng production thì <em>say no</em>!</p>
    `,
  },
  {
    slug: "nextjs-app-router-data-fetching",
    title: "Next.js App Router: Data Fetching patterns mày nên biết",
    excerpt: "Server Components, Suspense, parallel fetching — breakdown chi tiết cách xài đúng để không bị re-render điên loạn.",
    date: "2025-04-10",
    tags: ["Next.js", "React"],
    thumbnail: "/thumbnails/nextjs-data.jpg",
    readTime: "6 min read",
    content: `
      <h2>Đừng Dùng useEffect Nữa!</h2>
      <p>Với Next.js App Router (từ v13 trở đi), cách chúng ta fetch data đã thay đổi hoàn toàn so với thời Pages Router. Nếu bạn vẫn đang dùng <code>useEffect</code> để gọi API trong React component, bạn đang tự làm chậm ứng dụng của mình.</p>
      
      <h3>1. Server Components vs Client Components</h3>
      <p>Mặc định, mọi component trong App Router đều là Server Component. Điều này có nghĩa là bạn có thể biến component thành <code>async function</code> và fetch data trực tiếp bên trong nó!</p>
      <pre><code>
// app/page.tsx
export default async function Page() {
  const data = await fetch('https://api.example.com/...').then(r => r.json());
  return &lt;div&gt;{data.title}&lt;/div&gt;;
}
      </code></pre>
      
      <h3>2. Streaming và Suspense</h3>
      <p>Thay vì bắt người dùng chờ toàn bộ trang load xong mới hiển thị (Waterfall), hãy dùng <code>Suspense</code> để bọc các component lấy dữ liệu chậm. UI sẽ render ngay lập tức với một fallback (ví dụ như skeleton loading), sau đó nội dung thật sẽ được stream xuống sau.</p>
      
      <h3>3. Parallel Fetching</h3>
      <p>Nếu trang của bạn cần gọi nhiều API không phụ thuộc vào nhau, đừng dùng <code>await</code> cho từng cái một. Hãy dùng <code>Promise.all</code> để fetch song song!</p>
      <p>App Router mang lại trải nghiệm DX cực tốt nhưng đòi hỏi mindset khác biệt. Hãy làm quen với việc đẩy logic fetch data lên server nhiều nhất có thể nhé.</p>
    `,
  },
  {
    slug: "supabase-rls-setup",
    title: "Cấu hình Supabase RLS đúng cách để không bị lộ data",
    excerpt: "Row Level Security là thứ mà 90% dev bỏ qua khi mới dùng Supabase. Đây là cách setup đúng từ đầu.",
    date: "2025-04-02",
    tags: ["Supabase", "Security"],
    thumbnail: "/thumbnails/supabase-rls.jpg",
    readTime: "5 min read",
    content: `
      <h2>RLS Là Gì Mà Phải Cài?</h2>
      <p>Row Level Security (RLS) của PostgreSQL (và Supabase) cho phép bạn giới hạn ai được quyền đọc/ghi dữ liệu ở cấp độ <strong>từng dòng</strong> trong bảng. Rất nhiều bạn khi mới dùng Supabase lấy key <code>anon</code> public ra frontend mà quên bật RLS, dẫn đến ai cũng có thể query hoặc xóa sạch database của bạn bằng vài dòng code JS.</p>
      
      <h3>Các Bước Cấu Hình Chuẩn</h3>
      <ol>
        <li><strong>Enable RLS trên mọi bảng:</strong> Bấm vào table trong dashboard Supabase, góc phải trên cùng luôn có nút Enable RLS. Bật ngay và luôn.</li>
        <li><strong>Viết Policy cho Read (SELECT):</strong> Nếu bảng chứa dữ liệu public (như bài viết blog), bạn viết một policy cho phép <code>SELECT</code> với tất cả mọi người (<code>true</code>). Nếu bảng chứa thông tin cá nhân (như profile), policy phải là <code>auth.uid() = user_id</code>.</li>
        <li><strong>Viết Policy cho Write (INSERT/UPDATE/DELETE):</strong> Tương tự, chỉ cho phép user tự sửa dữ liệu của chính họ.</li>
      </ol>
      
      <h3>Đừng Tin Tưởng Frontend!</h3>
      <p>Quy tắc bất thành văn trong bảo mật: <em>Luôn kiểm tra quyền truy cập ở phía backend/database</em>. Việc ẩn nút "Delete" trên UI không ngăn được một người rành tech dùng cURL hoặc console để gửi request. RLS là chốt chặn cuối cùng bảo vệ dữ liệu của bạn.</p>
    `,
  },
  {
    slug: "tailwind-v4-migration",
    title: "Migration từ Tailwind v3 sang v4: Cái gì thay đổi?",
    excerpt: "CSS-first config, @theme directive, không còn tailwind.config.ts — đây là những điểm mày cần chú ý khi nâng cấp.",
    date: "2025-03-25",
    tags: ["Tailwind", "CSS"],
    thumbnail: "/thumbnails/tailwind-v4.jpg",
    readTime: "4 min read",
    content: `
      <h2>Tạm Biệt tailwind.config.js</h2>
      <p>Tailwind CSS v4 là một bản cập nhật lớn, đánh dấu sự chuyển đổi từ cấu hình bằng JavaScript sang cấu hình bằng CSS (CSS-first config). Điều này giúp việc tích hợp trở nên cực kỳ đơn giản.</p>
      
      <h3>1. Cấu Hình Bằng @theme</h3>
      <p>Bây giờ, mọi cấu hình màu sắc, font, spacing... đều được khai báo trực tiếp trong file CSS chính của bạn thông qua directive <code>@theme</code>.</p>
      <pre><code>
@import "tailwindcss";

@theme {
  --color-brand: #3b82f6;
  --font-heading: "Inter", sans-serif;
}
      </code></pre>
      
      <h3>2. Tốc Độ Compile Nhanh Hơn</h3>
      <p>Với engine mới được viết lại một phần bằng Rust (Lightning CSS), Tailwind v4 compile cực nhanh, cảm giác gần như tức thời khi bạn save file. Không còn độ trễ khó chịu khi dev nữa.</p>
      
      <h3>Lưu Ý Khi Nâng Cấp</h3>
      <p>Dù có công cụ tự động migration, bạn vẫn nên kiểm tra lại các plugin cũ hoặc cấu hình phức tạp (như custom variants), vì một số cách viết cũ đã bị loại bỏ hoặc thay thế.</p>
    `,
  },
  {
    slug: "typescript-tips-2025",
    title: "5 TypeScript tips giúp code sạch hơn mà ít người biết",
    excerpt: "satisfies operator, template literal types, infer keyword — mấy cái này mình dùng hàng ngày mà ít thấy ai nhắc tới.",
    date: "2025-03-15",
    tags: ["TypeScript"],
    thumbnail: "/thumbnails/typescript-tips.jpg",
    readTime: "7 min read",
    content: `
      <h2>Viết TypeScript Đừng Như Viết AnyScript</h2>
      <p>Nếu bạn chỉ dùng interface và string/number cơ bản, bạn mới sử dụng được 20% sức mạnh của TypeScript. Dưới đây là những tính năng nâng cao giúp type-checking chặt chẽ hơn.</p>
      
      <h3>1. satisfies Operator</h3>
      <p>Thay vì dùng type annotation (<code>const config: Config = {...}</code>) khiến type inference bị thu hẹp, hãy dùng <code>satisfies</code>. Nó kiểm tra object có đúng cấu trúc không, nhưng vẫn giữ nguyên kiểu hẹp nhất có thể của từng thuộc tính.</p>
      
      <h3>2. Template Literal Types</h3>
      <p>Bạn có thể tạo ra các kiểu dữ liệu từ chuỗi nội suy. Ví dụ: <code>type Event = \`on\${Capitalize&lt;Action&gt;}\`</code>. Rất tiện để gõ chặt các hàm xử lý sự kiện hoặc định tuyến.</p>
      
      <h3>3. Utility Types Mở Rộng</h3>
      <p>Thay vì tự viết lại, hãy tận dụng <code>Record</code>, <code>Pick</code>, <code>Omit</code>, và <code>Extract</code>. Kết hợp chúng với <code>infer</code> trong Conditional Types, bạn có thể giải nén type từ bất kỳ Promise hay Array phức tạp nào.</p>
    `,
  },
  {
    slug: "docker-compose-dev-setup",
    title: "Docker Compose setup cho local dev environment chuẩn không cần chỉnh",
    excerpt: "Môi trường dev của mình: Next.js + Postgres + Redis + Mailhog, tất cả trong một docker-compose.yml.",
    date: "2025-03-05",
    tags: ["Docker", "DevOps"],
    thumbnail: "/thumbnails/docker-compose.jpg",
    readTime: "5 min read",
    content: `
      <h2>Ngừng Việc Cài Cắm Trực Tiếp Lên Máy Tính!</h2>
      <p>Mình từng có thói quen cài Node, Postgres, Redis... trực tiếp lên máy. Hậu quả là sau vài tháng, máy rác và xung đột version liên miên (dự án này cần Node 14, dự án kia Node 20). Docker Compose là vị cứu tinh.</p>
      
      <h3>File docker-compose.yml Chân Ái</h3>
      <p>Chỉ với một file, bạn khai báo tất cả dịch vụ cần thiết. Mọi người trong team chỉ cần pull code về và chạy <code>docker-compose up -d</code> là có ngay một môi trường y hệt nhau, không còn câu "Works on my machine" nữa.</p>
      
      <h3>Các Dịch Vụ Cần Có</h3>
      <ul>
        <li><strong>App:</strong> Chạy code chính (mount volume để hot-reload).</li>
        <li><strong>Database:</strong> Postgres/MySQL (nhớ map port và dùng volume để không mất data khi tắt container).</li>
        <li><strong>Cache:</strong> Redis (nếu dự án cần).</li>
        <li><strong>Email:</strong> Mailhog (bắt email gửi đi lúc test, không bị spam ra ngoài).</li>
      </ul>
      <p>Setup ban đầu hơi mất thời gian, nhưng tin mình đi, nó sẽ tiết kiệm cho bạn hàng trăm giờ debug lỗi môi trường sau này!</p>
    `,
  }
];
