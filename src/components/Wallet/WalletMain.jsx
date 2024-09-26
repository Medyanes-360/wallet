import WalletActions from "./WalletActions";
import Transactions from "./Transactions";
export default function WalletMain({ page }) {
  return (
    <div className="h-full mt-1 mx-5">
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
