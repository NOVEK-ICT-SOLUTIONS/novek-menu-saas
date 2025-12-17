import QRCode from "qrcode";
import { type FC, useEffect, useRef } from "react";
import { MdDownload, MdQrCode2 } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRestaurants } from "@/features/restaurants/hooks/useRestaurants";

interface QRCodeDisplayProps {
  url: string;
}

const QRCodeDisplay: FC<QRCodeDisplayProps> = ({ url }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      console.log("Generating QR code for URL:", url);
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      }).catch((error) => {
        console.error("Failed to generate QR code:", error);
      });
    }
  }, [url]);

  return <canvas ref={canvasRef} className="max-w-full h-auto" />;
};

const QRCodesPage = () => {
  const { data: restaurants, isLoading } = useRestaurants();

  const generateQRUrl = (slug: string) => {
    // Auto-detect environment: localhost = dev, otherwise production
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const baseUrl = isLocalhost ? window.location.origin : "https://menu.novektech.com";
    return `${baseUrl}/${slug}`;
  };

  const downloadQR = async (restaurantName: string, slug: string) => {
    try {
      const url = generateQRUrl(slug);
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 500,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      const link = document.createElement("a");
      link.download = `${restaurantName.toLowerCase().replace(/\s+/g, "-")}-qr-code.png`;
      link.href = qrDataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">QR Codes</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {["qr-skeleton-1", "qr-skeleton-2", "qr-skeleton-3"].map((skeletonId) => (
            <Card key={skeletonId}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">QR Codes</h1>
        <p className="text-muted-foreground">Generate and download QR codes for your restaurants</p>
      </div>

      {restaurants && restaurants.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MdQrCode2 className="h-5 w-5" />
                  {restaurant.name}
                </CardTitle>
                <CardDescription>/{restaurant.slug}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                  <QRCodeDisplay url={generateQRUrl(restaurant.slug)} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Scan to view menu:</p>
                  <code className="block text-xs bg-muted p-2 rounded break-all">{generateQRUrl(restaurant.slug)}</code>
                </div>
                <Button
                  onClick={() => downloadQR(restaurant.name, restaurant.slug)}
                  className="w-full"
                  variant="outline"
                >
                  <MdDownload className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MdQrCode2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No restaurants yet</p>
            <Button asChild>
              <a href="/restaurants">Create Restaurant</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRCodesPage;
