import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import HomeLayout from "../../Layouts/HomeLayout";
import axiosInstance from "../../config/axiosInstance";

function DisplayLectures() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { role } = useSelector((state) => state.auth);

    const [lectures, setLectures] = useState([]);
    const [currentLecture, setCurrentLecture] = useState(0);
    const [progressMap, setProgressMap] = useState({});

    // Derived state for current video
    const videoRef = useRef(null);
    // Track the last known time to avoid race conditions during cleanup (when video.currentTime might reset to 0)
    // Track the last known time to avoid race conditions during cleanup (when video.currentTime might reset to 0)
    const lastPlayedTimeRef = useRef(0);
    // Track duration to ensure we don't save 0 duration on cleanup if videoRef is unavailable
    const durationRef = useRef(0);
    // Track if we have already resumed playback for the current video to prevent seeking loops
    const hasResumedRef = useRef(false);

    const currentLectureData = lectures && lectures[currentLecture];

    console.log("DisplayLectures Debug:", { state, lecturesLength: lectures?.length, currentLectureData });

    useEffect(() => {
        if (!state || !state._id) navigate("/courses");

        // Fetch lectures
        (async () => {
            try {
                const res = await axiosInstance.get(`/courses/${state._id}`);
                if (res?.data?.success) {
                    setLectures(res.data.lectures);
                }
            } catch (error) {
                console.error("Failed to fetch lectures", error);
            }
        })();
    }, [state]);

    // Fetch progress separately and re-fetch when needed
    useEffect(() => {
        if (state?._id) fetchProgress();
    }, [state?._id]);

    async function fetchProgress() {
        try {
            const res = await axiosInstance.get(`/courses/${state._id}/progress`);
            if (res?.data?.success) {
                const map = {};
                res.data.progressData.forEach(p => {
                    map[p.lectureId] = p;
                });
                setProgressMap(map);
            }
        } catch (error) {
            console.error("Failed to fetch progress", error);
        }
    }

    // Reset tracking refs when lecture changes
    useEffect(() => {
        lastPlayedTimeRef.current = 0;
        durationRef.current = 0;
        hasResumedRef.current = false;

        // Also ensure video starts at 0 if no progress logic intervenes (default behavior)
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
        }
    }, [currentLectureData?._id]);

    async function handleProgressUpdate(isCleanup = false, shouldUpdateUI = false) {
        if (!currentLectureData) return;

        let currentTime = lastPlayedTimeRef.current;
        let duration = durationRef.current; // Default to ref
        let ended = false;

        if (videoRef.current && !isCleanup) {
            currentTime = videoRef.current.currentTime;
            duration = videoRef.current.duration;
            ended = videoRef.current.ended;

            // Update refs
            lastPlayedTimeRef.current = currentTime;
            if (duration > 0) durationRef.current = duration;
        }

        const isCompleted = (duration > 0 && currentTime >= duration - 2) || ended;

        // optimistic update for UI if requested (Pause, Ended, Cleanup)
        if (shouldUpdateUI) {
            setProgressMap(prev => ({
                ...prev,
                [currentLectureData._id]: {
                    ...prev[currentLectureData._id],
                    lastWatchedTime: currentTime,
                    duration: duration,
                    completed: isCompleted || prev[currentLectureData._id]?.completed
                }
            }));
        }

        try {
            await axiosInstance.post(`/courses/${state._id}/lectures/${currentLectureData._id}/progress`, {
                lastWatchedTime: currentTime,
                duration: duration,
                completed: isCompleted
            });
        } catch (error) {
            console.error("Failed to update progress", error);
        }
    }

    // Resume functionality: Watch for both video metadata and progress availability
    useEffect(() => {
        if (!currentLectureData || !videoRef.current || hasResumedRef.current) return;

        const progress = progressMap[currentLectureData._id];
        if (progress && progress.lastWatchedTime > 0) {
            console.log(`Resuming ${currentLectureData.title} at ${progress.lastWatchedTime}`);
            videoRef.current.currentTime = progress.lastWatchedTime;
            lastPlayedTimeRef.current = progress.lastWatchedTime;
            hasResumedRef.current = true;
        } else if (progress) {
            // Progress loaded but time is 0, just mark as resumed so we don't force it later
            hasResumedRef.current = true;
        }
    }, [currentLectureData, progressMap]); // Run when lecture loads OR progress loads


    // Save progress on component unmount or lecture change (cleanup)
    useEffect(() => {
        return () => {
            // Pass true to indicate cleanup: use ref instead of potentially reset video DOM
            // Pass true for shouldUpdateUI: we want the list to update instantly when we leave
            handleProgressUpdate(true, true);
        };
    }, [currentLectureData?._id]);

    // Capture metadata to get duration early
    function onLoadedMetadata() {
        if (videoRef.current) {
            durationRef.current = videoRef.current.duration;
        }
    }

    // Throttle progress updates
    function onTimeUpdate() {
        if (videoRef.current) {
            // Always update the ref for safety
            lastPlayedTimeRef.current = videoRef.current.currentTime;

            if (Math.floor(videoRef.current.currentTime) % 5 === 0) {
                // Do NOT update UI (live tick), just DB
                handleProgressUpdate(false, false);
            }
        }
    }

    function onEnded() {
        console.log("Video ended");
        // Update UI instantly on finish
        handleProgressUpdate(false, true);
    }

    function onPause() {
        console.log("Video paused");
        // Update UI instantly on pause
        handleProgressUpdate(false, true);
    }

    return (
        <HomeLayout>
            <div className="flex flex-col md:flex-row gap-5 min-h-[90vh] py-10 px-5 text-white">

                {/* Main Content: Video Player and Details */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
                        <video
                            key={currentLectureData?._id}
                            ref={videoRef}
                            src={currentLectureData?.lecture?.secure_url}
                            className="w-full h-auto max-h-[75vh] object-contain bg-black"
                            controls
                            onTimeUpdate={onTimeUpdate}
                            onEnded={onEnded}
                            onPause={onPause}
                            onLoadedMetadata={onLoadedMetadata}
                            disablePictureInPicture
                            controlsList="nodownload"
                            muted
                        >
                        </video>
                    </div>

                    <div className="px-2">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-3xl font-bold text-yellow-500">
                                {currentLectureData?.title}
                            </h1>
                            {(role === "ADMIN" || role === "admin") && (
                                <button
                                    onClick={() => navigate("/course/addlecture", { state: { ...state } })}
                                    className="btn-primary px-4 py-2 rounded-md font-bold text-sm hover:scale-105 transition-all"
                                >
                                    Add New Lecture
                                </button>
                            )}
                        </div>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            {currentLectureData?.description}
                        </p>
                    </div>
                </div>

                {/* Sidebar: Lecture List */}
                <div className="md:w-[22rem] w-full flex flex-col gap-4">
                    <div className="bg-zinc-800 p-4 rounded-xl shadow-lg border border-zinc-700 h-full max-h-[85vh] flex flex-col">
                        <div className="text-xl font-bold text-yellow-500 mb-4 border-b border-zinc-600 pb-2 flex justify-between items-center">
                            <span>Course Content</span>
                            <span className="text-sm text-gray-400 font-normal">
                                {lectures.length} Lectures
                            </span>
                        </div>

                        <ul className="flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
                            {lectures.map((element, index) => {
                                const progress = progressMap[element._id];
                                let percent = 0;
                                if (progress?.duration > 0) {
                                    percent = Math.round((progress.lastWatchedTime / progress.duration) * 100);
                                }
                                if (progress?.completed) percent = 100;
                                const isActive = currentLecture === index;

                                return (
                                    <li key={element._id}>
                                        <button
                                            onClick={() => setCurrentLecture(index)}
                                            className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-start gap-3 group ${isActive
                                                ? "bg-yellow-600/20 border-l-4 border-yellow-500"
                                                : "hover:bg-zinc-700/50 hover:pl-4"
                                                }`}
                                        >
                                            <span className={`text-sm font-bold min-w-[1.5rem] ${isActive ? "text-yellow-500" : "text-gray-500"}`}>
                                                {index + 1}.
                                            </span>
                                            <div className="flex-1">
                                                <p className={`text-sm font-medium line-clamp-2 ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                                                    {element?.title}
                                                </p>
                                            </div>
                                            {(percent > 0 || (progress && percent === 0)) && (
                                                <span className={`text-xs font-bold whitespace-nowrap ${percent === 100 ? "text-green-500" : "text-yellow-500"}`}>
                                                    {percent}%
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>

            </div>
        </HomeLayout>
    );

}

export default DisplayLectures;
