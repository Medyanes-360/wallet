import WalletMain from "../../components/Wallet/WalletMain";
import WalletNavigation from "../../components/Wallet/WalletNavigation";

export default function WalletLayout({ children }) {
  return (
    <div className="grid grid-cols-5  min-h-screen md:p-0">
      <div className="hidden md:block md:col-span-1 md:p-5 border bg-gray-50">
        <WalletNavigation />
      </div>
      <div className="bg-white  col-span-5 md:col-span-3 md:p-10 md:pt-8">
        <WalletMain></WalletMain>
      </div>
      <div className="md:col-span-1"></div>
    </div>
  );
}
 