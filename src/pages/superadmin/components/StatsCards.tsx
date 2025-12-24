import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";
import { Site, Task } from "../data";

interface StatsCardsProps {
  tasks: Task[];
  sites: Site[];
}

export const StatsCards = ({ tasks, sites }: StatsCardsProps) => {
  const getSiteStats = () => {
    const siteStats: { [key: string]: { total: number; completed: number; pending: number; inProgress: number } } = {};
    
    sites.forEach(site => {
      const siteTasks = tasks.filter(task => task.siteId === site.id);
      siteStats[site.id] = {
        total: siteTasks.length,
        completed: siteTasks.filter(t => t.status === "completed").length,
        pending: siteTasks.filter(t => t.status === "pending").length,
        inProgress: siteTasks.filter(t => t.status === "in-progress").length
      };
    });

    return siteStats;
  };

  const siteStats = getSiteStats();
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === "in-progress").length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{inProgressTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{pendingTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Site-wise Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Site-wise Task Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => {
              const stats = siteStats[site.id];
              return (
                <Card key={site.id} className="relative">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      {site.name}
                      <Badge variant={site.status === "active" ? "default" : "secondary"}>
                        {site.status}
                      </Badge>
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {site.clientName} • {site.location}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Total Tasks</div>
                        <div className="font-semibold">{stats.total}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Completed</div>
                        <div className="font-semibold text-green-600">{stats.completed}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">In Progress</div>
                        <div className="font-semibold text-primary">{stats.inProgress}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Pending</div>
                        <div className="font-semibold text-orange-500">{stats.pending}</div>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%' 
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      {stats.completed} of {stats.total} tasks completed
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};