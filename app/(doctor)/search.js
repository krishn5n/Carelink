import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI, patientAPI } from '../../services/api';

export default function SearchPatientScreen() {
    const { user } = useAuth();
    const [patientId, setPatientId] = useState('');
    const [loading, setLoading] = useState(false);
    const [patient, setPatient] = useState(null);

    const handleSearch = async () => {
        if (!patientId.trim()) {
            Alert.alert('Error', 'Please enter a Patient ID');
            return;
        }

        setLoading(true);
        setPatient(null);

        try {
            const response = await patientAPI.getProfile(patientId.trim());
            setPatient(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                Alert.alert('Not Found', 'Patient not found');
            } else {
                Alert.alert('Error', 'Failed to fetch patient details');
            }
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!patient) return;

        Alert.alert(
            'Confirm Assignment',
            `Assign ${patient.first_name} ${patient.last_name} to your care?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Assign',
                    onPress: async () => {
                        try {
                            await doctorAPI.assignPatient(user.roleId, patient.patient_id);
                            Alert.alert('Success', 'Patient assigned successfully');
                            setPatient(null);
                            setPatientId('');
                        } catch (error) {
                            if (error.response?.status === 409) {
                                Alert.alert('Info', 'Patient is already assigned to you');
                            } else {
                                Alert.alert('Error', 'Failed to assign patient');
                            }
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Search Patient</Text>
                <Text style={styles.subtitle}>Find patients by ID</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.label}>Enter Patient ID</Text>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., P000001"
                        value={patientId}
                        onChangeText={setPatientId}
                        autoCapitalize="characters"
                    />
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearch}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.searchButtonText}>Search</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {patient && (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultTitle}>Patient Found</Text>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Name:</Text>
                            <Text style={styles.resultValue}>
                                {patient.first_name} {patient.last_name}
                            </Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Patient ID:</Text>
                            <Text style={styles.resultValue}>{patient.patient_id}</Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Email:</Text>
                            <Text style={styles.resultValue}>{patient.email}</Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Date of Birth:</Text>
                            <Text style={styles.resultValue}>
                                {new Date(patient.date_of_birth).toLocaleDateString()}
                            </Text>
                        </View>

                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Status:</Text>
                            <Text
                                style={[
                                    styles.resultValue,
                                    { color: patient.active ? '#4CAF50' : '#F44336' },
                                ]}
                            >
                                {patient.active ? 'Active' : 'Inactive'}
                            </Text>
                        </View>

                        {patient.emergency_contact && (
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Emergency:</Text>
                                <Text style={styles.resultValue}>
                                    {patient.emergency_contact}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.assignButton}
                            onPress={handleAssign}
                        >
                            <Text style={styles.assignButtonText}>
                                Assign to My Patients
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>ℹ️ How to use:</Text>
                    <Text style={styles.infoText}>
                        1. Enter the Patient ID (e.g., P000001)
                    </Text>
                    <Text style={styles.infoText}>2. Click Search</Text>
                    <Text style={styles.infoText}>
                        3. Review patient details and click Assign
                    </Text>
                </View>
            </View>
        </ScrollView>
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
    content: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 10,
    },
    searchButton: {
        backgroundColor: '#2196F3',
        borderRadius: 8,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 15,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    resultLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    resultValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        maxWidth: '60%',
        textAlign: 'right',
    },
    assignButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    assignButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoBox: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        padding: 15,
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
});