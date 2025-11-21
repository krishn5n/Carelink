import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Index() {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    if (user?.role === 'doctor') {
        return <Redirect href="/(doctor)" />;
    }

    return <Redirect href="/(patient)" />;
}