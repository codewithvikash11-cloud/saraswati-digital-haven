import { useEffect, useState, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon, Video as VideoIcon, FolderOpen, Calendar, Info, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GalleryCategory {
  id: string;
  name: string;
  description: string | null;
}

interface GalleryItem {
  id: string;
  title: string | null;
  description: string | null;
  media_url: string;
  media_type: 'image' | 'video';
  category_id: string | null;
  created_at: string;
}

export default function Gallery() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const [categoriesResult, itemsResult] = await Promise.all([
        supabase
          .from('gallery_categories')
          .select('id, name, description')
          .order('name')
          .limit(100), // Add limit to prevent timeouts
        supabase
          .from('gallery_items')
          .select('id, title, description, media_url, media_type, category_id, created_at')
          .order('created_at', { ascending: false })
          .limit(50) // Add limit to prevent timeouts
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (itemsResult.error) throw itemsResult.error;

      setCategories(categoriesResult.data || []);
      setGalleryItems((itemsResult.data || []).map(item => ({
        ...item,
        media_type: item.media_type as 'image' | 'video'
      })));
    } catch (error) {
      console.error('Error fetching gallery data:', error);
      setError('Failed to load gallery. ' + (error as Error).message);
      
      // Retry logic (max 3 retries)
      if (retryCount < 3) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff
        setTimeout(() => fetchData(retryCount + 1), delay);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category_id === selectedCategory);

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Uncategorized";
  };
  
  const handleItemClick = (item: GalleryItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  if (loading && !galleryItems.length) {
    return (
      <Layout>
        <section className="section-padding bg-subtle-gradient">
          <div className="container-custom">
            <div className="animate-pulse">
              <div className="h-10 bg-muted rounded w-1/3 mx-auto mb-8"></div>
              <div className="h-4 bg-muted rounded w-1/4 mx-auto mb-12"></div>
              
              {/* Category tabs skeleton */}
              <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded-full w-24"></div>
                ))}
              </div>
              
              {/* Gallery items skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-48 bg-muted w-full"></div>
                    <div className="p-4">
                      <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-5/6 mt-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding bg-subtle-gradient">
        <div className="container-custom">
          <div className="text-center mb-12 fade-in">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
              School Gallery
            </h1>
            <p className="text-subtitle max-w-2xl mx-auto">
              Explore our collection of photos and videos showcasing school life, events, and achievements
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-8">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription className="flex items-center">
                  {error} 
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 h-6 px-2 text-xs"
                    onClick={() => fetchData()}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" /> Retry
                  </Button>
                </AlertDescription>
              </div>
            </Alert>
          )}

          {categories.length > 0 && (
            <div className="mb-8">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
                  <TabsTrigger value="all" className="flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">All</span>
                  </TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                      <FolderOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">{category.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <Card
                  key={item.id}
                  className="card-elevated hover-lift group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      {item.media_type === 'image' ? (
                        <div className="w-full h-48 bg-muted/20 flex items-center justify-center overflow-hidden">
                          <img
                            src={imageLoadError[item.id] ? '/placeholder-image.jpg' : item.media_url}
                            alt={item.title || 'Gallery image'}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${
                              imageLoadError[item.id] ? 'opacity-50' : 'group-hover:scale-105 transition-transform duration-300'
                            }`}
                            onError={() => setImageLoadError(prev => ({ ...prev, [item.id]: true }))}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg flex items-center justify-center relative group">
                          <VideoIcon className="h-12 w-12 text-primary" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg">
                            <Button variant="secondary" size="sm" className="pointer-events-none">
                              <VideoIcon className="h-4 w-4 mr-2" /> Play Video
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute top-2 left-2 flex flex-col space-y-1">
                        <Badge className="bg-primary/90 text-white text-xs">
                          {item.media_type === 'image' ? (
                            <ImageIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <VideoIcon className="h-3 w-3 mr-1" />
                          )}
                          {item.media_type}
                        </Badge>
                        {imageLoadError[item.id] && (
                          <Badge variant="outline" className="bg-background/80 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1 text-yellow-500" />
                            Image not available
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(item.category_id)}
                        </Badge>
                      </div>
                      
                      {item.title && (
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                      )}

                      {item.description && (
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 fade-in">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {selectedCategory === "all" ? "No Gallery Items Yet" : "No Items in This Category"}
              </h3>
              <p className="text-muted-foreground">
                {selectedCategory === "all" 
                  ? "We're preparing our gallery. Check back soon for photos and videos from school events!"
                  : "This category doesn't have any items yet. Check other categories or come back later."
                }
              </p>
            </div>
          )}
          
          {/* Item Detail Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-3xl">
              {selectedItem && (
                <>
                  <DialogHeader>
                    <DialogTitle>{selectedItem.title || 'Gallery Item'}</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                      {selectedItem.media_type === 'image' ? (
                        <img 
                          src={selectedItem.media_url} 
                          alt={selectedItem.title || 'Gallery item'} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.jpg';
                          }}
                        />
                      ) : (
                        <video 
                          src={selectedItem.media_url} 
                          controls 
                          autoPlay
                          className="w-full h-full"
                        />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {selectedItem.media_type === 'image' ? (
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
                        <Badge variant="outline">
                          {getCategoryName(selectedItem.category_id)}
                        </Badge>
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(selectedItem.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                      
                      {selectedItem.description && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium flex items-center">
                            <Info className="h-4 w-4 mr-1" /> Description
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {selectedItem.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </Layout>
  );
}
