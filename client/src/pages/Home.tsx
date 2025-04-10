import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ChefBrowsing from "@/components/ChefBrowsing";
import FeaturedMenus from "@/components/FeaturedMenus";
import Testimonials from "@/components/Testimonials";
import FAQs from "@/components/FAQs";
import BookingForm from "@/components/BookingForm";
import { CheckCircle } from "lucide-react";

const Home = () => {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ChefBrowsing />
      <FeaturedMenus />
      
      <section id="book-now" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Book Your Private Chef Experience
            </h2>
            <p className="text-lg text-neutral-500 max-w-3xl mx-auto">
              Complete the form below to start planning your perfect dining experience at home
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 relative">
                <img 
                  src="https://images.unsplash.com/photo-1543353071-10c8ba85a904?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200&q=80"
                  alt="Chef preparing a meal" 
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-white">
                  <h3 className="text-2xl font-semibold mb-2">Why Book With Us?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="text-primary mt-1 mr-2 h-5 w-5" />
                      <span>All chefs are professionally trained and vetted</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-primary mt-1 mr-2 h-5 w-5" />
                      <span>Flexible menus to suit your preferences</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-primary mt-1 mr-2 h-5 w-5" />
                      <span>Your chef handles everything from shopping to cleanup</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-primary mt-1 mr-2 h-5 w-5" />
                      <span>100% satisfaction guarantee</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:w-1/2 p-8">
                <BookingForm />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Testimonials />
      <FAQs />
    </>
  );
};

export default Home;
