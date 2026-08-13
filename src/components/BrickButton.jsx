import { Link } from "react-router-dom";

// Shared button style used everywhere on the site (nav logout, forms,
// add-to-cart, checkout, etc.) so every button looks and behaves the same
// way instead of every page re-inventing its own button classes.
// Each variant defines the colors for one "look":
// - primary: solid red, the default/main call-to-action color
// - green:   used for the final "Buy Now" / checkout action
// - gray:    neutral, used for quantity +/- steppers
// - danger:  outlined red (white bg, red border/text) for destructive
//            actions like "Remove", so it doesn't look identical to the
//            solid red primary buttons
const VARIANTS = {
  primary: { bg: "bg-red-600", hover: "hover:bg-red-700", ring: "focus-visible:ring-red-300", text: "text-white", border: "border-black/10" },
  green: { bg: "bg-green-600", hover: "hover:bg-green-700", ring: "focus-visible:ring-green-300", text: "text-white", border: "border-black/10" },
  gray: { bg: "bg-gray-300", hover: "hover:bg-gray-400", ring: "focus-visible:ring-gray-300", text: "text-gray-700", border: "border-black/10" },
  danger: { bg: "bg-white", hover: "hover:bg-red-50", ring: "focus-visible:ring-red-300", text: "text-red-600", border: "border-red-300" },
};

// Padding/text-size presets, picked via the `size` prop.
const SIZES = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-sm sm:text-base",
  lg: "px-6 py-3 text-base",
};

// Classes shared by every button regardless of variant/size: the rounded
// "brick" shape, the drop-shadow that makes it look raised, and the
// hover/press animation (button lifts up on hover, presses down on click -
// like pushing in a LEGO brick).
const BASE =
  "inline-flex items-center justify-center rounded-xl font-semibold border " +
  "shadow-[0_4px_0_rgba(0,0,0,0.25)] transition-all duration-150 ease-out " +
  "hover:-translate-y-0.5 hover:shadow-[0_6px_0_rgba(0,0,0,0.25)] " +
  "active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.25)] " +
  "focus-visible:outline-none focus-visible:ring-4 " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

// A single reusable button component.
// - Pass `to="/some-path"` to render it as a router <Link> (navigates).
// - Otherwise it renders a normal <button> (use with onClick, type="submit", etc).
// Any other props (onClick, disabled, type, ...) are spread onto the
// underlying element via {...props}.
export default function BrickButton({
  to,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const classes = `${BASE} ${SIZES[size] ?? SIZES.md} ${v.border} ${v.bg} ${v.hover} ${v.ring} ${v.text} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
