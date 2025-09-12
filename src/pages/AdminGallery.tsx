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
import { 
  Image, 
  Video, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  ArrowLeft,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  media_type: 'image' | 'video';
  media_url: string;
  category: string;
  created_at: string;
}

export default function AdminGallery() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_type: 'image' as 'image' | 'video',
    category: '',
    media_file: null as File | null
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }
    fetchItems();
  }, [isAdmin, navigate]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      setError('Failed to fetch gallery items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.media_file && !editingItem) {
      setError('Please select a media file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let mediaUrl = editingItem?.media_url;

      if (formData.media_file) {
        const fileExt = formData.media_file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, formData.media_file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
      }

      const itemData = {
        title: formData.title,
        description: formData.description,
        media_type: formData.media_type,
        media_url: mediaUrl,
        category: formData.category
      };

      if (editingItem) {
        const { error } = await supabase
          .from('gallery_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        setSuccess('Gallery item updated successfully');
      } else {
        const { error } = await supabase
          .from('gallery_items')
          .insert([itemData]);

        if (error) throw error;
        setSuccess('Gallery item added successfully');
      }

      fetchItems();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving gallery item:', error);
      setError('Failed to save gallery item');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('Gallery item deleted successfully');
      fetchItems();
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      setError('Failed to delete gallery item');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      media_type: 'image',
      category: '',
      media_file: null
    });
    setEditingItem(null);
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      media_type: item.media_type,
      category: item.category,
      media_file: null
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
              <h1 className="text-xl font-bold text-gradient">Gallery Management</h1>
              <p className="text-xs text-muted-foreground">Manage photos and videos</p>
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

        {/* Add Item Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Gallery Items ({items.length})</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Events, Sports, Academics"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="media_type">Media Type</Label>
                  <Select
                    value={formData.media_type}
                    onValueChange={(value: 'image' | 'video') => setFormData({ ...formData, media_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="media_file">Media File</Label>
                  <Input
                    id="media_file"
                    type="file"
                    accept={formData.media_type === 'image' ? 'image/*' : 'video/*'}
                    onChange={(e) => setFormData({ ...formData, media_file: e.target.files?.[0] || null })}
                    required={!editingItem}
                  />
                  {editingItem && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Leave empty to keep current media
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
                    {uploading ? 'Saving...' : editingItem ? 'Update' : 'Add'} Item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="card-elevated hover-lift group">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                {item.media_type === 'image' ? (
                  <img
                    src={item.media_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <video
                    src={item.media_url}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
                <div className="absolute top-2 right-2">
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{item.category}</span>
                  <span>{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No gallery items yet</h3>
            <p className="text-muted-foreground mb-4">Start by adding your first photo or video</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
