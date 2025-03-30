
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <main className="page-container pt-24 min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-lg">
          <h1 className="text-8xl font-serif mb-6">404</h1>
          <p className="text-2xl font-medium mb-4">Page Not Found</p>
          <p className="text-muted-foreground mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium transition-all hover:bg-primary/90 btn-hover inline-flex items-center justify-center"
            >
              <Home className="mr-2 h-4 w-4" /> Back to Home
            </Link>
            
            <Link
              to="/my-orders"
              className="border border-primary text-primary bg-transparent px-6 py-3 rounded-md font-medium transition-all hover:bg-primary/10 inline-flex items-center justify-center"
            >
              <ShoppingBag className="mr-2 h-4 w-4" /> View My Orders
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
