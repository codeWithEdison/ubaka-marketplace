
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your account settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>No settings available at this time.</p>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
