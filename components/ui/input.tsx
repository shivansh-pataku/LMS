import * as React from "react";

import { cn } from "@/lib/utils";
import "./input.css"; // Import the CSS file

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn("input-custom", className)} // Use the custom class
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
