// /app/auth/signIn.tsx
import { Colors } from '@/constants/theme';
import { UserContext } from '@/context/usercontext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Button, ScrollView, Text, TextInput } from 'react-native';

export default function SignInScreen() {
    const { setRole } = useContext(UserContext);
    const router = useRouter();

    const [phone, setPhone] = useState('');

    const handleSignIn = async () => {
        // Dummy login logic: retrieve role from AsyncStorage
        const storedRole = await AsyncStorage.getItem('userRole');
        if (storedRole === 'doctor' || storedRole === 'patient') {
            setRole(storedRole);
            router.replace(storedRole === 'doctor' ? '/doctor' : '/patient');
        } else {
            alert('User not found. Please sign up first.');
        }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.primary }}>Sign In</Text>

            <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ marginVertical: 10, borderBottomWidth: 1 }} />

            <Button title="Sign In" color={Colors.primary} onPress={handleSignIn} />
        </ScrollView>
    );
}
