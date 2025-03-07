
import { Link } from 'react-router-dom';
import { categories } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from 'lucide-react';

const Categories = () => {
  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold">Product Categories</h1>
            <p className="text-muted-foreground max-w-2xl">
              Browse our extensive range of construction materials categorized to help you find exactly what you need for your project.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              {categories.map((category) => (
                <Link key={category.id} to={`/categories/${category.id}`}>
                  <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-md group">
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                          <p className="text-muted-foreground text-sm mb-2">{category.description}</p>
                          <p className="text-sm text-primary">{category.count} Products</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Categories;
