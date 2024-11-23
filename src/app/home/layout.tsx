import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Home",
    template: "DCS | %s",
  },
  description: "Document Control System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    {children}
    </>
  );
}
