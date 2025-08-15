import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, Checkin, User, Response } from '@/lib/api';
import { Calendar, Users, MessageSquare, TrendingUp, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalCheckins: number;
  totalUsers: number;
  totalResponses: number;
  responseRate: number;
  activeCheckins: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCheckins: 0,
    totalUsers: 0,
    totalResponses: 0,
    responseRate: 0,
    activeCheckins: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load basic stats
      const [checkinsRes, usersRes, responsesRes] = await Promise.all([
        api.getCheckins(),
        api.getUsers(),
        api.getResponses(),
      ]);

      if (checkinsRes.error || usersRes.error || responsesRes.error) {
        throw new Error('Failed to load dashboard data');
      }

      const checkins = checkinsRes.data || [];
      const users = usersRes.data || [];
      const responses = responsesRes.data || [];

      // Calculate stats
      const totalCheckins = checkins.length;
      const totalUsers = users.length;
      const totalResponses = responses.length;
      const activeCheckins = checkins.length; // All checkins are considered active for now
      
      // Calculate response rate (simplified)
      const responseRate = totalUsers > 0 ? (totalResponses / (totalUsers * totalCheckins)) * 100 : 0;

      setStats({
        totalCheckins,
        totalUsers,
        totalResponses,
        responseRate: Math.round(responseRate),
        activeCheckins,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Check-ins',
      value: stats.totalCheckins,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total Responses',
      value: stats.totalResponses,
      icon: MessageSquare,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Response Rate',
      value: `${stats.responseRate}%`,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Active Check-ins',
      value: stats.activeCheckins,
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of your Discord check-in system</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your Discord check-in system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat, index) => (
          <Card key={index} className="bg-card border-border hover:shadow-medium transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Activity tracking coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};