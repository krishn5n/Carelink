import Paho from 'paho-mqtt';
import { MQTT_CONFIG } from '../constants/config';

class MQTTService {
    constructor() {
        this.client = null;
        this.connected = false;
    }

    connect(patientId) {
        return new Promise((resolve, reject) => {
            const clientId = `patient_${patientId}_${Date.now()}`;

            this.client = new Paho.Client(
                MQTT_CONFIG.BROKER,
                MQTT_CONFIG.PORT,
                MQTT_CONFIG.PATH,
                clientId
            );

            this.client.onConnectionLost = (response) => {
                console.log('MQTT Connection Lost:', response.errorMessage);
                this.connected = false;
            };

            this.client.connect({
                onSuccess: () => {
                    console.log('MQTT Connected');
                    this.connected = true;
                    resolve();
                },
                onFailure: (error) => {
                    console.error('MQTT Connection Failed:', error);
                    reject(error);
                },
                useSSL: false,
                timeout: 10,
            });
        });
    }

    publishVitals(patientId, vitalsData) {
        if (!this.connected || !this.client) {
            throw new Error('MQTT not connected');
        }

        const topic = `carelink/${patientId}/vitals/batch`;
        const payload = JSON.stringify(vitalsData);

        const message = new Paho.Message(payload);
        message.destinationName = topic;
        message.qos = 1;

        this.client.send(message);
        console.log('Published vitals:', payload);
    }

    disconnect() {
        if (this.client && this.connected) {
            this.client.disconnect();
            this.connected = false;
        }
    }
}

export default new MQTTService();