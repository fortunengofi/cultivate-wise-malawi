import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Phone, MessageCircle, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from "@/components/PageHeader";
import marketplaceHero from "@/assets/marketplace-hero.jpg";

interface Listing {
  id: string;
  product: string;
  category: string;
  quantity: string;
  price: string;
  location: string;
  farmer: string;
  phone: string;
  posted: string;
  emoji: string;
}

const initialListings: Listing[] = [
  { id: "1", product: "Maize (Chimanga)", category: "Grains", quantity: "500 kg", price: "MK 250/kg", location: "Lilongwe", farmer: "James Banda", phone: "+265 999 123 456", posted: "2 hours ago", emoji: "🌽" },
  { id: "2", product: "Groundnuts (Mtedza)", category: "Legumes", quantity: "200 kg", price: "MK 1,500/kg", location: "Mzuzu", farmer: "Grace Phiri", phone: "+265 888 234 567", posted: "5 hours ago", emoji: "🥜" },
  { id: "3", product: "Fresh Tomatoes", category: "Vegetables", quantity: "100 crates", price: "MK 8,000/crate", location: "Blantyre", farmer: "Peter Mkwezalamba", phone: "+265 999 345 678", posted: "1 day ago", emoji: "🍅" },
  { id: "4", product: "Sweet Potatoes (Mbatata)", category: "Tubers", quantity: "300 kg", price: "MK 400/kg", location: "Zomba", farmer: "Mary Chirwa", phone: "+265 888 456 789", posted: "1 day ago", emoji: "🍠" },
  { id: "5", product: "Dried Beans (Nyemba)", category: "Legumes", quantity: "150 kg", price: "MK 2,000/kg", location: "Mangochi", farmer: "John Kamanga", phone: "+265 999 567 890", posted: "2 days ago", emoji: "🫘" },
  { id: "6", product: "Rice (Mpunga)", category: "Grains", quantity: "400 kg", price: "MK 1,200/kg", location: "Salima", farmer: "Esther Njobvu", phone: "+265 888 678 901", posted: "3 days ago", emoji: "🍚" },
];

const categories = ["All", "Grains", "Legumes", "Vegetables", "Tubers", "Fruits", "Livestock"];

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [listings] = useState<Listing[]>(initialListings);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [newListing, setNewListing] = useState({ product: "", category: "", quantity: "", price: "", location: "", phone: "" });

  const filteredListings = listings.filter((l) => {
    const matchesSearch = l.product.toLowerCase().includes(search.toLowerCase()) ||
      l.farmer.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || l.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Farmer's Market"
        subtitle="Buy and sell produce directly"
        image={marketplaceHero}
      />

      <div className="px-4 -mt-4 relative z-10 space-y-4">
        {/* Search & Filter */}
        <div className="bg-card rounded-xl p-3 shadow-card border border-border space-y-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products, farmers, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Post Listing Button */}
        <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
          <DialogTrigger asChild>
            <Button className="w-full gradient-harvest text-accent-foreground border-0 font-bold">
              <Plus size={18} className="mr-2" />
              Post Your Produce
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif">Post a Listing</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Product name" value={newListing.product} onChange={(e) => setNewListing({ ...newListing, product: e.target.value })} />
              <Select value={newListing.category} onValueChange={(v) => setNewListing({ ...newListing, category: v })}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c !== "All").map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Quantity (e.g., 100 kg)" value={newListing.quantity} onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })} />
              <Input placeholder="Price (e.g., MK 500/kg)" value={newListing.price} onChange={(e) => setNewListing({ ...newListing, price: e.target.value })} />
              <Input placeholder="Location" value={newListing.location} onChange={(e) => setNewListing({ ...newListing, location: e.target.value })} />
              <Input placeholder="Phone number" value={newListing.phone} onChange={(e) => setNewListing({ ...newListing, phone: e.target.value })} />
              <Button onClick={() => setShowPostDialog(false)} className="w-full gradient-earth text-primary-foreground border-0 font-bold">
                Post Listing
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Listings */}
        <div className="space-y-3 pb-6">
          <p className="text-xs text-muted-foreground font-semibold">{filteredListings.length} listings available</p>
          {filteredListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="bg-card rounded-xl p-4 shadow-card border border-border"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{listing.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{listing.product}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{listing.quantity} • {listing.category}</p>
                    </div>
                    <span className="text-sm font-bold text-secondary shrink-0">{listing.price}</span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {listing.location}
                    </span>
                    <span>• {listing.posted}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
                    <span className="text-xs font-semibold text-foreground">{listing.farmer}</span>
                    <div className="flex gap-2">
                      <a href={`tel:${listing.phone}`} className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        <Phone size={12} /> Call
                      </a>
                      <a href={`sms:${listing.phone}`} className="flex items-center gap-1 text-xs font-semibold text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
                        <MessageCircle size={12} /> SMS
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
