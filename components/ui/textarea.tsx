import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./textarea.module.css"; // Import the CSS module

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        styles.textarea, // Apply the class from the CSS module
        className // Allow additional classes to be passed
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
