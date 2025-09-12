import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { User, GraduationCap, Award, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StaffMember {
  id: string;
  name: string;
  position: string;
  qualifications: string | null;
  experience: string | null;
  photo_url: string | null;
  bio: string | null;
  is_director: boolean;
  display_order: number | null;
}

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('is_director', { ascending: false })
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching staff:', error);
      } else {
        setStaff(data || []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="section-padding bg-subtle-gradient">
          <div className="container-custom">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-12"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-6 space-y-4">
                    <div className="w-20 h-20 bg-muted rounded-full mx-auto"></div>
                    <div className="h-6 bg-muted rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
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
              Our Teaching Staff
            </h1>
            <p className="text-subtitle max-w-2xl mx-auto">
              Meet our dedicated educators who are committed to nurturing young minds and fostering academic excellence
            </p>
          </div>

          {staff.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((member, index) => (
                <Card
                  key={member.id}
                  className="card-elevated hover-lift group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-20 h-20 rounded-full object-cover mx-auto shadow-soft"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto shadow-soft">
                          <User className="h-10 w-10 text-primary" />
                        </div>
                      )}
                      {member.is_director && (
                        <Badge className="absolute -top-2 -right-2 bg-primary text-white">
                          Director
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    
                    <p className="text-primary font-medium mb-3">{member.position}</p>

                    {member.qualifications && (
                      <div className="flex items-center justify-center space-x-1 mb-3">
                        <GraduationCap className="h-4 w-4 text-secondary" />
                        <span className="text-sm text-muted-foreground">{member.qualifications}</span>
                      </div>
                    )}

                    {member.experience && (
                      <div className="flex items-center justify-center space-x-1 mb-3">
                        <Award className="h-4 w-4 text-secondary" />
                        <span className="text-sm text-muted-foreground">{member.experience}</span>
                      </div>
                    )}

                    {member.bio && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {member.bio}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 fade-in">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Staff Information Coming Soon</h3>
              <p className="text-muted-foreground">
                We're updating our staff profiles. Please check back later for detailed information about our teaching team.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
