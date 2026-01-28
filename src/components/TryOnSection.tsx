import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Download, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import UploadZone from "./UploadZone";
import { generateTryOn } from "@/services/tryOnService";

interface TryOnSectionProps {
  id?: string;
}

const TryOnSection = ({ id }: TryOnSectionProps) => {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [clothingPhoto, setClothingPhoto] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUserPhotoUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUserPhoto(e.target?.result as string);
      setResultImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleClothingUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setClothingPhoto(e.target?.result as string);
      setResultImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = async () => {
    if (!userPhoto || !clothingPhoto) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateTryOn(userPhoto, clothingPhoto);
      
      if (result.success && result.image) {
        setResultImage(result.image);
        toast.success("Virtual try-on generated successfully!");
      } else {
        const errorMessage = result.error || "Failed to generate try-on";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Try-on error details:", result.details);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = "virtual-tryon.png";
    link.click();
  };

  const handleReset = () => {
    setUserPhoto(null);
    setClothingPhoto(null);
    setResultImage(null);
    setError(null);
  };

  const canGenerate = userPhoto && clothingPhoto && !isGenerating;

  return (
    <section id={id} className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Wand2 className="w-4 h-4" />
            Virtual Try-On Studio
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            See It On <span className="gradient-text">You</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Upload your photo and the outfit you want to try. Our AI will do the magic.
          </p>
        </motion.div>

        {/* Upload Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* User Photo Upload */}
          <UploadZone
            type="photo"
            onUpload={handleUserPhotoUpload}
            preview={userPhoto}
            onClear={() => setUserPhoto(null)}
          />

          {/* Clothing Upload */}
          <UploadZone
            type="clothing"
            onUpload={handleClothingUpload}
            preview={clothingPhoto}
            onClear={() => setClothingPhoto(null)}
          />

          {/* Result */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-display text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Result
            </h3>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted/50 border border-border">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <div className="relative w-20 h-20 mb-4">
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/30"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        style={{ borderTopColor: "transparent" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Wand2 className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <p className="text-foreground font-medium">Generating...</p>
                    <p className="text-muted-foreground text-sm">AI is working its magic</p>
                  </motion.div>
                ) : resultImage ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full h-full group"
                  >
                    <img
                      src={resultImage}
                      alt="Try-on result"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-charcoal font-medium hover:bg-primary hover:text-white transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        Download
                      </button>
                    </div>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <p className="text-destructive font-medium text-center mb-2">
                      Generation Failed
                    </p>
                    <p className="text-muted-foreground text-sm text-center">
                      {error}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-center px-4">
                      Your AI-generated try-on will appear here
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mt-12"
        >
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`btn-primary flex items-center gap-3 ${
              !canGenerate ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Wand2 className="w-5 h-5" />
            Generate Try-On
          </button>
          {(userPhoto || clothingPhoto || resultImage) && (
            <button
              onClick={handleReset}
              className="px-8 py-4 rounded-full border border-border text-foreground font-medium hover:bg-muted transition-colors flex items-center gap-3"
            >
              <RefreshCw className="w-5 h-5" />
              Start Over
            </button>
          )}
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <div className="glass-card p-6">
            <h4 className="font-display text-lg font-semibold text-foreground mb-4">
              💡 Tips for Best Results
            </h4>
            <ul className="grid md:grid-cols-2 gap-3 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Use a front-facing photo with good lighting
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Plain backgrounds work best
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Upload clothing on white or transparent background
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Full body or half body photos recommended
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TryOnSection;
