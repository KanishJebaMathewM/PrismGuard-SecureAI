import { Landmark, Building2, Database, Search, type LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  bank: Landmark,
  building: Building2,
  database: Database,
  search: Search,
};

export function ResourceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? Database;
  return <Icon className={className} />;
}
