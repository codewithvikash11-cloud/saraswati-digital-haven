import { useEffect, useState, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { User, GraduationCap, Award, Mail, Star, BookOpen, Users, X } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
<<<<<<< HEAD
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Skeleton } from "@/components/ui/skeleton";
=======
>>>>>>> c1743d695eea39530dc7cda6db26b46b8493efe7

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
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    fetchStaff();
  }, []);
  
  const handleOpenProfile = (member: StaffMember) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };
  
  const filterStaffByTab = (staffList: StaffMember[]) => {
    if (activeTab === "all") return staffList;
    if (activeTab === "directors") return staffList.filter(member => member.is_director);
    if (activeTab === "teachers") return staffList.filter(member => !member.is_director);
    return staffList;
  };

  const fetchStaff = async () => {
    try {
      // Use a more optimized query with fewer fields initially
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, position, qualifications, experience, photo_url, is_director, display_order')
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
          
          {/* Staff Member Profile Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-3xl">
              {selectedMember && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl">{selectedMember.name}</DialogTitle>
                    <DialogDescription className="text-primary font-medium">
                      {selectedMember.position}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="text-center">
                      <div className="w-40 h-40 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 ring-4 ring-primary/10">
                        {selectedMember.photo_url ? (
<<<<<<< HEAD
                          <OptimizedImage
                            id={`staff-detail-${selectedMember.id}`}
                            src={selectedMember.photo_url}
                            alt={selectedMember.name}
                            className="w-full h-full"
                            priority={true}
=======
                          <img 
                            src={selectedMember.photo_url} 
                            alt={selectedMember.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(`Failed to load image: ${selectedMember.photo_url}`);
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
>>>>>>> c1743d695eea39530dc7cda6db26b46b8493efe7
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-20 w-20 text-primary" />
                          </div>
                        )}
                      </div>
                      
                      {selectedMember.is_director && (
                        <Badge className="mt-4 bg-primary text-white hover:bg-primary/90 border-none">
                          Director
                        </Badge>
                      )}
                      
                      {(selectedMember as StaffMember & { email?: string }).email && (
                        <div className="flex items-center justify-center mt-4 text-sm">
                          <Mail className="h-4 w-4 mr-2 text-primary" />
                          <a href={`mailto:${(selectedMember as StaffMember & { email?: string }).email}`} className="hover:underline">
{(selectedMember as StaffMember & { email?: string }).email}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <div className="md:col-span-2 space-y-4">
                      {selectedMember.bio && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Biography</h3>
                          <p className="text-muted-foreground">
                            {selectedMember.bio}
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        {selectedMember.qualifications && (
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-medium flex items-center text-primary mb-2">
                                <GraduationCap className="h-5 w-5 mr-2 text-blue-500" />
                                Qualifications
                              </h4>
                              <p>{selectedMember.qualifications}</p>
                            </CardContent>
                          </Card>
                        )}
                        
                        {selectedMember.experience && (
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-medium flex items-center text-primary mb-2">
                                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                                Experience
                              </h4>
                              <p>{selectedMember.experience} Years</p>
                            </CardContent>
                          </Card>
                        )}
                        
                        {(selectedMember as StaffMember & { specialization?: string }).specialization && (
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-medium flex items-center text-primary mb-2">
                                <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                                Specialization
                              </h4>
                              <p>{(selectedMember as StaffMember & { specialization?: string }).specialization}</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding bg-subtle-gradient">
        <div className="container-custom">
          <div className="text-center mb-16 fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl mb-6">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
              Our Teaching Staff
            </h1>
            <p className="text-subtitle max-w-2xl mx-auto mb-8">
              Meet our dedicated educators who are committed to nurturing young minds and fostering academic excellence
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Experienced Educators</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span>Subject Specialists</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-green-500" />
                <span>Certified Professionals</span>
              </div>
            </div>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Staff</TabsTrigger>
                <TabsTrigger value="directors">Directors</TabsTrigger>
                <TabsTrigger value="teachers">Teachers</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {staff.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterStaffByTab(staff).map((member, index) => (
                <Card
                  key={member.id}
                  className="card-elevated hover-lift group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleOpenProfile(member)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-6">
                      <div className="relative">
                        {member.photo_url ? (
                          <OptimizedImage
                            id={`staff-card-${member.id}`}
                            src={member.photo_url}
                            alt={member.name}
<<<<<<< HEAD
                            className="w-32 h-32 rounded-full mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 border-4 border-white"
=======
                            className="w-32 h-32 rounded-full object-cover mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 border-4 border-white"
                            onError={(e) => {
                              console.error(`Failed to load image: ${member.photo_url}`);
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
>>>>>>> c1743d695eea39530dc7cda6db26b46b8493efe7
                          />
                        ) : (
                          <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 border-4 border-white">
                            <User className="h-16 w-16 text-primary" />
                          </div>
                        )}
                        {member.is_director && (
                          <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-secondary text-white shadow-lg animate-pulse">
                            <Star className="h-3 w-3 mr-1" />
                            Director
                          </Badge>
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 scale-110"></div>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {member.name}
                    </h3>
                    
                    <p className="text-primary font-semibold mb-4 text-sm">{member.position}</p>

                    {member.qualifications && (
                      <div className="flex items-center justify-center space-x-2 mb-3 p-2 bg-primary/5 rounded-lg">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground font-medium">{member.qualifications}</span>
                      </div>
                    )}

                    {member.experience && (
                      <div className="flex items-center justify-center space-x-2 mb-4 p-2 bg-secondary/5 rounded-lg">
                        <Award className="h-4 w-4 text-secondary" />
                        <span className="text-sm text-muted-foreground font-medium">{member.experience}</span>
                      </div>
                    )}

                    {member.bio && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                        {member.bio}
                      </p>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-primary group-hover:text-white transition-all duration-300"
                    >
                      View Profile
                    </Button>
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

        {/* Staff Member Detail Modal */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    {selectedMember.photo_url ? (
                      <img
                        src={selectedMember.photo_url}
                        alt={selectedMember.name}
                        className="w-32 h-32 rounded-full object-cover mx-auto shadow-xl border-4 border-white"
                        onError={(e) => {
                          console.error(`Failed to load image: ${selectedMember.photo_url}`);
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-white">
                        <User className="h-16 w-16 text-primary" />
                      </div>
                    )}
                    {selectedMember.is_director && (
                      <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
                        <Star className="h-3 w-3 mr-1" />
                        Director
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-foreground mb-2">{selectedMember.name}</h2>
                  <p className="text-xl text-primary font-semibold mb-4">{selectedMember.position}</p>
                </div>

                <div className="space-y-4">
                  {selectedMember.qualifications && (
                    <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Qualifications</h4>
                        <p className="text-muted-foreground">{selectedMember.qualifications}</p>
                      </div>
                    </div>
                  )}

                  {selectedMember.experience && (
                    <div className="flex items-start space-x-3 p-4 bg-secondary/5 rounded-lg">
                      <Award className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Experience</h4>
                        <p className="text-muted-foreground">{selectedMember.experience}</p>
                      </div>
                    </div>
                  )}

                  {selectedMember.bio && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">About</h4>
                      <p className="text-muted-foreground leading-relaxed">{selectedMember.bio}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMember(null)}
                    className="px-8"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </Layout>
  );
}
