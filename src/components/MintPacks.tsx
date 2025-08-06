import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { Button } from "@0xsequence-demos/boilerplate-design-system";

const numPerMint = 5;

export default function MintPacks(props: {
  refetchPackCollection: () => void;
}) {
  const { refetchPackCollection } = props;
  const { address } = useAccount();
  const {
    isPending: isEncoding,
    data: signedMessage,
    signMessage,
  } = useSignMessage();

  useEffect(() => {
    if (address && !signedMessage && !isEncoding) {
      signMessage({ message: "let me in" });
    }
  }, [address, isEncoding, signMessage, signedMessage]);

  const [isMinting, setIsMinting] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  useEffect(() => {
    if (isCoolingDown) {
      setTimeout(() => setIsCoolingDown(false), 5000);
    }
  }, [isCoolingDown]);

  const requestMint = () => {
    if (isMinting) {
      return;
    }
    setIsMinting(true);
    fetch("api/mint", {
      method: "POST",
      headers: {
        authorization: `${address}:${signedMessage}`,
      },
      body: JSON.stringify({
        address,
        tokenId: "1",
        amount: numPerMint,
      }),
    })
      .then((response) => {
        response.json().then((d) => {
          console.log(d);
          setTimeout(() => {
            setIsMinting(false);
            setIsCoolingDown(true);
            refetchPackCollection();
          }, 1000);
        });
      })
      .catch((e) => {
        console.log(e);
        setTimeout(() => {
          setIsMinting(false);
        }, 5000);
      });
  };

  const isBusy = isEncoding || isMinting || isCoolingDown;

  return (
    <Button
      variant="primary"
      className="purchase"
      onClick={requestMint}
      type="button"
      disabled={isBusy}
    >
      {isBusy ? `Please wait...` : `Mint ${numPerMint} Packs`}
    </Button>
  );
}
