import {
  Landmark,
  Building2,
  Database,
  Search,
  Server,
  Shield,
  HeartPulse,
  Cpu,
  Globe,
  ShoppingBag,
  FileText,
  Layers,
  Lock,
  Boxes,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  bank: Landmark,
  building: Building2,
  database: Database,
  search: Search,
  server: Server,
  shield: Shield,
  heart: HeartPulse,
  healthcare: HeartPulse,
  cpu: Cpu,
  globe: Globe,
  ecommerce: ShoppingBag,
  shopping: ShoppingBag,
  file: FileText,
  layers: Layers,
  lock: Lock,
  custom: Boxes,
};

export function ResourceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name?.toLowerCase()] ?? Database;
  return <Icon className={className} />;
}
