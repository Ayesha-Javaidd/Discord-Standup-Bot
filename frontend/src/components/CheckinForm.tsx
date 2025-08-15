import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, Checkin } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, X } from 'lucide-react';

interface CheckinFormProps {
  checkin?: Checkin | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CheckinForm = ({ checkin, onCancel, onSuccess }: CheckinFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    channel_id: '',
    schedule_time: '',
    post_time: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (checkin) {
      setFormData({
        name: checkin.name,
        channel_id: checkin.channel_id,
        schedule_time: checkin.schedule_time,
        post_time: checkin.post_time,
      });
    }
  }, [checkin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.channel_id.trim() || !formData.schedule_time || !formData.post_time) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      let response;
      
      if (checkin) {
        response = await api.updateCheckin(checkin.id, formData);
      } else {
        response = await api.createCheckin(formData);
      }
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast({
        title: 'Success',
        description: `Check-in ${checkin ? 'updated' : 'created'} successfully`,
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${checkin ? 'update' : 'create'} check-in`,
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
      [name]: value,
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
          Back to Check-ins
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {checkin ? 'Edit Check-in' : 'Create Check-in'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {checkin ? 'Update your check-in settings' : 'Set up a new Discord check-in schedule'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-card border-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-foreground">Check-in Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Check-in Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Daily Standup"
                  className="bg-background border-border"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="channel_id" className="text-sm font-medium">
                  Discord Channel ID *
                </Label>
                <Input
                  id="channel_id"
                  name="channel_id"
                  value={formData.channel_id}
                  onChange={handleInputChange}
                  placeholder="1234567890123456789"
                  className="bg-background border-border font-mono"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schedule_time" className="text-sm font-medium">
                  Schedule Time *
                </Label>
                <Input
                  id="schedule_time"
                  name="schedule_time"
                  type="time"
                  value={formData.schedule_time}
                  onChange={handleInputChange}
                  className="bg-background border-border"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Time to send the check-in reminder
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="post_time" className="text-sm font-medium">
                  Post Time *
                </Label>
                <Input
                  id="post_time"
                  name="post_time"
                  type="time"
                  value={formData.post_time}
                  onChange={handleInputChange}
                  className="bg-background border-border"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Time to post the check-in form
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 pt-6">
              <Button
                type="submit"
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : checkin ? 'Update Check-in' : 'Create Check-in'}
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