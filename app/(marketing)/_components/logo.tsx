import Image from "next/image";
import { Poppins } from "next/font/google";

// cn : dynamically append classes
import { cn } from "@/lib/utils";

const font = Poppins({
    subsets: ["latin"],
    weight: ["400","600"]
});

export const Logo = () => {
    return (
        <div className="hidden md:flex items-center gap-x-2">
            <Image
                src="/logo.svg"
                width="40"
                height="40"
                alt="Logo"
                className="dark:hidden"
            />
            <Image
                src="/logo-dark.svg"
                width="40"
                height="40"
                alt="Logo"
                className="hidden dark:block"
            />
            <p className={cn("font-semibold", font.className)}>Jieun Notion</p>
        </div>
    )
}