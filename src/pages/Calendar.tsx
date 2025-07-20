import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { endOfMonth, format, startOfMonth } from "date-fns";

interface DayData {
  pnl: number;
  trades: number;
}

const Calendar = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tradingData, setTradingData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTradesForMonth = async () => {
      if (!user) return;
      setLoading(true);

      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

      try {
        const { data: trades, error } = await supabase
          .from('trades')
          .select('date, pnl')
          .eq('user_id', user.id)
          .eq('status', 'Closed')
          .not('pnl', 'is', null)
          .gte('date', start)
          .lte('date', end);

        if (error) throw error;
        
        const monthlyData: Record<string, DayData> = {};
        trades.forEach(trade => {
            const dayKey = trade.date;
            if (!monthlyData[dayKey]) {
                monthlyData[dayKey] = { pnl: 0, trades: 0 };
            }
            monthlyData[dayKey].pnl += trade.pnl || 0;
            monthlyData[dayKey].trades++;
        });

        setTradingData(monthlyData);
      } catch (err) {
        console.error("Error fetching calendar data:", err);
        toast({ title: "Erreur", description: "Impossible de charger les données du calendrier.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    if (user) {
        fetchTradesForMonth();
    }
  }, [user, currentDate, toast]);
    
  if (!isAuthenticated) {
    return <Navigate to="/tradecopilot" replace />;
  }
    
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
      const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
      return day === 0 ? 6 : day - 1; // Lundi = 0, Dimanche = 6
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const calendarDays = Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} className="h-28 bg-transparent"></div>);
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = format(new Date(year, month, day), 'yyyy-MM-dd');
    const dayData = tradingData[dateKey];
    
    calendarDays.push(
      <div key={day} className={`h-28 border border-border/20 rounded-lg p-2 transition-colors flex flex-col ${dayData ? (dayData.pnl >= 0 ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30") : "bg-card/50 hover:bg-accent/50"}`}>
        <span className="text-sm font-medium text-foreground">{day}</span>
        {dayData && (
          <div className="mt-auto text-right">
            <div className={`text-sm font-bold ${dayData.pnl >= 0 ? "text-success" : "text-destructive"}`}>
              {dayData.pnl >= 0 ? "+" : ""}${dayData.pnl.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">{dayData.trades} trade{dayData.trades > 1 ? "s" : ""}</div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendrier de Trading</h1>
            <p className="text-muted-foreground">Visualisez vos performances quotidiennes</p>
          </div>
        </div>

        <Card className="glass-card border-border/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">{monthNames[month]} {year}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')} className="border-border"><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')} className="border-border"><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map(day => <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {loading ? Array.from({ length: 35 }).map((_, i) => <div key={i} className="h-28 bg-muted/50 rounded-lg animate-pulse"></div>) : calendarDays}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Calendar;