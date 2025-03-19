
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TrackingTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracking Information</CardTitle>
        <CardDescription>Track your recent orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>No tracking information available at this time.</p>
      </CardContent>
    </Card>
  );
};

export default TrackingTab;
