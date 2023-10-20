import React from "react";
import { render, screen } from "@testing-library/react";
import { AddressContainer, AddressLine } from "../components/AddressesBook";
import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";

// Renders the address passed as props in a truncated format.
it("should render the truncated address", () => {
  const address = "0x1234567890abcdef";
  render(<AddressLine address={address} />);
  const truncatedAddress = screen.getByText("0x1234...cdef");
  expect(truncatedAddress).toBeInTheDocument();
});
