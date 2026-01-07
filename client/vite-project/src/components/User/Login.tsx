// client/vite-project/src/components/User/Login.tsx
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginComponent from '@/auth/LoginComponent';
import RegisterComponent from '@/auth/RegisterComponent';
// import heroImage from '@/assets/images/hero-image05.png';
import heroImage from '@/assets/images/snow1.png';


const Login = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Left Section - Image */}
          <div className="hidden md:block">
            <img 
              src={heroImage} 
              alt="Travel Hero" 
              // className="w-full rounded-2xl shadow-2xl"
            />
          </div>

          {/* Right Section - Auth Forms */}
          <div>
            <div className="text-center mb-8">
              <h1 className="font-display text-4xl font-bold mb-4">
                Discover Where Your{' '}
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Budget
                </span>{' '}
                Can Take You
              </h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{showRegister ? 'Create Account' : 'Welcome Back'}</CardTitle>
                <CardDescription>
                  {showRegister 
                    ? 'Start planning your dream vacation' 
                    : 'Sign in to access your itineraries'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showRegister ? (
                  <div className="space-y-4">
                    <RegisterComponent />
                    <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowRegister(false)}
                        className="p-0 h-auto font-semibold"
                      >
                        Login Here
                      </Button>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <LoginComponent />
                    <p className="text-center text-sm text-muted-foreground">
                      Don't have an account?{' '}
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowRegister(true)}
                        className="p-0 h-auto font-semibold"
                      >
                        Register Here
                      </Button>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;