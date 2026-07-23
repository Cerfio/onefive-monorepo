'use client';

import { useState } from 'react';
import React from 'react';
import { toast } from 'sonner';
import Navbar from '@/components/navbar';
import { useUserSettings } from '@/features/settings/hooks/useUserSettings';
import { useUpdateNotifications } from '@/features/settings/hooks/useUpdateNotifications';
import { useUpdatePrivacy } from '@/features/settings/hooks/useUpdatePrivacy';
import { useUpdatePreferences } from '@/features/settings/hooks/useUpdatePreferences';
import { useUpdatePassword } from '@/features/settings/hooks/useUpdatePassword';
import { useSessions, useRevokeSession, useRevokeSessions } from '@/features/sessions/hooks/useSessions';
import { TwoFactorSettings } from '@/components/settings/TwoFactorSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/base/card/card';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Label } from '@/components/base/label/label';
import { Toggle } from '@/components/base/toggle/toggle';
import { Tabs } from '@/components/application/tabs/tabs';
import { Select } from '@/components/base/select/select';
import { Separator } from '@/components/base/separator/separator';
import {
  Settings01 as Settings,
  Bell01 as Bell,
  Shield01 as Shield,
  Lock01 as Lock,
  Palette,
  Mail01 as Mail,
  AlertTriangle,
  User01 as User,
  Download01 as Download,
  Clock,
  Globe01 as Globe,
  Phone01 as Phone,
  Monitor01 as Monitor,
  BarChart03 as BarChart3,
  File05 as FileText,
  CreditCard01 as CreditCard
} from '@untitledui/icons';
import { Modal, ModalOverlay, Dialog } from '@/components/application/modals/modal';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from 'react-aria-components';
import { CloseButton } from '@/components/base/buttons/close-button';

// Utility function to extract browser from user agent
const extractBrowser = (userAgent: string): string => {
  if (!userAgent) return 'Navigateur inconnu';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Autre';
};

// Utility function to format last usage
const formatLastUsage = (lastUsage: string) => {
  const date = new Date(lastUsage);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return 'Il y a moins d\'une heure';
  if (diffInHours < 24) return `Il y a ${diffInHours}h`;
  if (diffInDays === 1) return 'Il y a 1 jour';
  return `Il y a ${diffInDays} jours`;
};


const SettingsPage = () => {
  // Hooks React Query
  const { data: user, isLoading } = useUserSettings();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllSessionsMutation = useRevokeSessions();
  const updateNotificationsMutation = useUpdateNotifications();
  const updatePrivacyMutation = useUpdatePrivacy();
  const updatePreferencesMutation = useUpdatePreferences();
  const updatePasswordMutation = useUpdatePassword();

  const [showPassword, _setShowPassword] = useState(false);
  const [showConfirmPassword, _setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [_isDeleteDialogOpen, _setIsDeleteDialogOpen] = useState(false);
  const [isSecurityHistoryOpen, setIsSecurityHistoryOpen] = useState(false);
  const [isSecurityAuditOpen, setIsSecurityAuditOpen] = useState(false);

  // Tab items definition
  const tabs = [
    { id: 'account', label: 'Compte' },
    { id: 'security', label: 'Sécurité' },
    { id: 'preferences', label: 'Préférences' },
    { id: 'billing', label: 'Facturation' }
  ];

  // Password form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Security history derived from real sessions data
  const securityHistory = (sessions?.sessions || []).map((session) => ({
    id: session.id,
    type: session.isCurrentSession ? 'login' as const : 'login' as const,
    device: session.deviceInfo || 'Appareil inconnu',
    browser: extractBrowser(session.userAgent),
    location: session.location || 'Localisation inconnue',
    date: session.createdAt,
    lastUsage: session.lastUsage,
    status: 'success' as const,
    ip: session.ipAddress || 'IP inconnue',
    isCurrentSession: session.isCurrentSession,
  }));

  // Security audit computed from real user data
  const computeSecurityAudit = () => {
    if (!user) return { score: 0, lastUpdated: new Date().toISOString(), checks: [], recommendations: [] };

    const now = new Date();
    const checks: { id: string; name: string; status: 'pass' | 'warning' | 'fail'; description: string; recommendation: string | null; icon: React.ReactNode }[] = [];
    const recommendations: string[] = [];

    // Check 1: 2FA
    const has2FA = user.security.twoFactorEnabled;
    checks.push({
      id: 'two_factor',
      name: 'Authentification à deux facteurs',
      status: has2FA ? 'pass' : 'fail',
      description: has2FA ? '2FA activée — votre compte est protégé' : '2FA non activée',
      recommendation: has2FA ? null : 'Activez la 2FA pour une sécurité renforcée',
      icon: <Shield className="h-4 w-4" />,
    });
    if (!has2FA) recommendations.push("Activez l'authentification à deux facteurs");

    // Check 2: Password age
    const lastPwChange = new Date(user.security.lastPasswordChange);
    const pwAgeDays = Math.floor((now.getTime() - lastPwChange.getTime()) / (1000 * 60 * 60 * 24));
    const pwStatus = pwAgeDays <= 30 ? 'pass' : pwAgeDays <= 90 ? 'warning' : 'fail';
    checks.push({
      id: 'password_age',
      name: 'Âge du mot de passe',
      status: pwStatus,
      description: `Dernier changement il y a ${pwAgeDays} jours`,
      recommendation: pwStatus === 'pass' ? null : 'Changez votre mot de passe régulièrement (tous les 90 jours)',
      icon: <Lock className="h-4 w-4" />,
    });
    if (pwStatus !== 'pass') recommendations.push('Changez votre mot de passe');

    // Check 3: Active sessions count
    const sessionCount = sessions?.total || user.security.activeSessions || 0;
    const oldSessions = (sessions?.sessions || []).filter((s) => {
      const lastUsed = new Date(s.lastUsage);
      const daysSinceUse = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceUse > 30 && !s.isCurrentSession;
    });
    const sessionsStatus = oldSessions.length === 0 ? 'pass' : 'warning';
    checks.push({
      id: 'old_sessions',
      name: 'Sessions anciennes',
      status: sessionsStatus,
      description: oldSessions.length === 0
        ? `${sessionCount} session(s) active(s), toutes récentes`
        : `${oldSessions.length} session(s) active(s) depuis plus de 30 jours`,
      recommendation: sessionsStatus === 'pass' ? null : 'Déconnectez les sessions inutilisées',
      icon: <Monitor className="h-4 w-4" />,
    });
    if (sessionsStatus !== 'pass') recommendations.push('Déconnectez les sessions anciennes');

    // Check 4: Email verified (user is logged in = email verified)
    checks.push({
      id: 'email_verified',
      name: 'Email vérifié',
      status: 'pass',
      description: 'Votre email est vérifié et à jour',
      recommendation: null,
      icon: <Mail className="h-4 w-4" />,
    });

    // Check 5: Privacy settings (check if profile is not fully public)
    const privacyOptimal = !user.privacy.showEmail && user.privacy.searchVisibility;
    checks.push({
      id: 'privacy_settings',
      name: 'Paramètres de confidentialité',
      status: privacyOptimal ? 'pass' : 'warning',
      description: privacyOptimal
        ? 'Paramètres de confidentialité optimisés'
        : 'Certains paramètres de confidentialité peuvent être améliorés',
      recommendation: privacyOptimal ? null : 'Vérifiez vos paramètres de confidentialité',
      icon: <User className="h-4 w-4" />,
    });
    if (!privacyOptimal) recommendations.push('Vérifiez vos paramètres de confidentialité');

    // Check 6: Notification security alerts
    const hasSecurityNotifs = user.notifications.email && user.notifications.push;
    checks.push({
      id: 'security_alerts',
      name: 'Alertes de sécurité',
      status: hasSecurityNotifs ? 'pass' : 'fail',
      description: hasSecurityNotifs
        ? 'Notifications de sécurité activées'
        : 'Notifications de sécurité désactivées',
      recommendation: hasSecurityNotifs ? null : 'Activez les alertes email et push pour être informé',
      icon: <Bell className="h-4 w-4" />,
    });
    if (!hasSecurityNotifs) recommendations.push('Activez les notifications de sécurité');

    // Calculate score
    const passCount = checks.filter(c => c.status === 'pass').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;
    const totalChecks = checks.length;
    const score = Math.round(((passCount * 1 + warningCount * 0.5) / totalChecks) * 100);

    return {
      score,
      lastUpdated: now.toISOString(),
      checks,
      recommendations,
    };
  };

  const securityAudit = computeSecurityAudit();

  const handlePreferenceChange = async (category: string, field: string, value: boolean | string) => {
    if (category === 'notifications') {
      await updateNotificationsMutation.mutateAsync({ [field]: value });
    } else if (category === 'privacy') {
      await updatePrivacyMutation.mutateAsync({ [field]: value });
    } else {
      await updatePreferencesMutation.mutateAsync({ [field]: value });
    }
  };

  // Le changement de langue doit aussi mettre à jour la locale locale : l'app
  // lit localStorage['language'] via currentLanguage(). Sans ça, la préférence
  // est persistée au back mais l'interface ne change jamais de langue.
  const handleLanguageChange = async (value: string) => {
    await handlePreferenceChange('preferences', 'language', value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', value);
      window.location.reload();
    }
  };

  const handleToggleChange = (category: string, field: string, checked: boolean) => {
    handlePreferenceChange(category, field, checked);
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    try {
      await updatePasswordMutation.mutateAsync(passwordData);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      // L'erreur est gérée dans le hook
    }
  };

  const handleTabChange = (key: string | number) => {
    setActiveTab(String(key));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FCFCFD]">
        <div className="w-full max-w-screen-xl mx-auto">
          <Navbar />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-500">Chargement des paramètres...</div>
          </div>
        </div>
      </div>
    );
  }

  // No data
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FCFCFD]">
        <div className="w-full max-w-screen-xl mx-auto">
          <Navbar />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-500">Impossible de charger les paramètres</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      <div className="w-full max-w-screen-xl mx-auto">
        <Navbar />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="h-6 w-6 text-[#5E6AD2]" />
              <h1 className="text-2xl font-bold text-[#101828]">Paramètres</h1>
            </div>
            <p className="text-[#475467]">Gérez vos préférences et paramètres de sécurité</p>

            {/* Email en lecture seule */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Adresse email</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Votre adresse email ne peut pas être modifiée. Contactez le support si nécessaire.
              </p>
            </div>

            {/* Numéro de téléphone en lecture seule */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Numéro de téléphone</p>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Votre numéro de téléphone ne peut pas être modifié. Contactez le support si nécessaire.
              </p>
            </div>

            {/* Informations importantes du compte */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-600">Type de compte</span>
                <span className="text-sm font-semibold text-[#5E6AD2]">Pro</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-600">Membre depuis</span>
                <span className="text-sm text-gray-900">
                  {new Date(user.joinedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div>
            <Tabs selectedKey={activeTab} onSelectionChange={handleTabChange} className="w-full">
              <Tabs.List type="underline" items={tabs} className="mb-6">
                {tab => (
                  <Tabs.Item key={tab.id} id={tab.id}>
                    {tab.label}
                  </Tabs.Item>
                )}
              </Tabs.List>

              {/* Account Tab */}
              <Tabs.Panel id="account" className="space-y-6">
                {/* Sessions actives */}
                <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Sessions actives ({sessions?.total || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sessionsLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                            <div className="flex items-center gap-3">
                              <div className="h-5 w-5 bg-gray-300 rounded"></div>
                              <div>
                                <div className="h-4 w-32 bg-gray-300 rounded mb-1"></div>
                                <div className="h-3 w-24 bg-gray-300 rounded"></div>
                              </div>
                            </div>
                            <div className="h-6 w-20 bg-gray-300 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : sessions?.sessions && sessions.sessions.length > 0 ? (
                      <div className="space-y-3">
                        {sessions.sessions.map((session) => (
                          <div key={session.id} className={`flex items-center justify-between p-3 rounded-lg ${session.isCurrentSession ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                              {session.deviceInfo.toLowerCase().includes('mobile') ||
                               session.deviceInfo.toLowerCase().includes('phone') ||
                               session.userAgent.toLowerCase().includes('mobile') ? (
                                <Phone className={`h-5 w-5 ${session.isCurrentSession ? 'text-green-600' : 'text-gray-500'}`} />
                              ) : (
                                <Monitor className={`h-5 w-5 ${session.isCurrentSession ? 'text-green-600' : 'text-gray-500'}`} />
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">{session.deviceInfo}</p>
                                  {session.isCurrentSession && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                                      Actuelle
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  {session.location} • {session.isCurrentSession ? 'Session actuelle' : formatLastUsage(session.lastUsage)}
                                </p>
                              </div>
                            </div>
                            {session.isCurrentSession ? (
                              <span className="text-xs text-green-600 font-medium">Actif maintenant</span>
                            ) : (
                              <Button
                                color="primary-destructive"
                                size="md"
                                onClick={() => revokeSessionMutation.mutate(session.id)}
                                disabled={revokeSessionMutation.isPending}
                              >
                                {revokeSessionMutation.isPending ? 'Déconnexion...' : 'Déconnecter'}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Monitor className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucune session active trouvée</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Export des données */}
                <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Mes données
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">Téléchargez une copie de toutes vos données OneFive.</p>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Export complet</p>
                        <p className="text-xs text-gray-500">Profil, publications, connexions, messages</p>
                      </div>
                      <Button
                        color="secondary"
                        size="sm"
                        iconLeading={<Mail />}
                        onClick={() => {
                          window.open('mailto:support@onefive.app?subject=Demande%20d%27export%20de%20mes%20données&body=Bonjour,%0A%0AJ%27aimerais%20exporter%20toutes%20mes%20données%20OneFive.%0A%0ACordialement', '_blank');
                        }}
                      >
                        Nous contacter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Tabs.Panel>

              {/* Notifications Tab */}
              <Tabs.Panel id="notifications" className="space-y-6">
                <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Fréquence des notifications */}
                    <div>
                      <Label htmlFor="frequency">Fréquence des notifications</Label>
                        <Select
                          label=""
                          placeholder="Sélectionner la fréquence"
                          selectedKey={user.notifications.frequency}
                          onSelectionChange={value => handlePreferenceChange('notifications', 'frequency', String(value))}
                          items={[
                          { id: 'immediate', label: "Immédiate - Dès qu'elles arrivent" },
                          { id: 'daily', label: 'Quotidienne - Résumé journalier' },
                          { id: 'weekly', label: 'Hebdomadaire - Résumé hebdomadaire' }
                        ]}
                        className="mt-2"
                      >
                        {item => <Select.Item id={item.id}>{item.label}</Select.Item>}
                      </Select>
                    </div>

                    <Separator />

                    {/* Types de notifications */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Types de notifications</h4>
                      {[
                        {
                          key: 'email',
                          label: 'Notifications par email',
                          desc: 'Recevoir des emails pour les activités importantes',
                          icon: <Mail className="h-4 w-4" />
                        },
                        {
                          key: 'push',
                          label: 'Notifications push',
                          desc: 'Notifications sur votre appareil',
                          icon: <Bell className="h-4 w-4" />
                        },
                        {
                          key: 'connections',
                          label: 'Nouvelles connexions',
                          desc: 'Demandes de connexion et acceptations',
                          icon: <User className="h-4 w-4" />
                        },
                        {
                          key: 'mentions',
                          label: 'Mentions',
                          desc: "Quand quelqu'un vous mentionne dans un post",
                          icon: <FileText className="h-4 w-4" />
                        },
                        {
                          key: 'discussions',
                          label: 'Discussions',
                          desc: 'Réponses à vos discussions et commentaires',
                          icon: <FileText className="h-4 w-4" />
                        }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">{item.icon}</div>
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                          </div>
                          <Toggle
                            isSelected={
                              user.notifications[
                                item.key as keyof typeof user.notifications
                              ] as boolean
                            }
                            onChange={selected => handleToggleChange('notifications', item.key, selected)}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Options avancées */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Options avancées</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Emails marketing</p>
                          <p className="text-sm text-gray-500">Newsletters, nouveautés et promotions</p>
                        </div>
                        <Toggle
                          isSelected={user.notifications.marketing}
                          onChange={selected => handleToggleChange('notifications', 'marketing', selected)}
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Mode silencieux</p>
                          <p className="text-sm text-gray-500">Pas de notifications entre 22h et 8h</p>
                        </div>
                        <Toggle
                          isSelected={user.notifications.quietHours}
                          onChange={selected => handleToggleChange('notifications', 'quietHours', selected)}
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Notifications week-end</p>
                          <p className="text-sm text-gray-500">Recevoir des notifications le week-end</p>
                        </div>
                        <Toggle
                          isSelected={user.notifications.weekendNotif}
                          onChange={selected => handleToggleChange('notifications', 'weekendNotif', selected)}
                          size="sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Tabs.Panel>

              {/* Privacy Tab */}
              <Tabs.Panel id="privacy" className="space-y-6">
                <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Confidentialité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="profileVisibility">Visibilité du profil</Label>
                        <Select
                          label=""
                          placeholder="Sélectionner la visibilité"
                          selectedKey={user.privacy.profileVisibility}
                          onSelectionChange={value =>
                            handlePreferenceChange('privacy', 'profileVisibility', String(value))
                          }
                          items={[
                            { id: 'public', label: 'Public - Visible par tous' },
                            { id: 'network', label: 'Réseau seulement - Visible par vos connexions' },
                            { id: 'private', label: 'Privé - Visible uniquement par vous' }
                          ]}
                          className="mt-2"
                        >
                          {item => <Select.Item id={item.id}>{item.label}</Select.Item>}
                        </Select>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Informations du profil</h4>
                        {[
                          {
                            key: 'showEmail',
                            label: "Afficher l'email",
                            desc: 'Permettre aux autres de voir votre email sur votre profil',
                            icon: <Mail className="h-4 w-4" />
                          }
                        ].map(item => (
                          <div key={item.key} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg">{item.icon}</div>
                              <div>
                                <p className="font-medium text-gray-900">{item.label}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                              </div>
                            </div>
                            <Toggle
                              isSelected={
                                user.privacy[item.key as keyof typeof user.privacy] as boolean
                              }
                              onChange={selected => handleToggleChange('privacy', item.key, selected)}
                              size="sm"
                            />
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Communication</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Autoriser les messages</p>
                              <p className="text-sm text-gray-500">
                                Recevoir des messages privés d'autres utilisateurs
                              </p>
                            </div>
                          </div>
                          <Toggle
                            isSelected={user.privacy.allowMessages}
                            onChange={selected => handleToggleChange('privacy', 'allowMessages', selected)}
                            size="sm"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Découvrabilité</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Globe className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Apparaître dans les recherches</p>
                              <p className="text-sm text-gray-500">
                                Permettre à d'autres de vous trouver via la recherche
                              </p>
                            </div>
                          </div>
                          <Toggle
                            isSelected={user.privacy.searchVisibility}
                            onChange={selected => handleToggleChange('privacy', 'searchVisibility', selected)}
                            size="sm"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Données et analytics</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <BarChart3 className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Traitement des données</p>
                              <p className="text-sm text-gray-500">
                                Autoriser le traitement pour améliorer l'expérience
                              </p>
                            </div>
                          </div>
                          <Toggle
                            isSelected={user.privacy.dataProcessing}
                            onChange={selected => handleToggleChange('privacy', 'dataProcessing', selected)}
                            size="sm"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <BarChart3 className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Partage d'analytics</p>
                              <p className="text-sm text-gray-500">
                                Partager des données anonymisées pour la recherche
                              </p>
                            </div>
                          </div>
                          <Toggle
                            isSelected={user.privacy.analyticsSharing}
                            onChange={selected => handleToggleChange('privacy', 'analyticsSharing', selected)}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Tabs.Panel>

              {/* Security Tab */}
              <Tabs.Panel id="security" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Authentification à deux facteurs */}
                  <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Authentification à deux facteurs
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-6">
                      <TwoFactorSettings />
                    </CardContent>
                  </Card>

                  {/* Historique de sécurité */}
                  <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Historique de sécurité
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm font-medium text-gray-600">Dernier changement de mot de passe</span>
                          <span className="text-sm text-gray-900">
                            {new Date(user.security.lastPasswordChange).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm font-medium text-gray-600">Sessions actives</span>
                          <span className="text-sm text-gray-900">{user.security.activeSessions} appareils</span>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button color="secondary" size="sm" onClick={() => setIsSecurityHistoryOpen(true)}>
                          Voir l'historique complet
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Changement de mot de passe */}
                <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Changer le mot de passe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                        <Input
                          id="currentPassword"
                          type={showPassword ? 'text' : 'password'}
                          label=""
                          value={passwordData.currentPassword}
                          onChange={(value: any) => {
                            if (typeof value === 'string') {
                              handlePasswordChange('currentPassword', value);
                            } else if (value && typeof value === 'object' && 'target' in value) {
                              handlePasswordChange('currentPassword', (value as any).target.value);
                            }
                          }}
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          label=""
                          value={passwordData.newPassword}
                          onChange={(value: any) => {
                            if (typeof value === 'string') {
                              handlePasswordChange('newPassword', value);
                            } else if (value && typeof value === 'object' && 'target' in value) {
                              handlePasswordChange('newPassword', (value as any).target.value);
                            }
                          }}
                          placeholder="Au moins 8 caractères"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          label=""
                          value={passwordData.confirmPassword}
                          onChange={(value: any) => {
                            if (typeof value === 'string') {
                              handlePasswordChange('confirmPassword', value);
                            } else if (value && typeof value === 'object' && 'target' in value) {
                              handlePasswordChange('confirmPassword', (value as any).target.value);
                            }
                          }}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                      <Button
                      color="primary"
                      size="md"
                      onClick={handleSavePassword}
                      isDisabled={
                        updatePasswordMutation.isPending ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword
                      }
                    >
                      {updatePasswordMutation.isPending ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Sécurité avancée */}
                <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Sécurité avancée
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        color="secondary"
                        size="md"
                        isDisabled={revokeAllSessionsMutation.isPending}
                        onClick={() => {
                          const others = (sessions?.sessions || [])
                            .filter((s) => !s.isCurrentSession)
                            .map((s) => s.id);
                          if (others.length === 0) {
                            toast.info('Aucune autre session active');
                            return;
                          }
                          revokeAllSessionsMutation.mutate(others);
                        }}
                      >
                        {revokeAllSessionsMutation.isPending
                          ? 'Déconnexion...'
                          : 'Déconnecter tous les appareils'}
                      </Button>
                      <Button color="secondary" size="md" onClick={() => setIsSecurityAuditOpen(true)}>
                        Audit de sécurité
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Tabs.Panel>

              {/* Preferences Tab */}
              <Tabs.Panel id="preferences" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Interface */}
                  <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Interface
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="language">Langue de l'interface</Label>
                        <Select
                          label=""
                          placeholder="Sélectionner une langue"
                          selectedKey={user.preferences.language}
                          onSelectionChange={value => handleLanguageChange(String(value))}
                          items={[
                            { id: 'fr', label: '🇫🇷 Français' },
                            { id: 'en', label: '🇺🇸 English' }
                          ]}
                          className="mt-2"
                        >
                          {item => <Select.Item id={item.id}>{item.label}</Select.Item>}
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Danger Zone */}
                <Card className="bg-white rounded-xl shadow-sm border border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Zone de danger
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Coming Soon</h4>
                            <p className="text-sm text-blue-700">
                              La suppression de compte sera bientôt disponible. Pour le moment, contactez-nous si vous souhaitez supprimer votre compte.
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        iconLeading={<Mail />}
                        color="secondary"
                        onClick={() => {
                          window.open('mailto:support@onefive.app?subject=Demande%20de%20suppression%20de%20compte&body=Bonjour,%0A%0AJ%27aimerais%20supprimer%20mon%20compte%20OneFive.%0A%0ACordialement', '_blank');
                        }}
                      >
                        Nous contacter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Tabs.Panel>

              {/* Billing Tab */}
              <Tabs.Panel id="billing" className="space-y-6">
                <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Plan actuel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="text-center">
                        <div className="text-4xl mb-4">🎉</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Accès gratuit
                        </h3>
                        <p className="text-gray-600">
                          Vous bénéficiez actuellement d&apos;un accès gratuit à toutes les fonctionnalités de OneFive.
                        </p>
                      </div>
                    </div>

                    {/* Fonctionnalités incluses */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Fonctionnalités incluses</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Profil complet</p>
                            <p className="text-sm text-gray-500">Créez votre profil startup</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Globe className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Réseau</p>
                            <p className="text-sm text-gray-500">Connectez-vous avec d&apos;autres fondateurs</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <FileText className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Discussions</p>
                            <p className="text-sm text-gray-500">Partagez et échangez</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <BarChart3 className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Analytics</p>
                            <p className="text-sm text-gray-500">Suivez votre activité</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900">Plans premium à venir</h4>
                          <p className="text-sm text-blue-700">
                            Des offres premium avec des fonctionnalités avancées seront bientôt disponibles.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modal Historique de sécurité */}
      <AriaDialogTrigger isOpen={isSecurityHistoryOpen} onOpenChange={setIsSecurityHistoryOpen}>
        <Button style={{ display: 'none' }}>Trigger</Button>
        <ModalOverlay isDismissable>
          <Modal>
            <Dialog>
              <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-4xl">
                <CloseButton onClick={() => setIsSecurityHistoryOpen(false)} theme="light" size="lg" />

                <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                  <AriaHeading slot="title" className="text-md font-semibold text-primary flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Historique de sécurité complet
                  </AriaHeading>
                  <p className="text-sm text-tertiary">
                    Consultez toutes les sessions et activités liées à la sécurité de votre compte.
                  </p>
                </div>

                <div className="h-5 w-full" />

                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Sessions enregistrées :</span>
                      <span className="text-sm font-semibold text-gray-900">{securityHistory.length}</span>
                    </div>
                  </div>

                  {/* Password change info */}
                  {user && (
                    <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Lock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Dernier changement de mot de passe</p>
                          <p className="text-sm text-gray-600">
                            🕒 {new Date(user.security.lastPasswordChange).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {sessionsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 rounded-lg border bg-gray-50 border-gray-200 animate-pulse">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-32 bg-gray-300 rounded"></div>
                              <div className="h-3 w-48 bg-gray-300 rounded"></div>
                              <div className="h-3 w-40 bg-gray-300 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : securityHistory.length > 0 ? (
                    <div className="space-y-3">
                      {securityHistory.map(activity => (
                        <div
                          key={activity.id}
                          className={`p-4 rounded-lg border ${
                            activity.isCurrentSession ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                                <User className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-gray-900">Session active</p>
                                  {activity.isCurrentSession && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                                      Actuelle
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>📱 {activity.device} • {activity.browser}</p>
                                  <p>📍 {activity.location}</p>
                                  <p>🌐 IP: {activity.ip}</p>
                                  <p>🕒 Créée le {new Date(activity.date).toLocaleString('fr-FR')}</p>
                                  <p>⏱️ Dernière activité: {formatLastUsage(activity.lastUsage)}</p>
                                </div>
                              </div>
                            </div>
                            {!activity.isCurrentSession && (
                              <Button
                                color="primary-destructive"
                                size="md"
                                onClick={() => revokeSessionMutation.mutate(activity.id)}
                                disabled={revokeSessionMutation.isPending}
                              >
                                {revokeSessionMutation.isPending ? 'Déconnexion...' : 'Déconnecter'}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Monitor className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucune session trouvée</p>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 mb-1">Conseil de sécurité</p>
                        <p className="text-sm text-blue-700">
                          Si vous ne reconnaissez pas une session, déconnectez-la immédiatement et changez votre mot de passe.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 sm:flex sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:pt-8 sm:pb-6">
                  <Button color="secondary" size="lg" onClick={() => setIsSecurityHistoryOpen(false)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </AriaDialogTrigger>

      {/* Modal Audit de sécurité */}
      <AriaDialogTrigger isOpen={isSecurityAuditOpen} onOpenChange={setIsSecurityAuditOpen}>
        <Button style={{ display: 'none' }}>Trigger</Button>
        <ModalOverlay isDismissable>
          <Modal>
            <Dialog>
              <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-4xl max-h-[80vh] overflow-y-auto">
                <CloseButton onClick={() => setIsSecurityAuditOpen(false)} theme="light" size="lg" />

                <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                  <AriaHeading slot="title" className="text-md font-semibold text-primary flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Audit de sécurité
                  </AriaHeading>
                  <p className="text-sm text-tertiary">
                    Analyse complète de la sécurité de votre compte et recommandations d'amélioration.
                  </p>
                </div>

                <div className="h-5 w-full" />

                <div className="space-y-6 py-4 px-4 sm:px-6">
                  {/* Score de sécurité */}
                  <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Score de sécurité
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Dernière mise à jour</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(securityAudit.lastUpdated).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-[#5E6AD2]">{securityAudit.score}/100</div>
                          <div className="text-sm text-gray-600">
                            {securityAudit.score >= 90
                              ? 'Excellent'
                              : securityAudit.score >= 70
                                ? 'Bon'
                                : securityAudit.score >= 50
                                  ? 'Moyen'
                                  : 'Faible'}
                          </div>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            securityAudit.score >= 90
                              ? 'bg-green-500'
                              : securityAudit.score >= 70
                                ? 'bg-[#5E6AD2]'
                                : securityAudit.score >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                          }`}
                          style={{ width: `${securityAudit.score}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vérifications de sécurité */}
                  <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Vérifications de sécurité
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {securityAudit.checks.map(check => (
                        <div
                          key={check.id}
                          className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                check.status === 'pass'
                                  ? 'bg-green-100 text-green-600'
                                  : check.status === 'warning'
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-red-100 text-red-600'
                              }`}
                            >
                              {check.icon}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{check.name}</p>
                              <p className="text-sm text-gray-500">{check.description}</p>
                              {check.recommendation && (
                                <p className="text-sm text-[#5E6AD2] mt-1">{check.recommendation}</p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              check.status === 'pass'
                                ? 'bg-green-100 text-green-800'
                                : check.status === 'warning'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {check.status === 'pass' ? 'Réussi' : check.status === 'warning' ? 'Attention' : 'Échec'}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Actions recommandées */}
                  <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Actions recommandées
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {securityAudit.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-[#5E6AD2] rounded-full"></div>
                            <span className="text-sm text-gray-700">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Statistiques */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {securityAudit.checks.filter(c => c.status === 'pass').length}
                        </div>
                        <div className="text-sm text-gray-600">Réussies</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {securityAudit.checks.filter(c => c.status === 'warning').length}
                        </div>
                        <div className="text-sm text-gray-600">Attention</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {securityAudit.checks.filter(c => c.status === 'fail').length}
                        </div>
                        <div className="text-sm text-gray-600">Critiques</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 sm:flex sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:pt-8 sm:pb-6">
                  <Button color="secondary" size="lg" onClick={() => setIsSecurityAuditOpen(false)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </AriaDialogTrigger>
    </div>
  );
};

export default SettingsPage;
