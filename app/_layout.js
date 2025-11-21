import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutNav() {
    const { isAuthenticated, user, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inDoctorGroup = segments[0] === '(doctor)';
        const inPatientGroup = segments[0] === '(patient)';

        if (!isAuthenticated && !inAuthGroup) {
            // Redirect to login
            router.replace('/(auth)/login');
        } else if (isAuthenticated) {
            if (user?.role === 'doctor' && !inDoctorGroup) {
                router.replace('/(doctor)');
            } else if (user?.role === 'patient' && !inPatientGroup) {
                router.replace('/(patient)');
            }
        }
    }, [isAuthenticated, user, segments, loading]);
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="(auth)/register" />
            <Stack.Screen name="(doctor)" />
            <Stack.Screen name="(patient)" />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    );
}