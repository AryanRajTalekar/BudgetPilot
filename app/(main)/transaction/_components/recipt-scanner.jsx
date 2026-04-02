"use client";

import { useRef, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";

export function ReceiptScanner({setPreviewUrl,accountId  }) {
  const fileInputRef = useRef(null);

  const compressImage = (file) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Max 1000px on longest side — plenty for Gemini to read a receipt
      const MAX = 1000;
      let { width, height } = img;

      if (width > height && width > MAX) {
        height = Math.round((height * MAX) / width);
        width = MAX;
      } else if (height > width && height > MAX) {
        width = Math.round((width * MAX) / height);
        height = MAX;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })),
        "image/jpeg",
        0.7 // 70% quality — more than enough for text on a receipt
      );
    };

    img.src = url;
  });
};

 

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

 const handleReceiptScan = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    toast.error("File size should be less than 5MB");
    return;
  }

  const url = URL.createObjectURL(file);
  setPreviewUrl(url);

  // Compress if it's an image before sending to Inngest
  const fileToSend = file.type.startsWith("image/")
    ? await compressImage(file)
    : file;

  await scanReceiptFn(fileToSend, accountId);
};

useEffect(() => {
  if (scannedData && !scanReceiptLoading) {
    if (scannedData.queued) {
      toast.success("Receipt is being processed in the background. You'll be notified when done!");
    }
  }
}, [scanReceiptLoading, scannedData]);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,application/pdf"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 sm:h-10 
                 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 
                 animate-gradient 
                 hover:opacity-90 transition-all duration-300 
                 text-white hover:text-white 
                 border-none 
                 text-sm sm:text-base 
                 font-medium"
        onClick={() => fileInputRef.current?.click()}
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="truncate">Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            <span className="truncate">Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
}