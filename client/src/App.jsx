import "./App.css";

import { Route, Routes } from "react-router-dom";

import RequireAuth from "./Components/Auth/RequireAuth.jsx"

import Home from "./Pages/Home.jsx";
import CourseList from "./Pages/Course/CourseList.jsx";
import Profile from "./Pages/User/Profile.jsx";
import Signin from "./Pages/Signin.jsx";
import Signup from "./Pages/Signup.jsx";
import CreateCourse from "./Pages/Course/CreateCourse.jsx";
import AddLecture from "./Pages/Dashboard/AddLecture.jsx";
import CourseDescription from "./Pages/Course/CourseDescription.jsx";
import DisplayLectures from "./Pages/Dashboard/DisplayLectures.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} ></Route>
      <Route path="/signup" element={<Signup />} ></Route>
      <Route path="/signin" element={<Signin />} ></Route>
      <Route path="/courses" element={<CourseList />} ></Route>
      <Route path="/course/description" element={<CourseDescription />} ></Route>


      <Route element={<RequireAuth allowedRoles={["ADMIN", "USER"]} />} >
        <Route path="/user/profile" element={<Profile />}></Route>
      </Route>

      <Route element={<RequireAuth allowedRoles={["ADMIN", "USER"]} />} >
        <Route path="/course/create" element={<CreateCourse />} />
        <Route path="/course/addlecture" element={<AddLecture />} />
        <Route path="/course/displaylectures" element={<DisplayLectures />} />
      </Route>




    </Routes>
  );
}

export default App;
