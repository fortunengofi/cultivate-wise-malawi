import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import irrigationImg from "@/assets/agritech-irrigation.jpg";
import solarImg from "@/assets/agritech-solar.jpg";
import mobileImg from "@/assets/agritech-mobile.jpg";
import greenhouseImg from "@/assets/agritech-greenhouse.jpg";

const technologies = [
  {
    title: "Drip Irrigation Systems",
    description: "Save up to 60% water compared to traditional flood irrigation. Drip systems deliver water directly to plant roots, reducing waste and improving crop yields significantly.",
    benefits: ["Water conservation", "Higher yields", "Reduced labor", "Less weed growth"],
    image: irrigationImg,
    availability: "Available through NASFAM and agricultural input dealers",
  },
  {
    title: "Solar-Powered Water Pumps",
    description: "Harness Malawi's abundant sunshine to pump water for irrigation. Solar pumps eliminate fuel costs and provide reliable water access even in remote areas.",
    benefits: ["No fuel costs", "Reliable power", "Environmentally friendly", "Low maintenance"],
    image: solarImg,
    availability: "Supported by USAID Feed the Future and Total Land Care",
  },
  {
    title: "Mobile Farm Technology",
    description: "Use your phone to access market prices, weather forecasts, and expert advice. Mobile apps connect farmers to vital information and buyers directly.",
    benefits: ["Real-time prices", "Weather alerts", "Expert advice", "Market access"],
    image: mobileImg,
    availability: "Available via Airtel Money & TNM Mpamba platforms",
  },
  {
    title: "Greenhouse Farming",
    description: "Protected cultivation using polytunnels allows year-round production. Grow high-value crops like tomatoes, peppers, and herbs regardless of season.",
    benefits: ["Year-round production", "Pest protection", "High-value crops", "Water efficiency"],
    image: greenhouseImg,
    availability: "Training through LUANAR and Extension Services",
  },
];

const AgriTech = () => {
  return (
    <div className="flex flex-col max-w-6xl mx-auto">
      <PageHeader
        title="AgriTech Innovations"
        subtitle="Modern farming technologies available in Malawi"
      />

      <div className="px-4 sm:px-0 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 pb-8">
        {technologies.map((tech, index) => (
          <motion.div
            key={tech.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl overflow-hidden shadow-card border border-border"
          >
            <div className="h-48 overflow-hidden">
              <img src={tech.image} alt={tech.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5">
              <h3 className="font-bold text-foreground text-lg font-serif">{tech.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{tech.description}</p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {tech.benefits.map((benefit) => (
                  <span
                    key={benefit}
                    className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full"
                  >
                    ✓ {benefit}
                  </span>
                ))}
              </div>

              <div className="mt-4 bg-leaf-light rounded-lg p-3">
                <p className="text-xs text-primary font-semibold">
                  📍 {tech.availability}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AgriTech;
