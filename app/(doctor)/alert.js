import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI } from '../../services/api';

export default function AlertsScreen() {
    const [alerts, setAlerts] = useState([]);
    const { user, token } = useAuth();

    useEffect(() => {
        async function fetchAlerts() {
            try {

                const doctorId = user.roleId // adjust based on your backend user schema

                const response = await doctorAPI.getAlerts(doctorId, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setAlerts(response.data.alerts || []);
            } catch (error) {
                console.error('Failed to fetch alerts:', error.response?.data || error.message);
            }
        }

        fetchAlerts();
    }, [user, token]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Alerts</Text>
            {alerts.length === 0 ? (
                <Text style={styles.empty}>No alerts yet</Text>
            ) : (
                <FlatList
                    data={alerts}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.alertCard}>
                            <Text style={styles.message}>{item.message}</Text>
                            <Text style={styles.sub}>{new Date(item.created_at).toLocaleString()}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
    empty: { textAlign: 'center', color: '#666', marginTop: 50 },
    alertCard: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 1,
    },
    message: { fontSize: 16, color: '#333' },
    sub: { fontSize: 12, color: '#888' },
});
