// src/components/Header.jsx
import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Route, User, LogOut, Menu, MapPin, Calendar} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { BackButton } from "@/components/BackButton";
// import logo from "@assets/logos/Yatra_Maker_Logo_1.svg";
import logo from "@assets/logos/logos2/logo-yatramaker-nobg.png";

const NAV_ITEMS = {
  authenticated: [
    { to: '/dashboard', label: 'Dashboard', icon: Calendar },
    { to: '/itineraries', label: 'My Itineraries', icon: MapPin },
    { to: '/search', label: 'Plan Trip', icon: Route },
  ],
  unauthenticated: [
    { to: '/search', label: 'Plan Trip', icon: Route },
    { to: '/login', label: 'Sign In', icon: User },
  ],
};

export default function Header() {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const navItems = isAuthenticated ? NAV_ITEMS.authenticated : NAV_ITEMS.unauthenticated;

  // Show logo/title only when NOT on detail pages
const showLogoOnMobile = ![
  '/destination/',
  '/itinerary/',
  '/results'
].some(path => location.pathname.startsWith(path));

  // Optional: contextual title for mobile
  const getContextualTitle = () => {
    if (location.pathname.startsWith('/destination/')) return 'Destination';
    if (location.pathname.startsWith('/itinerary/')) return 'Itinerary';
    if (location.pathname === '/results') return 'Results';
    if (location.pathname === '/itineraries') return 'My Itineraries';
    if (location.pathname === '/dashboard') return 'Dashboard';
    return '';
  };

return (
  <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
    <div className="max-w-7xl mx-auto px-4 py-2">
      <div className="flex items-center justify-between">
        {/* LEFT: Back (mobile) + Logo (desktop always, mobile only on home/results) */}
        <div className="flex items-center gap-3 min-w-0">
          <BackButton /> {/* Only shows on mobile */}
          
          {/* LOGO: Always on desktop, conditionally on mobile */}
          <Link to="/" className="flex items-center gap-3 min-w-0">
            {/* <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <Route className="h-5 w-5 text-white" />
            </div> */}
              <img
                src={logo}
                alt="YatraMaker Logo"
                className="h-10 sm:h-12 md:h-14 w-auto min-w-[140px] object-contain filter brightness-105 contrast-105"
                loading="eager"
                fetchPriority="high"
              />
              {/* <div className="hidden sm:block"> {/* Desktop only 
                <h1 className="font-display font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  YatraMaker
                </h1>
                <p className="text-xs text-muted-foreground">
                  AI-Powered Travel Discovery
                </p>
              </div> */}
            {/* Mobile contextual title (optional) */}
            {!showLogoOnMobile && (
              <div className="text-sm font-medium truncate max-w-[180px] sm:hidden">
                {getContextualTitle()}
              </div>
            )}
          </Link>
        </div>

          {/* Center: Desktop nav + ThemeToggle (desktop only) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.to}
                  variant="ghost"
                  asChild
                  className="text-foreground hover:text-primary"
                >
                  <Link to={item.to}>
                    {Icon && <Icon className="h-4 w-4 mr-2" />}
                    {item.label}
                  </Link>
                </Button>
              );
            })}
            {isAuthenticated && (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
            <ThemeToggle />
          </nav>

          {/* Right: Mobile menu + theme (mobile only) */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated && user && (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.to} asChild>
                      <Link to={item.to} className="flex items-center">
                        {Icon && <Icon className="h-4 w-4 mr-2" />}
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                {isAuthenticated && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

// // src/components/Header.jsx
// import { Link, useLocation } from "react-router-dom";
// import { useContext, useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { ThemeToggle } from "@/components/ThemeToggle";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Route, User, LogOut, Menu, MapPin, Calendar, ArrowLeft } from "lucide-react";
// import { AuthContext } from "@/context/AuthContext";
// import { BackButton } from "@/components/BackButton";
// import { useNavigation } from "@/context/NavigationContext";
// import logoLight from "@assets/logos/Yatra_Maker_Logo_1.svg";
// import logoDark from "@assets/logos/Yatra_Maker_Logo_Dark.svg"; // You'll create this

// const NAV_ITEMS = {
//   authenticated: [
//     { to: '/dashboard', label: 'Dashboard', icon: Calendar },
//     { to: '/itineraries', label: 'My Itineraries', icon: MapPin },
//     { to: '/search', label: 'Plan Trip', icon: Route },
//   ],
//   unauthenticated: [
//     { to: '/search', label: 'Plan Trip', icon: Route },
//     { to: '/login', label: 'Sign In', icon: User },
//   ],
// };

// export default function Header() {
//   const { isAuthenticated, logout, user } = useContext(AuthContext);
//   const { source } = useNavigation();
//   const location = useLocation();
//   const [isDark, setIsDark] = useState(false);

//   useEffect(() => {
//     // Check current theme
//     const checkTheme = () => {
//       setIsDark(document.documentElement.classList.contains('dark'));
//     };
    
//     checkTheme();
    
//     // Watch for theme changes
//     const observer = new MutationObserver(checkTheme);
//     observer.observe(document.documentElement, { 
//       attributes: true, 
//       attributeFilter: ['class'] 
//     });
    
//     return () => observer.disconnect();
//   }, []);

//   const handleLogout = () => {
//     logout();
//   };

//   const navItems = isAuthenticated ? NAV_ITEMS.authenticated : NAV_ITEMS.unauthenticated;

//   const showLogoOnMobile = ![
//     '/destination/',
//     '/itinerary/',
//     '/results'
//   ].some(path => location.pathname.startsWith(path));

//   const getContextualTitle = () => {
//     if (location.pathname.startsWith('/destination/')) return 'Destination';
//     if (location.pathname.startsWith('/itinerary/')) return 'Itinerary';
//     if (location.pathname === '/results') return 'Results';
//     if (location.pathname === '/itineraries') return 'My Itineraries';
//     if (location.pathname === '/dashboard') return 'Dashboard';
//     return '';
//   };

//   return (
//     <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
//       <div className="max-w-7xl mx-auto px-4 py-3">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3 min-w-0">
//             <BackButton />
            
//             <Link to="/" className="flex items-center gap-3 min-w-0">
//               {/* Light logo - hidden in dark mode */}
//               <img
//                 src={logoLight}
//                 alt="YatraMaker Logo"
//                 className={`h-8 sm:h-10 md:h-12 w-auto object-contain ${isDark ? 'hidden' : 'block'}`}
//               />
              
//               {/* Dark logo - hidden in light mode */}
//               <img
//                 src={logoDark}
//                 alt="YatraMaker Logo"
//                 className={`h-8 sm:h-10 md:h-12 w-auto object-contain ${isDark ? 'block' : 'hidden'}`}
//               />
              
//               {!showLogoOnMobile && (
//                 <div className="text-sm font-medium truncate max-w-[180px] sm:hidden">
//                   {getContextualTitle()}
//                 </div>
//               )}
//             </Link>
//           </div>
//           {/* Center: Desktop nav + ThemeToggle (desktop only) */}
//           <nav className="hidden md:flex items-center gap-1">
//             {navItems.map((item) => {
//               const Icon = item.icon;
//               return (
//                 <Button
//                   key={item.to}
//                   variant="ghost"
//                   asChild
//                   className="text-foreground hover:text-primary"
//                 >
//                   <Link to={item.to}>
//                     {Icon && <Icon className="h-4 w-4 mr-2" />}
//                     {item.label}
//                   </Link>
//                 </Button>
//               );
//             })}
//             {isAuthenticated && (
//               <Button
//                 variant="ghost"
//                 onClick={handleLogout}
//                 className="text-foreground hover:text-destructive"
//               >
//                 <LogOut className="h-4 w-4 mr-2" />
//                 Logout
//               </Button>
//             )}
//             <ThemeToggle />
//           </nav>

//           {/* Right: Mobile menu + theme (mobile only) */}
//           <div className="flex md:hidden items-center gap-2">
//             <ThemeToggle />
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="icon">
//                   <Menu className="h-5 w-5" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-56">
//                 {isAuthenticated && user && (
//                   <>
//                     <div className="px-2 py-1.5">
//                       <p className="text-sm font-medium">{user.name}</p>
//                       <p className="text-xs text-muted-foreground">{user.email}</p>
//                     </div>
//                     <DropdownMenuSeparator />
//                   </>
//                 )}
//                 {navItems.map((item) => {
//                   const Icon = item.icon;
//                   return (
//                     <DropdownMenuItem key={item.to} asChild>
//                       <Link to={item.to} className="flex items-center">
//                         {Icon && <Icon className="h-4 w-4 mr-2" />}
//                         {item.label}
//                       </Link>
//                     </DropdownMenuItem>
//                   );
//                 })}
//                 {isAuthenticated && (
//                   <>
//                     <DropdownMenuSeparator />
//                     <DropdownMenuItem onClick={handleLogout} className="text-destructive">
//                       <LogOut className="h-4 w-4 mr-2" />
//                       Logout
//                     </DropdownMenuItem>
//                   </>
//                 )}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }