import React from "react";

function Footer() {
  return (
    <footer>
      <p className="text-xs sm:text-sm font-medium text-center pb-3">
        Copyright ©{new Date().getFullYear()}{" "}
        <span className=" text-primaryColor">UniHub</span>. All Rights Reserved
      </p>
    </footer>
  );
}

export default Footer;
