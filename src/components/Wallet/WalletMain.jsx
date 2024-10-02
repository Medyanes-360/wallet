import WalletActions from "./WalletActions";
import Transactions from "./Transactions";
export default function WalletMain({ page }) {
  return (
    <div className="h-full mt-3 mx-2 md:mx-5">
      {page === "wallet" ? (
        <WalletActions />
      ) : page === "transactions" ? (
        <Transactions />
      ) : (
        ""
      )}
    </div>
  );
}
