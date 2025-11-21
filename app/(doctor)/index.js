import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI } from '../../services/api';

export default function DoctorHomeScreen() {
    // ✅ ALL HOOKS FIRST - before any conditional returns
    const { user } = useAuth();
    const router = useRouter();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // ✅ Define fetchPatients before useFocusEffect
    const fetchPatients = async () => {
        if (!user) return; // Guard clause inside function
        try {
            const response = await doctorAPI.getPatients(user.roleId);
            setPatients(response.data.patients);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // ✅ useFocusEffect hook
    useFocusEffect(
        useCallback(() => {
            fetchPatients();
        }, [user])
    );

    // ✅ Define onRefresh
    const onRefresh = () => {
        setRefreshing(true);
        fetchPatients();
    };

    // ✅ NOW conditional returns are safe (after all hooks)
    if (!user) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    const renderPatientCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                router.push({
                    pathname: '/(doctor)/patient-details',
                    params: {
                        patientId: item.patient_id,
                        firstName: item.first_name,
                        lastName: item.last_name
                    }
                })
            }
        >
            <View style={styles.cardHeader}>
                <Text style={styles.patientName}>
                    {item.first_name} {item.last_name}
                </Text>
                <Text style={styles.patientId}>{item.patient_id}</Text>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.infoText}>📧 {item.email}</Text>
                <Text style={styles.infoText}>
                    🎂 {new Date(item.date_of_birth).toLocaleDateString()}
                </Text>
                <Text style={styles.assignedText}>
                    Assigned: {new Date(item.assigned_at).toLocaleDateString()}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Patients</Text>
                <Text style={styles.subtitle}>Doctor ID: {user.roleId}</Text>
                <Text style={styles.count}>{patients.length} Patients</Text>
            </View>

            {patients.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No patients assigned yet</Text>
                    <Text style={styles.emptySubtext}>
                        Use the Search tab to find and assign patients
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={patients}
                    renderItem={renderPatientCard}
                    keyExtractor={(item) => item.patient_id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    count: {
        fontSize: 16,
        color: '#fff',
        marginTop: 10,
        fontWeight: '500',
    },
    listContainer: {
        padding: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    patientName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    patientId: {
        fontSize: 14,
        color: '#2196F3',
        fontWeight: '500',
    },
    cardBody: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    assignedText: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});