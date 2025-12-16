import { model, Schema } from 'mongoose'

const videoProgressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lectureId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    lastWatchedTime: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const videoProgress = new model('VideoProgress', videoProgressSchema)

export default videoProgress;