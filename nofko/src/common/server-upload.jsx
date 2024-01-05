import axios from "axios";


export const uploadImage = async (image) => {
    let image_url = null;

    const {data} = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/upload-image', image)

    if (data?.image_url) image_url = data?.image_url;


    return image_url;
}