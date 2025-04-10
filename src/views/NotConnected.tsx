import { useOpenConnectModal } from "@0xsequence/connect";
import { Button } from "boilerplate-design-system";

export default function NotConnected() {
  const { setOpenConnectModal } = useOpenConnectModal();

  return (
    <div className="w-full flex flex-col items-center">
      <Button
        variant="primary"
        subvariants={{ padding: "comfortable" }}
        onClick={() => setOpenConnectModal(true)}
        className="px-8"
      >
        Connect
      </Button>
    </div>
  );
}
