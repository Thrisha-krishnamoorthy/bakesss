
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  return (
    <>
      <Navbar />
      <main className="page-container pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif mb-8 text-center">About Our Bakery</h1>
          
          <div className="mb-12 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1926&q=80"
              alt="Our bakery"
              className="w-full h-80 object-cover"
            />
          </div>
          
          <div className="prose prose-lg max-w-none">
            <h2>Our Story</h2>
            <p>
              Founded in 2010, our bakery started as a small family operation with a simple mission: 
              to bring the joy of freshly baked goods to our community. What began as a passion project 
              in our home kitchen quickly blossomed into the beloved local bakery you know today.
            </p>
            
            <p>
              Over the years, we've remained committed to our core values of quality, tradition, and innovation. 
              Every item we create is made from scratch using time-honored techniques and the finest ingredients 
              we can source.
            </p>
            
            <h2>Our Philosophy</h2>
            <p>
              We believe that good food brings people together. That's why we put so much care into every loaf, 
              pastry, and treat we make. Our recipes have been perfected over generations, combining traditional 
              methods with modern twists to create unforgettable flavors.
            </p>
            
            <p>
              Sustainability is also central to our mission. We work with local farmers and suppliers whenever 
              possible, reducing our carbon footprint while supporting our local economy.
            </p>
            
            <h2>Our Team</h2>
            <p>
              Behind every delicious creation is our dedicated team of bakers and pastry chefs. Many have trained 
              at prestigious culinary schools, while others have learned their craft through years of hands-on 
              experience. What unites them all is their passion for baking and their commitment to excellence.
            </p>
            
            <p>
              From our kitchen to your table, we hope our baked goods bring a little bit of joy to your day. 
              Thank you for being part of our story.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default About;
