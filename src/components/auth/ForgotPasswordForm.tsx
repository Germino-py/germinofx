import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const { sendPasswordResetEmail } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { success, error } = await sendPasswordResetEmail(email);
    if (success) {
      toast({
        title: "E-mail envoyé",
        description: "Veuillez consulter votre boîte de réception pour réinitialiser votre mot de passe.",
      });
    } else {
      toast({
        title: "Erreur",
        description: error || "Une erreur s'est produite.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-border/20">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">
            Mot de passe oublié ?
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="bg-input text-input-foreground border-border"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium"
            >
              Envoyer l'e-mail de réinitialisation
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};