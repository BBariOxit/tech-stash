import { getDsaPosts } from "@/lib/posts";
import DsaPageClient from "./_components/dsa-page-client";

export const metadata = {
  title: "DSA — Data Structures & Algorithms | tech-stash",
  description:
    "Tập hợp bài viết giải ngố thuật toán và cấu trúc dữ liệu. Không có code thừa, chỉ có tư duy tối ưu.",
};

export default async function DsaPage() {
  const posts = await getDsaPosts(50);

  return (
    <div className="min-h-screen">
      <DsaPageClient posts={posts} />
    </div>
  );
}

