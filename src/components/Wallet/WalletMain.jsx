import WalletActions from "./WalletActions";
import Transactions from "./Transactions";
export default function WalletMain({ page, setPage }) {
  return (
    <div className="mt-3 w-full lg:w-2/3 lg:mx-auto">
      <div className="">
        {page === "wallet" ? (
          <WalletActions setPage={setPage} />
        ) : page === "transactions" ? (
          <Transactions />
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
