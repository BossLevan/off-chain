import Image from "next/image";
import { useEffect, useState } from "react";
import { convertIpfsToPinataUrl } from "@/lib/utils/ipfs";

type AsyncTokenImageProps = {
  imageIpfsUri: string | null;
  alt: string;
  size?: number;
};

export default function AsyncTokenImage({
  imageIpfsUri,
  alt,
  size = 148,
}: AsyncTokenImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imageIpfsUri) {
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        const url = await convertIpfsToPinataUrl(imageIpfsUri);
        setImageUrl(url);
      } catch (error) {
        console.error("Failed to fetch image", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [imageIpfsUri]);

  return (
    <div
      className="relative rounded-3xl overflow-hidden bg-zinc-800"
      style={{ width: size, height: size }}
    >
      {loading ? (
        <div className="w-full h-full animate-pulse" />
      ) : (
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={alt}
          width={size}
          height={size}
          className="object-cover"
        />
      )}
    </div>
  );
}
