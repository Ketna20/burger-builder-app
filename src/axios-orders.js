import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://burger-builder-app-33109.firebaseio.com/'
});

export default axiosInstance;