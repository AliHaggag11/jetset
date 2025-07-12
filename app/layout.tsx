import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JetSet - AI Travel Planner",
  description: "Plan your dream trip with AI-powered itineraries and smart budget planning",
  keywords: ["travel", "trip planner", "AI", "itinerary", "budget travel"],
  authors: [{ name: "JetSet" }],
  creator: "JetSet",
  publisher: "JetSet",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://jetset.app"),
  openGraph: {
    title: "JetSet - AI Travel Planner",
    description: "Plan your dream trip with AI-powered itineraries and smart budget planning",
    url: "https://jetset.app",
    siteName: "JetSet",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "JetSet - AI Travel Planner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JetSet - AI Travel Planner",
    description: "Plan your dream trip with AI-powered itineraries and smart budget planning",
    creator: "@jetsetapp",
    images: ["/og-image.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} h-full flex flex-col antialiased`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
