import { Tabs } from 'expo-router';
import { Alert, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function PatientLayout() {
    const { logout } = useAuth();

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
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
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
    );
}