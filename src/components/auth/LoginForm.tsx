import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToRegister: () => void;
}

export const LoginForm = ({ onLogin, onSwitchToRegister }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-border/20">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">
            Trade<span className="text-primary">Copilot</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Connectez-vous à votre compte
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
            
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground">Mot de passe</Label>
                    <Link to="/tradecopilot/reset-password" className="text-sm text-primary hover:underline">
                        Mot de passe oublié?
                    </Link>
                </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-input text-input-foreground border-border pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium"
            >
              Se connecter
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <button
                onClick={onSwitchToRegister}
                className="text-primary hover:underline font-medium"
              >
                S'inscrire
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};