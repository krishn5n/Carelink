import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert, KeyboardAvoidingView, Platform, ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import DatabaseService from '../../services/database';
import MQTTService from '../../services/mqtt';

export default function PatientHomeScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [mqttConnected, setMqttConnected] = useState(false);
    const [dbStats, setDbStats] = useState(null);
    const timerRef = useRef(null);

    const [vitals, setVitals] = useState({
        SpO2: '',
        Temperature: '',
        HeartRate: '',
        systolic: '',
        diastolic: '',
        OxygenSaturation: '',
    });

    useEffect(() => {
        if (!user) return;

        initializeServices();

        // Set up timer to check triggers every minute
        timerRef.current = setInterval(checkAndSendTriggers, 60000); // Check every 1 minute

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);


    if (!user) {
        return null;
    }
    const initializeServices = async () => {
        try {
            // Initialize database
            await DatabaseService.init();
            console.log('Database initialized');

            // Connect MQTT
            await connectMQTT();

            // Update stats
            await updateStats();
        } catch (error) {
            console.error('Initialization failed:', error);
            Alert.alert('Error', 'Failed to initialize services');
        }
    };
    const connectMQTT = async () => {
        try {
            if (!user?.roleId) return;
            await MQTTService.connect(user.roleId);
            setMqttConnected(true);
        } catch (error) {
            console.error('MQTT connection failed:', error);
            Alert.alert('Warning', 'MQTT connection failed. Vitals may not be sent.');
        }
    };


    const updateStats = async () => {
        const stats = await DatabaseService.getStats();
        setDbStats(stats);
    };

    const getdatafromML = async () => {
        return null
    }

    const handleSubmit = async () => {
        if (
            !vitals.SpO2 ||
            !vitals.Temperature ||
            !vitals.HeartRate ||
            !vitals.systolic
        ) {
            Alert.alert('Error', 'Please fill all vital fields');
            return;
        }

        const value = await getdatafromML(vitals)

        const vitalData = {
            SpO2: parseFloat(vitals.SpO2),
            Temperature: parseFloat(vitals.Temperature),
            HeartRate: parseFloat(vitals.HeartRate),
            systolic: parseFloat(vitals.systolic),
            OxygenSaturation: parseFloat(vitals.OxygenSaturation || 0),
            Value: 0.88,
        };

        setLoading(true);

        try {
            // Store in SQLite
            await DatabaseService.insertVital(vitalData);
            console.log('Vital stored in database');

            // Update stats
            await updateStats();

            const flag_to_send = await DatabaseService.shouldSendData(value);
            // Flag is 2 -> Priority , 1 -> Chill dhan send , 0 -> Dont send

            if (flag_to_send > 0) {
                await sendBatchData(flag_to_send);
            }

            Alert.alert(
                'Success',
                `Vitals saved!\nRisk Score: ${value}\nUnsynced: ${(await DatabaseService.getUnsyncedCount())}`
            );

            // Clear form
            setVitals({
                SpO2: '',
                Temperature: '',
                HeartRate: '',
                systolic: '',
                OxygenSaturation: '',
            });
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Failed to save vitals');
        } finally {
            setLoading(false);
        }
    };

    const sendBatchData = async (flag_to_send) => {
        try {
            if (!mqttConnected) {
                await connectMQTT();
            }

            // Get data from SQLite
            const result = await DatabaseService.dataFromSQL(flag_to_send);

            if (!result) {
                console.log('No data to send');
                return;
            }

            const { payload, ids } = result;

            // Send via MQTT
            MQTTService.publishVitals(user.roleId, payload);

            console.log(`Sent ${ids.length} vitals via MQTT`);

            // Mark as synced
            await DatabaseService.markAsSynced(ids);

            // Delete synced data
            await DatabaseService.deleteSyncedVitals(ids);

            // Update last send time
            await DatabaseService.updateLastSendTime();

            // Update stats
            await updateStats();

            Alert.alert('Sync Complete', `${ids.length} vitals sent successfully!`);
        } catch (error) {
            console.error('Batch send error:', error);
            Alert.alert('Sync Failed', 'Failed to send batch data. Will retry later.');
        }
    };

    const checkAndSendTriggers = async () => {
        try {
            const flag_to_send = await DatabaseService.shouldSendData();
            console.log("Checking triggers")
            if (flag_to_send) {
                console.log('Trigger met - sending batch data');
                await sendBatchData();
            }

            // Update stats
            await updateStats();
        } catch (error) {
            console.error('Trigger check error:', error);
        }
    };

    const handleManualSync = async () => {
        Alert.alert(
            'Manual Sync',
            'Force send all unsynced data now?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send',
                    onPress: async () => {
                        setLoading(true);
                        await sendBatchData();
                        setLoading(false);
                    },
                },
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Submit Vitals</Text>
                    <Text style={styles.subtitle}>Patient ID: {user.roleId}</Text>
                    <View style={styles.statusBadge}>
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: mqttConnected ? '#4CAF50' : '#F44336' },
                            ]}
                        />
                        <Text style={styles.statusText}>
                            {mqttConnected ? 'Connected' : 'Disconnected'}
                        </Text>
                    </View>
                </View>
                {dbStats && (
                    <View style={styles.statsBox}>
                        <Text style={styles.statsTitle}>📊 Local Storage</Text>
                        <Text style={styles.statsText}>
                            Unsynced Records: {dbStats.unsyncedCount}
                        </Text>
                        <Text style={styles.statsText}>
                            Database Size: {(dbStats.databaseSize / 1024).toFixed(2)} KB / 1024 KB
                        </Text>
                        <Text style={styles.statsText}>
                            Next Auto-Sync: {dbStats.timeUntilNextSendMinutes} min
                        </Text>
                        {dbStats.unsyncedCount > 0 && (
                            <TouchableOpacity
                                style={styles.syncButton}
                                onPress={handleManualSync}
                            >
                                <Text style={styles.syncButtonText}>
                                    🔄 Sync Now
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}


                <View style={styles.form}>
                    <Text style={styles.label}>SpO2 (%)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 98"
                        placeholderTextColor="#888"
                        value={vitals.SpO2}
                        onChangeText={(text) => setVitals({ ...vitals, SpO2: text })}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Temperature (°C)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 36.8"
                        placeholderTextColor="#888"
                        value={vitals.Temperature}
                        onChangeText={(text) => setVitals({ ...vitals, Temperature: text })}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Heart Rate (bpm)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 78"
                        placeholderTextColor="#888"
                        value={vitals.HeartRate}
                        onChangeText={(text) => setVitals({ ...vitals, HeartRate: text })}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Blood Pressure</Text>
                    <View style={styles.bpContainer}>
                        <TextInput
                            style={[styles.input, styles.bpInput]}
                            placeholder="Systolic"
                            placeholderTextColor="#888"
                            value={vitals.systolic}
                            onChangeText={(text) => setVitals({ ...vitals, systolic: text })}
                            keyboardType="numeric"
                        />
                        <Text style={styles.bpSeparator}>/</Text>
                        <TextInput
                            style={[styles.input, styles.bpInput]}
                            placeholder="Diastolic"
                            placeholderTextColor="#888"
                            value={vitals.diastolic}
                            onChangeText={(text) => setVitals({ ...vitals, diastolic: text })}
                            keyboardType="numeric"
                        />
                    </View>


                    <Text style={styles.label}>Oxygen Saturation (%)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 95"
                        placeholderTextColor="#888"
                        value={vitals.OxygenSaturation}
                        onChangeText={(text) => setVitals({ ...vitals, OxygenSaturation: text })}
                        keyboardType="numeric"
                    />


                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Submit Vitals</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>ℹ️ Normal Ranges:</Text>
                        <Text style={styles.infoText}>• SpO2: 95-100%</Text>
                        <Text style={styles.infoText}>• Temperature: 36.1-37.2°C</Text>
                        <Text style={styles.infoText}>• Heart Rate: 60-100 bpm</Text>
                        <Text style={styles.infoText}>• BP: Less than 120/80</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2196F3',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        marginTop: 5,
        opacity: 0.9,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    bpContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    bpInput: {
        flex: 1,
        marginBottom: 0,
    },
    bpSeparator: {
        fontSize: 20,
        marginHorizontal: 10,
        color: '#666',
    },
    button: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoBox: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        padding: 15,
        marginTop: 20,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1976D2',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 12,
        color: '#1976D2',
        marginVertical: 2,
    },
    statsBox: {
        backgroundColor: '#FFF9C4',
        margin: 15,
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#FBC02D',
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F57F17',
        marginBottom: 8,
    },
    statsText: {
        fontSize: 13,
        color: '#F57F17',
        marginVertical: 2,
    },
    syncButton: {
        backgroundColor: '#FBC02D',
        borderRadius: 6,
        padding: 10,
        marginTop: 10,
        alignItems: 'center',
    },
    syncButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    }
});