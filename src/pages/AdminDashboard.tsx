import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface DashboardStats {
  staffCount: number;
  eventsCount: number;
  galleryItemsCount: number;
  newsCount: number;
  achievementsCount: number;
  unreadInquiries: number;
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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }
    fetchStats();
  }, [isAdmin, navigate]);

  const fetchStats = async () => {
    try {
      const [
        staffResult,
        eventsResult,
        galleryResult,
        newsResult,
        achievementsResult,
        inquiriesResult
      ] = await Promise.all([
        supabase.from('staff').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('gallery_items').select('id', { count: 'exact', head: true }),
        supabase.from('news').select('id', { count: 'exact', head: true }),
        supabase.from('achievements').select('id', { count: 'exact', head: true }),
        supabase.from('contact_inquiries').select('id', { count: 'exact', head: true }).eq('is_read', false)
      ]);

      setStats({
        staffCount: staffResult.count || 0,
        eventsCount: eventsResult.count || 0,
        galleryItemsCount: galleryResult.count || 0,
        newsCount: newsResult.count || 0,
        achievementsCount: achievementsResult.count || 0,
        unreadInquiries: inquiriesResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
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
            <div className="w-10 h-10 bg-hero-gradient rounded-lg flex items-center justify-center shadow-soft">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Saraswati School</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email}
            </span>
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

        {/* Quick Actions */}
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
              <Button variant="outline" className="w-full">
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
              <Button variant="outline" className="w-full">
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
              <Button variant="outline" className="w-full">
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
              <Button variant="outline" className="w-full">
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
              <Button variant="outline" className="w-full">
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
    </div>
  );
}
