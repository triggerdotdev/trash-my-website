import Dashboard from "@/app/components/Dashboard";
import { Footer } from "@/app/components/Footer";
import { Gradients } from "@/app/components/Gradients";
import Header from "@/app/components/Header";

export default function Home() {
  return (
    <main className="flex min-h-screen pb-6 flex-col items-center justify-between relative">
      <Header />
      <Dashboard />
      <Gradients />
      <Footer />
    </main>
  );
}
