"use client";
import React, { FormEvent, useState, useEffect } from "react";
import displayImg from "@/public/images/sign-in-page-img.png";
import Image from "next/image";
import FormInput from "@/components/ui/FormInput";
import GradientBackground from "@/components/ui/GradientBackground";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/Alert";
import { authService } from "../authService";

// Validation types
type ValidationErrors = {
  email?: string;
  password?: string;
};

function SignIn() {
  // Form values
  const [formValues, setFormValues] = useState({
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

    try {
      const response = await authService.login({
        email: formValues.email,
        password: formValues.password
      });

      // Show success message
      setAlert({
        message: response.message || "Login successful!",
        type: 'success'
      });

      // Redirect to home after successful login
      setTimeout(() => {
        router.push("/home");
      }, 1500);

    } catch (error: any) {
      console.error('[LOG login] ========= Login error:', error);
      
      if (error.message === "Invalid credentials") {
        setAlert({
          message: "Invalid email or password. Please try again.",
          type: 'error'
        });
      } else {
        setAlert({
          message: error.message || "Login failed. Please try again.",
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

        <div className=" w-full pt-4">
          <p className="text-2xl font-semibold ">Welcome Back!</p>
          <p className="text-sm  pt-4">Sign in to your account and join us</p>

          <form
            onSubmit={handleSubmit}
            className="pt-10 grid grid-cols-2 gap-4 sm:gap-6"
          >
            <div className=" col-span-2">
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
            <div className=" col-span-2">
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
              <Link
                href={"/auth/forgot-password"}
                className="text-end block pt-4 text-primaryColor text-sm"
              >
                Forget password?
              </Link>
            </div>

            <p className="col-span-2 text-sm pt-2">
              Don&apos;t have an accounts?{" "}
              <Link href={"/auth/signup"} className="text-errorColor font-semibold">
                Sign Up
              </Link>
            </p>

            <div className=" col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`text-sm font-medium text-white bg-primaryColor text-center py-3 px-6 rounded-full block w-full ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Signing In..." : "Sign In"}
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
export default SignIn;

