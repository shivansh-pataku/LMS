import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Greeting from "./Greeting";

describe("Greeting Component", () => {
  test('renders "Hello, Guest!" when no name is provided', () => {
    render(<Greeting />);
    expect(screen.getByRole("heading")).toHaveTextContent("Hello, Guest!");
  });

  test('renders "Hello, Guest!" when name is an empty string', () => {
    render(<Greeting name="" />);
    expect(screen.getByRole("heading")).toHaveTextContent("Hello, Guest!");
  });

  test('renders "Hello, Guest!" when name is a string with only spaces', () => {
    render(<Greeting name="   " />);
    expect(screen.getByRole("heading")).toHaveTextContent("Hello, Guest!");
  });

  test('renders "Hello, [name]!" when a name is provided', () => {
    const testName = "Alice";
    render(<Greeting name={testName} />);
    expect(screen.getByRole("heading")).toHaveTextContent(
      `Hello, ${testName}!`
    );
  });
});
