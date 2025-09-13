import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  ArrowLeft,
  Eye,
  AlertCircle,
  CheckCircle,
  FileType,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  media_type: 'image' | 'video';
  media_url: string;
  category_id: string | null;
  created_at: string;
}

interface GalleryCategory {
  id: string;
  name: string;
  description: string | null;
}

export default function AdminGallery() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_type: 'image' as 'image' | 'video',
    category_id: '',
    media_file: null as File | null
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsResult, categoriesResult] = await Promise.all([
        supabase
          .from('gallery_items')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('gallery_categories')
          .select('*')
          .order('name')
      ]);

      if (itemsResult.error) throw itemsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      
      setItems((itemsResult.data as GalleryItem[]) || []);
      setCategories(categoriesResult.data || []);
    } catch (error: any) {
      console.error('Error fetching gallery data:', error);
      toast.error('Failed to fetch gallery data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const fileType = file.type.split('/')[0];
    if (fileType !== 'image' && fileType !== 'video') {
      setError('Please select an image or video file');
      return;
    }
    
    // Update media type based on file
    const mediaType = fileType as 'image' | 'video';
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    setFormData(prev => ({
      ...prev,
      media_file: file,
      media_type: mediaType
    }));
    
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.media_file && !editingItem) {
      setError('Please select a media file');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      let mediaUrl = editingItem?.media_url;

      if (formData.media_file) {
        const fileExt = formData.media_file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `gallery/${fileName}`;
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 95) {
              clearInterval(progressInterval);
              return 95;
            }
            return prev + 5;
          });
        }, 100);

        const { error: uploadError, data } = await supabase.storage
          .from('media')
          .upload(filePath, formData.media_file, {
            cacheControl: '3600',
            upsert: false
          });

        clearInterval(progressInterval);
        setUploadProgress(100);

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
        category_id: formData.category_id || null
      };

      if (editingItem) {
        const { error } = await supabase
          .from('gallery_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Gallery item updated successfully');
      } else {
        const { error } = await supabase
          .from('gallery_items')
          .insert([itemData]);

        if (error) throw error;
        toast.success('Gallery item added successfully');
      }

      fetchData();
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving gallery item:', error);
      setError(error.message || 'Failed to save gallery item');
      toast.error('Failed to save gallery item');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      // Find the item to get its media URL
      const itemToDelete = items.find(item => item.id === id);
      
      // Delete from database
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Try to delete the file from storage if possible
      if (itemToDelete?.media_url) {
        try {
          const filePath = itemToDelete.media_url.split('/').pop();
          if (filePath) {
            await supabase.storage
              .from('media')
              .remove([`gallery/${filePath}`]);
          }
        } catch (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue even if storage deletion fails
        }
      }
      
      setItems(items.filter(item => item.id !== id));
      toast.success('Gallery item deleted successfully');
    } catch (error: any) {
      console.error('Error deleting gallery item:', error);
      setError('Failed to delete gallery item');
      toast.error('Failed to delete gallery item: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      media_type: 'image',
      category_id: '',
      media_file: null
    });
    setEditingItem(null);
    setError(null);
    setSuccess(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      media_type: item.media_type,
      category_id: item.category_id || '',
      media_file: null
    });
    setPreviewUrl(item.media_url);
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
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Add Item Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Gallery Items ({items.length})</h2>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category_id">Category</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Uncategorized</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Label htmlFor="media_file">{editingItem ? 'Replace Media (optional)' : 'Upload Media *'}</Label>
                      <Input
                        id="media_file"
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        required={!editingItem}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Media Preview</Label>
                    <div className="border rounded-md aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        formData.media_type === 'image' ? (
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <video 
                            src={previewUrl} 
                            controls 
                            className="max-w-full max-h-full"
                          />
                        )
                      ) : (
                        <div className="text-center text-gray-400 flex flex-col items-center">
                          <FileType className="h-12 w-12 mb-2" />
                          <span>No media selected</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      {formData.media_type === 'image' ? (
                        <>
                          <ImageIcon className="h-3 w-3 mr-1" />
                          Image
                        </>
                      ) : (
                        <>
                          <VideoIcon className="h-3 w-3 mr-1" />
                          Video
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Upload Progress</Label>
                      <span className="text-sm">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {editingItem ? 'Updating...' : 'Uploading...'}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {editingItem ? 'Update' : 'Add'} Item
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const categoryName = categories.find(c => c.id === item.category_id)?.name || 'Uncategorized';
            return (
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
                  <Badge className="absolute top-2 left-2 bg-primary/80 backdrop-blur-sm">
                    {item.media_type === 'image' ? (
                      <>
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Image
                      </>
                    ) : (
                      <>
                        <VideoIcon className="h-3 w-3 mr-1" />
                        Video
                      </>
                    )}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <Badge variant="outline" className="font-normal">{categoryName}</Badge>
                    <span>{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
