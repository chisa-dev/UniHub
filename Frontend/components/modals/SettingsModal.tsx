import SmallButtons from "@/components/ui/buttons/SmallButtons";
import InputFieldSecond from "@/components/ui/InputFieldSecond";
import ToggleButton from "@/components/ui/ToggleButton";
import {
  accentColorItems,
  responseStyle,
  settingsTabItems,
  themeSettingsData,
} from "@/constants/data";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import SelectDropdown from "../ui/SelectDropdown";

function SettingsModal() {
  const [activeMenu, setActiveMenu] = useState(0);
  const { setTheme } = useTheme();
  return (
    <div className=" dark:text-n30">
      <div className="p-2 border border-primaryColor/30 bg-primaryColor/5 rounded-xl min-[1400px]:rounded-full flex flex-row justify-centert items-center flex-wrap gap-2 w-full mt-6">
        {settingsTabItems.map(({ id, name, icon }, idx) => (
          <div
            key={id}
            className={`flex justify-start items-center gap-2 xl:gap-2 py-2 pl-2 pr-6  border  rounded-full cursor-pointer ${
              activeMenu === idx
                ? " border-primaryColor bg-primaryColor"
                : "border-primaryColor/30 bg-white dark:bg-n0"
            }`}
            onClick={() => setActiveMenu(idx)}
          >
            <div
              className={`flex justify-center items-center border  rounded-full p-1.5 xl:p-2  ${
                activeMenu === idx
                  ? " border-primaryColor bg-white"
                  : "border-primaryColor/30 bg-primaryColor/5"
              }`}
            >
              {React.createElement(icon, {
                className: `text-primaryColor text-base xl:text-xl`,
              })}
            </div>
            <p
              className={`text-sm font-medium text-nowrap pr-4 ${
                activeMenu === idx ? "text-white" : ""
              }`}
            >
              {name}
            </p>
          </div>
        ))}
      </div>

      {activeMenu === 0 && (
        <div className="mt-6 bg-primaryColor/5 border border-primaryColor/30 rounded-xl p-5">
          <div className=" pb-5 border-b border-primaryColor/30">
            <p className="text-n700 font-medium  dark:text-n30">Settings</p>
            <p className="pt-2 text-xs">
              Configure your chat and AI interaction preferences
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-5 ">
            <div className="flex justify-between items-center p-4 rounded-xl hover:bg-primaryColor/5 hover:border-primaryColor/30 border border-transparent duration-500  ">
              <div className=" ">
                <p className="text-n700 font-medium  dark:text-n30 text-sm">
                  Message History
                </p>
                <p className="pt-2 text-xs">
                  Save chat history for future reference
                </p>
              </div>
              <div className="">
                <ToggleButton />
              </div>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl hover:bg-primaryColor/5 hover:border-primaryColor/30 border border-transparent duration-500  ">
              <div className=" ">
                <p className="text-n700 font-medium  dark:text-n30 text-sm">
                  Code Highlighting
                </p>
                <p className="pt-2 text-xs">
                  Enable syntax highlighting for code blocks
                </p>
              </div>
              <div className="">
                <ToggleButton />
              </div>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl hover:bg-primaryColor/5 hover:border-primaryColor/30 border border-transparent duration-500  ">
              <div className=" ">
                <p className="text-n700 font-medium  dark:text-n30 text-sm">
                  AI Suggestions
                </p>
                <p className="pt-2 text-xs">
                  Show AI-powered response suggestions
                </p>
              </div>
              <div className="">
                <ToggleButton />
              </div>
            </div>

            <div className="p-4 border border-primaryColor/30 rounded-xl bg-white dark:bg-n0">
              <p className="text-n700 font-medium  dark:text-n30 text-sm pb-2">
                More Style & Format
              </p>
              <div className="flex flex-col gap-2">
                <SelectDropdown
                  options={responseStyle}
                  placeholder="Select response style"
                  title="Response Style"
                />
                <SelectDropdown
                  options={responseStyle}
                  placeholder="Select code format"
                  title="Code Output Format"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-start items-center gap-2 pt-5 text-xs">
            <SmallButtons name="Save Changes" />
            <SmallButtons name="Reset Here" secondary={true} />
          </div>
        </div>
      )}

      {activeMenu === 1 && (
        <div className="flex flex-col gap-6 pt-6">
          <div className="p-5 border border-primaryColor/30 rounded-xl">
            <div className=" pb-5 border-b border-primaryColor/30">
              <p className="text-n700 font-medium  dark:text-n30">
                Change Password
              </p>
              <p className="pt-2 text-xs">
                If you want to change your password, then try it’s
              </p>
            </div>

            <div className="grid grid-cols-12 gap-6 pt-6">
              <InputFieldSecond
                className="col-span-12"
                placeholder="*******"
                title="Old Password"
                type="password"
              />
              <InputFieldSecond
                className="col-span-6"
                placeholder="*******"
                title="New Password"
                type="password"
              />
              <InputFieldSecond
                className="col-span-6"
                placeholder="*******"
                title="Confirm Password"
                type="password"
              />
              <div className="flex justify-start items-center gap-2 text-xs col-span-12">
                <SmallButtons name="Save Changes" />
                <SmallButtons name="Reset Here" secondary={true} />
              </div>
            </div>
          </div>

          <div className=" bg-primaryColor/5 border border-primaryColor/30 rounded-xl p-5">
            <div className=" pb-5 border-b border-primaryColor/30">
              <p className="text-n700 font-medium  dark:text-n30">Security</p>
              <p className="pt-2 text-xs">
                Protect your account with security settings
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-5 ">
              <div className="flex justify-between items-center p-4 rounded-xl hover:bg-primaryColor/5 hover:border-primaryColor/30 border border-transparent duration-500  ">
                <div className=" ">
                  <p className="text-n700 font-medium  dark:text-n30 text-sm">
                    End-to-End Encryption
                  </p>
                  <p className="pt-2 text-xs">
                    Enable encryption for all chat messages
                  </p>
                </div>
                <div className="">
                  <ToggleButton />
                </div>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl hover:bg-primaryColor/5 hover:border-primaryColor/30 border border-transparent duration-500  ">
                <div className=" ">
                  <p className="text-n700 font-medium  dark:text-n30 text-sm">
                    Auto-delete Messages
                  </p>
                  <p className="pt-2 text-xs">
                    Automatically delete messages after 30 days
                  </p>
                </div>
                <div className="">
                  <ToggleButton />
                </div>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl hover:bg-primaryColor/5 hover:border-primaryColor/30 border border-transparent duration-500  ">
                <div className=" ">
                  <p className="text-n700 font-medium  dark:text-n30 text-sm">
                    Two-Factor Authentication
                  </p>
                  <p className="pt-2 text-xs">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <div className="">
                  <ToggleButton />
                </div>
              </div>

              <div className="p-4 border border-primaryColor/30 rounded-xl bg-white dark:bg-n0">
                <p className="text-n700 font-medium  dark:text-n30 text-sm">
                  More Security
                </p>
                <InputFieldSecond
                  className=" pt-3"
                  placeholder="demo@mail.com"
                  title="Recovery Email"
                  type="email"
                />
                <div className="col-span-12">
                  <p className="text-xs text-n400 -mb-2.5 pl-6">
                    <span className="bg-white dark:bg-n0 px-1">API Key</span>
                  </p>
                  <div className="border border-primaryColor/20 rounded-xl py-2 pl-5 pr-2 flex justify-between items-center gap-2 ">
                    <input
                      type="password"
                      placeholder="***************************"
                      className="bg-transparent outline-none text-xs placeholder:text-n100 w-full"
                    />
                    <button className="text-xs font-medium text-primaryColor bg-primaryColor/10 border border-primaryColor/20 py-2 px-4 rounded-md">
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-start items-center gap-2 pt-5 text-xs">
              <SmallButtons name="Save Changes" />
              <SmallButtons name="Reset Here" secondary={true} />
            </div>
          </div>
        </div>
      )}

      {activeMenu === 2 && (
        <div className=" bg-primaryColor/5 border border-primaryColor/30 rounded-xl p-5 mt-6">
          <div className=" pb-5 border-b border-primaryColor/30">
            <p className="text-n700 font-medium  dark:text-n30">Appearance</p>
            <p className="pt-2 text-xs">
              Customize the look and feel of your interface
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-5 ">
            <div className="flex flex-col gap-4 items-start ">
              <div className=" ">
                <p className="text-n700 font-medium  dark:text-n30 text-sm">
                  Theme
                </p>
                <p className="pt-2 text-xs">
                  Select your preferred theme for the application.
                </p>
              </div>
              <div className="flex justify-start items-start bg-white p-2 rounded-xl border border-primaryColor/30 gap-2 dark:bg-n0">
                {themeSettingsData.map(({ id, name, icon }) => (
                  <div
                    className="bg-primaryColor/5 border border-primaryColor/30 py-3 px-10 flex flex-col justify-center items-center gap-2 rounded-xl cursor-pointer group hover:bg-primaryColor hover:border-primaryColor duration-300"
                    key={id}
                    onClick={() => setTheme(name.toLowerCase())}
                  >
                    <div className="flex justify-center items-center bg-white  text-primaryColor border border-primaryColor/30 p-2 text-xl rounded-full">
                      {React.createElement(icon)}
                    </div>
                    <p className="text-sm font-medium text-center group-hover:text-white">
                      {name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 items-start ">
              <div className=" ">
                <p className="text-n700 font-medium  dark:text-n30 text-sm">
                  Accent Color
                </p>
                <p className="pt-2 text-xs">
                  Choose your accent color to personalize your interface.
                </p>
              </div>
              <div className="flex justify-start items-center gap-1">
                {accentColorItems.map(({ id, color }) => (
                  <div
                    className="bg-white rounded-full size-7 flex justify-center items-center border border-white hover:border-primaryColor duration-300 dark:bg-n0 dark:border-lightN30"
                    key={id}
                  >
                    <div
                      className="size-5 rounded-full"
                      style={{
                        backgroundColor: color,
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center  ">
              <div className=" ">
                <p className="text-n700 font-medium  dark:text-n30 text-sm">
                  Message Bubbles
                </p>
                <p className="pt-1 text-xs">Show messages in bubble style</p>
              </div>
              <div className="">
                <ToggleButton />
              </div>
            </div>
            <div className="flex justify-between items-center  ">
              <div className=" ">
                <p className="text-n700 font-medium  dark:text-n30 text-sm">
                  Compact Mode
                </p>
                <p className="pt-1 text-xs">Reduce spacing between messages</p>
              </div>
              <div className="">
                <ToggleButton />
              </div>
            </div>
            <div className="flex justify-between items-center  ">
              <div className=" ">
                <p className="text-n700 font-medium  dark:text-n30 text-sm">
                  Large Font
                </p>
                <p className="pt-1 text-xs">
                  Increase text size for better readability
                </p>
              </div>
              <div className="">
                <ToggleButton />
              </div>
            </div>
          </div>

          <div className="flex justify-start items-center gap-2 pt-5 text-xs">
            <SmallButtons name="Save Changes" />
            <SmallButtons name="Reset Here" secondary={true} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsModal;
