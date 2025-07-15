import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../stores';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Input, Button } from '../components';
import { updatePassword } from '../services/supabaseService';

const SecurityScreen = () => {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePasswords = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor.');
      return false;
    }

    if (newPassword.length < 8) {
      Alert.alert('Hata', 'Yeni şifre en az 8 karakter olmalıdır.');
      return false;
    }

    return true;
  };

  const handlePasswordChange = async () => {
    if (!validatePasswords()) return;

    try {
      setLoading(true);
      const { error } = await updatePassword(newPassword);

      if (error) {
        throw error;
      }

      Alert.alert('Başarılı', 'Şifreniz başarıyla güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      let message = 'Şifre güncellenirken bir hata oluştu.';
      
      if (error.message?.includes('auth')) {
        message = 'Mevcut şifreniz yanlış.';
      } else if (error.message?.includes('weak-password')) {
        message = 'Yeni şifreniz çok zayıf. Lütfen daha güçlü bir şifre seçin.';
      }
      
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    showPassword: boolean,
    setShowPassword: (show: boolean) => void
  ) => (
    <View style={styles.inputContainer}>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!showPassword}
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
        placeholderTextColor={colors.textSecondary}
        rightIcon={
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Güvenlik
        </Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Şifre Değiştir
            </Text>
          </View>

          {renderPasswordInput(
            currentPassword,
            setCurrentPassword,
            'Mevcut şifre',
            showCurrentPassword,
            setShowCurrentPassword
          )}

          {renderPasswordInput(
            newPassword,
            setNewPassword,
            'Yeni şifre',
            showNewPassword,
            setShowNewPassword
          )}

          {renderPasswordInput(
            confirmPassword,
            setConfirmPassword,
            'Yeni şifre tekrar',
            showConfirmPassword,
            setShowConfirmPassword
          )}

          <Button
            title={loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            onPress={handlePasswordChange}
            disabled={loading}
            style={[styles.button, { backgroundColor: colors.primary }]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    marginTop: 8,
  },
});

export default SecurityScreen; 