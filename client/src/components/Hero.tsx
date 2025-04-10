import { Link } from "wouter";

const Hero = () => {
  return (
    <section className="relative h-screen">
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80')" 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/50"></div>
      </div>
      
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6">
            Hire a Private Chef for Your Next Dinner Party
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Professional chefs create and serve restaurant-quality meals in your home from $40 per person. Perfect for special occasions or just because.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="#book-now">
              <a className="py-3 px-8 bg-primary text-white rounded-full hover:bg-opacity-90 transition-all text-center font-medium text-lg">
                Book a Chef
              </a>
            </Link>
            <Link href="#how-it-works">
              <a className="py-3 px-8 bg-white text-primary rounded-full hover:bg-primary hover:text-white transition-all text-center font-medium text-lg">
                How It Works
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
