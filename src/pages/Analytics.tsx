import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { parseISO, getDay } from "date-fns"; // Importation de fonctions fiables pour les dates

// Interfaces pour les données
interface Stats {
  totalPnL: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  totalTrades: number;
}

interface DailyWinRate {
    name: string;
    "Taux de réussite": number;
}

const Analytics = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<number[]>([]);
  const [dailyWinRateData, setDailyWinRateData] = useState<DailyWinRate[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return;
      setLoadingAnalytics(true);

      try {
        const { data: trades, error } = await supabase
          .from('trades')
          .select('pnl, date')
          .eq('user_id', user.id)
          .eq('status', 'Closed')
          .not('pnl', 'is', null)
          .order('date', { ascending: true });

        if (error) throw error;
        
        const weekdays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
        const initialDailyWinRate: DailyWinRate[] = weekdays.map(day => ({ name: day.substring(0, 3), "Taux de réussite": 0 }));
        
        if (trades && trades.length > 0) {
          const pnlValues = trades.map(t => t.pnl || 0);
          
          const winningTrades = pnlValues.filter(pnl => pnl > 0);
          const losingTrades = pnlValues.filter(pnl => pnl < 0);
          
          const totalPnL = pnlValues.reduce((sum, pnl) => sum + pnl, 0);
          const totalTrades = pnlValues.length;
          const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
          const avgWin = winningTrades.length > 0 ? winningTrades.reduce((a, b) => a + b, 0) / winningTrades.length : 0;
          const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((a, b) => a + b, 0) / losingTrades.length) : 0;
          const grossProfit = winningTrades.reduce((sum, pnl) => sum + pnl, 0);
          const grossLoss = Math.abs(losingTrades.reduce((sum, pnl) => sum + pnl, 0));
          const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0);

          setStats({ totalPnL, winRate, profitFactor, avgWin, avgLoss, totalTrades });

          const cumulativePnl = [0, ...pnlValues.map((sum => value => sum += value)(0))];
          setChartData(cumulativePnl);
          
          // CORRECTION : Calcul du taux de réussite par jour avec une méthode plus robuste
          const dailyStats: { [key: number]: { wins: number; total: number } } = { 1: { wins: 0, total: 0 }, 2: { wins: 0, total: 0 }, 3: { wins: 0, total: 0 }, 4: { wins: 0, total: 0 }, 5: { wins: 0, total: 0 } };
          trades.forEach(trade => {
            const tradeDate = parseISO(trade.date); // Utilisation de parseISO pour une lecture de date fiable
            const dayOfWeek = getDay(tradeDate);   // Utilisation de getDay (Dimanche=0, Lundi=1...)

            if (dailyStats[dayOfWeek]) { // On ne traite que les jours de semaine (Lundi à Vendredi)
                dailyStats[dayOfWeek].total++;
                if (trade.pnl > 0) {
                    dailyStats[dayOfWeek].wins++;
                }
            }
          });
          
          const finalWinRateData = initialDailyWinRate.map((dayData, index) => {
              const dayIndex = index + 1; // index 0 est Lundi (Lun)
              const stats = dailyStats[dayIndex];
              if(stats && stats.total > 0){
                  dayData["Taux de réussite"] = parseFloat(((stats.wins / stats.total) * 100).toFixed(1));
              }
              return dayData;
          });
          setDailyWinRateData(finalWinRateData);

        } else {
          setStats({ totalPnL: 0, winRate: 0, profitFactor: 0, avgWin: 0, avgLoss: 0, totalTrades: 0 });
          setChartData([]);
          setDailyWinRateData(initialDailyWinRate);
        }

      } catch (err) {
        console.error('Error fetching analytics:', err);
        toast({ title: "Erreur", description: "Impossible de charger les statistiques", variant: "destructive" });
      } finally {
        setLoadingAnalytics(false);
      }
    };

    if (user) {
      fetchAnalyticsData();
    }
  }, [user, toast]);

  if (loading || loadingAnalytics) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/tradecopilot" replace />;
  } 
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Analysez vos performances de trading</p>
          </div>
        </div>

        {stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="glass-card border-border/20"><CardContent className="p-6"><p className="text-sm text-muted-foreground mb-1">Total P&L Net</p><p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>{stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}</p></CardContent></Card>
            <Card className="glass-card border-border/20"><CardContent className="p-6"><p className="text-sm text-muted-foreground mb-1">Taux de Réussite</p><p className="text-2xl font-bold text-primary">{stats.winRate.toFixed(1)}%</p></CardContent></Card>
            <Card className="glass-card border-border/20"><CardContent className="p-6"><p className="text-sm text-muted-foreground mb-1">Profit Factor</p><p className="text-2xl font-bold">{stats.profitFactor.toFixed(2)}</p></CardContent></Card>
            <Card className="glass-card border-border/20"><CardContent className="p-6"><p className="text-sm text-muted-foreground mb-1">Gain / Perte Moyen</p><p className="text-xl font-bold"><span className="text-success">${stats.avgWin.toFixed(2)}</span> / <span className="text-destructive">${stats.avgLoss.toFixed(2)}</span></p></CardContent></Card>
            <Card className="glass-card border-border/20"><CardContent className="p-6"><p className="text-sm text-muted-foreground mb-1">Nombre de Trades</p><p className="text-2xl font-bold">{stats.totalTrades}</p></CardContent></Card>
          </div>
        )}
        
        <Card className="glass-card border-border/20">
          <CardHeader><CardTitle className="text-foreground">Courbe de P&L</CardTitle><CardDescription>Évolution de vos gains et pertes trade après trade</CardDescription></CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.map((pnl, index) => ({ name: index, pnl }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: "Nombre de trades", position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}/>
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    labelFormatter={(label) => `Trade #${label}`}
                    formatter={(value:number) => [`$${value.toFixed(2)}`, "P&L Cumulé"]}
                  />
                  <Line type="monotone" dataKey="pnl" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/20">
            <CardHeader><CardTitle className="text-foreground">Taux de Réussite par Jour</CardTitle><CardDescription>Analyse de la performance pour chaque jour de la semaine</CardDescription></CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyWinRateData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" domain={[0, 100]} />
                            <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} labelStyle={{ color: "hsl(var(--foreground))" }} formatter={(value: number, name) => [`${value}%`, name]} />
                            <Bar dataKey="Taux de réussite" radius={[4, 4, 0, 0]}>
                                {dailyWinRateData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry["Taux de réussite"] >= 50 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} />))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Analytics;
