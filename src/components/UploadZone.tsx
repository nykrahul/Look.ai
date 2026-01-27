import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, User, Shirt } from "lucide-react";

interface UploadZoneProps {
  type: "photo" | "clothing";
  onUpload: (file: File) => void;
  preview?: string | null;
  onClear: () => void;
}

const UploadZone = ({ type, onUpload, preview, onClear }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const Icon = type === "photo" ? User : Shirt;
  const title = type === "photo" ? "Your Photo" : "Clothing Item";
  const description =
    type === "photo"
      ? "Upload a front-facing photo with good lighting"
      : "Upload a shirt, pants, or any outfit piece";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <h3 className="font-display text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </h3>

      <div
        className={`upload-zone relative ${
          isDragging ? "border-primary bg-primary/5" : ""
        } ${preview ? "p-0 border-0" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden group"
            >
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button
                onClick={onClear}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-charcoal/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.label
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center aspect-[3/4] cursor-pointer"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <motion.div
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDragging ? (
                  <ImageIcon className="w-8 h-8 text-primary" />
                ) : (
                  <Upload className="w-8 h-8 text-primary" />
                )}
              </motion.div>
              <p className="text-foreground font-medium mb-1">
                {isDragging ? "Drop image here" : "Click or drag to upload"}
              </p>
              <p className="text-muted-foreground text-sm text-center max-w-[200px]">
                {description}
              </p>
            </motion.label>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default UploadZone;
