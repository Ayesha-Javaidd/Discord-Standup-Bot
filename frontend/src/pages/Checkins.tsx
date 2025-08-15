import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, Checkin } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Clock, Hash, Users, Calendar } from "lucide-react";
import { CheckinForm } from "@/components/CheckinForm";
import { CheckinDetails } from "@/components/CheckinDetails";

export const Checkins = () => {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCheckin, setEditingCheckin] = useState<Checkin | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("apiKey", "SDASDSADWQRGHY");
    loadCheckins();
  }, []);

  const loadCheckins = async () => {
    try {
      setIsLoading(true);
      const response = await api.getCheckins();

      if (response.error) {
        throw new Error(response.error);
      }

      setCheckins(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load check-ins",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (checkin: Checkin) => {
    if (!confirm(`Are you sure you want to delete "${checkin.name}"?`)) {
      return;
    }

    try {
      const response = await api.deleteCheckin(checkin.id);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Check-in deleted successfully",
      });

      loadCheckins();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete check-in",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCheckin(null);
    loadCheckins();
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (selectedCheckin) {
    return (
      <CheckinDetails
        checkin={selectedCheckin}
        onBack={() => setSelectedCheckin(null)}
        onUpdate={loadCheckins}
      />
    );
  }

  if (showForm) {
    return (
      <CheckinForm
        checkin={editingCheckin}
        onCancel={() => {
          setShowForm(false);
          setEditingCheckin(null);
        }}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Check-ins</h1>
          <p className="text-muted-foreground mt-2">
            Manage your Discord check-in schedules
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Check-in
        </Button>
      </div>

      {/* Checkins Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : checkins.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No check-ins yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first check-in to get started
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Check-in
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {checkins.map((checkin) => (
            <Card
              key={checkin.id}
              className="bg-card border-border hover:shadow-medium transition-all duration-200 cursor-pointer group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                    {checkin.name}
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCheckin(checkin);
                        setShowForm(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(checkin);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent
                className="pt-0"
                onClick={() => setSelectedCheckin(checkin)}
              >
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Hash className="w-4 h-4 mr-2" />
                    <span className="font-mono">{checkin.channel_id}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Schedule: {formatTime(checkin.schedule_time)}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Post: {formatTime(checkin.post_time)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Created{" "}
                      {new Date(checkin.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
