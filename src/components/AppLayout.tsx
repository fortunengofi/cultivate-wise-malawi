import { ReactNode } from "react";
import TopNav from "./TopNav";
import Footer from "./Footer";
import InstallPrompt from "./InstallPrompt";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <Footer />
      <InstallPrompt />
    </div>
  );
};

export default AppLayout;
