import React, { useEffect, useState } from "react";
import BotVideoReply from "./BotVideoReply";
import BotAudioClipReply from "./BotAudioClipReply";
import BotImageReply from "./BotImageReply";
import BotRetouchImageReply from "./BotRetouchImageReply";
import BotTableReply from "./BotTableReply";
import { TypeAnimation } from "react-type-animation";
import logo from "@/public/images/favicon.png";
import {
  PiArrowsCounterClockwise,
  PiChecks,
  PiCopy,
  PiShareFat,
  PiSparkle,
  PiSpeakerHigh,
  PiThumbsDown,
  PiThumbsUp,
} from "react-icons/pi";
import Image from "next/image";
import BotCodeReply from "./BotCodeReply";
import { useChatHandler } from "@/stores/chatList";
import BotSuggestionReply from "./BotSuggestionReply";

const generalText =
  "Based on the gender identified in the uploaded data, the reply has been automatically generated with a appropriate data. However, you have the option to customize your reply by selecting from the available options below.";

type BotReplyProps = {
  replyType: string;
  setScroll: React.Dispatch<React.SetStateAction<boolean>>;
  isAnimation: boolean;
};

function BotReply({ replyType, setScroll, isAnimation }: BotReplyProps) {
  const { emptyQuery } = useChatHandler();
  const [showElements, setShowElements] = useState({
    generatingMessage: false,
    botReplyText: false,
    preview: false,
    lastMessage: false,
  });

  const hideSuggestions = [
    "video",
    "audio",
    "image",
    "retouch",
    "data-table",
    "code",
  ].includes(replyType);

  useEffect(() => {
    if (replyType === "emptyQuery") {
      emptyQuery();
      const timeouts = [
        setTimeout(() => {
          setShowElements({
            generatingMessage: true,
            botReplyText: true,
            preview: true,
            lastMessage: true,
          });
        }, 1000),
      ];
      return () => {
        timeouts.forEach(clearTimeout);
      };
    } else {
      setShowElements({
        generatingMessage: true,
        botReplyText: true,
        preview: true,
        lastMessage: true,
      });
    }
  }, [replyType, emptyQuery, hideSuggestions, setScroll, isAnimation]);

  useEffect(() => {
    if (isAnimation) {
      const timeouts = [
        setTimeout(() => {
          setScroll(true);
          setShowElements((prev) => ({ ...prev, generatingMessage: true }));
        }, 3000),
        setTimeout(() => {
          setScroll(false);
          setShowElements((prev) => ({ ...prev, botReplyText: true }));
        }, 6000),
        setTimeout(
          () => {
            setScroll(true);
            setShowElements((prev) => ({ ...prev, preview: true }));
          },
          hideSuggestions ? 10000 : 8000
        ),
        setTimeout(() => setScroll(false), 10500),
        setTimeout(
          () => {
            setScroll(true);
            setShowElements((prev) => ({ ...prev, lastMessage: true }));
          },
          hideSuggestions ? 12000 : 10000
        ),
        setTimeout(() => emptyQuery(), 12500),
      ];
      return () => {
        timeouts.forEach(clearTimeout);
      };
    } else {
      setShowElements({
        generatingMessage: true,
        botReplyText: true,
        preview: true,
        lastMessage: true,
      });
    }
  }, [isAnimation, hideSuggestions, setScroll, emptyQuery]);
  return (
    <div className="flex justify-start items-start gap-1 sm:gap-3  w-full max-w-[90%]  ">
      <Image src={logo} alt="" className=" max-sm:size-5 object-cover" />
      <div className="flex flex-col justify-start items-start gap-3 flex-1   ">
        <p className="text-xs text-n100">UniHub, 2 min ago</p>
        <div className="text-sm bg-primaryColor/5 py-3 px-5 border border-primaryColor/20 rounded-lg w-full sm:max-w-[90%] ">
          <div className="flex justify-start items-center gap-1">
            <PiChecks className="text-successColor text-xl" />
            <p>
              {isAnimation ? (
                <TypeAnimation
                  sequence={["Scanning the data..."]}
                  speed={20}
                  cursor={false}
                />
              ) : (
                "Scanning the data..."
              )}
            </p>
          </div>
          {showElements.generatingMessage && (
            <div className="flex justify-start items-center gap-1 pt-3">
              <div className={`${isAnimation ? "circle" : ""}`}>
                <PiSparkle className="text-secondaryColor text-xl " />
              </div>
              <p>
                {isAnimation ? (
                  <TypeAnimation
                    sequence={["Generating answers for you..."]}
                    speed={50}
                    cursor={false}
                    repeat={2}
                  />
                ) : (
                  "Generating answers for you..."
                )}
              </p>
            </div>
          )}

          {showElements.botReplyText && (
            <p className="pt-5">
              {isAnimation ? (
                <TypeAnimation
                  splitter={(str) => str.split(/(?= )/)}
                  sequence={[
                    hideSuggestions
                      ? generalText
                      : "Please Click on the commands to generate pre defined reply:",
                  ]}
                  speed={20}
                  cursor={false}
                />
              ) : hideSuggestions ? (
                generalText
              ) : (
                "Please Click on the commands to generate pre defined reply:"
              )}
            </p>
          )}

          {replyType === "video" && (
            <BotVideoReply show={showElements.preview} />
          )}
          {replyType === "audio" && (
            <BotAudioClipReply show={showElements.preview} />
          )}
          {replyType === "image" && (
            <BotImageReply show={showElements.preview} />
          )}
          {replyType === "retouch" && (
            <BotRetouchImageReply show={showElements.preview} />
          )}
          {replyType === "data-table" && (
            <BotTableReply show={showElements.preview} />
          )}
          {replyType === "code" && <BotCodeReply show={showElements.preview} />}

          {!hideSuggestions && (
            <BotSuggestionReply show={showElements.preview} />
          )}

          {showElements.lastMessage && (
            <p className="pt-5">
              {isAnimation ? (
                <TypeAnimation
                  splitter={(str) => str.split(/(?= )/)}
                  sequence={[
                    "Would you like me to refine this further or add script elements? 🚀",
                  ]}
                  speed={20}
                  cursor={false}
                />
              ) : (
                "Would you like me to refine this further or add script elements? 🚀"
              )}
            </p>
          )}
        </div>
        <div className=" flex justify-end items-center gap-2 cursor-pointer">
          <PiSpeakerHigh />
          <PiThumbsUp />
          <PiThumbsDown />

          <PiCopy />
          <PiArrowsCounterClockwise />
          <PiShareFat />
        </div>
      </div>
    </div>
  );
}

export default BotReply;
