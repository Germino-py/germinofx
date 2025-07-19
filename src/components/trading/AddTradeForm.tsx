import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Upload, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface TradeFormData {
  asset: string;
  direction: "Long" | "Short";
  entryPrice: number;
  size: number;
  date: Date;
  session: string;
  strategy: string;
  timeframe: string;
  trend_h4: string;
  trend_m15: string;
  trend_m1: string;
  screenshot?: File;
}

export const AddTradeForm = ({ onTradeAdded }: { onTradeAdded?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<TradeFormData>({
    asset: "EURUSD",
    direction: "Long",
    entryPrice: 0,
    size: 0,
    date: new Date(),
    session: "",
    strategy: "",
    timeframe: "",
    trend_h4: "",
    trend_m15: "",
    trend_m1: ""
  });

  const strategies = [ { value: "BOS OB", label: "BOS OB" }, { value: "BOS BB", label: "BOS BB" }, { value: "CHOCH OB", label: "CHOCH OB" }, { value: "CHOCH BB", label: "CHOCH BB" } ];
  const timeframes = [ { value: "M1", label: "M1" }, { value: "M5", label: "M5" }, { value: "M15", label: "M15" }, { value: "H1", label: "H1" }, { value: "H4", label: "H4" } ];
  const tradingSessions = [ { value: "New York", label: "New York (NY)" }, { value: "London", label: "London (LN)" }, { value: "Asian", label: "Asian (AS)" } ];
  const trendOptions = [ { value: "Haussier", label: "Haussier" }, { value: "Baissier", label: "Baissier" }, { value: "Range", label: "Range" } ];
  const assets = [ { value: "EURUSD", label: "EUR/USD" }, { value: "GBPUSD", label: "GBP/USD" }, { value: "USDJPY", label: "USD/JPY" }, { value: "AUDUSD", label: "AUD/USD" }, { value: "USDCAD", label: "USD/CAD" }, { value: "GC", label: "Gold" }, { value: "ES", label: "S&P 500" }, { value: "NQ", label: "Nasdaq" } ];

  const uploadScreenshot = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('trade-screenshots').upload(fileName, file);
    if (error) { console.error('Error uploading screenshot:', error); return null; }
    const { data: { publicUrl } } = supabase.storage.from('trade-screenshots').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.asset || !formData.entryPrice || !formData.size || !formData.session || !formData.strategy || !formData.timeframe || !formData.date) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      let screenshotUrl = null;
      if (formData.screenshot) {
        screenshotUrl = await uploadScreenshot(formData.screenshot);
      }
      const { error } = await supabase.from('trades').insert({
        user_id: user.id,
        asset: formData.asset,
        direction: formData.direction,
        entry_price: formData.entryPrice,
        size: formData.size,
        date: format(formData.date, 'yyyy-MM-dd'),
        session: formData.session,
        strategy: formData.strategy,
        timeframe: formData.timeframe,
        trend_h4: formData.trend_h4 || null,
        trend_m15: formData.trend_m15 || null,
        trend_m1: formData.trend_m1 || null,
        screenshot_url: screenshotUrl,
        status: 'Open'
      });
      if (error) throw error;
      toast({ title: "Trade ajouté", description: "Votre trade a été enregistré avec succès" });
      setFormData({ asset: "EURUSD", direction: "Long", entryPrice: 0, size: 0, date: new Date(), session: "", strategy: "", timeframe: "", trend_h4: "", trend_m15: "", trend_m1: "" });
      setIsOpen(false);
      onTradeAdded?.();
    } catch (error) {
      console.error('Error adding trade:', error);
      toast({ title: "Erreur", description: "Impossible d'ajouter le trade", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button className="bg-primary hover:bg-primary-hover"><Plus className="w-4 h-4 mr-2" />Ajouter un Trade</Button></DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader><DialogTitle>Ajouter un Nouveau Trade</DialogTitle><DialogDescription>Enregistrez un nouveau trade avec tous les détails d'analyse</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="date">Date d'entrée *</Label>
              <Popover>
                <PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formData.date ? format(formData.date, "PPP", { locale: fr }) : <span>Choisissez une date</span>}</Button></PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card"><Calendar mode="single" selected={formData.date} onSelect={(date) => setFormData({ ...formData, date: date || new Date() })} initialFocus /></PopoverContent>
              </Popover>
            </div>
            <div><Label htmlFor="asset">Actif *</Label><Select value={formData.asset} onValueChange={(value) => setFormData({...formData, asset: value})}><SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger><SelectContent>{assets.map((asset) => (<SelectItem key={asset.value} value={asset.value}>{asset.label}</SelectItem>))}</SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="direction">Direction *</Label><Select value={formData.direction} onValueChange={(value: "Long" | "Short") => setFormData({...formData, direction: value})}><SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Long">Long</SelectItem><SelectItem value="Short">Short</SelectItem></SelectContent></Select></div>
            <div><Label htmlFor="entryPrice">Prix d'entrée *</Label><Input id="entryPrice" type="number" step="0.00001" value={formData.entryPrice || ""} onChange={(e) => setFormData({...formData, entryPrice: parseFloat(e.target.value) || 0})} placeholder="1.1000" className="bg-input border-border" /></div>
          </div>
          <div><Label htmlFor="size">Taille (lots) *</Label><Input id="size" type="number" step="0.01" value={formData.size || ""} onChange={(e) => setFormData({...formData, size: parseFloat(e.target.value) || 0})} placeholder="0.5" className="bg-input border-border" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="session">Session *</Label><Select value={formData.session} onValueChange={(value) => setFormData({...formData, session: value})}><SelectTrigger className="bg-input border-border"><SelectValue placeholder="Sélectionner une session" /></SelectTrigger><SelectContent>{tradingSessions.map((session) => (<SelectItem key={session.value} value={session.value}>{session.label}</SelectItem>))}</SelectContent></Select></div>
            <div><Label htmlFor="strategy">Stratégie *</Label><Select value={formData.strategy} onValueChange={(value) => setFormData({...formData, strategy: value})}><SelectTrigger className="bg-input border-border"><SelectValue placeholder="Sélectionner une stratégie" /></SelectTrigger><SelectContent>{strategies.map((strategy) => (<SelectItem key={strategy.value} value={strategy.value}>{strategy.label}</SelectItem>))}</SelectContent></Select></div>
          </div>
          <div><Label htmlFor="timeframe">Timeframe *</Label><Select value={formData.timeframe} onValueChange={(value) => setFormData({...formData, timeframe: value})}><SelectTrigger className="bg-input border-border"><SelectValue placeholder="Sélectionner un timeframe" /></SelectTrigger><SelectContent>{timeframes.map((tf) => (<SelectItem key={tf.value} value={tf.value}>{tf.label}</SelectItem>))}</SelectContent></Select></div>
          <div><Label>Alignement des Tendances</Label><div className="grid grid-cols-3 gap-4 mt-2">
              <div><Label htmlFor="trend_h4" className="text-sm">H4</Label><Select value={formData.trend_h4} onValueChange={(value) => setFormData({...formData, trend_h4: value})}><SelectTrigger className="bg-input border-border"><SelectValue placeholder="H4" /></SelectTrigger><SelectContent>{trendOptions.map((trend) => (<SelectItem key={trend.value} value={trend.value}>{trend.label}</SelectItem>))}</SelectContent></Select></div>
              <div><Label htmlFor="trend_m15" className="text-sm">M15</Label><Select value={formData.trend_m15} onValueChange={(value) => setFormData({...formData, trend_m15: value})}><SelectTrigger className="bg-input border-border"><SelectValue placeholder="M15" /></SelectTrigger><SelectContent>{trendOptions.map((trend) => (<SelectItem key={trend.value} value={trend.value}>{trend.label}</SelectItem>))}</SelectContent></Select></div>
              <div><Label htmlFor="trend_m1" className="text-sm">M1</Label><Select value={formData.trend_m1} onValueChange={(value) => setFormData({...formData, trend_m1: value})}><SelectTrigger className="bg-input border-border"><SelectValue placeholder="M1" /></SelectTrigger><SelectContent>{trendOptions.map((trend) => (<SelectItem key={trend.value} value={trend.value}>{trend.label}</SelectItem>))}</SelectContent></Select></div>
          </div></div>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full bg-primary hover:bg-primary-hover">{isLoading ? "Enregistrement..." : "Enregistrer le Trade"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};