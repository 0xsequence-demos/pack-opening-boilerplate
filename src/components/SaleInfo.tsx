import { Image } from "boilerplate-design-system";
import { useContractInfo } from "../hooks/data";
import { initialChainId, nftTokenAddress } from "../configs/chains";
import { MintedProgressBar } from "./MintedProgressBar";
import { useSaleProgress } from "../contexts/SaleProgressContext";

export default function SaleInfo() {
  const { data: contractInfoData } = useContractInfo(
    initialChainId,
    nftTokenAddress,
  );

  const name = contractInfoData?.name;
  const image = contractInfoData?.logoURI;
  const description = contractInfoData?.extensions?.description;

  const saleProgress = useSaleProgress();

  return (
    <div className="flex gap-4 w-full sm:flex-row flex-col text-left">
      {image ? (
        <Image
          src={image}
          alt={name}
          className="sm:w-[8rem] w-full max-w-[28rem] mx-auto aspect-square rounded-[0.5rem]"
        />
      ) : null}
      <div className="flex flex-col items-start w-full">
        <div className="flex items-start flex-col flex-1 gap-2">
          <h3 className="text-20 font-bold leading-tight">{name}</h3>
          {description ? <p className="text-14">{description}</p> : null}
        </div>
        <div className="mt-auto mb-0 w-full pt-4">
          <MintedProgressBar
            mintedPercentage={saleProgress.percentage}
            mintedValue={saleProgress.totalSupply}
            supplyValue={saleProgress.supplyCap}
            showTotalMintedPercentage
          />
        </div>
      </div>
    </div>
  );
}
