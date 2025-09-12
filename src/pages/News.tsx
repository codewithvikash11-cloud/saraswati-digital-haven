import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, Calendar, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching news:', error);
      } else {
        setNews(data || []);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const featuredNews = news.filter(item => item.is_featured);
  const regularNews = news.filter(item => !item.is_featured);

  if (loading) {
    return (
      <Layout>
        <section className="section-padding bg-subtle-gradient">
          <div className="container-custom">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-12"></div>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-6 space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
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
              School News & Announcements
            </h1>
            <p className="text-subtitle max-w-2xl mx-auto">
              Stay informed with the latest news, announcements, and updates from Saraswati School
            </p>
          </div>

          {/* Featured News */}
          {featuredNews.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center">
                <Star className="h-6 w-6 text-primary mr-3" />
                Featured News
              </h2>
              <div className="space-y-6">
                {featuredNews.map((item, index) => (
                  <Card
                    key={item.id}
                    className="card-elevated hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className="bg-primary text-white">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Featured
                            </Badge>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-foreground mb-3 hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      
                      {item.excerpt && (
                        <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                          {item.excerpt}
                        </p>
                      )}
                      
                      <div className="prose prose-sm max-w-none text-muted-foreground">
                        <div dangerouslySetInnerHTML={{ __html: item.content }} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular News */}
          {regularNews.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center">
                <Newspaper className="h-6 w-6 text-primary mr-3" />
                Latest News
              </h2>
              <div className="space-y-6">
                {regularNews.map((item, index) => (
                  <Card
                    key={item.id}
                    className="card-elevated hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-3 hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      
                      {item.excerpt && (
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {item.excerpt}
                        </p>
                      )}
                      
                      <div className="prose prose-sm max-w-none text-muted-foreground">
                        <div dangerouslySetInnerHTML={{ __html: item.content }} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {news.length === 0 && (
            <div className="text-center py-12 fade-in">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Newspaper className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No News Yet</h3>
              <p className="text-muted-foreground">
                We're preparing exciting news and announcements. Check back soon for updates!
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
