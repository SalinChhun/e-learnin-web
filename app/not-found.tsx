import React, { JSX } from "react";
import Link from "next/link";
import Button from "@/components/shared/Button";

export default function Custom404(): JSX.Element {
  return (
    <div className="h-100 w-100 d-flex flex-column px-4 mb-4 ">
      <h1 className="">404</h1>
      <h2 className="">Page Not Found</h2>
      <p className="">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button className="wl-btn-primary wl-btn-lg" text="Return to Home" />
      </Link>
    </div>
  );
}
