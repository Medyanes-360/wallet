"use client";
import { useFormik } from "formik";
import { postAPI } from "../../../services/fetchAPI";
import Swal from "sweetalert2";

export default function Page() {
  const formik = useFormik({
    initialValues: {
      email: "",
      fullname: "",
      birthdate: "",
      tel: "",
      password: "",
    },
    onSubmit: async (values) => {
      const payload = {
        email: values.email,
        fullname: values.fullname,
        birthdate: values.birthdate,
        tel: values.tel,
        password: values.password,
      };
      console.log(payload);
      await postAPI("/signup", payload);
    },
  });
  return (
    <div>
      <div className="h-screen flex  justify-center bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100">
        <div className="bg-white  shadow-lg rounded-md mt-5 mx-3 md:mt-20 p-5 w-full md:w-4/5 lg:w-2/5 max-h-[500px]">
          <form onSubmit={formik.handleSubmit} className="">
            <h3 className="text-4xl space text-center font-bold text-purple-950">
              Kayıt Ol
            </h3>
            <div className="flex flex-col md:grid md:grid-cols-2 gap-2 gap-y-3 mt-10 ">
              <div className="grid grid-cols-3 gap-x-3 border p-3 rounded-lg">
                <label className="col-span-1" htmlFor="">
                  Tam Ad
                </label>
                <input
                  value={formik.values.fullname}
                  onChange={formik.handleChange}
                  name="fullname"
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
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  name="email"
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
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  name="password"
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
                  value={formik.values.tel}
                  name="tel"
                  onChange={formik.handleChange}
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
                  value={formik.values.birthdate}
                  name="birthdate"
                  type="date"
                  onChange={formik.handleChange}
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
