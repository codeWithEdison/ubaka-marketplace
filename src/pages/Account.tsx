
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Account = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful login
    if (loginData.email && loginData.password) {
      setIsLoggedIn(true);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in to your account.",
      });
    }
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate password match
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate successful registration
    if (registerData.name && registerData.email && registerData.password) {
      setIsLoggedIn(true);
      toast({
        title: "Account created!",
        description: "Your account has been successfully created.",
      });
    }
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {isLoggedIn ? (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">My Account</h1>
              
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        View and update your personal information.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="fullName" className="text-sm font-medium">
                            Full Name
                          </label>
                          <Input id="fullName" value="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">
                            Email Address
                          </label>
                          <Input id="email" type="email" value="john.doe@example.com" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="phone" className="text-sm font-medium">
                            Phone Number
                          </label>
                          <Input id="phone" value="(555) 123-4567" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="company" className="text-sm font-medium">
                            Company (Optional)
                          </label>
                          <Input id="company" value="Acme Construction" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save Changes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="orders" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order History</CardTitle>
                      <CardDescription>
                        View your recent orders and track shipments.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-10">
                        <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                        <Button variant="outline" asChild>
                          <a href="/products">Start Shopping</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account preferences and security.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="currentPassword" className="text-sm font-medium">
                          Current Password
                        </label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="newPassword" className="text-sm font-medium">
                          New Password
                        </label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">
                          Confirm New Password
                        </label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">Delete Account</Button>
                      <Button>Update Password</Button>
                    </CardFooter>
                  </Card>
                  
                  <div className="mt-6 text-right">
                    <Button variant="ghost" onClick={handleLogout}>
                      Sign Out
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold mb-8 text-center">Account</h1>
              
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sign In</CardTitle>
                      <CardDescription>
                        Sign in to your account to view orders and manage your profile.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="login-email" className="text-sm font-medium">
                            Email Address
                          </label>
                          <Input
                            id="login-email"
                            name="email"
                            type="email"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label htmlFor="login-password" className="text-sm font-medium">
                              Password
                            </label>
                            <a href="#" className="text-sm text-primary">
                              Forgot password?
                            </a>
                          </div>
                          <Input
                            id="login-password"
                            name="password"
                            type="password"
                            value={loginData.password}
                            onChange={handleLoginChange}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Sign In
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="register" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create Account</CardTitle>
                      <CardDescription>
                        Register for a new account to start shopping.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="register-name" className="text-sm font-medium">
                            Full Name
                          </label>
                          <Input
                            id="register-name"
                            name="name"
                            value={registerData.name}
                            onChange={handleRegisterChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="register-email" className="text-sm font-medium">
                            Email Address
                          </label>
                          <Input
                            id="register-email"
                            name="email"
                            type="email"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="register-password" className="text-sm font-medium">
                            Password
                          </label>
                          <Input
                            id="register-password"
                            name="password"
                            type="password"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="register-confirm-password" className="text-sm font-medium">
                            Confirm Password
                          </label>
                          <Input
                            id="register-confirm-password"
                            name="confirmPassword"
                            type="password"
                            value={registerData.confirmPassword}
                            onChange={handleRegisterChange}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Create Account
                        </Button>
                      </form>
                    </CardContent>
                    <CardFooter>
                      <p className="text-sm text-muted-foreground text-center w-full">
                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Account;
