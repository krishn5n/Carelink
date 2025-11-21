import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
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

export default function RegisterScreen() {
    const [showPicker, setShowPicker] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'patient',
        dateOfBirth: '',
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        if (
            !formData.email ||
            !formData.password ||
            !formData.firstName ||
            !formData.lastName
        ) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        const result = await register(formData);
        setLoading(false);

        if (result.success) {
            Alert.alert('Success', 'Registration successful! Please login.', [
                { text: 'OK', onPress: () => router.replace('/(auth)/login') },
            ]);
        } else {
            Alert.alert('Registration Failed', result.error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Create Account</Text>

                <Text style={styles.label}>First Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChangeText={(text) =>
                        setFormData({ ...formData, firstName: text })
                    }
                />

                <Text style={styles.label}>Last Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChangeText={(text) =>
                        setFormData({ ...formData, lastName: text })
                    }
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(text) =>
                        setFormData({ ...formData, email: text })
                    }
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowPicker(true)}
                >
                    <Text style={{ color: formData.dateOfBirth ? '#000' : '#aaa' }}>
                        {formData.dateOfBirth || 'Select Date of Birth'}
                    </Text>
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date()}
                        mode="date"
                        display="default"
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                            setShowPicker(false);
                            if (selectedDate) {
                                setFormData({
                                    ...formData,
                                    dateOfBirth: selectedDate.toISOString().split('T')[0],
                                });
                            }
                        }}
                    />
                )}

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChangeText={(text) =>
                        setFormData({ ...formData, password: text })
                    }
                    secureTextEntry
                />

                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChangeText={(text) =>
                        setFormData({ ...formData, confirmPassword: text })
                    }
                    secureTextEntry
                />

                <Text style={styles.label}>User Role</Text>
                <View style={styles.roleContainer}>
                    <TouchableOpacity
                        style={[
                            styles.roleButton,
                            formData.role === 'patient' && styles.roleButtonActive,
                        ]}
                        onPress={() =>
                            setFormData({ ...formData, role: 'patient' })
                        }
                    >
                        <Text
                            style={[
                                styles.roleButtonText,
                                formData.role === 'patient' &&
                                styles.roleButtonTextActive,
                            ]}
                        >
                            Patient
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.roleButton,
                            formData.role === 'doctor' && styles.roleButtonActive,
                        ]}
                        onPress={() =>
                            setFormData({ ...formData, role: 'doctor' })
                        }
                    >
                        <Text
                            style={[
                                styles.roleButtonText,
                                formData.role === 'doctor' &&
                                styles.roleButtonTextActive,
                            ]}
                        >
                            Doctor
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Register</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.linkText}>
                        Already have an account? Login
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2196F3',
        textAlign: 'center',
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        marginBottom: 6,
        marginTop: 4,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    roleContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    roleButton: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#2196F3',
        marginHorizontal: 5,
        alignItems: 'center',
    },
    roleButtonActive: {
        backgroundColor: '#2196F3',
    },
    roleButtonText: {
        fontSize: 16,
        color: '#2196F3',
        fontWeight: '500',
    },
    roleButtonTextActive: {
        color: '#fff',
    },
    button: {
        backgroundColor: '#2196F3',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
        marginBottom: 40,
    },
    linkText: {
        color: '#2196F3',
        fontSize: 14,
    },
});
