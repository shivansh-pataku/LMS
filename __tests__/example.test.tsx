import React from "react";
import { render, screen } from "@testing-library/react";

// Example component to test (you would import your actual components)
const Greeting = ({ name }: { name?: string }) => {
  return <h1>Hello, {name ? name : "World"}!</h1>;
};

describe("Greeting Component", () => {
  it("renders a greeting message", () => {
    render(<Greeting />);
    expect(screen.getByText("Hello, World!")).toBeInTheDocument();
  });

  it("renders a greeting message with a name", () => {
    render(<Greeting name="Test User" />);
    expect(screen.getByText("Hello, Test User!")).toBeInTheDocument();
  });
});

// Example test for a simple function (if you have utility functions to test)
const add = (a: number, b: number) => a + b;

describe("add function", () => {
  it("should add two positive numbers correctly", () => {
    expect(add(1, 2)).toBe(3);
  });

  it("should add a positive and a negative number correctly", () => {
    expect(add(-1, 1)).toBe(0);
    expect(add(5, -2)).toBe(3);
  });

  it("should add two negative numbers correctly", () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it("should add zero to a number correctly", () => {
    expect(add(0, 5)).toBe(5);
    expect(add(5, 0)).toBe(5);
  });

  it("should add two zeros correctly", () => {
    expect(add(0, 0)).toBe(0);
  });
});
