import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroFarm from "@/assets/hero-farm.jpg";
import irrigationImg from "@/assets/agritech-irrigation.jpg";
import greenhouseImg from "@/assets/agritech-greenhouse.jpg";
import solarImg from "@/assets/agritech-solar.jpg";

const slides = [
  {
    image: heroFarm,
    title: "Farm Link",
    subtitle: "Smart Farming for Malawi 🌾",
    overlay: "from-foreground/70 via-foreground/40 to-transparent",
  },
  {
    image: irrigationImg,
    title: "Modern Irrigation",
    subtitle: "Save water, boost your yields with drip systems",
    overlay: "from-foreground/70 via-foreground/40 to-transparent",
  },
  {
    image: greenhouseImg,
    title: "Greenhouse Farming",
    subtitle: "Grow high-value crops all year round",
    overlay: "from-foreground/70 via-foreground/40 to-transparent",
  },
  {
    image: solarImg,
    title: "Solar-Powered Future",
    subtitle: "Harness Malawi's sunshine for your farm",
    overlay: "from-foreground/70 via-foreground/40 to-transparent",
  },
];

const HeroSlideshow = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[480px] overflow-hidden rounded-b-2xl sm:rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={slide.image}
          alt={slide.title}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t ${slide.overlay}`} />

      {/* Text content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight font-serif">
              {slide.title}
            </h1>
            <p className="text-primary-foreground/80 text-sm sm:text-base mt-2 font-medium max-w-md">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-4">
        <button
          onClick={prev}
          className="w-9 h-9 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-background/50 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-4">
        <button
          onClick={next}
          className="w-9 h-9 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-background/50 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-2 bg-primary-foreground"
                : "w-2 h-2 bg-primary-foreground/40 hover:bg-primary-foreground/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlideshow;
