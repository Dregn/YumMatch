import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Chef {
  id: number;
  name: string;
  profileImage: string;
  cuisine: string;
  price: number;
  description: string;
  rating: string;
  reviewCount: number;
}

const ChefBrowsing = () => {
  const [cuisine, setCuisine] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");

  const { data: chefs, isLoading } = useQuery<Chef[]>({
    queryKey: ["/api/chefs", cuisine],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(cuisine ? `/api/chefs?cuisine=${cuisine}` : "/api/chefs");
      if (!response.ok) {
        throw new Error("Failed to fetch chefs");
      }
      return response.json();
    }
  });

  return (
    <section id="chefs" className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-2">Our Professional Chefs</h2>
            <p className="text-lg text-neutral-500">
              Discover talented chefs ready to create amazing dining experiences in your home
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Select value={cuisine} onValueChange={setCuisine}>
              <SelectTrigger className="min-w-[130px]">
                <SelectValue placeholder="All Cuisines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="japanese">Japanese</SelectItem>
                <SelectItem value="indian">Indian</SelectItem>
                <SelectItem value="mediterranean">Mediterranean</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="min-w-[130px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="london">London</SelectItem>
                <SelectItem value="manchester">Manchester</SelectItem>
                <SelectItem value="birmingham">Birmingham</SelectItem>
                <SelectItem value="edinburgh">Edinburgh</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="min-w-[130px]">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="budget">$40 - $60</SelectItem>
                <SelectItem value="mid">$60 - $100</SelectItem>
                <SelectItem value="premium">$100+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <Skeleton className="w-full h-52" />
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <Skeleton className="w-32 h-6" />
                    <div className="ml-auto">
                      <Skeleton className="w-16 h-4" />
                    </div>
                  </div>
                  <Skeleton className="w-full h-12 mb-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-28 h-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chefs?.map((chef) => (
              <div key={chef.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="relative">
                  <img 
                    src={chef.profileImage} 
                    alt={`${chef.name} preparing food`} 
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="cuisine">
                      {chef.cuisine}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <h3 className="text-xl font-semibold">{chef.name}</h3>
                    <div className="ml-auto flex items-center">
                      <div className="text-yellow-500 mr-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      </div>
                      <span className="font-medium">{chef.rating}</span>
                      <span className="text-neutral-500 text-sm ml-1">({chef.reviewCount})</span>
                    </div>
                  </div>
                  <p className="text-neutral-500 mb-4 line-clamp-2">{chef.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-primary font-semibold">
                      From ${chef.price} per person
                    </div>
                    <Link href={`/chef/${chef.id}`}>
                      <Button size="sm" className="rounded-full">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-10">
          <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white">
            View All Chefs
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ChefBrowsing;
