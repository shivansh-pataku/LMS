"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import "./select.css"; // Import the CSS

interface SelectContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string | null;
  setSelectedValue: React.Dispatch<React.SetStateAction<string | null>>;
  selectedLabel: string | null;
  setSelectedLabel: React.Dispatch<React.SetStateAction<string | null>>;
  onValueChange?: (value: string) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(
  undefined
);

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select provider");
  }
  return context;
};

// Define interfaces for the props of children elements
interface SelectContentElementProps {
  children?: React.ReactNode;
}

interface SelectItemElementProps {
  value: string;
  children?: React.ReactNode;
}

interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  value?: string; // Controlled component value
  onValueChange?: (value: string) => void; // Callback for when value changes
  defaultValue?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ children, value, onValueChange, defaultValue, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState<string | null>(
      defaultValue || value || null
    );
    const [selectedLabel, setSelectedLabel] = React.useState<string | null>(
      null
    );
    const selectContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
        // Attempt to find label for controlled value
        React.Children.forEach(children, (child) => {
          if (
            React.isValidElement<SelectContentElementProps>(child) &&
            child.type === SelectContent
          ) {
            React.Children.forEach(child.props.children, (item) => {
              if (
                React.isValidElement<SelectItemElementProps>(item) &&
                item.type === SelectItem &&
                item.props.value === value
              ) {
                // Ensure item.props.children is a string or can be treated as one
                if (typeof item.props.children === "string") {
                  setSelectedLabel(item.props.children);
                } else if (React.isValidElement(item.props.children)) {
                  // Check if item.props.children is a React element
                  // Then, safely access its props, assuming it's a simple element like <span>
                  const innerChild = item.props.children as React.ReactElement<{
                    children?: React.ReactNode;
                  }>;
                  if (
                    innerChild &&
                    typeof innerChild.props.children === "string"
                  ) {
                    setSelectedLabel(innerChild.props.children);
                  } else {
                    // Fallback if the inner child's children is not a string
                    setSelectedLabel(String(item.props.children));
                  }
                } else {
                  // Fallback or more complex logic to extract a string label
                  setSelectedLabel(String(item.props.children));
                }
              }
            });
          }
        });
      }
    }, [value, children]);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectContainerRef.current &&
          !selectContainerRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <SelectContext.Provider
        value={{
          open,
          setOpen,
          selectedValue,
          setSelectedValue,
          selectedLabel,
          setSelectedLabel,
          onValueChange,
        }}
      >
        <div
          ref={ref || selectContainerRef}
          className="select-container"
          {...props}
        >
          {children}
        </div>
      </SelectContext.Provider>
    );
  }
);
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, ...props }, ref) => {
  const { open, setOpen } = useSelectContext();
  return (
    <button
      ref={ref}
      type="button"
      className={`select-trigger ${className || ""}`}
      onClick={() => setOpen(!open)}
      aria-haspopup="listbox"
      aria-expanded={open}
      {...props}
    >
      {children}
      <ChevronDown
        className={`select-trigger-icon ${
          open ? "select-trigger-icon-open" : ""
        }`}
      />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => {
  const { selectedLabel, selectedValue } = useSelectContext();
  const displayValue = selectedLabel || selectedValue;
  return (
    <span
      ref={ref}
      className={`select-value ${
        !displayValue && placeholder ? "select-value-placeholder" : ""
      } ${className || ""}`}
      {...props}
    >
      {displayValue || placeholder}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { open } = useSelectContext();
  if (!open) return null;
  return (
    <div
      ref={ref}
      className={`select-content ${className || ""}`}
      role="listbox"
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode; // Children are used as the label
  disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, children, className, disabled, ...props }, ref) => {
    const {
      setSelectedValue,
      setSelectedLabel,
      setOpen,
      selectedValue,
      onValueChange,
    } = useSelectContext();
    const isSelected = selectedValue === value;

    const handleSelect = () => {
      if (disabled) return;
      setSelectedValue(value);
      // Assuming children is the label. If children can be complex, this might need adjustment.
      if (typeof children === "string") {
        setSelectedLabel(children);
      } else {
        // Fallback or more complex logic to extract a string label
        // For simplicity, we'll try to convert to string, might need adjustment
        setSelectedLabel(String(children));
      }
      setOpen(false);
      if (onValueChange) {
        onValueChange(value);
      }
    };

    return (
      <div
        ref={ref}
        className={`select-item ${isSelected ? "select-item-selected" : ""} ${
          disabled ? "select-item-disabled" : ""
        } ${className || ""}`}
        onClick={handleSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleSelect();
        }}
        role="option"
        aria-selected={isSelected}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        <span className="select-item-text">{children}</span>
        {isSelected && <Check className="select-item-indicator" />}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
