"use client";
import React, { useEffect, useState } from "react";
import user from "@/public/images/user.png";
import Image from "next/image";
import InputFieldSecond from "@/components/ui/InputFieldSecond";
import TextArea from "@/components/ui/TextArea";
import { PiCloudArrowUp } from "react-icons/pi";
import SelectDropdown from "@/components/ui/SelectDropdown";
import {
  countryOptions,
  languageOptions,
} from "@/constants/data";
import SmallButtons from "@/components/ui/buttons/SmallButtons";
import { authService } from "@/app/auth/authService";
import Alert from "@/components/ui/Alert";

// User type to match backend response
interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

function EditProfileModal() {
  const [userData, setUserData] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Fetch user data on component mount
  useEffect(() => {
    const user = authService.getUser();
    if (user) {
      setUserData(user);
      
      // Split full name into first and last name
      if (user.full_name) {
        const nameParts = user.full_name.split(' ');
        if (nameParts.length > 0) {
          setFormData({
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' ')
          });
        }
      }
    }
  }, []);
  
  const handleUpdateProfile = () => {
    setIsLoading(true);
    
    // For now, just show a success message
    // In a real implementation, you would call an API to update the profile
    setTimeout(() => {
      setAlert({
        message: "Profile updated successfully!",
        type: 'success'
      });
      setIsLoading(false);
    }, 1000);
  };
  
  if (!userData) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      
      <div className="flex justify-start items-center pb-6 gap-3">
        <div className="flex justify-center items-center relative border rounded-full border-primaryColor/30 p-1.5">
          <Image 
            src={userData.avatar_url ? userData.avatar_url : user}
            alt={userData.username || "User"}
            width={44}
            height={44}
            className="size-11 rounded-full object-cover" 
          />
          <label
            htmlFor="photo-upload"
            className="bg-white dark:bg-n0 flex justify-center items-center absolute bottom-1 right-1 rounded-full p-0.5 cursor-pointer"
          >
            <PiCloudArrowUp />
            <input type="file" className="hidden" id="photo-upload" />
          </label>
        </div>
        <div className="">
          <p className="text-sm font-medium">Profile Picture</p>
          <p className="text-xs pt-1 ">
            Choose an avatar or image that represents you
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <InputFieldSecond
          className="col-span-12 sm:col-span-6"
          placeholder={formData.firstName || "First Name"}
          title="First Name"
        />
        <InputFieldSecond
          className="col-span-12 sm:col-span-6"
          placeholder={formData.lastName || "Last Name"}
          title="Last Name"
        />
        <InputFieldSecond
          className="col-span-12"
          placeholder={userData.username}
          title="Username"
        />
        <InputFieldSecond
          className="col-span-12"
          placeholder={userData.email}
          title="Email"
          type="email"
        />
        <div className={"col-span-12"}>
          <SelectDropdown
            options={languageOptions}
            placeholder="Select your preferred language"
            title="Preferred Language"
          />
        </div>
      </div>
      <div className="flex justify-start items-center gap-2 pt-5 text-xs">
        <SmallButtons 
          name={isLoading ? "Updating..." : "Update Now"} 
          fn={handleUpdateProfile}
        />
        <SmallButtons name="Cancel" secondary={true} />
      </div>
    </div>
  );
}

export default EditProfileModal;
