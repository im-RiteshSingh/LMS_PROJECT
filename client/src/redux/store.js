import { configureStore } from "@reduxjs/toolkit";

import authReducer from './slices/authSlice.js';
import courseReducer from './slices/courseSlice.js';
import lectureReducer from './slices/lectureSlice.js';
const store = configureStore({
    reducer: {
        auth: authReducer,
        course: courseReducer,
        lecture: lectureReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
    devTools: true
});

export default store;