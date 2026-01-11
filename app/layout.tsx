import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/custom/theme.provider";
import { SiteNavbar } from "@/components/custom/site/navbar";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import SiteFooter from "@/components/custom/site/footer";

const fontLora = localFont({
  src: [
    {
      path: "../fonts/Lora-Bold.ttf",
      weight: "400",
      style: "bold",
    },
    {
      path: "../fonts/Lora-SemiBold.ttf",
      weight: "400",
      style: "semibold",
    },
    {
      path: "../fonts/Lora-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/Lora-BoldItalic.ttf",
      weight: "400",
      style: "bold-italic",
    },
    {
      path: "../fonts/Lora-SemiBoldItalic.ttf",
      weight: "400",
      style: "semibold-italic",
    },
    {
      path: "../fonts/Lora-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-lora",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Dextrix 5.0 by Team TechnoJam",
  description: "Finding the next gen DEXTERS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontLora.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen items-center justify-center overflow-x-hidden">
            <SiteNavbar />
            {children}
            <SmoothCursor />
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
