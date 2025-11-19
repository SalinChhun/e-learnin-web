import {http} from '@/utils/http';

const ServiceId = {
    UPLOADIMAGE: '/api/wba/v1/files',
}


function uploadImage(image: File) {
    const formData = new FormData();
    formData.append("file_data", image)
    const API = ServiceId.UPLOADIMAGE;

    return http.post(API + `/upload-image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

function uploadVideo(video: File) {
    const formData = new FormData();
    formData.append("file_data", video)
    const API = ServiceId.UPLOADIMAGE;

    return http.post(API + `/upload-video`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

const fileService = {
    uploadImage,
    uploadVideo
}
export default fileService;
