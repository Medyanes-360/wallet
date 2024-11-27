
export default function NavigationItem({
  id,
  icon,
  title,
  page,
  setPage,
  type = "desktop",
}) {
  // type= desktop/mobile

  if (type === "mobile") {
    return (
      <button onClick={() => setPage(id)} className="block w-full">
        <div
          className={`flex justify-center items-center flex-col gap-1 ${
            page === id ? "" : ""
          }`}
        >
          <div
            className={`col-span-1 flex justify-end items-center ${
              page === id ? "text-purple-600" : ""
            }`}
          >
            {icon}
          </div>
          <div
            className={`col-span-3 text-left ${
              page === id ? "text-purple-600" : ""
            }`}
          >
            {title}
          </div>
        </div>
      </button>
    );
  }
  return (
    <button onClick={() => setPage(id)} className="block w-full">
      <div
        className={`grid grid-cols-4 gap-x-5 p-3 ${
          page === id
            ? "border-l-4 border-purple-400 bg-gradient-to-r from-purple-50 via-purple-100 to-gray-100"
            : ""
        }`}
      >
        <div
          className={`col-span-1 flex justify-end items-center ${
            page === id ? "text-purple-600" : ""
          }`}
        >
          {icon ? icon : "icon"}
        </div>
        <div className=" col-span-3 text-left">{title ? title : "Title"}</div>
      </div>
    </button>
  );
}
