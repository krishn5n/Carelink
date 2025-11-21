import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { patientAPI } from '../../services/api';
import { getVitalColor, getVitalStatus } from '../../utils/colors';

export default function PatientDetailsScreen() {
    const params = useLocalSearchParams();
    const { patientId, firstName, lastName } = params;
    const [vitals, setVitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchVitals = async () => {
                try {
                    const response = await patientAPI.getVitals(patientId, {
                        limit: 50,
                        patientId,
                    });
                    setVitals(response.data.vitals);
                } catch (error) {
                    console.error('Failed to fetch vitals:', error);
                } finally {
                    setLoading(false);
                    setRefreshing(false);
                }
            };

            fetchVitals();
        }, [patientId])
    );

    const onRefresh = () => {
        setRefreshing(true);
    };

    const renderVitalCard = ({ item }) => {

        let vitalData = {};
        try {
            vitalData = typeof item.vitals === 'string'
                ? JSON.parse(item.vitals)
                : item.vitals;
        } catch (error) {
            console.error('Failed to parse vitals:', error);
        }
        const status = getVitalStatus(item.value);
        const backgroundColor = getVitalColor(vitalData.value * 10);




        return (
            <View style={[styles.vitalCard, { backgroundColor }]}>
                <View style={styles.vitalHeader}>
                    <View>
                        <Text style={styles.vitalValue}>Risk: {vitalData.value.toFixed(2) * 10}//10</Text>
                        <Text style={styles.vitalStatus}>{status}</Text>
                    </View>
                    <Text style={styles.vitalDate}>
                        {new Date(item.timestamp).toLocaleString()}
                    </Text>
                </View>

                <View style={styles.vitalDetails}>
                    {vitalData.spo2 && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>SpO2:</Text>
                            <Text style={styles.detailValue}>{vitalData.spo2}%</Text>
                        </View>
                    )}
                    {vitalData.temperature && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Temperature:</Text>
                            <Text style={styles.detailValue}>{vitalData.temperature}°C</Text>
                        </View>
                    )}
                    {vitalData.heartrate && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Heart Rate:</Text>
                            <Text style={styles.detailValue}>{vitalData.heartrate} bpm</Text>
                        </View>
                    )}
                    {vitalData.systolic && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Blood Pressure:</Text>
                            <Text style={styles.detailValue}>{vitalData.systolic}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: `${firstName} ${lastName}`,
                    headerStyle: { backgroundColor: '#2196F3' },
                    headerTintColor: '#fff',
                }}
            />

            <View style={styles.patientHeader}>
                <Text style={styles.patientId}>{patientId}</Text>
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                    <Text style={styles.legendText}>Normal (0-5)</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
                    <Text style={styles.legendText}>Warning (5-7.5)</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
                    <Text style={styles.legendText}>Critical (7.5+)</Text>
                </View>
            </View>

            {vitals.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No vital readings yet</Text>
                </View>
            ) : (
                <FlatList
                    data={vitals}
                    renderItem={renderVitalCard}
                    keyExtractor={(item) => item.id.toString()}
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
    patientHeader: {
        backgroundColor: '#2196F3',
        padding: 15,
        alignItems: 'center',
    },
    patientId: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 5,
    },
    legendText: {
        fontSize: 12,
        color: '#666',
    },
    listContainer: {
        padding: 15,
    },
    vitalCard: {
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    vitalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.3)',
    },
    vitalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    vitalStatus: {
        fontSize: 14,
        color: '#fff',
        marginTop: 2,
        opacity: 0.9,
    },
    vitalDate: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.8,
    },
    vitalDetails: {
        marginTop: 5,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 3,
    },
    detailLabel: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});