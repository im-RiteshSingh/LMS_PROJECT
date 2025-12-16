import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import CourseCard from "../../Components/CourseCard.jsx";
import HomeLayout from "../../Layouts/HomeLayout.jsx";
import { getAllCourses } from "../../redux/slices/courseSlice.js";

function CourseList() {

    const dispatch = useDispatch();

    const { courseList } = useSelector((state) => state.course);

    async function loadCourses() {
        await dispatch(getAllCourses());
    }

    useEffect(() => {
        loadCourses();
    }, [])

    return (
        <HomeLayout>
            <div className="min-h-[90vh] pt-12 pl-20 flex flex-col gap-10 text-white">
                <h1 className="text-center text-4xl font-semibold mb-5 font-sans">
                    Explore courses made by {" "}
                    <span className="font-bold text-yellow-500 font-sans">Industry experts</span>
                </h1>
                <div className="mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mx-auto">
                    {courseList?.map((element) => {
                        return <CourseCard key={element._id} data={element} />
                    })}
                </div>
            </div>

        </HomeLayout>
    );
}

export default CourseList;