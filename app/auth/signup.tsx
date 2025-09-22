// /app/auth/signUp.tsx
import { Colors } from '@/constants/theme';
import { UserContext } from '@/context/usercontext';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Button, ScrollView, Text, TextInput, View } from 'react-native';

export default function SignUpScreen() {
    const { setRole } = useContext(UserContext);
    const router = useRouter();

    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [phone, setPhone] = useState('');
    const [isDoctor, setIsDoctor] = useState(false);
    const [email, setEmail] = useState('');
    const [qualification, setQualification] = useState('');

    const handleSignUp = async () => {
        // Here you can save user info in AsyncStorage or server
        const role = isDoctor ? 'doctor' : 'patient';
        await setRole(role);
        // Redirect based on role
        router.replace(role === 'doctor' ? '/doctor' : '/patient');
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.primary }}>Sign Up</Text>

            <TextInput placeholder="Name" value={name} onChangeText={setName} style={{ marginVertical: 10, borderBottomWidth: 1 }} />
            <TextInput placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" style={{ marginVertical: 10, borderBottomWidth: 1 }} />
            <TextInput placeholder="Gender" value={gender} onChangeText={setGender} style={{ marginVertical: 10, borderBottomWidth: 1 }} />
            <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ marginVertical: 10, borderBottomWidth: 1 }} />

            <View style={{ flexDirection: 'row', marginVertical: 10, alignItems: 'center' }}>
                <Text style={{ marginRight: 10 }}>Are you a Doctor?</Text>
                <Button title={isDoctor ? "Yes" : "No"} onPress={() => setIsDoctor(!isDoctor)} />
            </View>

            {isDoctor && (
                <>
                    <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ marginVertical: 10, borderBottomWidth: 1 }} />
                    <TextInput placeholder="Qualification" value={qualification} onChangeText={setQualification} style={{ marginVertical: 10, borderBottomWidth: 1 }} />
                </>
            )}

            <Button title="Sign Up" color={Colors.primary} onPress={handleSignUp} />
        </ScrollView>
    );
}
