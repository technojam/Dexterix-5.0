import Image from "next/image";

export default function NotFound() {
  return (
    <div className="relative flex flex-col min-h-screen w-full bg-[#1b4080] overflow-hidden">
      <Image
        src={"/img/bg-stars2.png"}
        alt="bg"
        fill
        className="absolute inset-0 z-10 w-full h-full object-contain pointer-events-none select-none opacity-25"
        priority
        draggable={false}
      />
      <Image
        src={"/img/404.png"}
        alt="404 Not Found"
        fill
        className="absolute inset-0 -top-20 z-50 w-full h-full object-contain pointer-events-none select-none"
        priority
        draggable={false}
      />
    </div>
  );
}
