import { SegmentedButton, SegmentedButtonSegment } from "@c/util/segmented-button";
import { render, screen, fireEvent } from "@testing-library/react";

it("displays specified content", () => {
  const text = "Test";
  render(
    <SegmentedButton>
      <SegmentedButtonSegment label={text} />
    </SegmentedButton>
  );
  expect(() => screen.getByText(text)).not.toThrow();
});

it("calls onClick callback", () => {
  const cb = jest.fn();
  render(
    <SegmentedButton>
      <SegmentedButtonSegment label="Click me" onClick={cb} />
    </SegmentedButton>
  );
  fireEvent.click(screen.getByText("Click me"));
  expect(cb).toHaveBeenCalledTimes(1);
});

it("adds selected class to button", () => {
  render(
    <SegmentedButton toggle>
      <SegmentedButtonSegment label="Hi!" selected />
      <SegmentedButtonSegment label="Bye!" />
    </SegmentedButton>
  );
  expect(() =>
    screen.getByText((_, element) => element.classList.contains("segmented-button__segment--selected"))
  ).not.toThrow();
});
