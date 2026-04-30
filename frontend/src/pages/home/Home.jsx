import Cards from "./components/Cards";
import HeroSection from "./components/HeroSection";

export default function Home() {

  return (
    <div className=" bg-white min-h-screen dark:bg-neutral-900 text-slate-900 dark:text-white">


      {/* Hero Section */}
      <HeroSection />

      {/* Categories */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <h3 className="text-xl font-bold mb-6 text-center">Categories</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          
          {["JavaScript", "React", "Node.js", "Aptitude"].map((cat) => (
            <Cards key={cat} cat={cat} />
          ))}

        </div>
      </section>
    </div>
  );
}