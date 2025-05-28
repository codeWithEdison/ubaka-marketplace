import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileForm from '@/components/account/ProfileForm';
import OrderHistory from '@/components/account/OrderHistory';
import TrackingTab from '@/components/account/TrackingTab';
import SettingsTab from '@/components/account/SettingsTab';
import { useSearchParams } from 'react-router-dom';

const Account = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>

          <Tabs defaultValue={activeTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileForm />
            </TabsContent>

            <TabsContent value="orders">
              <OrderHistory />
            </TabsContent>

            <TabsContent value="tracking">
              <TrackingTab />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Account;
