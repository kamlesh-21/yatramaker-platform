// // client/vite-project/src/App.jsx - COMPLETE VERSION
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider } from "@tanstack/react-query";  
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/User/Login';
import Dashboard from './components/User/Dashboard';
import SearchPage from '@/pages/SearchPage';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import Onboarding from './components/User/UserOnboarding';
import SavedDestinationDetail from './components/User/SavedDestinationDetail';
import FAQ from './components/Corporate/FAQ';
// import News from './components/Corporate/News';
import TermsOfService from './components/Corporate/TermsOfService';
import Privacy from './components/Corporate/Privacy';
import AboutUs from './components/Corporate/AboutUs';
// import Contact from './components/Corporate/Contact';
// import Partner from './components/Corporate/Partner';
import BlogLandingPage from './components/Corporate/Blog/BlogLandingPage';
import SingleBlogPost from './components/Corporate/Blog/SingleBlogPost';
import PrivateRoute from './components/PrivateRoute';
// import AccommodationOptions from './components/Results/AccommodationOptions';
import UserItineraries from './components/User/UserItineraries';
import ScrollToTop from './ScrollToTop';
import BaseSEO from './components/BaseSEO';
import { NavigationProvider } from "@/context/NavigationContext";
import Home from '@/pages/Home';
import Results from '@/pages/Results';
import DestinationDetail from '@/pages/DestinationDetail';
import ItineraryDetail from '@/pages/ItineraryDetail';
import NotFound from '@/pages/not-found';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <HelmetProvider>
          <NavigationProvider>
          <div className="app-container">
            <ScrollToTop />
            <Header />
            
            <div className="content">
              <Routes>
                {/* Home Page */}
                <Route path="/" element={<Home />} />

                <Route path="/results" element={<Results />} />
                <Route path="/destination/:id" element={<DestinationDetail />} />
                <Route path="/itinerary/:id" element={<ItineraryDetail />} />

                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
                <Route path="/itineraries" element={<PrivateRoute><UserItineraries /></PrivateRoute>} />
                <Route path="/saved-destination/:id" element={<PrivateRoute><SavedDestinationDetail /></PrivateRoute>} />              

                <Route path="/search" element={
                  <>
                    <BaseSEO 
                      title="Plan Your Trip | Budget Travel Planner India"
                      description="Smart travel planner finds destinations within your budget."
                      canonicalUrl="https://yatramaker.com/search"
                    />
                    <SearchPage />
                  </>
                } />
                
                <Route path="/about" element={<AboutUs />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<Privacy />} /> 
                <Route path="/blog" element={<BlogLandingPage />} />
                <Route path="/blog/:slug" element={<SingleBlogPost />} />

                {/* <Route path="/contact" element={<Contact />} />
                <Route path="/partner" element={<Partner />} />
                <Route path="/news" element={<News />} /> 
                <Route path="/accommodation-options" element={<AccommodationOptions />} />*/}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
          </NavigationProvider>
        </HelmetProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;