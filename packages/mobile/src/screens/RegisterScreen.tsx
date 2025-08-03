import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthStore, useThemeColors } from '../stores';
import { useNavigation } from '@react-navigation/native';
import { Input, Button } from '../components';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const { signUp } = useAuthStore();
  const colors = useThemeColors();
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    // Clear previous rate limit error
    setRateLimitError(null);

    setLoading(true);
    try {
      await signUp(email, password, username);
      Alert.alert('Başarılı', 'Hesabınız oluşturuldu! Giriş yapabilirsiniz.');
      // Navigation otomatik olarak auth state değişikliği ile yapılacak
      // Manuel navigation yapmaya gerek yok
    } catch (error: any) {
      console.error('Register error:', error);
      
      // Check if it's a rate limit error
      if (error.message && (
        error.message.includes('kilitlendi') ||
        error.message.includes('fazla deneme') ||
        error.message.includes('hızlı deneme') ||
        error.message.includes('bekleyin')
      )) {
        // Show rate limit error in UI instead of Alert
        setRateLimitError(error.message);
      } else {
        // Show regular error in Alert
        Alert.alert('Kayıt Hatası', 'Kayıt olurken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    form: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 20,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    rateLimitError: {
      backgroundColor: '#FFE6E6',
      borderColor: '#FF6B6B',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    rateLimitErrorText: {
      color: '#D63031',
      fontSize: 14,
      textAlign: 'center',
      fontWeight: '500',
    },
    linkButton: {
      alignItems: 'center',
      marginTop: 20,
    },
    linkText: {
      color: colors.primary,
      fontSize: 14,
    },
  });

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>BenAlsam</Text>
          <Text style={styles.subtitle}>Yeni hesap oluşturun</Text>
        </View>

        <View style={styles.form}>
          {rateLimitError && (
            <View style={styles.rateLimitError}>
              <Text style={styles.rateLimitErrorText}>
                🛡️ {rateLimitError}
              </Text>
            </View>
          )}

          <Input
            label="Kullanıcı Adı"
            placeholder="Kullanıcı adınızı girin"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            textContentType="username"
            autoCorrect={false}
          />

          <Input
            label="E-posta"
            placeholder="E-posta adresinizi girin"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Input
            label="Şifre"
            placeholder="Şifrenizi girin"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
            autoCorrect={false}
          />

          <Button
            title={loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
            onPress={handleRegister}
            loading={loading}
            fullWidth
          />

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => (navigation as any).navigate('Login')}
          >
            <Text style={styles.linkText}>
              Zaten hesabınız var mı? Giriş yapın
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen; 