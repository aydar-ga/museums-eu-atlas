import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { museums } from "@/data/museums";
import { MuseumCard } from "./MuseumCard";

const museum = museums[0]!;

function Harness({ initiallyVisited = false }: { initiallyVisited?: boolean }) {
  const [visited, setVisited] = useState(initiallyVisited);
  return (
    <ul>
      <MuseumCard
        museum={museum}
        legacyId={1}
        planned={false}
        visited={visited}
        onTogglePlanned={() => undefined}
        onToggleVisited={() => setVisited((value) => !value)}
      />
    </ul>
  );
}

const foil = () => screen.queryByTestId(`scratch-foil-${museum.slug}`);
const toggle = () => screen.getByTestId(`visit-toggle-${museum.slug}`);

describe("MuseumCard scratch-off reveal", () => {
  it("scratches a gold foil off the image when the visitor marks the museum visited", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(foil()).not.toBeInTheDocument();

    await user.click(toggle());

    expect(foil()).toBeInTheDocument();
    expect(toggle()).toHaveAttribute("aria-pressed", "true");
    expect(toggle()).toHaveTextContent("Visited");
  });

  it("removes the foil about a second later, once the wipe is over", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(toggle());
    expect(foil()).toBeInTheDocument();
    await waitFor(() => expect(foil()).not.toBeInTheDocument(), { timeout: 2000 });
  });

  it("shows no foil on a card that is already visited when it renders", () => {
    render(<Harness initiallyVisited />);
    expect(toggle()).toHaveAttribute("aria-pressed", "true");
    expect(foil()).not.toBeInTheDocument();
  });

  it("shows no foil when the visitor un-marks a museum", async () => {
    const user = userEvent.setup();
    render(<Harness initiallyVisited />);
    await user.click(toggle());
    expect(toggle()).toHaveAttribute("aria-pressed", "false");
    expect(foil()).not.toBeInTheDocument();
  });

  it("hides the foil from assistive technology", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(toggle());
    expect(foil()).toHaveAttribute("aria-hidden", "true");
  });
});
