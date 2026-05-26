"use client";

import * as React from "react";
import { DownloadIcon, QrCodeIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface QrCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  formTitle?: string | null;
}

export function QrCodeModal({
  open,
  onOpenChange,
  url,
  formTitle,
}: QrCodeModalProps) {
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  const handleDownload = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob(
      ['<?xml version="1.0" standalone="no"?>\r\n', source],
      { type: "image/svg+xml;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${formTitle ?? "form"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCodeIcon className="size-4" />
            QR Code
          </DialogTitle>
          <DialogDescription>
            Scan to open{" "}
            <span className="font-medium text-foreground">
              {formTitle ?? "the form"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          <div className="rounded-xl border border-border/60 bg-white p-4">
            <QRCodeSVG
              ref={svgRef}
              value={url}
              size={200}
              bgColor="#ffffff"
              fgColor="#0b1a15"
              level="M"
            />
          </div>

          <p className="max-w-[220px] break-all text-center text-[11px] text-muted-foreground">
            {url}
          </p>

          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl"
            onClick={handleDownload}
          >
            <DownloadIcon className="size-4" />
            Download SVG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
