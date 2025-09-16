import axios from 'axios';
import backend_url from './commonServices';

const client = axios.create({
    baseURL: backend_url
});

const fetchAPI = async ({ ...options }) => {
    client.defaults.withCredentials = true;
    client.defaults.signal = options?.signal ? options.signal : undefined;
    const onSuccess = (response) => response;
    const onError = (error) => {
        throw error?.response || error;
    };
    return client(options).then(onSuccess).catch(onError);
}

export default fetchAPI;