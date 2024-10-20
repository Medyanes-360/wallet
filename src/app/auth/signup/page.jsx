"use client"
export default function Page() {
  function handleSubmit(){
    return 0
  }
  return (
    <div>
      <div className="h-screen flex  justify-center bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100">
        <div className="bg-white  shadow-lg rounded-md mt-5 mx-3 md:mt-20 p-5 w-full md:w-4/5 lg:w-2/5 max-h-[500px]">
          <form onSubmit={()=>handleSubmit()} className="">
            <h3 className="text-4xl space text-center font-bold text-purple-950">
              Kayıt Ol
            </h3>
            <div className="flex flex-col md:grid md:grid-cols-2 gap-2 gap-y-3 mt-10 ">
              <div className="grid grid-cols-3 gap-x-3 border p-3 rounded-lg">
                <label className="col-span-1" htmlFor="">
                  Tam Ad
                </label>
                <input
                  placeholder="john doe"
                  type="text"
                  autoComplete="fullName"
                  className="outline-none col-span-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-x-3 border p-3 rounded-lg">
                <label className="col-span-1" htmlFor="">
                  Email
                </label>
                <input
                  placeholder="johndoe@johndoe.com"
                  type="email"
                  autoComplete="email"
                  className="outline-none col-span-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-x-3 border p-3 rounded-lg">
                <label className="col-span-1" htmlFor="">
                  Şifre
                </label>
                <input
                  placeholder="******"
                  type="password"
                  autoComplete="current-password"
                  className="outline-none col-span-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-x-3 border p-3 rounded-lg">
                <label className="col-span-1" htmlFor="">
                  Telefon No
                </label>
                <input
                  placeholder="5462871232"
                  type="tel"
                  autoComplete="current-password"
                  className="outline-none col-span-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-x-3 border p-3 rounded-lg">
                <label className="col-span-1" htmlFor="">
                  Doğum Tarihi
                </label>
                <input
                  defaultValue="2000-07-22"
                  type="date"
                  autoComplete="birthday"
                  className="outline-none"
                />
              </div>
              <div className="col-span-1"></div>
            </div>
            <div className="flex justify-center">
              <button
                className="shadow rounded-lg w-[200px]  px-5 mt-10 bg-purple-500 text-white font-medium p-1 duration-100 ease-in transition-all hover:bg-purple-600 hover:shadow-lg"
                type="submit"
              >
                Kayıt Ol
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
