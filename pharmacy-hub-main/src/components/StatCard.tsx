import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  delay?: number;
  accent?: "primary" | "success" | "warning" | "destructive";
};

const accentMap = {
  primary: "bg-gradient-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

const StatCard = ({ label, value, icon: Icon, trend, delay = 0, accent = "primary" }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="relative overflow-hidden p-6 bg-gradient-card border-border/60 shadow-card-soft hover:shadow-lg-soft transition-all">
      <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/5" />
      <div className="relative flex items-start justify-between mb-4">
        <div className={`h-12 w-12 rounded-xl ${accentMap[accent]} flex items-center justify-center shadow-md-soft`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">{trend}</span>}
      </div>
      <div className="relative">
        <div className="text-3xl font-display font-bold tracking-tight">{value}</div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
      </div>
    </Card>
  </motion.div>
);

export default StatCard;
