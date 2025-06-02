"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

type CanvasAnnotationProps = {
  base64: string;
  vol: string;
  mcap: string;
  x?: number;
  y?: number;
};

export type CanvasAnnotationHandle = {
  download: () => void;
  getImage: () => string | null;
};

const CanvasAnnotation = forwardRef<
  CanvasAnnotationHandle,
  CanvasAnnotationProps
>(({ base64, vol, mcap, x = 10, y = 10 }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useImperativeHandle(ref, () => ({
    download: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const link = document.createElement("a");
      link.download = "annotated-image.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    },

    getImage: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL("image/png");
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const padding = 20;
      const radius = 14;
      const fontSize = 24;
      const labelSpacing = 30;
      const textY = y + fontSize + 8;

      ctx.font = `bold ${fontSize}px "Courier New", monospace`;
      const volWidth = ctx.measureText(vol).width;
      const volLabelWidth = ctx.measureText("VOL").width;
      const mcapWidth = ctx.measureText(mcap).width;
      const mcapLabelWidth = ctx.measureText("MCAP").width;

      const boxWidth =
        padding * 2 +
        volWidth +
        10 +
        volLabelWidth +
        labelSpacing +
        mcapWidth +
        10 +
        mcapLabelWidth;
      const boxHeight = fontSize + padding;

      // Rounded rectangle
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + boxWidth - radius, y);
      ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + radius);
      ctx.lineTo(x + boxWidth, y + boxHeight - radius);
      ctx.quadraticCurveTo(
        x + boxWidth,
        y + boxHeight,
        x + boxWidth - radius,
        y + boxHeight,
      );
      ctx.lineTo(x + radius, y + boxHeight);
      ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();

      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fill();

      let cursorX = x + padding;

      ctx.fillStyle = "#00FF00";
      ctx.fillText(vol, cursorX, textY);
      cursorX += volWidth + 10;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("VOL", cursorX, textY);
      cursorX += volLabelWidth + labelSpacing;

      ctx.fillStyle = "#00FF00";
      ctx.fillText(mcap, cursorX, textY);
      cursorX += mcapWidth + 10;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("MCAP", cursorX, textY);
    };

    img.src = base64;
  }, [base64, vol, mcap, x, y]);

  return (
    <canvas ref={canvasRef} style={{ display: "block", maxWidth: "100%" }} />
  );
});

export default CanvasAnnotation;
