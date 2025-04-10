import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Star, MapPin, Clock, Calendar, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const ChefProfile = () => {
  const { id } = useParams();
  const chefId = parseInt(id || "0");
  
  const { data: chef, isLoading } = useQuery<Chef>({
    queryKey: [`/api/chefs/${chefId}`],
    queryFn: async () => {
      const response = await fetch(`/api/chefs/${chefId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chef");
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!chef) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Chef not found</h2>
        <p className="mb-6">The chef you're looking for doesn't exist or has been removed.</p>
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
          Back to Chefs
        </a>
      </Link>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="relative">
              <img 
                src={chef.profileImage} 
                alt={chef.name} 
                className="w-32 h-32 rounded-full object-cover"
              />
              <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                Available
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-semibold mb-2">{chef.name}</h1>
              <div className="flex items-center mb-1">
                <Badge variant="cuisine" className="mr-2">
                  {chef.cuisine}
                </Badge>
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 mr-1" />
                  <span className="font-medium text-neutral-800">{chef.rating}</span>
                  <span className="text-neutral-500 text-sm ml-1">({chef.reviewCount} reviews)</span>
                </div>
              </div>
              <div className="flex items-center text-neutral-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span>London, UK</span>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="about" className="mb-8">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="menus">Menus</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">About {chef.name}</h2>
                  <p className="text-neutral-600">{chef.description}</p>
                  <p className="text-neutral-600 mt-3">
                    With a passion for creating memorable dining experiences, {chef.name} 
                    specializes in {chef.cuisine.toLowerCase()} that combines traditional 
                    techniques with modern presentation. Each meal is customized to your preferences
                    and dietary requirements, using only the freshest seasonal ingredients.
                  </p>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-3">Experience</h2>
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="w-24 text-neutral-500">2018-Present</div>
                      <div>
                        <h3 className="font-medium">Private Chef</h3>
                        <p className="text-neutral-600 text-sm">
                          Catering exclusive dinner parties and special events
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-24 text-neutral-500">2014-2018</div>
                      <div>
                        <h3 className="font-medium">Head Chef, The Gourmet Bistro</h3>
                        <p className="text-neutral-600 text-sm">
                          Leading kitchen operations at a renowned restaurant
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-24 text-neutral-500">2010-2014</div>
                      <div>
                        <h3 className="font-medium">Sous Chef, Michelin Star Restaurant</h3>
                        <p className="text-neutral-600 text-sm">
                          Working under award-winning chefs to perfect culinary skills
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-3">What to Expect</h2>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-primary mt-0.5 mr-2" />
                      <span className="text-neutral-600">Personalized menu planning based on your preferences</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-primary mt-0.5 mr-2" />
                      <span className="text-neutral-600">Grocery shopping for fresh, quality ingredients</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-primary mt-0.5 mr-2" />
                      <span className="text-neutral-600">Cooking and professional plating in your kitchen</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-primary mt-0.5 mr-2" />
                      <span className="text-neutral-600">Table service during your meal</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-primary mt-0.5 mr-2" />
                      <span className="text-neutral-600">Kitchen cleanup after your dining experience</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="menus" className="mt-6">
              <div className="space-y-8">
                <div className="border border-neutral-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3">Classic {chef.cuisine}</h3>
                  <p className="text-neutral-600 mb-4">
                    A traditional menu featuring the best of {chef.cuisine.toLowerCase()} cooking.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="font-medium mb-2">Appetizers</h4>
                      <ul className="space-y-1 text-neutral-600">
                        <li>• Fresh seasonal salad with house dressing</li>
                        <li>• Handmade appetizer selection</li>
                        <li>• Specialty bread with dipping oils</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Main Course (choice of)</h4>
                      <ul className="space-y-1 text-neutral-600">
                        <li>• Signature dish with seasonal vegetables</li>
                        <li>• Premium protein option with accompaniments</li>
                        <li>• Vegetarian/vegan alternative available</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Dessert</h4>
                      <ul className="space-y-1 text-neutral-600">
                        <li>• Traditional dessert with modern presentation</li>
                        <li>• Coffee or tea service</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-primary font-semibold">
                      From ${chef.price} per person
                    </div>
                    <p className="text-neutral-500 text-sm">
                      Minimum 4 guests
                    </p>
                  </div>
                </div>
                
                <div className="border border-neutral-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3">Premium Tasting Menu</h3>
                  <p className="text-neutral-600 mb-4">
                    A curated multi-course experience showcasing the finest techniques and ingredients.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="font-medium mb-2">5-Course Tasting Menu</h4>
                      <ul className="space-y-1 text-neutral-600">
                        <li>• Amuse-bouche</li>
                        <li>• First course: Seasonal appetizer</li>
                        <li>• Second course: Specialty dish</li>
                        <li>• Main course: Chef's signature creation</li>
                        <li>• Dessert: Artisanal sweet course</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Optional Add-ons</h4>
                      <ul className="space-y-1 text-neutral-600">
                        <li>• Wine pairing: $35 per person</li>
                        <li>• Cheese course: $15 per person</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-primary font-semibold">
                      From ${chef.price + 35} per person
                    </div>
                    <p className="text-neutral-500 text-sm">
                      Minimum 2 guests
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="text-yellow-500 flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                      <span className="font-medium text-lg">{chef.rating} out of 5</span>
                    </div>
                    <p className="text-neutral-500">Based on {chef.reviewCount} reviews</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border-b border-neutral-200 pb-6">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden mr-3">
                          <img 
                            src={`https://i.pravatar.cc/80?img=${i + 10}`} 
                            alt="Reviewer" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">
                            {["John D.", "Sarah M.", "Michael T."][i]}
                          </div>
                          <div className="text-neutral-500 text-sm">
                            {["March 2023", "February 2023", "January 2023"][i]}
                          </div>
                        </div>
                        <div className="ml-auto flex items-center text-yellow-500">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-neutral-600">
                        {[
                          `${chef.name} created an incredible dining experience for my birthday dinner. The food was exceptional and beautifully presented. Every course was perfect, and the service was impeccable. Will definitely book again!`,
                          `We had a wonderful anniversary dinner prepared by ${chef.name}. The menu was perfectly tailored to our preferences, and the attention to detail was impressive. Our guests were amazed by the quality and presentation.`,
                          `${chef.name} exceeded our expectations for our small gathering. Professional, friendly, and incredibly talented. The kitchen was left spotless, and the meal was memorable. Highly recommend!`
                        ][i]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="md:w-1/3">
          <div className="bg-white border border-neutral-200 rounded-lg p-6 sticky top-24">
            <h3 className="text-xl font-semibold mb-4">Book this Chef</h3>
            
            <div className="mb-6">
              <div className="text-primary font-semibold text-xl mb-2">
                From ${chef.price} per person
              </div>
              <p className="text-neutral-500 text-sm">
                Price includes shopping, cooking, serving, and cleanup
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-neutral-500 mr-3" />
                <div>
                  <p className="font-medium">Select a Date</p>
                  <p className="text-neutral-500 text-sm">Check chef's availability</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-neutral-500 mr-3" />
                <div>
                  <p className="font-medium">Choose Time</p>
                  <p className="text-neutral-500 text-sm">Lunch or dinner service</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-neutral-500 mr-3" />
                <div>
                  <p className="font-medium">Guest Count</p>
                  <p className="text-neutral-500 text-sm">Minimum 2 guests required</p>
                </div>
              </div>
            </div>
            
            <Link href="#book-now">
              <Button className="w-full rounded-full">
                Check Availability
              </Button>
            </Link>
            
            <div className="mt-4 text-center text-neutral-500 text-sm">
              No payment required to check availability
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefProfile;
