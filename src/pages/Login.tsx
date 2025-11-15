import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    accessCode: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just navigate to home - will integrate backend later
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-midnight-blue via-background to-deep-indigo">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Welcome */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-accent/20 to-cyan-accent/5 backdrop-blur-sm border border-cyan-accent/20">
            <Shield className="w-10 h-10 text-cyan-accent" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-soft-white">
              CLOAK
            </h1>
            <p className="text-grey-blue text-sm max-w-xs mx-auto leading-relaxed">
              Express Yourself. No Labels. No Judgment. Just You.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-blur rounded-3xl p-8 space-y-6 shadow-soft border border-soft-royal-blue/30">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-soft-white">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-grey-blue text-sm">
              {isSignUp
                ? "Join the community anonymously"
                : "Sign in to continue"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-soft-white">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose your handle"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="bg-deep-indigo/50 border-soft-royal-blue text-soft-white placeholder:text-grey-blue rounded-2xl h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-soft-white">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="bg-deep-indigo/50 border-soft-royal-blue text-soft-white placeholder:text-grey-blue rounded-2xl h-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-grey-blue hover:text-cyan-accent transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-soft-white">
                  School Access Code (Optional)
                </Label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Enter code if you have one"
                  value={formData.accessCode}
                  onChange={(e) =>
                    setFormData({ ...formData, accessCode: e.target.value })
                  }
                  className="bg-deep-indigo/50 border-soft-royal-blue text-soft-white placeholder:text-grey-blue rounded-2xl h-12"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-cyan-accent to-cyan-accent/80 hover:from-cyan-accent/90 hover:to-cyan-accent/70 text-midnight-blue font-semibold rounded-2xl shadow-glow"
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-grey-blue hover:text-cyan-accent transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-grey-blue text-xs">
          Your privacy is our priority. No emails, no tracking.
        </p>
      </div>
    </div>
  );
};

export default Login;
