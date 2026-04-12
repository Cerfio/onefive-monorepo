import Image from "next/image";
import { useState } from "react";

interface SEOImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
}

export function SEOImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 85,
  placeholder = "empty",
  blurDataURL,
  sizes,
  fill = false,
  style,
  onClick,
  title,
}: SEOImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Validation de l'alt text (important pour le SEO)
  if (!alt || alt.trim() === "") {
    console.warn(`Image ${src} is missing alt text for SEO`);
  }

  // Image de fallback en cas d'erreur
  const fallbackSrc = "/images/placeholder.jpg";

  const handleError = () => {
    setImageError(true);
  };

  const handleLoad = () => {
    setImageLoaded(true);
  };

  // Props communes
  const commonProps = {
    alt: alt || "Image",
    className: `${className} ${!imageLoaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300`,
    priority,
    quality,
    placeholder,
    blurDataURL,
    sizes,
    style,
    onError: handleError,
    onLoad: handleLoad,
    onClick,
    title: title || alt,
  };

  if (fill) {
    return (
      <Image
        src={imageError ? fallbackSrc : src}
        fill
        {...commonProps}
      />
    );
  }

  return (
    <Image
      src={imageError ? fallbackSrc : src}
      width={width || 400}
      height={height || 300}
      {...commonProps}
    />
  );
}

// Composant spécialisé pour les articles de blog
export function BlogImage({
  src,
  alt,
  caption,
  className = "",
  ...props
}: SEOImageProps & { caption?: string }) {
  return (
    <figure className={`my-6 ${className}`}>
      <SEOImage
        src={src}
        alt={alt}
        className="rounded-lg w-full h-auto"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        quality={90}
        {...props}
      />
      {caption && (
        <figcaption className="text-sm text-muted-foreground mt-2 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// Composant pour les images de profil optimisées
export function ProfileImage({
  src,
  alt,
  size = 40,
  className = "",
  ...props
}: Omit<SEOImageProps, "width" | "height"> & { size?: number }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <SEOImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover"
        priority={size > 100} // Prioriser les grandes images de profil
        {...props}
      />
    </div>
  );
}

// Composant pour les images de logos
export function LogoImage({
  src,
  alt,
  width = 120,
  height = 40,
  className = "",
  ...props
}: SEOImageProps) {
  return (
    <SEOImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority={true} // Les logos sont généralement importants
      quality={95} // Qualité plus élevée pour les logos
      {...props}
    />
  );
}

// Composant pour les images de hero/bannières
export function HeroImage({
  src,
  alt,
  className = "",
  ...props
}: Omit<SEOImageProps, "fill"> & { fill?: boolean }) {
  return (
    <div className={`relative w-full h-[400px] md:h-[500px] lg:h-[600px] ${className}`}>
      <SEOImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority={true} // Les images hero sont prioritaires
        quality={90}
        sizes="100vw"
        {...props}
      />
    </div>
  );
} 