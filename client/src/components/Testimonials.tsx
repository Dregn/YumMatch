import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      text: "Our anniversary dinner was perfect! Chef Marco created an amazing Italian feast that surpassed our expectations. The homemade pasta was incredible, and he left the kitchen spotless.",
      name: "Sarah T.",
      location: "London, Anniversary Dinner",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
    },
    {
      text: "We hired Chef Yuki for a business dinner and were blown away by the presentation and flavors of the Japanese fusion menu. Everyone was impressed, and it made for a memorable evening.",
      name: "James M.",
      location: "Manchester, Corporate Event",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
    },
    {
      text: "Chef Elena's Mediterranean tapas menu was perfect for our housewarming party. The food was delicious, beautifully presented, and she was so professional and friendly. Highly recommend!",
      name: "Emma L.",
      location: "Edinburgh, Housewarming Party",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
    }
  ];

  return (
    <section className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">What Our Customers Say</h2>
          <p className="text-lg text-neutral-500 max-w-3xl mx-auto">
            Hear from people who have enjoyed exceptional dining experiences with our chefs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="text-yellow-500 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>
              <p className="text-neutral-600 mb-6 italic">"{testimonial.text}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{testimonial.name}</h4>
                  <p className="text-sm text-neutral-500">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
