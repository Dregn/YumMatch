import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Utensils, Users, CircleDot } from "lucide-react";
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

const FeaturedMenus = () => {
  const { data: menus, isLoading } = useQuery<Menu[]>({
    queryKey: ["/api/menus"],
    queryFn: async () => {
      const response = await fetch("/api/menus");
      if (!response.ok) {
        throw new Error("Failed to fetch menus");
      }
      return response.json();
    }
  });

  return (
    <section id="menus" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Popular Menu Options</h2>
          <p className="text-lg text-neutral-500 max-w-3xl mx-auto">
            Our chefs offer a wide range of menu options to suit any taste or dietary preference
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-6">
                  <Skeleton className="w-32 h-6 mb-2" />
                  <Skeleton className="w-full h-4 mb-4" />
                  <Skeleton className="w-full h-16 mb-4" />
                  <div className="space-y-2 mb-6">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="w-full h-4" />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-24 h-5" />
                    <Skeleton className="w-28 h-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menus?.map((menu) => (
              <div key={menu.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                <img 
                  src={menu.image} 
                  alt={`${menu.name} menu`} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{menu.name}</h3>
                  <div className="flex items-center text-sm text-neutral-500 mb-4">
                    <span className="mr-3 flex items-center">
                      <Utensils className="w-4 h-4 mr-1" /> {menu.courses}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" /> {menu.guestRange}
                    </span>
                  </div>
                  <p className="text-neutral-500 mb-4">{menu.description}</p>
                  <div className="space-y-2 mb-6">
                    {menu.items.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <CircleDot className="w-3 h-3 text-primary mr-2" />
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-primary font-semibold">
                      From ${menu.price} per person
                    </div>
                    <Link href={`/menu/${menu.id}`}>
                      <Button size="sm" className="rounded-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedMenus;
