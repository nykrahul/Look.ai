import { motion } from "framer-motion";
import { Zap, Shield, Palette, Smartphone, RefreshCw, Heart } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get your virtual try-on in seconds, not minutes. Our optimized AI delivers instant results.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your photos are never stored. All processing happens securely and data is deleted immediately.",
  },
  {
    icon: Palette,
    title: "Any Style",
    description: "From casual tees to formal suits — our AI handles all clothing types with precision.",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Works perfectly on any device. Try on outfits anywhere, anytime.",
  },
  {
    icon: RefreshCw,
    title: "Unlimited Tries",
    description: "Mix and match as many outfits as you want. Find your perfect look.",
  },
  {
    icon: Heart,
    title: "Save Favorites",
    description: "Love a look? Download and save your favorite combinations instantly.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose <span className="gradient-text">Look.ai</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            The smartest way to shop for clothes online. Never wonder how it looks again.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
