import { siteConfig } from "@/config/site";
import { AuthorCard } from "@/components/sidebar/AuthorCard";
import { SearchBox } from "@/components/sidebar/SearchBox";
import { RecentPosts } from "@/components/sidebar/RecentPosts";
import { HotTags } from "@/components/sidebar/HotTags";
import { FriendLinks } from "@/components/sidebar/FriendLinks";
import { PersonalLinks } from "@/components/sidebar/PersonalLinks";

export function Sidebar() {
  return (
    <aside className="w-full lg:w-80 space-y-4">
      <SearchBox />
      <AuthorCard />
      
      {siteConfig.sidebar.recentPosts && <RecentPosts />}
      {siteConfig.sidebar.tags && <HotTags />}
      {siteConfig.sidebar.friendLinks && <FriendLinks />}
      {siteConfig.sidebar.links && <PersonalLinks />}
    </aside>
  );
}
