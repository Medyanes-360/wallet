import { CiBank } from "react-icons/ci";
import { RiArrowRightWideLine } from "react-icons/ri";

export default function CardItem({i,setActionStep,setIfSavedCardUsed,ifSavedCardUsed}) {
  return (
    <li className="">
      <button
        onClick={() => {
          setActionStep((val) => val + 2);
          setIfSavedCardUsed(true);
        }}
        className="w-full flex p-4  rounded-lg justify-between items-center text-sm shadow"
      >
        <span className="grid grid-cols-4  w-full">
          <span className="col-span-1 flex items-center justify-center">
            <CiBank size={24} />
          </span>
          <span className="col-span-3 font-medium flex flex-col items-start gap-y-1 ">
            <span>{i} Bankası </span>
            <span className="">Kart No</span>
          </span>
        </span>
        <span className="flex justify-center items-center gap-x-5">
          <span className="flex flex-col gap-y-1"></span>
          <span className="p-1">
            <RiArrowRightWideLine size={24} />
          </span>
        </span>
      </button>
    </li>
  );
}
