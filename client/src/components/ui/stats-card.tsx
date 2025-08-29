import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  href?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = "text-blue-600",
  trend,
  className,
  href,
}: StatsCardProps) {
  const bgColor = iconColor.replace("text-", "bg-").replace("-600", "-50");

  const card = (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md hover:-translate-y-1",
      href && "cursor-pointer",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={cn("p-3 rounded-lg", bgColor)}>
            <Icon className={cn("w-8 h-8", iconColor)} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900" data-testid={`stat-${title.toLowerCase().replace(' ', '-')}`}>
              {value}
            </p>
          </div>
        </div>
        {trend && (
          <div className={cn(
            "mt-4 flex items-center text-sm",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline" aria-label={`${title} - navigate`}>
        {card}
      </Link>
    );
  }

  return card;
}
