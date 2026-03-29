"use client";

import { useRef, useEffect, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);



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

  // 🔥 send file to parent for preview
  onScanComplete({ file });

  await scanReceiptFn(file);
};



  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
    }
  }, [scanReceiptLoading, scannedData]);

  return (
    <div className="flex gap-4 items-stretch w-full">
      
      {/* 🔵 LEFT: YOUR ORIGINAL SCANNER (UNCHANGED) */}
      <div className="flex-[2] flex flex-col">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full h-full">
          
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
      </div>
    </div>
  );
}