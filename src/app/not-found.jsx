"use client";
import { usePathname, useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  const handleReturnHome = () => {
    router.replace("/");
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 text-center max-w-xs sm:max-w-md md:max-w-lg">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          404
        </h2>
        <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">
          Page Not Found
        </h3>
        <p className="text-gray-600 mb-6 text-sm sm:text-base md:text-lg">
          Sorry, the page you’re looking for{" "}
          <span className="font-semibold">&apos;{pathname}&apos;</span> doesn’t
          exist or may have been moved.
        </p>
        <button
          onClick={handleReturnHome}
          className="px-5 py-3 bg-blue-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Return to Homepage
        </button>
      </div>
    </div>
  );
}
