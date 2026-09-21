import { ComponentPropsWithoutRef, ElementType } from "react";

type CardProps<T extends ElementType> = { as?: T } & ComponentPropsWithoutRef<T>;

export default function Card<T extends ElementType = "div">({
  as,
  className = "",
  ...props
}: CardProps<T>) {
  const Component = as ?? "div";
  return (
    <Component
      className={`bg-white rounded-2xl border border-carbon-100 shadow-sm p-5 ${className}`}
      {...props}
    />
  );
}
