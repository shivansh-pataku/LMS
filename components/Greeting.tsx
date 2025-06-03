import React from "react";

interface GreetingProps {
  name?: string;
}

const Greeting: React.FC<GreetingProps> = ({ name }) => {
  const displayName = name && name.trim() !== "" ? name : "Guest";
  return <h1>Hello, {displayName}!</h1>;
};

export default Greeting;
