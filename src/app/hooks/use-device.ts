import createBreakpoint from "@h/factory/create-breakpoint";

const useDevice = createBreakpoint(
  { desktop: 1240, mobile: 0, tablet: 600 },
  { name: "device", throttle: 1000 }
);

export default useDevice;
