import { Search, Utensils, CalendarCheck } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="text-primary text-2xl" />,
      title: "Choose Your Chef",
      description: "Browse our selection of professional chefs and select the one that matches your preferences."
    },
    {
      icon: <Utensils className="text-primary text-2xl" />,
      title: "Select Your Menu",
      description: "Choose from a variety of menu options or work with your chef to create a custom dining experience."
    },
    {
      icon: <CalendarCheck className="text-primary text-2xl" />,
      title: "Enjoy Your Meal",
      description: "The chef arrives with ingredients, cooks, serves, and cleans up. You just sit back and enjoy."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">How It Works</h2>
          <p className="text-lg text-neutral-500 max-w-3xl mx-auto">
            Book a private chef in just a few simple steps and enjoy a restaurant-quality dining experience at home.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-md text-center transition-all hover:shadow-lg">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-neutral-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
