"use client";
import ToggleButton from "@/components/ui/ToggleButton";
import { upgradePlanDetails } from "@/constants/data";
import { useMainModal } from "@/stores/modal";
import React, { useState } from "react";
import { PiCheckCircle, PiXCircle } from "react-icons/pi";

function UpgradePlan() {
  const { modalOpen } = useMainModal();
  const [showYearlyPrice, setShowYearlyPrice] = useState(false);
  return (
    <div className="  h-full flex-1 overflow-auto w-full z-20 flex justify-center items-start">
      <div className="flex flex-col justify-center items-center px-4 lg:px-6 max-w-[1080px] w-full">
        <div className="text-center">
          <p className="text-2xl font-semibold text-n700 dark:text-n30 ">
            Upgrade your plan
          </p>
          <p className="pt-2 max-w-[600px]">
            Manage your subscription and payment details
          </p>
        </div>
        <div className="pt-10 flex justify-center items-center gap-4">
          <p className=" font-medium">Monthly</p>
          <ToggleButton fn={() => setShowYearlyPrice((prev) => !prev)} />
          <p className=" font-medium">
            Yearly <span className="text-primaryColor">(Save 30%)</span>{" "}
          </p>
        </div>
        <div className="flex justify-center items-center py-12 w-full max-sm:flex-col max-sm:gap-6">
          {upgradePlanDetails.map(
            ({ id, name, icon, price, features, notProvidedFeatures }, idx) => (
              <div
                className={` border  rounded-xl flex flex-col justify-center items-center p-4 md:p-6 flex-1 ${
                  idx === 1
                    ? " bg-primaryColor border-primaryColor scale-105 text-white"
                    : "bg-primaryColor/5 border-primaryColor/30"
                }`}
                key={id}
              >
                {React.createElement(icon, {
                  className: ` text-[40px] lg:text-[60px]  ${
                    idx === 1 ? " text-white" : "text-primaryColor"
                  }`,
                })}
                <p
                  className={`text-base sm:text-lg font-semibold pt-2  pb-3 sm:pb-5 ${
                    idx === 1 ? " text-white" : "text-primaryColor"
                  }`}
                >
                  {name}
                </p>

                <div
                  className={`py-3 sm:py-4 border-y  flex flex-col justify-center items-center sm:gap-2 w-full ${
                    idx === 1 ? " border-white/30" : "border-primaryColor/20"
                  }`}
                >
                  <p className="text-3xl lg:text-4xl font-semibold ">
                    {price === 0
                      ? "Free"
                      : `$${showYearlyPrice ? price * 12 : price}`}
                  </p>
                  <p className="max-lg:text-sm">Per month</p>
                </div>
                <ul className="pt-5 flex flex-col gap-3 md:gap-4 text-xs lg:text-sm">
                  {features.map((item, index) => (
                    <li
                      className="flex justify-start items-start gap-2"
                      key={`${index}`}
                    >
                      <PiCheckCircle
                        className={` text-base lg:text-xl ${
                          idx === 1 ? "text-white" : "text-primaryColor"
                        }`}
                      />
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
                  {notProvidedFeatures.map((item, idx) => (
                    <li
                      className="flex justify-start items-start gap-2"
                      key={`${idx}`}
                    >
                      <PiXCircle className="text-errorColor  text-base lg:text-xl" />
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-6 w-full">
                  <button
                    onClick={() => modalOpen("Upgrade")}
                    disabled={idx === 0}
                    className={`w-full py-2 px-4 rounded-full  text-sm font-medium ${
                      idx === 0
                        ? "bg-primaryColor/40 text-white"
                        : idx === 1
                        ? "bg-white text-primaryColor"
                        : "bg-primaryColor text-white "
                    } `}
                  >
                    {idx === 0
                      ? "Your Current Plan"
                      : idx === 1
                      ? "Upgrade Plus"
                      : "Upgrade Pro"}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default UpgradePlan;
