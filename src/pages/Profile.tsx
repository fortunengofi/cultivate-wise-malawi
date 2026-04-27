import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, User as UserIcon, MapPin, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ display_name: "", phone: "", location: "", bio: "" });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            display_name: data.display_name || "",
            phone: data.phone || "",
            location: data.location || "",
            bio: data.bio || "",
          });
        }
        setLoading(false);
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(form)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  if (loading) {
    return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto">
      <PageHeader title="My Profile" subtitle="Tell other farmers about yourself" />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 sm:px-0 mt-6 space-y-4">
        <div className="bg-card rounded-xl p-5 shadow-card border border-border space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-14 h-14 rounded-full gradient-earth flex items-center justify-center text-primary-foreground font-bold text-xl">
              {(form.display_name?.[0] || user?.email?.[0] || "F").toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-foreground">{form.display_name || "Farmer"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label><UserIcon size={12} className="inline mr-1" /> Display name</Label>
            <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="James Banda" />
          </div>
          <div className="space-y-1.5">
            <Label><Phone size={12} className="inline mr-1" /> Phone (for buyers to reach you)</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+265 999 123 456" />
          </div>
          <div className="space-y-1.5">
            <Label><MapPin size={12} className="inline mr-1" /> Location / District</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Lilongwe" />
          </div>
          <div className="space-y-1.5">
            <Label><FileText size={12} className="inline mr-1" /> About your farm</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="I grow maize, groundnuts, and beans on 2 hectares..." rows={3} />
          </div>

          <Button onClick={save} disabled={saving} className="w-full gradient-earth text-primary-foreground border-0 font-bold">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} className="mr-2" /> Save Profile</>}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;