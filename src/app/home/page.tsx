import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="text-white flex flex-col">
      <main className=" flex flex-col items-center justify-between p-4 container max-w-md mx-auto">
        <div className="w-full pt-20 space-y-6 text-center">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight leading-tight">
            The future
            <br />
            <span className="text-4xl">of marketing.</span>
          </h1>
          <div className="flex justify-center pt-10 ">
            <Headphones size={300} />
          </div>
        </div>
        <div className="w-full space-y-4 mt-20">
          <Link to={"/auth"}>
            <Button
              className="w-full h-12 text-base bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
              size="lg"
            >
              Sign In/Register
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full h-12 text-base border-white/20 bg-black hover:bg-white/10 text-white"
            size="lg"
          >
            Explore
          </Button>

          <p className="text-sm text-gray-400 text-center px-6 pb-4">
            By signing up or logging in, you are indicating that you have read
            and agreed to the{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Terms of Use
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;
