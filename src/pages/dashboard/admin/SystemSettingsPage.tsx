// src/pages/dashboard/admin/SystemSettingsPage.tsx
import React, { useState } from 'react';
import { Settings, Save, AlertCircle, Bell, Globe, Shield, Database, Cloud } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'PharmaTogo',
    siteDescription: 'Plateforme de gestion des pharmacies au Togo',
    siteEmail: 'contact@pharmatogo.tg',
    sitePhone: '+228 90 00 00 00',
    maintenanceMode: false,
    allowRegistrations: true,
    maxPharmaciesPerUser: 1,
    notificationEmail: true,
    notificationSMS: false,
    currency: 'XOF',
    timezone: 'Africa/Lome',
    apiKey: '********',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simuler l'enregistrement
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInfoClick = (message: string) => {
    // Utilisez toast() pour les notifications d'information
    toast(message, {
      icon: 'ℹ️',
      duration: 3000,
    });
  };

  const handleRegenerateApiKey = () => {
    handleInfoClick('Génération de la clé API en cours...');
    // Simuler la régénération
    setTimeout(() => {
      setSettings(prev => ({
        ...prev,
        apiKey: 'sk_' + Math.random().toString(36).substring(2, 15)
      }));
      toast.success('Clé API régénérée avec succès');
    }, 1500);
  };

  const handleExportConfig = () => {
    handleInfoClick('Exportation de la configuration...');
    // Logique d'exportation simulée
    setTimeout(() => {
      const config = JSON.stringify(settings, null, 2);
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pharmatogo-config.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Configuration exportée avec succès');
    }, 1000);
  };

  const handleResetDefaults = () => {
    handleInfoClick('Restauration des paramètres par défaut...');
    // Simuler la restauration
    setTimeout(() => {
      setSettings({
        siteName: 'PharmaTogo',
        siteDescription: 'Plateforme de gestion des pharmacies au Togo',
        siteEmail: 'contact@pharmatogo.tg',
        sitePhone: '+228 90 00 00 00',
        maintenanceMode: false,
        allowRegistrations: true,
        maxPharmaciesPerUser: 1,
        notificationEmail: true,
        notificationSMS: false,
        currency: 'XOF',
        timezone: 'Africa/Lome',
        apiKey: '********',
      });
      toast.success('Paramètres restaurés avec succès');
    }, 1500);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
          <Settings className="h-8 w-8 mr-3 text-blue-600" />
          Paramètres système
        </h1>
        <p className="text-gray-600 mt-2">
          Configurez les paramètres globaux de la plateforme PharmaTogo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations du site */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-600" />
              Informations du site
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du site
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  name="siteEmail"
                  value={settings.siteEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="text"
                  name="sitePhone"
                  value={settings.sitePhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise
                </label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="XOF">Franc CFA (XOF)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">Dollar US (USD)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuseau horaire
                </label>
                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Africa/Lome">Lomé (GMT+0)</option>
                  <option value="Africa/Accra">Accra (GMT+0)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du site
                </label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Paramètres de sécurité */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              Sécurité et accès
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mode maintenance</p>
                  <p className="text-sm text-gray-500">
                    Bloquer l'accès aux utilisateurs non administrateurs
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autoriser les inscriptions</p>
                  <p className="text-sm text-gray-500">
                    Permettre aux nouveaux utilisateurs de s'inscrire
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowRegistrations"
                    checked={settings.allowRegistrations}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre maximum de pharmacies par utilisateur
                </label>
                <input
                  type="number"
                  name="maxPharmaciesPerUser"
                  value={settings.maxPharmaciesPerUser}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-purple-600" />
              Notifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications par email</p>
                  <p className="text-sm text-gray-500">
                    Envoyer des notifications par email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="notificationEmail"
                    checked={settings.notificationEmail}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications par SMS</p>
                  <p className="text-sm text-gray-500">
                    Envoyer des notifications par SMS
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="notificationSMS"
                    checked={settings.notificationSMS}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Aperçu API */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2 text-indigo-600" />
              Configuration API
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clé API
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={settings.apiKey}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={handleRegenerateApiKey}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Régénérer
                  </button>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Cette clé est utilisée pour les intégrations externes
                </p>
              </div>
            </div>
          </div>

          {/* Sauvegarde */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Cloud className="h-5 w-5 mr-2 text-green-600" />
              Sauvegarde
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5 mr-2" />
                {isSaving ? 'Sauvegarde en cours...' : 'Sauvegarder les paramètres'}
              </button>
              
              <button
                onClick={handleExportConfig}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium"
              >
                Exporter la configuration
              </button>
              
              <button
                onClick={handleResetDefaults}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium"
              >
                Restaurer les paramètres par défaut
              </button>
            </div>
          </div>

          {/* Informations système */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Informations système</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Version</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Environnement</span>
                <span className="text-sm font-medium text-green-600">Production</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Dernière sauvegarde</span>
                <span className="text-sm font-medium">Aujourd'hui, 14:30</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Statut</span>
                <span className="text-sm font-medium text-green-600">✓ Opérationnel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;