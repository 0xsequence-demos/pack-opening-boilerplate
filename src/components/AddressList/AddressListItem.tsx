export function AddressListItem({
  label,
  url,
  address,
}: {
  label: string;
  url?: string;
  address?: string;
}) {
  return (
    <li className="flex-col md:flex-row flex md:justify-between gap-x-4 gap-y-1">
      <span className="text-grey-100 text-12 md:text-14">{label}</span>
      {address ? (
        <a href={`${url}${address}`} className="underline truncate">
          {address}
        </a>
      ) : (
        <span> </span>
      )}
    </li>
  );
}
