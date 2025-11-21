import { Stack, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Text } from 'react-native';
import io from 'socket.io-client';
import { SOCKET_CONFIG } from '../../constants/config';
import { useAuth } from '../../context/AuthContext';

const SOCKET_SERVER_URL = `http://${SOCKET_CONFIG.IP}:${SOCKET_CONFIG.PORT}`;

export default function DoctorLayout() {
    const { user, logout } = useAuth();
    useEffect(() => {
        // 🧩 If user or roleId is not ready, skip entirely
        if (!user?.roleId) {
            console.log("⏸️ Skipping socket init: roleId missing");
            return;
        }

        console.log(`⚡ Initializing socket for doctor ${user.roleId}`);

        const socket = io(SOCKET_SERVER_URL, {
            query: { doctorId: user.roleId },
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log(`🔗 Connected as ${user.roleId}`);
            socket.emit('registerDoctor', user.roleId);  // 👈 send doctorId to backend here
        });

        socket.on('disconnect', () => console.log('❌ Disconnected'));
        socket.on('alert', (data) => {
            console.log('🚨 New alert:', data);
            Alert.alert('New Alert', data.message);
        });

        // 🧹 Proper cleanup
        return () => {
            console.log(`🧹 Cleaning up socket for ${user.roleId}`);
            socket.disconnect();
        };
    }, [user?.roleId]);


    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: logout, style: 'destructive' },
            ]
        );
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: '#2196F3',
                    tabBarInactiveTintColor: '#666',
                    headerShown: false,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Patients',
                        tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👥</Text>,
                    }}
                />
                <Tabs.Screen
                    name="search"
                    options={{
                        title: 'Search',
                        tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🔍</Text>,
                    }}
                />
                <Tabs.Screen
                    name="alerts"
                    options={{
                        title: 'Alerts',
                        tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🚨</Text>,
                    }}
                />
                <Tabs.Screen
                    name="patient-details"
                    options={{
                        href: null, // Hide from tabs
                    }}
                />
                <Tabs.Screen
                    name="logout"
                    options={{
                        title: 'Logout',
                        tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🚪</Text>,
                    }}
                    listeners={{
                        tabPress: (e) => {
                            e.preventDefault();
                            handleLogout();
                        },
                    }}
                />
            </Tabs>
        </>
    );
}
