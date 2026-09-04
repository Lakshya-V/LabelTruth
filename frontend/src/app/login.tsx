import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { authService } from '@/services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await authService.login(email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Login failed');
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
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.brand}>LabelTruth</Text>
            <Text style={styles.title}>Know what's{"\n"}actually in your food.</Text>
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
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={styles.forgotPasswordButton} 
              onPress={() => router.push('/forgot-password')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginText}>Log In</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.linkText}>Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing.xxl,
  },
  brand: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginBottom: theme.spacing.l,
  },
  title: {
    ...theme.typography.h1,
    lineHeight: 40,
  },
  form: {
    marginBottom: theme.spacing.xxl,
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -theme.spacing.s,
    marginBottom: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
  },
  forgotPasswordText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.pill,
    padding: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.m,
    height: 56,
  },
  loginText: {
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
