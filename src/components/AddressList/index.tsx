import { type ReactElement } from "react";

export function AddressList({
  children,
}: {
  children: ReactElement | ReactElement[];
}) {
  return (
    <ul className="flex flex-col gap-4 text-14 text-left leading-tight">
      {children}
    </ul>
  );
}
