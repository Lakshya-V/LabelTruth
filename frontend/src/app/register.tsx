import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { authService } from '@/services/authService';
import { Feather } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [condition, setCondition] = useState('None');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const conditions = ['None', 'Diabetic', 'Hypertension'];

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await authService.register(email, password, condition);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Create your account</Text>
          </View>
          
          <View style={styles.form}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput 
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textLight}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput 
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={theme.colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dietary condition</Text>
              <View style={styles.conditionContainer}>
                {conditions.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.conditionButton,
                      condition === item && styles.conditionButtonSelected
                    ]}
                    onPress={() => setCondition(item)}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.radioCircle,
                      condition === item && styles.radioCircleSelected
                    ]}>
                      {condition === item && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.conditionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.registerText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.navigate('/login')}>
              <Text style={styles.linkText}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.s,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.l,
    ...theme.shadows.subtle,
  },
  title: {
    ...theme.typography.h2,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.l,
  },
  label: {
    ...theme.typography.bodySmall,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.m,
    padding: theme.spacing.m,
    ...theme.typography.body,
  },
  conditionContainer: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.m,
    overflow: 'hidden',
  },
  conditionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '50',
  },
  conditionButtonSelected: {
    backgroundColor: theme.colors.primary + '05',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.m,
  },
  radioCircleSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  conditionText: {
    ...theme.typography.body,
  },
  registerButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.pill,
    padding: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.m,
    height: 56,
  },
  registerText: {
    ...theme.typography.body,
    color: '#FFF',
    fontWeight: '600',
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.semantic.red,
    marginBottom: theme.spacing.m,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingBottom: theme.spacing.m,
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  linkText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  }
});
