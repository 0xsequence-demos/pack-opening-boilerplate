import { Context, useContext } from "react";

export default function useCustomContext<T>(
  context: Context<T | undefined>,
): T {
  // Get the context value which could be undefined
  const value = useContext(context);

  // Check the value is not undefined and
  // has been initialised by the provider
  if (value == null) {
    throw new Error(
      'The "useContext" hook must be used within the corresponding context "Provider"',
    );
  }

  return value;
}
