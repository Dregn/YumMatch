import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQs = () => {
  const faqs = [
    {
      question: "What does the price include?",
      answer: "The price includes the chef's time (shopping, cooking, serving, and cleaning), all ingredients needed for your meal, and any basic equipment the chef needs to bring. The exact inclusions may vary based on the chef and menu chosen, but there are no hidden costs - the price you see is what you pay."
    },
    {
      question: "How far in advance should I book?",
      answer: "We recommend booking at least 1-2 weeks in advance to ensure availability, especially for weekend dates or special occasions. However, we can sometimes accommodate last-minute bookings depending on chef availability."
    },
    {
      question: "Can I customize the menu?",
      answer: "Absolutely! While our chefs offer set menus, they're happy to customize dishes based on your preferences or dietary requirements. After booking, you'll have the opportunity to discuss any modifications directly with your chef."
    },
    {
      question: "What equipment do I need to provide?",
      answer: "You only need to provide a working kitchen with basic appliances (stove, oven) and dining plates/cutlery for your guests. Your chef will bring any specialized equipment needed for preparation. If you have any concerns about your kitchen setup, you can discuss this with us before booking."
    },
    {
      question: "How does payment work?",
      answer: "We require a 30% deposit to secure your booking, with the remaining balance due 3 days before your event. All payments are processed securely online through our platform. In case of cancellation, our policy allows for full refunds if canceled more than 7 days in advance."
    }
  ];

  return (
    <section id="faqs" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-neutral-500 max-w-3xl mx-auto">
            Find answers to common questions about our private chef service
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-neutral-200 rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-neutral-50 font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-neutral-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQs;
