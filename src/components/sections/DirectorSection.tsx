import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Quote } from "lucide-react";

interface Director {
  id: string;
  name: string;
  position: string;
  bio: string;
  photo_url: string | null;
  qualifications: string | null;
}

export default function DirectorSection() {
  const [director, setDirector] = useState<Director | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDirector();
  }, []);

  const fetchDirector = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('is_director', true)
        .order('display_order', { ascending: true })
        .limit(1);

      if (error) {
        console.error('Error fetching director:', error);
      } else if (data && data.length > 0) {
        setDirector(data[0] as unknown as Director);
      }
    } catch (error) {
      console.error('Error fetching director:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="section-padding bg-card">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-12"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="w-full h-80 bg-muted rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!director) {
    return (
      <section className="section-padding bg-card">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-gradient mb-8">Meet Our Director</h2>
          <div className="card-elevated p-8 max-w-md mx-auto">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Director information will be available soon. Please check back later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-card">
      <div className="container-custom">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
            Meet Our Director
          </h2>
          <p className="text-subtitle max-w-2xl mx-auto">
            Leading with vision, dedication, and a commitment to educational excellence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative slide-up">
            <div className="relative">
              {director.photo_url ? (
                <img
                  src={director.photo_url}
                  alt={director.name}
                  className="w-full h-96 object-cover rounded-2xl shadow-medium"
                  onError={(e) => {
                    console.error(`Failed to load director image: ${director.photo_url}`);
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center shadow-medium">
                  <User className="h-20 w-20 text-primary" />
                </div>
              )}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-soft">
                <Quote className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-6 fade-in">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {director.name}
              </h3>
              <p className="text-primary font-medium text-lg mb-4">{director.position}</p>
              {director.qualifications && (
                <p className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full inline-block">
                  {director.qualifications}
                </p>
              )}
            </div>

            <div className="relative">
              <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
              <p className="text-muted-foreground leading-relaxed pl-6">
                {director.bio || "Welcome to Saraswati School, where we believe in nurturing every child's potential through quality education, moral values, and holistic development. Our commitment is to create an environment where students can thrive academically, socially, and personally."}
              </p>
            </div>

            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground italic">
                "Education is the foundation upon which we build our future."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}