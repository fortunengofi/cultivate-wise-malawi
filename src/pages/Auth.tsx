import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!authLoading && user) navigate("/");
  }, [user, authLoading, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: displayName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("already") ? "Account already exists. Try signing in." : error.message);
    } else {
      toast.success("Welcome! Check your email to verify your account.");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("Invalid") ? "Wrong email or password" : error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background to-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl gradient-earth mx-auto flex items-center justify-center mb-3 shadow-card">
            <Leaf size={28} className="text-primary-foreground" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-foreground">Farm Link</h1>
          <p className="text-sm text-muted-foreground mt-1">Smart farming for Malawi</p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-5">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="signin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="signin-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="••••••••" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-earth text-primary-foreground border-0 font-bold">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name">Full name</Label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="signup-name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-9" placeholder="James Banda" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="signup-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Password (min 6 chars)</Label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="signup-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="••••••••" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-harvest text-accent-foreground border-0 font-bold">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Create Account"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone">
              {!otpSent ? (
                <form onSubmit={sendOtp} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone-name">Full name (optional)</Label>
                    <div className="relative">
                      <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input id="phone-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-9" placeholder="James Banda" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone-number">Phone number</Label>
                    <div className="relative">
                      <PhoneIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input id="phone-number" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" placeholder="+265 999 123 456" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">We send a 6-digit code by SMS. Standard rates may apply.</p>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full gradient-earth text-primary-foreground border-0 font-bold">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : "Send code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={verifyOtp} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone-otp">Verification code</Label>
                    <div className="relative">
                      <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input id="phone-otp" inputMode="numeric" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value)} className="pl-9 tracking-[0.4em]" placeholder="123456" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Sent to {normalizePhone(phone)}</p>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full gradient-harvest text-accent-foreground border-0 font-bold">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : "Verify & continue"}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full text-xs" onClick={() => { setOtpSent(false); setOtp(""); }}>
                    Change number / resend code
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link to="/" className="hover:text-primary">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;