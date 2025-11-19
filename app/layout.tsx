import "@/styles/main.css";
import AuthProvider from "@/components/layout/AuthProviderProps";
import "@/styles/global.css";

export const metadata = {
  title: "PPCB FEP",
  description: "Dashboard for FEP system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={``}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
