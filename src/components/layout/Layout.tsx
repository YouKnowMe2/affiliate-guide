import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import StickyMobileCTA from "./StickyMobileCTA";
import CookieConsent from "@/components/CookieConsent";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20 md:pt-24">{children}</main>
      <Footer />
      {/* Spacer so footer/end-of-page content isn't hidden behind sticky mobile CTA */}
      <div className="md:hidden h-20" aria-hidden />
      <StickyMobileCTA />
      <CookieConsent />
    </div>
  );
};

export default Layout;
