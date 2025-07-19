import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, TrendingDown, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Interface mise à jour pour inclure tous les champs du formulaire
interface PositionData {
  accountId: string;
  session: string;
  asset: string;
  direction: "Long" | "Short";
  entryPrice: number;
  slPips: number;
  tpPips: number;
  riskAmount: number;
  riskType: "dollar" | "percentage";
  accountBalance: number;
  strategy: string;
  timeframe: string;
  trend_h4: string;
  trend_m15: string;
  trend_m1: string;
}

export const PositionCalculator = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // État initial mis à jour pour inclure tous les champs
  const [positionData, setPositionData] = useState<PositionData>({
    accountId: "",
    session: "New York",
    asset: "GC",
    direction: "Long",
    entryPrice: 0,
    slPips: 0,
    tpPips: 0,  
    riskAmount: 0,
    riskType: "dollar",
    accountBalance: 10000,
    strategy: "BOS OB",
    timeframe: "M15",
    trend_h4: "Haussier",
    trend_m15: "Haussier",
    trend_m1: "Haussier",
  });

  const [calculatedData, setCalculatedData] = useState({
    positionSize: 0,
    riskRewardRatio: 0,
    slPrice: 0,
    tpPrice: 0,
    riskPercentage: 0
  });

  // Listes de données pour les menus déroulants
  const tradingSessions = [
    { value: "New York", label: "New York (NY)" },
    { value: "London", label: "London (LN)" },
    { value: "Asian", label: "Asian (AS)" }
  ];
  const assets = [
    { value: "GC", label: "Gold", pipValue: 10, pipSize: 0.1 },
    { value: "ES", label: "S&P 500", pipValue: 12.50, pipSize: 0.25 },
    { value: "NQ", label: "Nasdaq", pipValue: 5, pipSize: 0.25 },
    { value: "EURUSD", label: "EUR/USD", pipValue: 10, pipSize: 0.0001 },
    { value: "GBPUSD", label: "GBP/USD", pipValue: 10, pipSize: 0.0001 },
    { value: "USDJPY", label: "USD/JPY", pipValue: 9.26, pipSize: 0.01 },
  ];
  const strategies = [
    { value: "BOS OB", label: "BOS OB" }, { value: "BOS BB", label: "BOS BB" },
    { value: "CHOCH OB", label: "CHOCH OB" }, { value: "CHOCH BB", label: "CHOCH BB" }
  ];
  const timeframes = [
    { value: "M1", label: "M1" }, { value: "M5", label: "M5" }, { value: "M15", label: "M15" },
    { value: "H1", label: "H1" }, { value: "H4", label: "H4" }
  ];
  const trendOptions = [
    { value: "Haussier", label: "Haussier" }, { value: "Baissier", label: "Baissier" }, { value: "Range", label: "Range" }
  ];

  useEffect(() => {
    const calculatePosition = () => {
        if (!positionData.entryPrice || !positionData.slPips || !positionData.riskAmount || !positionData.accountBalance) {
            return;
        }
        const selectedAsset = assets.find(asset => asset.value === positionData.asset);
        if (!selectedAsset) return;
        const { pipValue, pipSize } = selectedAsset;
        const riskInDollars = positionData.riskType === "percentage" 
          ? (positionData.riskAmount / 100) * positionData.accountBalance
          : positionData.riskAmount;
        const positionSize = riskInDollars > 0 && positionData.slPips > 0 ? riskInDollars / (positionData.slPips * pipValue) : 0;
        const slPrice = positionData.direction === "Long" 
          ? positionData.entryPrice - (positionData.slPips * pipSize)
          : positionData.entryPrice + (positionData.slPips * pipSize);
        const tpPrice = positionData.tpPips > 0 ? (positionData.direction === "Long"
          ? positionData.entryPrice + (positionData.tpPips * pipSize)
          : positionData.entryPrice - (positionData.tpPips * pipSize)) : 0;
        const riskRewardRatio = positionData.slPips > 0 ? positionData.tpPips / positionData.slPips : 0;
        const riskPercentage = (riskInDollars / positionData.accountBalance) * 100;
        setCalculatedData({
          positionSize: parseFloat(positionSize.toFixed(2)),
          riskRewardRatio: parseFloat(riskRewardRatio.toFixed(2)),
          slPrice: parseFloat(slPrice.toFixed(5)),
          tpPrice: parseFloat(tpPrice.toFixed(5)),
          riskPercentage: parseFloat(riskPercentage.toFixed(2))
        });
    };
    calculatePosition();
  }, [positionData]);

  const handleSaveTrade = async () => {
    if (!user) return;
    if (!positionData.accountId || !positionData.session || !positionData.entryPrice || !calculatedData.positionSize) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs et calculer une position.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          asset: positionData.asset,
          direction: positionData.direction,
          entry_price: positionData.entryPrice,
          size: calculatedData.positionSize,
          session: positionData.session,
          status: 'Open',
          strategy: positionData.strategy,
          timeframe: positionData.timeframe,
          trend_h4: positionData.trend_h4,
          trend_m15: positionData.trend_m15,
          trend_m1: positionData.trend_m1,
        });

      if (error) throw error;
      toast({ title: "Trade planifié et enregistré !", description: "Vous pouvez le voir et le clôturer dans votre journal." });
      navigate('/journal');
    } catch (error) {
      console.error('Error saving trade:', error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer le trade.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calculateur de Position</h1>
          <p className="text-muted-foreground">Planifiez vos trades avec précision</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-border/20">
          <CardHeader><CardTitle className="text-foreground">Paramètres du Trade</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="accountId">ID Compte *</Label><Input id="accountId" value={positionData.accountId} onChange={(e) => setPositionData({...positionData, accountId: e.target.value})} placeholder="12345"/></div>
              <div><Label htmlFor="accountBalance">Balance *</Label><Input id="accountBalance" type="number" value={positionData.accountBalance || ""} onChange={(e) => setPositionData({...positionData, accountBalance: parseFloat(e.target.value) || 0})} placeholder="10000"/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="asset">Actif</Label><Select value={positionData.asset} onValueChange={(value) => setPositionData({...positionData, asset: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{assets.map((asset) => (<SelectItem key={asset.value} value={asset.value}>{asset.label}</SelectItem>))}</SelectContent></Select></div>
              <div><Label htmlFor="session">Session *</Label><Select value={positionData.session} onValueChange={(value) => setPositionData({...positionData, session: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{tradingSessions.map((session) => (<SelectItem key={session.value} value={session.value}>{session.label}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <div><Label htmlFor="direction">Direction</Label><Select value={positionData.direction} onValueChange={(value: "Long" | "Short") => setPositionData({...positionData, direction: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Long"><div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-success" />Long</div></SelectItem><SelectItem value="Short"><div className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-destructive" />Short</div></SelectItem></SelectContent></Select></div>
            <div><Label htmlFor="entryPrice">Prix d'entrée *</Label><Input id="entryPrice" type="number" step="any" value={positionData.entryPrice || ""} onChange={(e) => setPositionData({...positionData, entryPrice: parseFloat(e.target.value) || 0})}/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="slPips">SL (pips) *</Label><Input id="slPips" type="number" value={positionData.slPips || ""} onChange={(e) => setPositionData({...positionData, slPips: parseFloat(e.target.value) || 0})}/></div>
              <div><Label htmlFor="tpPips">TP (pips)</Label><Input id="tpPips" type="number" value={positionData.tpPips || ""} onChange={(e) => setPositionData({...positionData, tpPips: parseFloat(e.target.value) || 0})}/></div>
            </div>
            <div><Label htmlFor="riskAmount">Risque *</Label><div className="flex gap-2"><Input id="riskAmount" type="number" step="0.01" value={positionData.riskAmount || ""} onChange={(e) => setPositionData({...positionData, riskAmount: parseFloat(e.target.value) || 0})}/><Select value={positionData.riskType} onValueChange={(value: "dollar" | "percentage") => setPositionData({...positionData, riskType: value})}><SelectTrigger className="w-24"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dollar">$</SelectItem><SelectItem value="percentage">%</SelectItem></SelectContent></Select></div></div>
            
            <CardTitle className="text-foreground pt-4">Contexte Stratégique</CardTitle>
            <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="strategy">Stratégie *</Label><Select value={positionData.strategy} onValueChange={(value) => setPositionData({...positionData, strategy: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{strategies.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent></Select></div>
                <div><Label htmlFor="timeframe">Timeframe *</Label><Select value={positionData.timeframe} onValueChange={(value) => setPositionData({...positionData, timeframe: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{timeframes.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <div>
                <Label>Alignement des Tendances</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                    <div><Label htmlFor="trend_h4" className="text-sm">H4</Label><Select value={positionData.trend_h4} onValueChange={(value) => setPositionData({...positionData, trend_h4: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{trendOptions.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent></Select></div>
                    <div><Label htmlFor="trend_m15" className="text-sm">M15</Label><Select value={positionData.trend_m15} onValueChange={(value) => setPositionData({...positionData, trend_m15: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{trendOptions.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent></Select></div>
                    <div><Label htmlFor="trend_m1" className="text-sm">M1</Label><Select value={positionData.trend_m1} onValueChange={(value) => setPositionData({...positionData, trend_m1: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{trendOptions.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent></Select></div>
                </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
            <Card className="glass-card border-border/20">
                <CardHeader><CardTitle>Taille de Position Requise</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-bold text-primary text-center">{calculatedData.positionSize} lots</p></CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
                <Card className="glass-card border-border/20"><CardHeader><CardTitle>Risque</CardTitle></CardHeader><CardContent className="space-y-2"><p className="font-bold text-destructive">{positionData.slPips} pips / ${((calculatedData.riskPercentage / 100) * positionData.accountBalance).toFixed(2)} / {calculatedData.riskPercentage}%</p><p className="text-sm text-muted-foreground">Prix SL : {calculatedData.slPrice}</p></CardContent></Card>
                <Card className="glass-card border-border/20"><CardHeader><CardTitle>Récompense</CardTitle></CardHeader><CardContent className="space-y-2"><p className="font-bold text-success">{positionData.tpPips} pips / ${(((calculatedData.riskPercentage / 100) * positionData.accountBalance) * calculatedData.riskRewardRatio).toFixed(2)} / {(calculatedData.riskPercentage * calculatedData.riskRewardRatio).toFixed(2)}%</p><p className="text-sm text-muted-foreground">Prix TP : {calculatedData.tpPrice}</p></CardContent></Card>
            </div>
            <Card className="glass-card border-border/20"><CardHeader><CardTitle>Ratio Risque/Récompense</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-center">1:{calculatedData.riskRewardRatio}</p></CardContent></Card>
            <Button onClick={handleSaveTrade} disabled={isLoading} className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Enregistrement..." : "Enregistrer et Aller au Journal"}
            </Button>
        </div>
      </div>
    </div>
  );
};
