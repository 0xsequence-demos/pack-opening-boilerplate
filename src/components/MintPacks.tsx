import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { Button } from "@0xsequence-demos/boilerplate-design-system";

const numPerMint = 30;

export default function MintPacks(props: {
  refetchPackCollection: () => void;
}) {
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
            props.refetchPackCollection();
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

  return (
    <Button
      variant="primary"
      className="purchase"
      onClick={requestMint}
      type="button"
      disabled={isEncoding || isMinting}
    >
      {isEncoding || isMinting ? `Please wait...` : `Mint ${numPerMint} Packs`}
    </Button>
  );
}
