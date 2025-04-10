import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ChevronLeft, Utensils, Users, CircleDot, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Menu {
  id: number;
  name: string;
  image: string;
  description: string;
  courses: string;
  guestRange: string;
  price: number;
  items: string[];
}

const MenuDetails = () => {
  const { id } = useParams();
  const menuId = parseInt(id || "0");
  
  const { data: menu, isLoading } = useQuery<Menu>({
    queryKey: [`/api/menus/${menuId}`],
    queryFn: async () => {
      const response = await fetch(`/api/menus/${menuId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch menu");
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-4 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Menu not found</h2>
        <p className="mb-6">The menu you're looking for doesn't exist or has been removed.</p>
        <Link href="/">
          <Button className="rounded-full">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/">
        <a className="inline-flex items-center text-neutral-600 hover:text-primary mb-8 transition-all">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Menus
        </a>
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="rounded-lg overflow-hidden">
          <img 
            src={menu.image} 
            alt={menu.name} 
            className="w-full h-96 object-cover"
          />
        </div>
        
        <div>
          <h1 className="text-3xl font-semibold mb-3">{menu.name}</h1>
          
          <div className="flex items-center text-sm text-neutral-500 mb-4">
            <span className="mr-4 flex items-center">
              <Utensils className="w-4 h-4 mr-1" /> {menu.courses}
            </span>
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" /> {menu.guestRange}
            </span>
          </div>
          
          <p className="text-neutral-600 mb-6">{menu.description}</p>
          
          <div className="text-primary font-semibold text-xl mb-6">
            From ${menu.price} per person
          </div>
          
          <Link href="#book-now">
            <Button className="rounded-full">
              Book This Menu
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-neutral-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Menu Highlights</h2>
          <ul className="space-y-2">
            {menu.items.map((item, index) => (
              <li key={index} className="flex items-start">
                <CircleDot className="w-4 h-4 text-primary mt-1 mr-2" />
                <span className="text-neutral-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-neutral-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Dietary Options</h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <Check className="w-5 h-5 text-primary mt-0.5 mr-2" />
              <span className="text-neutral-600">Vegetarian alternatives available</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-primary mt-0.5 mr-2" />
              <span className="text-neutral-600">Gluten-free modifications possible</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-primary mt-0.5 mr-2" />
              <span className="text-neutral-600">All allergies accommodated with notice</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-neutral-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">What's Included</h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <Check className="w-5 h-5 text-primary mt-0.5 mr-2" />
              <span className="text-neutral-600">All ingredients for the menu</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-primary mt-0.5 mr-2" />
              <span className="text-neutral-600">Chef's time (shopping to cleanup)</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-primary mt-0.5 mr-2" />
              <span className="text-neutral-600">Professional service and plating</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-primary mt-0.5 mr-2" />
              <span className="text-neutral-600">Kitchen cleanup after service</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-3">Ready to Book This Menu?</h2>
        <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
          Complete your booking now to secure your preferred date and time. Our chefs are ready to create an unforgettable dining experience in your home.
        </p>
        <Link href="#book-now">
          <Button size="lg" className="rounded-full">
            Check Availability
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MenuDetails;
