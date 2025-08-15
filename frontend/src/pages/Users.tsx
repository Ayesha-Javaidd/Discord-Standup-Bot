import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api, User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, User as UserIcon, AtSign } from 'lucide-react';

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.getUsers();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setUsers(response.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.discord_id.includes(searchTerm)
    );
    setFilteredUsers(filtered);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.display_name}"?`)) {
      return;
    }

    try {
      const response = await api.deleteUser(user.id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-2">Manage Discord users in your check-in system</p>
        </div>
        <Button
          onClick={() => {
            toast({
              title: 'Info',
              description: 'Users are automatically added when they interact with the bot',
            });
          }}
          className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, username, or Discord ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <UserIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? 'No users found' : 'No users yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Users will appear here when they interact with the Discord bot'
              }
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-card border-border hover:shadow-medium transition-all duration-200 group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar_url || '/placeholder-avatar.png'}
                      alt={user.display_name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">{user.display_name}</h3>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        toast({
                          title: 'Coming Soon',
                          description: 'User editing functionality will be added soon',
                        });
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <AtSign className="w-4 h-4 mr-2" />
                    <span className="font-mono">{user.discord_id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Joined {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">User Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{users.length}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{filteredUsers.length}</div>
              <div className="text-sm text-muted-foreground">
                {searchTerm ? 'Search Results' : 'Active Users'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {users.filter(u => 
                  new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">New This Week</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};