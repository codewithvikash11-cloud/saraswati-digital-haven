import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Calendar,
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  student_name?: string;
  class_name?: string;
  achievement_date: string;
  image_url?: string;
  created_at: string;
}

export default function AdminAchievements() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    student_name: '',
    class_name: '',
    achievement_date: '',
    image_file: null as File | null
  });

  const categories = [
    'Academic Excellence',
    'Sports',
    'Arts & Culture',
    'Leadership',
    'Community Service',
    'Science & Technology',
    'Literature',
    'Mathematics',
    'Other'
  ];

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }
    fetchAchievements();
  }, [isAdmin, navigate]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('achievement_date', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setError('Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    try {
      let imageUrl = editingAchievement?.image_url;

      if (formData.image_file) {
        const fileExt = formData.image_file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `achievements/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, formData.image_file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const achievementData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        student_name: formData.student_name || null,
        class_name: formData.class_name || null,
        achievement_date: formData.achievement_date,
        image_url: imageUrl
      };

      if (editingAchievement) {
        const { error } = await supabase
          .from('achievements')
          .update(achievementData)
          .eq('id', editingAchievement.id);

        if (error) throw error;
        setSuccess('Achievement updated successfully');
      } else {
        const { error } = await supabase
          .from('achievements')
          .insert([achievementData]);

        if (error) throw error;
        setSuccess('Achievement added successfully');
      }

      fetchAchievements();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving achievement:', error);
      setError('Failed to save achievement');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('Achievement deleted successfully');
      fetchAchievements();
    } catch (error) {
      console.error('Error deleting achievement:', error);
      setError('Failed to delete achievement');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      student_name: '',
      class_name: '',
      achievement_date: '',
      image_file: null
    });
    setEditingAchievement(null);
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      student_name: achievement.student_name || '',
      class_name: achievement.class_name || '',
      achievement_date: achievement.achievement_date,
      image_file: null
    });
    setIsDialogOpen(true);
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
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gradient">Achievements Management</h1>
              <p className="text-xs text-muted-foreground">Manage student and school achievements</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Add Achievement Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Achievements ({achievements.length})</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Achievement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., First Place in Science Fair"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="achievement_date">Achievement Date</Label>
                    <Input
                      id="achievement_date"
                      type="date"
                      value={formData.achievement_date}
                      onChange={(e) => setFormData({ ...formData, achievement_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student_name">Student Name (Optional)</Label>
                    <Input
                      id="student_name"
                      value={formData.student_name}
                      onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                      placeholder="Leave empty for school achievement"
                    />
                  </div>
                  <div>
                    <Label htmlFor="class_name">Class (Optional)</Label>
                    <Input
                      id="class_name"
                      value={formData.class_name}
                      onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                      placeholder="e.g., Class 10A"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                    placeholder="Describe the achievement in detail..."
                  />
                </div>

                <div>
                  <Label htmlFor="image_file">Achievement Image (Optional)</Label>
                  <Input
                    id="image_file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image_file: e.target.files?.[0] || null })}
                  />
                  {editingAchievement && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Leave empty to keep current image
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Saving...' : editingAchievement ? 'Update' : 'Add'} Achievement
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className="card-elevated hover-lift group">
              {achievement.image_url && (
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img
                    src={achievement.image_url}
                    alt={achievement.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{achievement.title}</h3>
                    <Badge variant="secondary" className="mb-3">
                      {achievement.category}
                    </Badge>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleEdit(achievement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(achievement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{achievement.description}</p>
                
                <div className="space-y-2 text-sm">
                  {achievement.student_name && (
                    <div className="flex items-center text-muted-foreground">
                      <Award className="h-4 w-4 mr-2" />
                      {achievement.student_name}
                      {achievement.class_name && ` (${achievement.class_name})`}
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(achievement.achievement_date), 'MMM dd, yyyy')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {achievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No achievements yet</h3>
            <p className="text-muted-foreground mb-4">Start by adding your first achievement</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Achievement
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
