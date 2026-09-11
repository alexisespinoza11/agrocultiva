import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Sprout,
  ShieldCheck,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Agricultor Productor');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sincronizar modo inicial cuando se abre el modal
  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const translateError = (error: string): string => {
    if (error.includes('Invalid login credentials')) {
      return 'Correo o contraseña incorrectos. Verifica tus datos.';
    }
    if (error.includes('User already registered') || error.includes('already registered')) {
      return 'Ya existe una cuenta con este correo. Prueba iniciar sesión.';
    }
    if (error.includes('Password should be at least')) {
      return 'La contraseña debe contener al menos 6 caracteres.';
    }
    if (error.includes('Email not confirmed')) {
      return 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.';
    }
    return error || 'Ocurrió un error al procesar la solicitud.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Por favor completa el correo y la contraseña.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo o de tu asociación.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.session) {
          setSuccessMsg('¡Sesión iniciada con éxito!');
          setTimeout(() => {
            closeAuthModal();
          }, 800);
        }
      } else {
        // Modo Registro
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: role,
              phone: phone.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          setSuccessMsg('¡Cuenta creada y sesión iniciada!');
          setTimeout(() => {
            closeAuthModal();
          }, 900);
        } else if (data.user) {
          setSuccessMsg('¡Cuenta registrada exitosamente! Revisa tu correo electrónico para confirmar tu cuenta.');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(translateError(err.message || 'Error de autenticación'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente verde agrícola */}
        <div className="bg-linear-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">AgroCultiva</h3>
                <p className="text-xs text-emerald-100">Portal de Agricultores y Comerciantes</p>
              </div>
            </div>
            
            <button
              onClick={closeAuthModal}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Switcher de Pestañas: Login vs Registro */}
          <div className="flex p-1 bg-black/15 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Crear Cuenta</span>
            </button>
          </div>
        </div>

        {/* Cuerpo del formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Mensaje de error */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-snug">{errorMsg}</p>
            </div>
          )}

          {/* Mensaje de éxito */}
          {successMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-snug">{successMsg}</p>
            </div>
          )}

          {/* Campos adicionales para REGISTRO */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nombre Completo o Razón Social <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Alexis Espinoza / Asoc. Productores"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Rol en la Cadena
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      <option value="Agricultor Productor">Agricultor Productor</option>
                      <option value="Comerciante Acopiador">Comerciante Acopiador</option>
                      <option value="Comprador Mayorista">Comprador Mayorista</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Teléfono / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="976123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Campo Correo Electrónico */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="agricultor@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Botón Principal de Envío */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando con Supabase...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Acceder a AgroCultiva</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Registrarme como Productor</span>
              </>
            )}
          </button>

          {/* Pie informativo de seguridad Supabase */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Autenticación segura encriptada con Supabase Auth</span>
          </div>

        </form>
      </div>
    </div>
  );
};
