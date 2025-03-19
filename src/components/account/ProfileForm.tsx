
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const ProfileForm = () => {
  const [profile, setProfile] = useState<ProfileData>({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "123-456-7890",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    zipCode: "91234",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile updated!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              type="text"
              id="firstName"
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              type="text"
              id="lastName"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={profile.phoneNumber}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              type="text"
              id="address"
              name="address"
              value={profile.address}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              type="text"
              id="city"
              name="city"
              value={profile.city}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              type="text"
              id="state"
              name="state"
              value={profile.state}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              type="text"
              id="zipCode"
              name="zipCode"
              value={profile.zipCode}
              onChange={handleChange}
            />
          </div>
          <Button type="submit">Update Profile</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
