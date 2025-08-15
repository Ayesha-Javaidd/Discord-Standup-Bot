import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api, Response, Checkin } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Download, MessageSquare, Filter, Search, User } from 'lucide-react';

export const Responses = () => {
  const [responses, setResponses] = useState<Response[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<Response[]>([]);
  const [selectedCheckin, setSelectedCheckin] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterResponses();
  }, [responses, selectedCheckin, selectedDate, searchTerm]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [responsesRes, checkinsRes] = await Promise.all([
        api.getResponses(),
        api.getCheckins(),
      ]);
      
      if (responsesRes.error || checkinsRes.error) {
        throw new Error('Failed to load data');
      }
      
      setResponses(responsesRes.data || []);
      setCheckins(checkinsRes.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load responses',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterResponses = () => {
    let filtered = responses;

    // Filter by check-in
    if (selectedCheckin) {
      filtered = filtered.filter(r => r.checkin_id === parseInt(selectedCheckin));
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter(r => {
        const responseDate = new Date(r.response_date).toISOString().split('T')[0];
        return responseDate === selectedDate;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.response_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.question.question_text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredResponses(filtered);
  };

  const handleExport = () => {
    if (filteredResponses.length === 0) {
      toast({
        title: 'No Data',
        description: 'No responses to export',
        variant: 'destructive',
      });
      return;
    }

    // Convert to CSV
    const headers = ['Date', 'Check-in', 'User', 'Question', 'Response'];
    const csvData = filteredResponses.map(r => [
      new Date(r.response_date).toLocaleDateString(),
      checkins.find(c => c.id === r.checkin_id)?.name || 'Unknown',
      r.user.display_name,
      r.question.question_text,
      r.response_text.replace(/,/g, ';'), // Replace commas to avoid CSV issues
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `responses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Responses exported successfully',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Responses</h1>
          <p className="text-muted-foreground mt-2">View and export check-in responses</p>
        </div>
        <Button
          onClick={handleExport}
          className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          disabled={filteredResponses.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Check-in</label>
              <Select value={selectedCheckin} onValueChange={setSelectedCheckin}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="All check-ins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All check-ins</SelectItem>
                  {checkins.map(checkin => (
                    <SelectItem key={checkin.id} value={checkin.id.toString()}>
                      {checkin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search responses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Actions</label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedCheckin('');
                  setSelectedDate('');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredResponses.length} of {responses.length} responses
        </p>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {checkins.length} Check-ins
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {new Set(responses.map(r => r.user_id)).size} Users
          </Badge>
        </div>
      </div>

      {/* Responses */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredResponses.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {responses.length === 0 ? 'No responses yet' : 'No responses match your filters'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {responses.length === 0
                ? 'Responses will appear here when users answer check-ins'
                : 'Try adjusting your filters to see more results'
              }
            </p>
            {responses.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCheckin('');
                  setSelectedDate('');
                  setSearchTerm('');
                }}
              >
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResponses.map((response) => (
            <Card key={response.id} className="bg-card border-border hover:shadow-medium transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={response.user.avatar_url || '/placeholder-avatar.png'}
                      alt={response.user.display_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">{response.user.display_name}</h3>
                      <p className="text-sm text-muted-foreground">@{response.user.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(response.response_date)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(response.response_date)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    {response.question.question_text}
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {response.response_text}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Badge variant="secondary" className="text-xs">
                    {checkins.find(c => c.id === response.checkin_id)?.name || 'Unknown Check-in'}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <User className="w-3 h-3 mr-1" />
                    Response #{response.id}
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