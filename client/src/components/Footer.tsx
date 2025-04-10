import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">YumMatch</h3>
            <p className="text-neutral-300 mb-4">Book professional chefs to cook for your dinner parties at home.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-primary transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-primary transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-primary transition-all">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-primary transition-all">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#how-it-works">
                  <a className="text-neutral-300 hover:text-white transition-all">How It Works</a>
                </Link>
              </li>
              <li>
                <Link href="#chefs">
                  <a className="text-neutral-300 hover:text-white transition-all">Our Chefs</a>
                </Link>
              </li>
              <li>
                <Link href="#menus">
                  <a className="text-neutral-300 hover:text-white transition-all">Sample Menus</a>
                </Link>
              </li>
              <li>
                <Link href="#book-now">
                  <a className="text-neutral-300 hover:text-white transition-all">Book a Chef</a>
                </Link>
              </li>
              <li>
                <Link href="#faqs">
                  <a className="text-neutral-300 hover:text-white transition-all">FAQs</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#">
                  <a className="text-neutral-300 hover:text-white transition-all">Terms & Conditions</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-neutral-300 hover:text-white transition-all">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-neutral-300 hover:text-white transition-all">Cookie Policy</a>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <a className="text-neutral-300 hover:text-white transition-all">Accessibility</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-primary mt-0.5 mr-2" />
                <a 
                  href="mailto:info@YumMatch.com" 
                  className="text-neutral-300 hover:text-white transition-all"
                >
                  info@YumMatch.com
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-primary mt-0.5 mr-2" />
                <a 
                  href="tel:+44123456789" 
                  className="text-neutral-300 hover:text-white transition-all"
                >
                  +44 (0) 123 456 789
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mt-0.5 mr-2" />
                <span className="text-neutral-300">London, United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-neutral-400">
          <p>&copy; {new Date().getFullYear()} YumMatch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
