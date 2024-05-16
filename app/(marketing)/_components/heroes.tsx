import Image from "next/image";

export const Heroes = () => {
    return (
        <div className="flex items-center">
            <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:h-[400px] md:w-[400px]">
                <Image
                    src="/space.png"
                    fill
                    className="object-contain"
                    alt="마케팅페이지 아이콘1"
                />
            </div>
            <div className="relative w-[400px] h-[400px] sm:w-[350px] hidden md:block">
                <Image
                    src="/search_user.png"
                    fill
                    className="object-contain"
                    alt="마케팅페이지 아이콘2"
                />
            </div>
        </div>
    )
}