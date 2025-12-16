import { useNavigate } from "react-router-dom"

function CourseCard({ data }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate("/course/description", { state: { ...data } })}
            className="text-white w-[22rem] h-[430px] shadow-lg rounded-2xl cursor-pointer group overflow-hidden bg-zinc-800 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all ease-in-out duration-300 border border-zinc-700/50"
        >
            <div className="overflow-hidden relative h-48 w-full">
                <img
                    alt="Course thumbnail"
                    src={data?.thumbnail?.secure_url}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform ease-in-out duration-300"
                />
                <div className="absolute bottom-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                    {data?.numberOfLectures} Lectures
                </div>
            </div>
            <div className="p-5 space-y-3 text-white">
                <h2 className="text-xl font-bold text-yellow-500 line-clamp-2 min-h-[3.5rem]" title={data?.title}>
                    {data?.title}
                </h2>
                <p className="line-clamp-2 text-gray-400 text-sm h-[2.5rem]">
                    {data?.description}
                </p>

                <div className="flex flex-col gap-2 pt-2 border-t border-zinc-700">
                    <p className="font-semibold text-gray-300">
                        Category: <span className="font-bold text-yellow-500">{data?.category}</span>
                    </p>
                    <p className="font-semibold text-gray-300">
                        Instructor: <span className="font-bold text-yellow-500">{data?.instructor}</span>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default CourseCard