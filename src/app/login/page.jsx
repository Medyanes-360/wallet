export default function Page() {
  return (
    <div>
      <div className="h-screen flex justify-center bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100">
        <div className="bg-white shadow-lg rounded-md mt-36 flex flex-row justify-center p-5 w-96 h-96">
          <form>
            <h3 className="text-4xl space text-center font-bold text-purple-950">Giriş Yap</h3>
            <div className="flex flex-col gap-2 gap-y-5 mt-10">
              <div className="flex gap-x-3 border p-3 rounded-lg">
                <label htmlFor="">Email</label>
                <input placeholder="johndoe@johndoe.com" type="email" className="outline-none" />
              </div>
              <div className="flex gap-x-3 border p-3 rounded-lg">
                <label htmlFor="">Şifre</label>
                <input placeholder="*******" type="password" className="outline-none" />
              </div>
              <button className="shadow rounded-lg bg-purple-500 text-white font-medium p-1 duration-100 ease-in transition-all hover:bg-purple-600 hover:shadow-lg" type="submit">
                Giriş Yap
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
