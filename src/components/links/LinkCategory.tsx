
import { LinkCard } from "./LinkCard";

interface LinkItem {
  name: string;
  desc: string;
  link: string;
  icon: string;
}

interface LinkCategoryProps {
  title: string;
  items: LinkItem[];
}

export function LinkCategory({ title, items }: LinkCategoryProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-white flex items-center gap-2 pl-4 border-l-4 border-cyan-400">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <LinkCard key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}
