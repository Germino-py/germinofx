import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AddTradeForm } from "@/components/trading/AddTradeForm";

interface Trade {
  id: string;
  created_at: string;
  date: string; // Ajout de la date manuelle à l'interface
  asset: string;
  direction: "Long" | "Short";
  size: number;
  pnl?: number;
  status: "Open" | "Closed";
  session: string;
  strategy?: string;
  timeframe?: string;
  trend_h4?: string;
  trend_m15?: string;
  trend_m1?: string;
  screenshot_url?: string;
}

const Journal = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(true);
  const [closeTradeData, setCloseTradeData] = useState<{pnl: string; screenshot: File | null}>({ pnl: "", screenshot: null });
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTrades = async () => {
    if (!user) return;
    setLoadingTrades(true);
    try {
      const { data, error } = await supabase.from('trades').select('*').eq('user_id', user.id).order('date', { ascending: false });
      if (error) throw error;
      setTrades(
        (data || []).map((trade: any) => ({
          ...trade,
          direction: trade.direction === "Long" ? "Long" : "Short",
        }))
      );
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les trades", variant: "destructive" });
    } finally {
      setLoadingTrades(false);
    }
  };

  useEffect(() => {
    if (user) { fetchTrades(); }
  }, [user]);

  const handleCloseTrade = async () => {
    if (!selectedTradeId || !closeTradeData.pnl || !user) {
      return toast({ title: "Erreur", description: "Veuillez entrer le P&L", variant: "destructive" });
    }
    try {
      const tradeToUpdate = trades.find(t => t.id === selectedTradeId);
      if (!tradeToUpdate) return;
      let screenshotUrl = tradeToUpdate.screenshot_url || null;
      if (closeTradeData.screenshot) {
        const file = closeTradeData.screenshot;
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('trade-screenshots').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('trade-screenshots').getPublicUrl(fileName);
        screenshotUrl = urlData.publicUrl;
      }
      const { error } = await supabase.from('trades').update({ status: 'Closed', pnl: parseFloat(closeTradeData.pnl), screenshot_url: screenshotUrl }).eq('id', selectedTradeId);
      if (error) throw error;
      toast({ title: "Trade clôturé", description: "Le journal a été mis à jour." });
      fetchTrades(); 
      setIsCloseModalOpen(false);
      setCloseTradeData({ pnl: "", screenshot: null });
      setSelectedTradeId(null);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de clôturer le trade", variant: "destructive" });
    }
  };
  
  if (loading) { return <div className="min-h-screen flex items-center justify-center">Chargement...</div>; }
  if (!isAuthenticated) { return <Navigate to="/" replace />; }

  const renderTrend = (trend?: string) => {
    if (!trend) return <span className="text-muted-foreground">-</span>;
    if (trend === 'Haussier') return <span className="text-success">📈</span>;
    if (trend === 'Baissier') return <span className="text-destructive">📉</span>;
    return <span className="text-primary">↔️</span>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Journal de Trading</h1>
                    <p className="text-muted-foreground">Gérez et analysez vos trades</p>
                </div>
            </div>
            <AddTradeForm onTradeAdded={fetchTrades} />
        </div>
        <Card className="glass-card border-border/20">
            <CardHeader><CardTitle className="text-foreground">Historique des Trades</CardTitle></CardHeader>
            <CardContent className="p-4">
                <Table>
                    <TableHeader><TableRow>
                        <TableHead>Date</TableHead><TableHead>Actif</TableHead><TableHead>Direction</TableHead>
                        <TableHead>Stratégie</TableHead><TableHead>Alignement TF</TableHead>
                        <TableHead>P&L</TableHead><TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {loadingTrades ? (
                            <TableRow><TableCell colSpan={8} className="text-center h-24">Chargement...</TableCell></TableRow>
                        ) : trades.length === 0 ? (
                            <TableRow><TableCell colSpan={8} className="text-center h-24">Aucun trade enregistré.</TableCell></TableRow>
                        ) : (
                            trades.map((trade) => (
                            <TableRow key={trade.id}>
                                <TableCell>{new Date(trade.date + 'T00:00:00').toLocaleDateString('fr-FR')}</TableCell>
                                <TableCell className="font-medium">{trade.asset}</TableCell>
                                <TableCell><div className={`flex items-center gap-1 ${trade.direction === "Long" ? "text-success" : "text-destructive"}`}>{trade.direction}</div></TableCell>
                                <TableCell>{trade.strategy} / {trade.timeframe}</TableCell>
                                <TableCell><div className="flex items-center gap-3 font-mono text-xs">
                                    <span>H4:{renderTrend(trade.trend_h4)}</span>
                                    <span>M15:{renderTrend(trade.trend_m15)}</span>
                                    <span>M1:{renderTrend(trade.trend_m1)}</span>
                                </div></TableCell>
                                <TableCell>{trade.pnl !== null && trade.pnl !== undefined ? (<span className={trade.pnl >= 0 ? "text-success" : "text-destructive"}>{trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}</span>) : "-"}</TableCell>
                                <TableCell><Badge variant={trade.status === "Open" ? "secondary" : "default"}>{trade.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                    {trade.screenshot_url && (<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedImage(trade.screenshot_url)}><Eye className="w-4 h-4" /></Button>)}
                                    {trade.status === "Open" && (
                                        <Dialog open={isCloseModalOpen && selectedTradeId === trade.id} onOpenChange={(open) => { if (!open) setSelectedTradeId(null); setIsCloseModalOpen(open); }}>
                                        <DialogTrigger asChild><Button size="sm" variant="outline" onClick={() => { setSelectedTradeId(trade.id); setIsCloseModalOpen(true); }}>Clôturer</Button></DialogTrigger>
                                        <DialogContent className="bg-card border-border">
                                            <DialogHeader><DialogTitle>Clôturer le Trade #{trade.id.substring(0, 8)}</DialogTitle></DialogHeader>
                                            <div className="py-4 space-y-4">
                                                <div><Label htmlFor="pnl">P&L Net ($)</Label><Input id="pnl" type="number" step="0.01" onChange={(e) => setCloseTradeData(d => ({...d, pnl: e.target.value}))} /></div>
                                                <div><Label htmlFor="screenshot">Capture d'écran</Label><Input id="screenshot" type="file" accept="image/*" onChange={(e) => setCloseTradeData(d => ({...d, screenshot: e.target.files?.[0] || null}))} /></div>
                                                <Button onClick={handleCloseTrade} className="w-full">Confirmer</Button>
                                            </div>
                                        </DialogContent>
                                        </Dialog>
                                    )}
                                    </div>
                                </TableCell>
                            </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2"><img src={selectedImage || ''} alt="Capture d'écran du trade" className="w-full h-auto rounded-lg" /></DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Journal;