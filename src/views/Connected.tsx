import { Button, Card } from "boilerplate-design-system";
import { Address } from "viem";
import { useState } from "react";
import { PackOpener } from "../hooks/PackOpener";
import { PackOpeningState } from "./packOpeningStates";
import { PackData } from "../hooks/PackData";

const Connected = (props: { userAddress: Address; chainId: number }) => {
  const { userAddress } = props;

  const [debugPackState, setDebugPackState] =
    useState<PackOpeningState>("idle");

  const [debugPackData, setDebugPackData] = useState<PackData | undefined>();

  return (
    <div className="flex flex-col gap-12">
      <Card className="flex flex-col gap-5 bg-white/10 border border-white/10 backdrop-blur-sm text-center p-0">
        <Card
          collapsable
          title="Pack opening debug"
          className="border-t border-white/10 rounded-none bg-transparent"
        >
          {debugPackState === "idle" || debugPackState === "fail" ? (
            <Button
              variant="primary"
              onClick={() => {
                setDebugPackState("startingOpeningProcess");
              }}
            >
              {debugPackState === "fail" ? "Retry Opening Pack" : "Open Pack"}
            </Button>
          ) : (
            <div>{debugPackState}</div>
          )}
          <div className="flex flex-row gap-3">
            {debugPackState !== "idle" &&
              debugPackState !== "success" &&
              debugPackState !== "fail" && (
                <PackOpener
                  id={99}
                  address={userAddress}
                  packState={debugPackState}
                  setPackState={setDebugPackState}
                  setPackData={setDebugPackData}
                />
              )}
          </div>
          {debugPackData &&
            debugPackData.tokenIds.map((v, i) => (
              <div key={i}>
                {v} x{debugPackData.amounts[i]}
              </div>
            ))}
        </Card>
      </Card>
    </div>
  );
};

export default Connected;
