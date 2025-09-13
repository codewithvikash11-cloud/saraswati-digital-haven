import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Calendar, 
  Image, 
  Newspaper, 
  Trophy, 
  Mail, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface DashboardStats {
  staffCount: number;
  eventsCount: number;
  galleryItemsCount: number;
  newsCount: number;
  achievementsCount: number;
  unreadInquiries: number;
  totalInquiries: number;
}

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entity_id: string;
  user_email: string;
  created_at: string;
}

interface RecentEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  image_url?: string;
}

export default function AdminDashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    staffCount: 0,
    eventsCount: 0,
    galleryItemsCount: 0,
    newsCount: 0,
    achievementsCount: 0,
    unreadInquiries: 0,
    totalInquiries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [recentInquiries, setRecentInquiries] = useState<ContactInquiry[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<RecentEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }
    fetchStats();
    fetchRecentInquiries();
    fetchActivityLogs();
    fetchUpcomingEvents();
  }, [isAdmin, navigate]);

  const fetchStats = async () => {
    try {
      const [
        staffResult,
        eventsResult,
        galleryResult,
        newsResult,
        achievementsResult,
        unreadInquiriesResult,
        totalInquiriesResult
      ] = await Promise.all([
        supabase.from('staff').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('gallery_items').select('id', { count: 'exact', head: true }),
        supabase.from('news').select('id', { count: 'exact', head: true }),
        supabase.from('achievements').select('id', { count: 'exact', head: true }),
        supabase.from('contact_inquiries').select('id', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('contact_inquiries').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        staffCount: staffResult.count || 0,
        eventsCount: eventsResult.count || 0,
        galleryItemsCount: galleryResult.count || 0,
        newsCount: newsResult.count || 0,
        achievementsCount: achievementsResult.count || 0,
        unreadInquiries: unreadInquiriesResult.count || 0,
        totalInquiries: totalInquiriesResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentInquiries(data || []);
    } catch (error) {
      console.error('Error fetching recent inquiries:', error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      // Simulate activity logs since we don't have an actual activity_logs table
      // In a real application, you would fetch from an activity_logs table
      const mockLogs: ActivityLog[] = [
        {
          id: '1',
          action: 'created',
          entity: 'event',
          entity_id: '123',
          user_email: user?.email || 'admin@example.com',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        },
        {
          id: '2',
          action: 'updated',
          entity: 'staff',
          entity_id: '456',
          user_email: user?.email || 'admin@example.com',
          created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        },
        {
          id: '3',
          action: 'uploaded',
          entity: 'gallery',
          entity_id: '789',
          user_email: user?.email || 'admin@example.com',
          created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
        },
        {
          id: '4',
          action: 'deleted',
          entity: 'news',
          entity_id: '101',
          user_email: user?.email || 'admin@example.com',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
        {
          id: '5',
          action: 'responded',
          entity: 'inquiry',
          entity_id: '202',
          user_email: user?.email || 'admin@example.com',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
        },
      ];
      
      setActivityLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const today = new Date();
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, location, image_url')
        .gte('date', today.toISOString())
        .order('date', { ascending: true })
        .limit(3);

      if (error) throw error;
      setUpcomingEvents(
        (data || []).map((event): RecentEvent => ({
          id: event && 'id' in event ? event.id.toString() : '',
          title: event && 'title' in event && typeof event.title === 'string' ? event.title : '',
          date: event && 'date' in event && typeof event.date === 'string' ? event.date : '',
          location: event && 'location' in event && typeof event.location === 'string' ? event.location : '',
          image_url: event && 'image_url' in event && typeof event.image_url === 'string' ? event.image_url : undefined
        }))
      );
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    }
  };
  
  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Inquiry marked as read",
      });
      fetchRecentInquiries();
      fetchStats();
    } catch (error) {
      console.error('Error marking inquiry as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark inquiry as read",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-subtle-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-subtle-gradient">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="container-custom flex items-center justify-between py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-soft overflow-hidden">
              <img 
                src="/logo.svg" 
                alt="Saraswati School Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Saraswati School</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center mr-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              {stats.unreadInquiries > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.unreadInquiries}
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium">{user?.email}</span>
              <span className="text-xs text-muted-foreground">Administrator</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-destructive hover:bg-destructive hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="card-elevated hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.staffCount}</div>
              <p className="text-xs text-muted-foreground">
                Teaching and administrative staff
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Calendar className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.eventsCount}</div>
              <p className="text-xs text-muted-foreground">
                School events and activities
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gallery Items</CardTitle>
              <Image className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.galleryItemsCount}</div>
              <p className="text-xs text-muted-foreground">
                Photos and videos
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">News Articles</CardTitle>
              <Newspaper className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.newsCount}</div>
              <p className="text-xs text-muted-foreground">
                Published news and announcements
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.achievementsCount}</div>
              <p className="text-xs text-muted-foreground">
                Student and school achievements
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Inquiries</CardTitle>
              <Mail className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.unreadInquiries}</div>
              <p className="text-xs text-muted-foreground">
                New contact messages
              </p>
            </CardContent>
          </Card>
            </div>

            {/* Upcoming Events */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Upcoming Events</h2>
                <Button variant="outline" size="sm" onClick={() => navigate("/admin/events")}>
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <Card key={event.id} className="card-elevated hover-lift">
                      <div className="h-40 w-full overflow-hidden rounded-t-lg">
                        {event.image_url ? (
                          <img 
                            src={event.image_url} 
                            alt={event.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder-event.jpg";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Calendar className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold mb-2 line-clamp-1">{event.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(event.date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full" 
                          onClick={() => navigate(`/admin/events?edit=${event.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Manage Event
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-3 card-elevated">
                    <CardContent className="py-8 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">No upcoming events</h3>
                      <p className="text-muted-foreground mb-4">Schedule new events to see them here</p>
                      <Button onClick={() => navigate("/admin/events")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Event
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 text-primary mr-2" />
                Staff Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/admin/staff")}>
                <Eye className="h-4 w-4 mr-2" />
                View All Staff
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/admin/staff")}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Staff
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 text-secondary mr-2" />
                Events Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/admin/events")}>
                <Eye className="h-4 w-4 mr-2" />
                View All Events
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/admin/events")}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Event
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="h-5 w-5 text-primary mr-2" />
                Gallery Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/admin/gallery")}>
                <Eye className="h-4 w-4 mr-2" />
                View Gallery
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/admin/gallery")}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Newspaper className="h-5 w-5 text-secondary mr-2" />
                News Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/admin/news")}>
                <Eye className="h-4 w-4 mr-2" />
                View All News
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/admin/news")}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Article
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 text-primary mr-2" />
                Achievements Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/admin/achievements")}>
                <Eye className="h-4 w-4 mr-2" />
                View All Achievements
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/admin/achievements")}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Achievement
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 text-secondary mr-2" />
                Contact Inquiries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/admin/inquiries")}>
                <Eye className="h-4 w-4 mr-2" />
                View Inquiries
              </Button>
              {stats.unreadInquiries > 0 && (
                <Badge className="w-full justify-center bg-primary text-white">
                  {stats.unreadInquiries} Unread
                </Badge>
              )}
            </CardContent>
          </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 text-primary mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Recent actions performed in the admin panel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {log.action === 'created' && <Plus className="h-5 w-5 text-green-500" />}
                          {log.action === 'updated' && <Edit className="h-5 w-5 text-blue-500" />}
                          {log.action === 'deleted' && <Trash2 className="h-5 w-5 text-red-500" />}
                          {log.action === 'uploaded' && <Image className="h-5 w-5 text-purple-500" />}
                          {log.action === 'responded' && <Mail className="h-5 w-5 text-orange-500" />}
                        </div>
                        <div className="h-full w-px bg-border mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {log.user_email} {log.action} a {log.entity}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.action === 'created' && `Added a new ${log.entity}`}
                          {log.action === 'updated' && `Modified ${log.entity} information`}
                          {log.action === 'deleted' && `Removed a ${log.entity}`}
                          {log.action === 'uploaded' && `Added new media to ${log.entity}`}
                          {log.action === 'responded' && `Replied to a contact ${log.entity}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-primary mr-2" />
                  Content Statistics
                </CardTitle>
                <CardDescription>
                  Overview of content across the website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Staff Members</span>
                      <span className="text-sm text-muted-foreground">{stats.staffCount}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${Math.min(100, stats.staffCount * 5)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Events</span>
                      <span className="text-sm text-muted-foreground">{stats.eventsCount}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary" 
                        style={{ width: `${Math.min(100, stats.eventsCount * 10)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Gallery Items</span>
                      <span className="text-sm text-muted-foreground">{stats.galleryItemsCount}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${Math.min(100, stats.galleryItemsCount * 2)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">News Articles</span>
                      <span className="text-sm text-muted-foreground">{stats.newsCount}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary" 
                        style={{ width: `${Math.min(100, stats.newsCount * 5)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Achievements</span>
                      <span className="text-sm text-muted-foreground">{stats.achievementsCount}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${Math.min(100, stats.achievementsCount * 10)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inquiries" className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 text-primary mr-2" />
                  Recent Inquiries
                </CardTitle>
                <CardDescription>
                  Latest messages from the contact form
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInquiries.length > 0 ? (
                    recentInquiries.map((inquiry) => (
                      <div 
                        key={inquiry.id} 
                        className={`p-4 rounded-lg border ${!inquiry.is_read ? 'bg-primary/5 border-primary/20' : 'bg-background border-border'}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">{inquiry.subject || 'No Subject'}</h3>
                              {!inquiry.is_read && (
                                <Badge variant="default" className="ml-2 text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              From: {inquiry.name} ({inquiry.email})
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(inquiry.created_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2 mb-3">{inquiry.message}</p>
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/inquiries`)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {!inquiry.is_read && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleMarkAsRead(inquiry.id)}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">No inquiries yet</h3>
                      <p className="text-muted-foreground">Contact form submissions will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/admin/inquiries")}
                >
                  View All Inquiries
                  {stats.unreadInquiries > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {stats.unreadInquiries} unread
                    </Badge>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 text-primary mr-2" />
                  Inquiries Overview
                </CardTitle>
                <CardDescription>
                  Status of contact form submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-2xl font-bold">{stats.totalInquiries}</p>
                        <p className="text-sm text-muted-foreground">Total Inquiries</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold">{stats.totalInquiries - stats.unreadInquiries}</p>
                        <p className="text-sm text-muted-foreground">Read Inquiries</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                          <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-2xl font-bold">{stats.unreadInquiries}</p>
                        <p className="text-sm text-muted-foreground">Unread Inquiries</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-6">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-semibold inline-block text-primary">
                          Response Rate
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block">
                          {stats.totalInquiries > 0 ? Math.round(((stats.totalInquiries - stats.unreadInquiries) / stats.totalInquiries) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-muted">
                      <div
                        style={{
                          width: `${stats.totalInquiries > 0 ? ((stats.totalInquiries - stats.unreadInquiries) / stats.totalInquiries) * 100 : 0}%`,
                        }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
