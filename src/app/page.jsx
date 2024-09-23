"use client";

import { postAPI } from "../services/fetchAPI";
import { useState } from "react";

export default function Home() {
  const [testVal, setTestVal] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();

    postAPI("/test", { text: testVal })
      .then((res) => {
        if (res.status === "success" || res.status === 200) {
          console.log("A new text added");
        } else {
          console.error("Something went wrong");
        }
      })
      .catch((err) => {
        console.error(err.message);
      });

    console.log(testVal);
  };

  return (
    <>
      <div>Hello</div>
      <form onSubmit={onSubmit}>
        <input
          className="border border-blue-500"
          type="text"
          value={testVal}
          onChange={(e) => setTestVal(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white p-1">
          Send
        </button>
      </form>
    </>
  );
}
