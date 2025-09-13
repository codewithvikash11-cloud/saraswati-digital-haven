import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  event_date: string;
}

export default function CrawlerPost() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      // Start auto-sliding
      startAutoSlide();
    }

    return () => {
      // Clean up interval on component unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [events]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, event_date')
        .order('event_date', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Error fetching events for crawler:', error);
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error fetching events for crawler:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Auto slide every 3 seconds
    intervalRef.current = window.setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, 3000);
  };

  const handleIndicatorClick = (index: number) => {
    setActiveIndex(index);
    
    // Reset the auto-slide timer when manually changing slides
    startAutoSlide();
  };

  if (loading || events.length === 0) {
    return null; // Don't show anything while loading or if no events
  }

  return (
    <div className="bg-primary text-white py-2 sticky top-0 z-10 shadow-md">
      <div className="container-custom">
        <div className="relative overflow-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0 font-bold px-3 py-1 bg-secondary text-white rounded-md mr-4">
              LATEST UPDATES
            </div>
            
            <div className="relative overflow-hidden flex-grow">
              {events.map((event, index) => (
                <div 
                  key={event.id}
                  className={cn(
                    "transition-all duration-500 absolute w-full",
                    index === activeIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}
                >
                  <Link 
                    to={`/events/${event.id}`} 
                    className="flex items-center hover:underline"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium mr-2">
                      {format(new Date(event.event_date), 'MMM dd, yyyy')}:
                    </span>
                    <span className="truncate">{event.title}</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              ))}
            </div>
            
            <div className="flex-shrink-0 ml-4 space-x-1">
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleIndicatorClick(index)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    index === activeIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}