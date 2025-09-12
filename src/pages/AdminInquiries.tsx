import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  ArrowLeft,
  Eye,
  Check,
  Trash2,
  Phone,
  Calendar,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminInquiries() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }
    fetchInquiries();
  }, [isAdmin, navigate]);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setError('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      setSuccess('Inquiry marked as read');
      fetchInquiries();
    } catch (error) {
      console.error('Error marking inquiry as read:', error);
      setError('Failed to mark inquiry as read');
    }
  };

  const handleMarkAsUnread = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({ is_read: false })
        .eq('id', id);

      if (error) throw error;
      setSuccess('Inquiry marked as unread');
      fetchInquiries();
    } catch (error) {
      console.error('Error marking inquiry as unread:', error);
      setError('Failed to mark inquiry as unread');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('Inquiry deleted successfully');
      fetchInquiries();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      setError('Failed to delete inquiry');
    }
  };

  const unreadCount = inquiries.filter(inquiry => !inquiry.is_read).length;

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
              <h1 className="text-xl font-bold text-gradient">Contact Inquiries</h1>
              <p className="text-xs text-muted-foreground">Manage contact form submissions</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unreadCount} Unread
            </Badge>
          )}
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

        {/* Inquiries List */}
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card 
              key={inquiry.id} 
              className={`card-elevated hover-lift cursor-pointer transition-all ${
                !inquiry.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelectedInquiry(inquiry)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{inquiry.subject}</h3>
                      {!inquiry.is_read && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {inquiry.name}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {inquiry.email}
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {inquiry.phone}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(inquiry.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground line-clamp-2">{inquiry.message}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInquiry(inquiry);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant={inquiry.is_read ? "secondary" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        inquiry.is_read ? handleMarkAsUnread(inquiry.id) : handleMarkAsRead(inquiry.id);
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {inquiry.is_read ? "Mark Unread" : "Mark Read"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(inquiry.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {inquiries.length === 0 && (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No inquiries yet</h3>
            <p className="text-muted-foreground">Contact form submissions will appear here</p>
          </div>
        )}

        {/* Inquiry Detail Modal */}
        {selectedInquiry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{selectedInquiry.subject}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedInquiry(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="text-sm">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm">{selectedInquiry.email}</p>
                  </div>
                  {selectedInquiry.phone && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="text-sm">{selectedInquiry.phone}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                    <p className="text-sm">{format(new Date(selectedInquiry.created_at), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Message</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedInquiry(null)}
                  >
                    Close
                  </Button>
                  <Button
                    variant={selectedInquiry.is_read ? "secondary" : "default"}
                    onClick={() => {
                      selectedInquiry.is_read ? handleMarkAsUnread(selectedInquiry.id) : handleMarkAsRead(selectedInquiry.id);
                      setSelectedInquiry(null);
                    }}
                  >
                    {selectedInquiry.is_read ? "Mark as Unread" : "Mark as Read"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
