import {
  Boxes,
  Building2,
  Code2,
  Gauge,
  LayoutTemplate,
  PenLine,
  RefreshCw,
  Search,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";

export const SERVICE_ICONS = {
  Code2,
  UtensilsCrossed,
  Building2,
  ShoppingBag,
  Target,
  RefreshCw,
  Wrench,
  PenLine,
  Smartphone,
  Search,
  Boxes,
  Sparkles,
  LayoutTemplate,
  Gauge,
};

export function ServiceIcon({ name, className }) {
  const Icon = SERVICE_ICONS[name] || Sparkles;
  return <Icon className={className} strokeWidth={1.5} />;
}