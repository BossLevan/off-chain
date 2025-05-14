import { useTokenFirestoreDetails } from "@/lib/hooks/useGetFirestoreToken";
import Image from "next/image";

interface GalleryImagesProps {
  contract: string;
  title?: string;
}

export default function GalleryImages({
  contract,
  title = "Aesthetic Samples",
}: GalleryImagesProps) {
  const { imageUrls, loading, error } = useTokenFirestoreDetails(contract);

  // You can choose to use `imageUrls` from the hook, or just keep using `images` from props
  const displayImages = imageUrls; // replace with imageUrls if needed

  const skeletons = Array(5).fill(null);

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex space-x-3 min-w-max">
          {loading ? (
            skeletons.map((_, i) => (
              <div
                key={i}
                className="w-[160px] h-[160px] bg-gray-200 animate-pulse rounded-2xl flex-shrink-0"
              />
            ))
          ) : error ? (
            <div className="text-red-500 text-sm">Failed to load images.</div>
          ) : displayImages.length === 0 ? (
            <div className="text-gray-500 text-sm">No images available.</div>
          ) : (
            displayImages.map((img, i) => (
              <Image
                key={i}
                src={img || "/placeholder.svg"}
                alt={`Gallery ${i}`}
                width={160}
                height={160}
                className="rounded-2xl object-cover flex-shrink-0"
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
