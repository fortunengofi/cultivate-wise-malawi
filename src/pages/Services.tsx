import { motion } from "framer-motion";
import { Phone, Globe, MapPin } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const agencies = [
  {
    name: "NASFAM",
    fullName: "National Smallholder Farmers' Association of Malawi",
    description: "The largest independent smallholder-owned membership organization. Provides marketing, extension, and financial services.",
    services: ["Market linkages", "Training & extension", "Input supply", "Advocacy"],
    phone: "+265 1 772 866",
    website: "nasfam.org",
    location: "Lilongwe",
    emoji: "🌾",
  },
  {
    name: "AICC",
    fullName: "Agricultural Information & Communication Centre",
    description: "Government center providing agricultural information, weather updates, and farming best practices to farmers nationwide.",
    services: ["Weather information", "Market prices", "Technical advice", "Publications"],
    phone: "+265 1 789 033",
    website: "agriculture.gov.mw",
    location: "Lilongwe",
    emoji: "📡",
  },
  {
    name: "LUANAR",
    fullName: "Lilongwe University of Agriculture & Natural Resources",
    description: "Leading agricultural university offering research, training programs, and extension services for farmers.",
    services: ["Research & innovation", "Farmer training", "Soil testing", "Seed development"],
    phone: "+265 1 277 222",
    website: "luanar.ac.mw",
    location: "Lilongwe",
    emoji: "🎓",
  },
  {
    name: "Total Land Care",
    fullName: "Total Land Care (TLC)",
    description: "International NGO promoting sustainable agriculture, conservation farming, and climate-smart practices in Malawi.",
    services: ["Conservation farming", "Agroforestry", "Water management", "Climate adaptation"],
    phone: "+265 1 773 886",
    website: "totallandcare.org",
    location: "Lilongwe",
    emoji: "🌍",
  },
  {
    name: "USAID Feed the Future",
    fullName: "USAID Feed the Future Malawi",
    description: "US government program supporting Malawian agriculture through technology transfer, market development, and nutrition.",
    services: ["Technology transfer", "Market development", "Nutrition programs", "Youth in agriculture"],
    phone: "+265 1 772 455",
    website: "feedthefuture.gov",
    location: "Lilongwe",
    emoji: "🇺🇸",
  },
  {
    name: "DARS",
    fullName: "Department of Agricultural Research Services",
    description: "Government research body developing improved crop varieties and farming techniques suited to Malawi's conditions.",
    services: ["Seed research", "Soil analysis", "Pest management", "Crop improvement"],
    phone: "+265 1 707 222",
    website: "agriculture.gov.mw",
    location: "Chitedze, Lilongwe",
    emoji: "🔬",
  },
];

const Services = () => {
  return (
    <div className="flex flex-col max-w-6xl mx-auto">
      <PageHeader
        title="Agricultural Services"
        subtitle="Development agencies & support for farmers"
      />

      <div className="px-4 sm:px-0 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
        {agencies.map((agency, index) => (
          <motion.div
            key={agency.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-elevated transition-shadow"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{agency.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-base">{agency.name}</h3>
                <p className="text-xs text-muted-foreground font-medium">{agency.fullName}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{agency.description}</p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {agency.services.map((service) => (
                <span
                  key={service}
                  className="text-xs font-semibold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full"
                >
                  {service}
                </span>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-border space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone size={12} className="text-primary shrink-0" />
                <span className="font-semibold">{agency.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe size={12} className="text-primary shrink-0" />
                <span className="font-semibold">{agency.website}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin size={12} className="text-primary shrink-0" />
                <span className="font-semibold">{agency.location}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Services;
