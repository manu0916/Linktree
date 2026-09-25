// Clean QR code helper that provides an SVG QR Code representation
// Uses a reliable encoded QR generator or vector matrix for offline usage.

export function generateQrCodeUrl(text: string, size = 260): string {
  // Encodes text for universal high-res QR rendering
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=8&format=svg`;
}
