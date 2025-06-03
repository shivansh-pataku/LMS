import * as React from "react";
import { Slot } from "@radix-ui/react-slot"; // npm install @radix-ui/react-slot
import { cva, type VariantProps } from "class-variance-authority";  // npm install class-variance-authority
import { cn } from "@/lib/utils";
import "./button.css"; // Import the CSS file

const buttonVariants = cva(
  "button", // Base class
  {
    variants: {
      variant: {
        default: "button-default",
        destructive: "button-destructive",
        outline: "button-outline",
        secondary: "button-secondary",
        ghost: "button-ghost",
        link: "button-link",
      },
      size: {
        default: "button-size-default",
        sm: "button-size-sm",
        lg: "button-size-lg",
        icon: "button-size-icon",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    // Construct the class string using the base 'button' class and the variant/size specific classes
    const buttonGeneratedClass = buttonVariants({ variant, size });
    return (
      <Comp
        className={cn(buttonGeneratedClass, className)} // Apply generated and any additional classNames
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
