import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import NavMenu from "./navMenu";

const Navbar = async () => {
  return (
    <nav className="sticky z-[100] h-14 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold text-lg">
            Iphone<span className="text-primary">Case</span>
          </Link>

          <NavMenu />
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
