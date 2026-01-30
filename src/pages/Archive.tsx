import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Features from "@/components/Features";

const Archive = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex flex-col">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">Archived Features</h1>
          <Features />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Archive;
