"use client";
import React, { FormEvent, useState, useEffect } from "react";
import displayImg from "@/public/images/sign-up-page-img.png";
import Image from "next/image";
import FormInput from "@/components/ui/FormInput";
import GradientBackground from "@/components/ui/GradientBackground";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/Alert";
import { authService } from "../authService";

// Validation types
type ValidationErrors = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
};

function SignUp() {
  // Form values
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  // Form validation errors
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // Form touched state to track which fields have been interacted with
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Alerts
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const router = useRouter();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input blur for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate form fields
  const validateForm = () => {
    let valid = true;
    const newErrors: ValidationErrors = {};

    // Validate first name
    if (!formValues.firstName.trim()) {
      newErrors.firstName = "First name is required";
      valid = false;
    }

    // Validate last name
    if (!formValues.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      valid = false;
    }

    // Validate username
    if (!formValues.username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    } else if (formValues.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      valid = false;
    }

    // Validate email
    if (!formValues.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!isValidEmail(formValues.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    // Validate password
    if (!formValues.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formValues.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Run validation on field change if the field has been touched
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [formValues]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Set all fields as touched
    const allTouched = Object.keys(formValues).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouched(allTouched);
    
    // Validate all fields
    const isValid = validateForm();
    
    if (!isValid) {
      setAlert({
        message: "Please correct the errors in the form",
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    
    // Create full name from first and last name
    const fullName = `${formValues.firstName} ${formValues.lastName}`.trim();

    try {
      const response = await authService.signup({
        username: formValues.username,
        email: formValues.email,
        password: formValues.password,
        fullName
      });

      // Show success message
      setAlert({
        message: response.message || "Account created successfully!",
        type: 'success'
      });

      // Redirect to home page after successful signup
      setTimeout(() => {
        router.push("/home");
      }, 1500);
    } catch (error: any) {
      console.error('[LOG signup] ========= Signup error:', error);
      
      // Handle API-specific error messages
      if (error.message) {
        if (error.message.includes("Username already taken")) {
          setErrors(prev => ({ ...prev, username: "This username is already taken" }));
        } else if (error.message.includes("Email already registered")) {
          setErrors(prev => ({ ...prev, email: "This email is already registered" }));
        }
        
        setAlert({
          message: error.message,
          type: 'error'
        });
      } else {
        setAlert({
          message: "Error creating account. Please try again.",
          type: 'error'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-between text-n500 dark:text-n30 xxl:gap-20 max-xxl:container xxl:h-dvh max-xxl:justify-center relative ">
      <GradientBackground />

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className=" py-6 xxl:ml-[calc((100%-1296px)/2)] flex-1 flex flex-col justify-between items-start max-xxl:max-w-[600px]">
        
        <br />

        <div className="w-full pt-4">
          <p className="text-2xl font-semibold ">Let&apos;s Get Started!</p>
          <p className="text-sm pt-4">
           Welcome to UniHub! Please enter your details to create an account.
          </p>

          <form onSubmit={handleSubmit} className="pt-6 sm:pt-10 grid grid-cols-2 gap-4 sm:gap-6">
            <div className="max-sm:col-span-2">
              <FormInput 
                title="First Name" 
                placeholder="John" 
                name="firstName"
                value={formValues.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.firstName ? errors.firstName : undefined}
                required
              />
            </div>
            <div className="max-sm:col-span-2">
              <FormInput 
                title="Last Name" 
                placeholder="Doe" 
                name="lastName"
                value={formValues.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.lastName ? errors.lastName : undefined}
                required
              />
            </div>
            <div className="col-span-2">
              <FormInput
                title="Username"
                placeholder="Choose a unique username"
                name="username"
                value={formValues.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.username ? errors.username : undefined}
                required
              />
            </div>
            <div className="col-span-2">
              <FormInput
                title="Enter Your Email ID"
                placeholder="Your email ID here"
                type="email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email ? errors.email : undefined}
                required
              />
            </div>
            <div className="col-span-2">
              <FormInput
                title="Password"
                placeholder="*******"
                type="password"
                name="password"
                value={formValues.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password ? errors.password : undefined}
                required
              />
            </div>
            <p className="col-span-2 text-sm pt-2">
              Have an account?{" "}
              <Link href="/auth/login" className="text-errorColor font-semibold">
                Sign In
              </Link>
            </p>

            <div className="col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`text-sm font-medium text-white bg-primaryColor text-center py-3 px-6 rounded-full block w-full ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>
            </div>
          </form>
       
        </div>
      </div>
      <div className="w-1/2 max-xxl:hidden max-h-dvh overflow-hidden ">
        <Image src={displayImg} alt="" className=" w-full object-cover" />
      </div>
    </div>
  );
}

export default SignUp;

