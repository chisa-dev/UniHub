import React from "react";
import displayImg from "@/public/images/sign-up-page-img.png";
import Image from "next/image";
import FormInput from "@/components/ui/FormInput";
import GradientBackground from "@/components/ui/GradientBackground";
import Link from "next/link";

function SignUp() {
  return (
    <div className="flex justify-between text-n500 dark:text-n30 xxl:gap-20 max-xxl:container xxl:h-dvh max-xxl:justify-center relative ">
      <GradientBackground />
      <div className=" py-6 xxl:ml-[calc((100%-1296px)/2)] flex-1 flex flex-col justify-between items-start max-xxl:max-w-[600px]">
        
        <br />


        <div className=" w-full pt-4">
          <p className="text-2xl font-semibold ">Let&apos;s Get Started!</p>
          <p className="text-sm  pt-4">
           Welcome to UniHub! Please enter your details to create an account.
          </p>

          <form className="pt-6 sm:pt-10 grid grid-cols-2 gap-4 sm:gap-6">
            <div className=" max-sm:col-span-2">
              <FormInput title="First Name" placeholder="John" />
            </div>
            <div className=" max-sm:col-span-2">
              <FormInput title="Last Name" placeholder="Doe" />
            </div>
            <div className=" col-span-2">
              <FormInput
                title="Enter Your Email ID"
                placeholder="Your email ID here"
                type="email"
              />
            </div>
            <div className=" col-span-2">
              <FormInput
                title="Password"
                placeholder="*******"
                type="password"
              />
            </div>
            <p className="col-span-2 text-sm pt-2">
              Have an accounts?{" "}
              <Link href={"/"} className="text-errorColor font-semibold">
                Sign In
              </Link>
            </p>

            <div className=" col-span-2">
              <Link
                href={"/"}
                className="text-sm font-medium text-white bg-primaryColor text-center py-3 px-6 rounded-full block"
              >
                Sign Up
              </Link>
            </div>
          </form>

          {/* <div className="pt-8">
            <div className="flex justify-center items-center">
              <div className=" bg-n30 flex-1 h-px"></div>
              <p className="text-xs px-2">Or Continue</p>
              <div className=" bg-n30 flex-1 h-px"></div>
            </div>
            <div className="flex justify-center items-center pt-6 gap-2">
              <div className="flex justify-center items-center p-2 rounded-full border border-primaryColor/30 bg-primaryColor/5 text-xl hover:bg-primaryColor hover:border-primaryColor duration-300 hover:text-white cursor-pointer">
                <PiFacebookLogo />
              </div>
              <div className="flex justify-center items-center p-2 rounded-full border border-primaryColor/30 bg-primaryColor/5 text-xl hover:bg-primaryColor hover:border-primaryColor duration-300 hover:text-white cursor-pointer">
                <PiInstagramLogo />
              </div>
              <div className="flex justify-center items-center p-2 rounded-full border border-primaryColor/30 bg-primaryColor/5 text-xl hover:bg-primaryColor hover:border-primaryColor duration-300 hover:text-white cursor-pointer">
                <PiGoogleLogo />
              </div>
            </div>
          </div> */}
        </div>
      </div>
      <div className="w-1/2 max-xxl:hidden max-h-dvh overflow-hidden ">
        <Image src={displayImg} alt="" className=" w-full object-cover" />
      </div>
    </div>
  );
}

export default SignUp;
