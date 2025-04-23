"use client";
import React, { FormEvent, useState } from "react";
import displayImg from "@/public/images/sign-in-page-img.png";
import Image from "next/image";
import FormInput from "@/components/ui/FormInput";
import GradientBackground from "@/components/ui/GradientBackground";
import Link from "next/link";
import { useRouter } from "next/navigation";

function SignIn() {
  const [userEmail, setUserEmail] = useState("geme@aastustudent.edu.et");
  const [userPassword, setUserPassword] = useState("123456");
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isUserEmailCorrect = userEmail === "geme@aastustudent.edu.et";
    const isUserPasswordCorrect = userPassword === "123456";

    if (isUserEmailCorrect && isUserPasswordCorrect) {
      router.push("/new-chat");
    } else {
      setIsError(true);
    }
  };
  return (
    <div className="flex justify-between text-n500 dark:text-n30 xxl:gap-20 max-xxl:container xxl:h-dvh max-xxl:justify-center relative ">
      <GradientBackground />
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
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
            <div className=" col-span-2">
              <FormInput
                title="Password"
                placeholder="*******"
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
              />
              <Link
                href={"/"}
                className="text-end block pt-4 text-primaryColor text-sm"
              >
                Forget password?
              </Link>
            </div>

            <p className="col-span-2 text-sm pt-2">
              Don&apos;t have an accounts?{" "}
              <Link href={"/sign-up"} className="text-errorColor font-semibold">
                Sign Up
              </Link>
            </p>

            <div className=" col-span-2">
              <button
                type="submit"
                className="text-sm font-medium text-white bg-primaryColor text-center py-3 px-6 rounded-full block w-full"
              >
                Sign In
              </button>
              {isError && (
                <p className="text-errorColor text-sm pt-2">
                  Please enter correct information
                </p>
              )}
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

export default SignIn;
