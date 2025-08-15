import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, Checkin, CheckinFull, Question, User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Clock,
  Hash,
  Users,
  MessageSquare,
} from "lucide-react";
import { QuestionForm } from "@/components/QuestionForm";

interface CheckinDetailsProps {
  checkin: Checkin;
  onBack: () => void;
  onUpdate: () => void;
}

export const CheckinDetails = ({
  checkin,
  onBack,
  onUpdate,
}: CheckinDetailsProps) => {
  const [checkinData, setCheckinData] = useState<CheckinFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCheckinData();
  }, [checkin.id]);

  const loadCheckinData = async () => {
    try {
      setIsLoading(true);
      const response = await api.getCheckinFull(checkin.id);

      if (response.error) {
        throw new Error(response.error);
      }

      setCheckinData(response.data || null);
    } catch (error) {
      console.error("Failed to load checkin details:", error);
      toast({
        title: "Error",
        description: `Failed to load check-in details: ${
          error.message || error
        }`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (question: Question) => {
    if (!confirm(`Are you sure you want to delete this question?`)) {
      return;
    }

    try {
      const response = await api.deleteQuestion(question.id);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });

      loadCheckinData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleQuestionFormSuccess = () => {
    setShowQuestionForm(false);
    setEditingQuestion(null);
    loadCheckinData();
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (showQuestionForm) {
    return (
      <QuestionForm
        checkinId={checkin.id}
        question={editingQuestion}
        onCancel={() => {
          setShowQuestionForm(false);
          setEditingQuestion(null);
        }}
        onSuccess={handleQuestionFormSuccess}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Check-ins
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{checkin.name}</h1>
          <p className="text-muted-foreground mt-2">
            Manage questions and users for this check-in
          </p>
        </div>
      </div>

      {/* Check-in Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Check-in Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-3">
              <Hash className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Channel ID
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  {checkin.channel_id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Schedule Time
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(checkin.schedule_time)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Post Time</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(checkin.post_time)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Users</p>
                <p className="text-sm text-muted-foreground">
                  {checkinData?.users.length || 0} assigned
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Questions</CardTitle>
            <Button
              onClick={() => setShowQuestionForm(true)}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : checkinData?.questions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No questions yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Add questions for users to answer during check-in
              </p>
              <Button
                onClick={() => setShowQuestionForm(true)}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {checkinData?.questions
                .sort((a, b) => a.order - b.order)
                .map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="text-xs">
                        #{question.order}
                      </Badge>
                      <p className="text-foreground">
                        {question.question_text}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingQuestion(question);
                          setShowQuestionForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Assigned Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : checkinData?.users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No users assigned
              </h3>
              <p className="text-muted-foreground">
                Users will be automatically added when they interact with the
                bot
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {checkinData?.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                >
                  <img
                    src={user.avatar_url || "/placeholder-avatar.png"}
                    alt={user.display_name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {user.display_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
