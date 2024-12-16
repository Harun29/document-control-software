import Link from "next/link";

export function IconCard({ bgColor, icon: Icon, label, href}: { bgColor: string; icon: any; label: string; href: string }) {
  return (
    <div className="m-8 flex flex-col items-center justify-start">
      <Link href={href}
        className="mb-5 h-24 w-24 flex items-center justify-center rounded-3xl hover:scale-105 transform transition duration-300 ease-in-out"
        style={{
          background: `linear-gradient(to bottom, ${bgColor} 0%, ${darkenColor(bgColor, 0)} 0%, ${lightenColor(bgColor, 5)} 100%)`,
          boxShadow: `0px 4px 6px rgba(0, 0, 0, 0.1), inset 0px 2px 10px rgba(0, 0, 0, 0.1)`,
        }}
      >
        <div className="bg-background h-16 w-16 rounded-full flex items-center justify-center">
          <Icon color={bgColor} size={36} strokeWidth={2} />
        </div>
      </Link>
      <span className="w-32 text-xl text-center">{label}</span>
    </div>
  );
}

// Helper function to lighten a color
function lightenColor(color: string, percentage: number): string {
  const rgb = hexToRgb(color);
  return rgbToHex(
    rgb.r + (255 - rgb.r) * (percentage / 100),
    rgb.g + (255 - rgb.g) * (percentage / 100),
    rgb.b + (255 - rgb.b) * (percentage / 100)
  );
}

// Helper function to darken a color
function darkenColor(color: string, percentage: number): string {
  const rgb = hexToRgb(color);
  return rgbToHex(
    rgb.r - rgb.r * (percentage / 100),
    rgb.g - rgb.g * (percentage / 100),
    rgb.b - rgb.b * (percentage / 100)
  );
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// Helper function to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}
