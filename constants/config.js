// Configuration file for API and MQTT settings
export const API_CONFIG = {
    BASE_URL: 'http://172.20.10.8:3000', // Change to your server IP
    TIMEOUT: 10000,
};


export const SOCKET_CONFIG = {
    IP: "172.20.10.8",
    PORT: 3002
}

export const MQTT_CONFIG = {
    BROKER: '172.20.10.8', // Change to your MQTT broker IP
    PORT: 2000, // WebSocket port
    PATH: '/mqtt',
};

export default {
    API_CONFIG,
    MQTT_CONFIG,
};