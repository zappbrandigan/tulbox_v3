import { useImageLoaded } from '@/hooks/useImageLoaded';

const PosterImage = ({ src, alt }: { src?: string; alt: string }) => {
  const isLoaded = useImageLoaded(src);

  return (
    <div className="w-16 h-24 relative rounded-md shadow-lg overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-shimmer" />
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          className={`w-16 h-24 object-cover rounded-md flex-shrink-0 transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

export default PosterImage;
