import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#181818] text-neutral-200">
      <Navbar />
      <main className="flex-1 w-full animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
