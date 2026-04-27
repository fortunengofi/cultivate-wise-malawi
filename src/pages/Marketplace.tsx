import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, MessageCircle, Plus, Loader2, Trash2, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from "@/components/PageHeader";
import marketplaceHero from "@/assets/marketplace-hero.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Listing {
  id: string;
  user_id: string;
  product: string;
  category: string;
  quantity: string;
  price: string;
  location: string;
  description: string | null;
  emoji: string;
  image_url: string | null;
  created_at: string;
}
interface ProfileLite { user_id: string; display_name: string | null; }

const categories = ["All", "Grains", "Legumes", "Vegetables", "Tubers", "Fruits", "Livestock"];
const emojiByCategory: Record<string, string> = {
  Grains: "🌽", Legumes: "🥜", Vegetables: "🥬", Tubers: "🍠", Fruits: "🍌", Livestock: "🐄",
};

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [posting, setPosting] = useState(false);
  const [newListing, setNewListing] = useState({ product: "", category: "", quantity: "", price: "", location: "", description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const loadListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    const list = (data || []) as Listing[];
    setListings(list);
    const userIds = [...new Set(list.map((l) => l.user_id))];
    if (userIds.length) {
      const { data: profs } = await supabase.from("profiles").select("user_id,display_name").in("user_id", userIds);
      const map: Record<string, ProfileLite> = {};
      (profs || []).forEach((p) => { map[p.user_id] = p; });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => { loadListings(); }, []);

  const filtered = listings.filter((l) => {
    const s = search.toLowerCase();
    const matchSearch = !s || l.product.toLowerCase().includes(s) || l.location.toLowerCase().includes(s);
    const matchCat = selectedCategory === "All" || l.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const post = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!newListing.product || !newListing.category || !newListing.quantity || !newListing.price || !newListing.location) {
      toast.error("Fill in all required fields"); return;
    }
    setPosting(true);
    let image_url: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("listing-images").upload(path, imageFile);
      if (upErr) { toast.error(upErr.message); setPosting(false); return; }
      image_url = supabase.storage.from("listing-images").getPublicUrl(path).data.publicUrl;
    }
    const { error } = await supabase.from("listings").insert({
      user_id: user.id,
      product: newListing.product.slice(0, 100),
      category: newListing.category,
      quantity: newListing.quantity.slice(0, 50),
      price: newListing.price.slice(0, 50),
      location: newListing.location.slice(0, 100),
      description: newListing.description.slice(0, 500) || null,
      emoji: emojiByCategory[newListing.category] || "🌾",
      image_url,
    });
    setPosting(false);
    if (error) { toast.error(error.message); return; }
    setNewListing({ product: "", category: "", quantity: "", price: "", location: "", description: "" });
    setImageFile(null); setImagePreview(null);
    setShowPostDialog(false);
    toast.success("Listing posted!");
    loadListings();
  };

  const removeListing = async (id: string) => {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Listing removed"); setListings(listings.filter((l) => l.id !== id)); }
  };

  const messageSeller = async (listing: Listing) => {
    if (!user) { navigate("/auth"); return; }
    if (listing.user_id === user.id) { toast.info("This is your own listing"); return; }
    const { data: existing } = await supabase
      .from("conversations").select("id")
      .eq("listing_id", listing.id).eq("buyer_id", user.id).maybeSingle();
    if (existing) { navigate(`/messages/${existing.id}`); return; }
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ listing_id: listing.id, buyer_id: user.id, seller_id: listing.user_id })
      .select("id").single();
    if (error) { toast.error(error.message); return; }
    navigate(`/messages/${created.id}`);
  };

  return (
    <div className="flex flex-col max-w-6xl mx-auto">
      <PageHeader title="Farmer's Market" subtitle="Buy and sell produce directly" image={marketplaceHero} />

      <div className="px-4 sm:px-0 -mt-4 relative z-10 space-y-4 pb-8">
        <div className="bg-card rounded-xl p-3 shadow-card border border-border space-y-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products, locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-background" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{cat}</button>
            ))}
          </div>
        </div>

        <Dialog open={showPostDialog} onOpenChange={(o) => { if (o && !user) { navigate("/auth"); return; } setShowPostDialog(o); }}>
          <DialogTrigger asChild>
            <Button className="w-full gradient-harvest text-accent-foreground border-0 font-bold">
              <Plus size={18} className="mr-2" /> Post Your Produce
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-sm">
            <DialogHeader><DialogTitle className="font-serif">Post a Listing</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Product name *" value={newListing.product} onChange={(e) => setNewListing({ ...newListing, product: e.target.value })} maxLength={100} />
              <Select value={newListing.category} onValueChange={(v) => setNewListing({ ...newListing, category: v })}>
                <SelectTrigger><SelectValue placeholder="Category *" /></SelectTrigger>
                <SelectContent>
                  {categories.filter((c) => c !== "All").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Quantity (e.g., 100 kg) *" value={newListing.quantity} onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })} maxLength={50} />
              <Input placeholder="Price (e.g., MK 500/kg) *" value={newListing.price} onChange={(e) => setNewListing({ ...newListing, price: e.target.value })} maxLength={50} />
              <Input placeholder="Location *" value={newListing.location} onChange={(e) => setNewListing({ ...newListing, location: e.target.value })} maxLength={100} />
              <Textarea placeholder="Description (optional)" value={newListing.description} onChange={(e) => setNewListing({ ...newListing, description: e.target.value })} maxLength={500} rows={2} />
              <div className="space-y-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-1 right-1 bg-background/90 rounded-full p-1">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full border-dashed">
                    <ImagePlus size={16} className="mr-2" /> Add Product Photo
                  </Button>
                )}
              </div>
              <Button onClick={post} disabled={posting} className="w-full gradient-earth text-primary-foreground border-0 font-bold">
                {posting ? <Loader2 className="animate-spin" size={16} /> : "Post Listing"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div>
          <p className="text-xs text-muted-foreground font-semibold mb-3">{filtered.length} listings available</p>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No listings yet. Be the first to post!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((listing, index) => {
                const seller = profiles[listing.user_id];
                const isMine = user?.id === listing.user_id;
                const posted = new Date(listing.created_at).toLocaleDateString();
                return (
                  <motion.div key={listing.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.3) }} className="bg-card rounded-xl p-4 shadow-card border border-border hover:shadow-elevated transition-shadow">
                    {listing.image_url && (
                      <img src={listing.image_url} alt={listing.product} className="w-full h-36 object-cover rounded-lg mb-3" loading="lazy" />
                    )}
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{listing.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-foreground text-sm truncate">{listing.product}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{listing.quantity} • {listing.category}</p>
                          </div>
                          <span className="text-sm font-bold text-secondary shrink-0">{listing.price}</span>
                        </div>
                        {listing.description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{listing.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin size={11} /> {listing.location}</span>
                          <span>• {posted}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
                          <span className="text-xs font-semibold text-foreground truncate">{seller?.display_name || "Farmer"}</span>
                          {isMine ? (
                            <button onClick={() => removeListing(listing.id)} className="flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
                              <Trash2 size={12} /> Remove
                            </button>
                          ) : (
                            <button onClick={() => messageSeller(listing)} className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors">
                              <MessageCircle size={12} /> Message
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;