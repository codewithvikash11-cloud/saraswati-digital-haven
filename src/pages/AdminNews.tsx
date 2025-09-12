import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Newspaper, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Eye,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminNews() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    published: false
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }
    fetchArticles();
  }, [isAdmin, navigate]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching news articles:', error);
      setError('Failed to fetch news articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const articleData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      if (editingArticle) {
        const { error } = await supabase
          .from('news')
          .update(articleData)
          .eq('id', editingArticle.id);

        if (error) throw error;
        setSuccess('News article updated successfully');
      } else {
        const { error } = await supabase
          .from('news')
          .insert([articleData]);

        if (error) throw error;
        setSuccess('News article created successfully');
      }

      fetchArticles();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving news article:', error);
      setError('Failed to save news article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('News article deleted successfully');
      fetchArticles();
    } catch (error) {
      console.error('Error deleting news article:', error);
      setError('Failed to delete news article');
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      setSuccess(`Article ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      fetchArticles();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      setError('Failed to update publish status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      author: '',
      published: false
    });
    setEditingArticle(null);
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      author: article.author,
      published: article.published
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
              <h1 className="text-xl font-bold text-gradient">News Management</h1>
              <p className="text-xs text-muted-foreground">Manage news articles and announcements</p>
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

        {/* Add Article Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">News Articles ({articles.length})</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingArticle ? 'Edit News Article' : 'Add New News Article'}
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
                    placeholder="Enter article title"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    placeholder="Brief description of the article"
                  />
                </div>

                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                    placeholder="Author name"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                    required
                    placeholder="Write your article content here..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="published">Publish immediately</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : editingArticle ? 'Update' : 'Create'} Article
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {articles.map((article) => (
            <Card key={article.id} className="card-elevated hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{article.title}</h3>
                      <Badge variant={article.published ? "default" : "secondary"}>
                        {article.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>By {article.author}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(article.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(article)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={article.published ? "secondary" : "default"}
                      onClick={() => handleTogglePublish(article.id, article.published)}
                    >
                      {article.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No news articles yet</h3>
            <p className="text-muted-foreground mb-4">Start by creating your first news article</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Article
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
