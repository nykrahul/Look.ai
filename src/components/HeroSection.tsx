import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-fashion.jpg";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-charcoal">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Fashion hero"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/50" />
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-primary/20 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Fashion
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
          >
            Try Before You{" "}
            <span className="gradient-text">Buy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 mb-10 max-w-xl leading-relaxed"
          >
            Upload your photo and any outfit. Our AI instantly shows you how it 
            looks on you — no fitting room needed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={onGetStarted}
              className="btn-primary group flex items-center gap-3"
            >
              Start Virtual Try-On
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-300">
              See How It Works
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex gap-12 mt-16"
          >
            {[
              { value: "50K+", label: "Try-Ons Daily" },
              { value: "98%", label: "Accuracy" },
              { value: "3s", label: "Generation Time" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-white/50 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-white/50" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
