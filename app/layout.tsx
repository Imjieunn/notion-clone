import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ConvexClientProvider } from "@/components/providers/convex-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jieun Notion",
  description: "The connected workspace where better, faster work happens.",
  icons : {
    icon : [
      {
        media : "(prefers-color-scheme: dark)",
        url : "/logo-dark.svg",
        href : "/logo-dark.svg",
      }, {
        media : "(prefers-color-scheme: light)",
        url : "/logo.svg",
        href : "/logo.svg",
      },
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ConvexClientProvider>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              storageKey="jieun-theme-2"
          >
            {children}
            <Toaster position="bottom-center" />
          </ThemeProvider>
        </ConvexClientProvider>
        </body>
    </html>
  );
}
