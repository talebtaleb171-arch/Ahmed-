import { Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "صندوق أحمد - إدارة الصناديق",
  description: "نظام إدارة الصناديق الرئيسي والفرعي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
