import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

type QRProps = { url: string; size?: number };
export default function QRCodeComponent({ url, size = 128 }: QRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: size });
    }
  }, [url, size]);
  return <canvas ref={canvasRef} />;
}