import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Key, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@benalsam/shared-types';
import { useAuthStore } from '@/stores';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuthStore();

  const queryParams = new URLSearchParams(location.search);
  const initialAction = queryParams.get('action') === 'register' ? 'register' : 'login';
  
  const [action, setAction] = useState(initialAction);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAction(initialAction);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
  }, [initialAction]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (action === 'register' && !formData.name.trim()) newErrors.name = 'İsim gerekli';
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }
    if (action === 'register' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Hata!",
        description: "Lütfen tüm alanları doğru doldurun.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    setErrors({});

    if (action === 'register') {
      const result = await signUp(formData.email, formData.password, formData.name);
      
      if (result.error) {
        toast({ title: "Kayıt Başarısız", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Başarılı!", description: "Hesabınız başarıyla oluşturuldu.", variant: "default" });
        navigate('/');
      }
    } else { 
      const result = await signIn(formData.email, formData.password);
      
      if (result.error) {
        toast({ title: "Giriş Başarısız", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Başarılı!", description: "Başarıyla giriş yaptınız.", variant: "default" });
        navigate('/');
      }
    }
    setLoading(false);
    if (!Object.keys(errors).length) { 
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    }
  };

  const switchAuthAction = (newAction) => {
    setAction(newAction);
    navigate(`/auth?action=${newAction}`, { replace: true });
    setErrors({}); 
    setFormData({ name: '', email: '', password: '', confirmPassword: '' }); 
  };


  const currentTitle = action === 'login' ? 'Giriş Yap' : 'Kayıt Ol';
  const switchText = action === 'login' ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?';
  const switchLinkText = action === 'login' ? 'Kayıt Ol' : 'Giriş Yap';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-slate-900/30 p-4"
    >
      <div className="absolute top-4 left-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5 mr-2" /> Ana Sayfa
        </Button>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-effect rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">{currentTitle}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {action === 'register' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <User className="w-4 h-4 inline mr-2 text-primary" /> İsim *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Adınız Soyadınız"
                disabled={loading}
                className={`w-full px-4 py-3 bg-input border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none input-glow ${errors.name ? 'border-destructive' : 'border-border'}`}
              />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Mail className="w-4 h-4 inline mr-2 text-primary" /> E-posta *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="ornek@mail.com"
              disabled={loading}
              className={`w-full px-4 py-3 bg-input border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none input-glow ${errors.email ? 'border-destructive' : 'border-border'}`}
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Key className="w-4 h-4 inline mr-2 text-primary" /> Şifre *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className={`w-full px-4 py-3 bg-input border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none input-glow ${errors.password ? 'border-destructive' : 'border-border'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
          </div>
          
          {action === 'register' && (
              <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                      <Key className="w-4 h-4 inline mr-2 text-primary" /> Şifre Tekrar *
                  </label>
                  <div className="relative">
                      <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      className={`w-full px-4 py-3 bg-input border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none input-glow ${errors.confirmPassword ? 'border-destructive' : 'border-border'}`}
                      />
                      <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
                          disabled={loading}
                      >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                  </div>
                  {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
          )}

          <Button
            type="submit"
            className="w-full btn-primary text-primary-foreground font-semibold py-3 text-lg"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
            ) : (
              currentTitle
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {switchText}{' '}
            <button
              onClick={() => {
                if (!loading) {
                  switchAuthAction(action === 'login' ? 'register' : 'login');
                }
              }}
              className="font-semibold text-primary hover:text-primary/80"
              disabled={loading}
            >
              {switchLinkText}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthPage;