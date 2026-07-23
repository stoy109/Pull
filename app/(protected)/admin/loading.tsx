export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#f4f7f5] px-5 py-8 lg:pl-[17rem] sm:px-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-7 w-48 rounded-lg bg-[#dfe8e3]" />
        <div className="mt-4 h-11 max-w-xl rounded-xl bg-[#e6ede9]" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-40 rounded-[20px] border border-[#dce6e0] bg-white" />
          ))}
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_.8fr]">
          <div className="h-80 rounded-[22px] border border-[#dce6e0] bg-white" />
          <div className="h-80 rounded-[22px] border border-[#dce6e0] bg-white" />
        </div>
      </div>
    </div>
  );
}

