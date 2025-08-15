import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, Question } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, X } from 'lucide-react';

interface QuestionFormProps {
  checkinId: number;
  question?: Question | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const QuestionForm = ({ checkinId, question, onCancel, onSuccess }: QuestionFormProps) => {
  const [formData, setFormData] = useState({
    question_text: '',
    order: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text,
        order: question.order,
      });
    }
  }, [question]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question_text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      let response;
      
      if (question) {
        response = await api.updateQuestion(question.id, formData);
      } else {
        response = await api.createQuestion(checkinId, formData);
      }
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast({
        title: 'Success',
        description: `Question ${question ? 'updated' : 'created'} successfully`,
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${question ? 'update' : 'create'} question`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 1 : value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Check-in
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {question ? 'Edit Question' : 'Add Question'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {question ? 'Update the question details' : 'Create a new question for the check-in'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-card border-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-foreground">Question Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question_text" className="text-sm font-medium">
                Question Text *
              </Label>
              <Input
                id="question_text"
                name="question_text"
                value={formData.question_text}
                onChange={handleInputChange}
                placeholder="How are you feeling today?"
                className="bg-background border-border"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="order" className="text-sm font-medium">
                Order
              </Label>
              <Input
                id="order"
                name="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={handleInputChange}
                className="bg-background border-border w-32"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                The order in which this question appears in the check-in
              </p>
            </div>
            
            <div className="flex items-center space-x-3 pt-6">
              <Button
                type="submit"
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : question ? 'Update Question' : 'Add Question'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};