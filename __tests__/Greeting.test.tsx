import React from "react";
import { render, screen } from "@testing-library/react";
import Greeting from "@/components/Greeting"; // Assuming @/components alias is set up
import "@testing-library/jest-dom"; // Import jest-dom for extended matchers

// Remove 'expect' from this import to rely on the global Jest 'expect'
import { describe, test } from "@jest/globals";

describe("Greeting Component", () => {
  test('renders greeting with default name "Guest"', () => {
    render(<Greeting />);
    const headingElement = screen.getByRole("heading", {
      name: /Hello, Guest!/i,
    });
    expect(headingElement).toBeInTheDocument();
  });

  test("renders greeting with provided name", () => {
    const testName = "World";
    render(<Greeting name={testName} />);
    const headingElement = screen.getByRole("heading", {
      name: `Hello, ${testName}!`,
    });
    expect(headingElement).toBeInTheDocument();
  });

  test("renders greeting with default name for empty string name", () => {
    render(<Greeting name="" />);
    const headingElement = screen.getByRole("heading", {
      name: /Hello, Guest!/i, // Assuming it defaults to Guest for empty string
    });
    expect(headingElement).toBeInTheDocument();
  });

  test("matches snapshot with name", () => {
    const { asFragment } = render(<Greeting name="Snapshot" />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("matches snapshot without name", () => {
    const { asFragment } = render(<Greeting />);
    expect(asFragment()).toMatchSnapshot();
  });
});
