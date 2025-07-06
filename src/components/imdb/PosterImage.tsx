import { useImageLoaded } from '@/hooks/useImageLoaded';

const PosterImage = ({ src, alt }: { src?: string; alt: string }) => {
  const isLoaded = useImageLoaded(src);

  return (
    <div className="w-16 h-24 relative rounded-md shadow-lg overflow-hidden">
      {/* Shimmer Background — always rendered */}
      <div className="absolute inset-0 bg-shimmer bg-[length:200%_100%] animate-shimmer" />

      {/* Actual Image */}
      {src && (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover rounded-md transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

export default PosterImage;
