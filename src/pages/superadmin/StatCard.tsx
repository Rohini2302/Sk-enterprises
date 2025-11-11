// src/components/hrms/shared/StatCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
  className?: string;
}

const StatCard = ({ title, value, className = "" }: StatCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${className}`}>{value}</div>
    </CardContent>
  </Card>
);

export default StatCard;