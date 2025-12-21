// src/pages/dashboard/pharmacien/CommandeDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Icônes Lucide - optimisées
import {
  ArrowLeft, Printer, CheckCircle, XCircle, User, Phone, MapPin,
  Calendar, Package, CreditCard, Truck, AlertCircle, Clock,
  DollarSign, FileText, Store, Mail, UserPlus, ChevronRight,
  Shield, ClipboardCheck, Home, Navigation, Smartphone, Globe,
  Star, ShieldCheck, PackageCheck, AlertTriangle, RefreshCw,
  MessageSquare, QrCode, Battery, Thermometer, Pill, Stethoscope,
  Heart, Eye, Activity, Zap, Target, Award, TrendingUp, Download,
  Share2, Bell, Lock, Unlock, Truck as TruckIcon, Map
} from 'lucide-react';

// Services
import { commandeService } from '../../../services/api/commande.service';
import { livraisonService } from '../../../services/api/livraison.service';
import { userService } from '../../../services/api/user.service';

// Types
import { Commande, CommandeStatus } from '../../../types/commande.types';
import { User as UserType } from '../../../types/user.types';
import { Livraison } from '../../../types/livraison.types';

const CommandeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // États
  const [commande, setCommande] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [assignLivreurModal, setAssignLivreurModal] = useState(false);
  const [selectedLivreur, setSelectedLivreur] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'articles' | 'livraison' | 'paiement'>('details');
  const [showPrintOptions, setShowPrintOptions] = useState(false);

  // Chargement des données
  useEffect(() => {
    if (id) {
      loadCommandeDetails(parseInt(id));
    }
  }, [id]);

  // Query pour les livreurs disponibles
  const { data: livreurs = [], isLoading: loadingLivreurs } = useQuery({
    queryKey: ['livreurs-disponibles'],
    queryFn: () => userService.getLivreurs(),
    enabled: assignLivreurModal,
    staleTime: 30000,
  });

  // Mutation pour assigner un livreur
  const assignLivreurMutation = useMutation({
    mutationFn: ({ commandeId, livreurId }: { commandeId: number; livreurId: number }) =>
      livraisonService.assignLivreur(commandeId, livreurId),
    onSuccess: (data: Livraison) => {
      queryClient.invalidateQueries({ queryKey: ['commande-details', id] });
      toast.success('✅ Livreur assigné avec succès');
      setAssignLivreurModal(false);
      setSelectedLivreur(null);

      // Mettre à jour l'état local
      if (commande) {
        setCommande({
          ...commande,
          livreur_id: data.livreur_id,
          livreur: data.livreur,
          status: 'en_cours' as CommandeStatus,
          livraison: data
        });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || '❌ Erreur lors de l\'assignation du livreur');
    },
  });

  // Mutation pour mettre à jour le statut
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: CommandeStatus }) =>
      commandeService.updateStatus(id, status),
    onSuccess: (updatedCommande: Commande) => {
      queryClient.invalidateQueries({ queryKey: ['commande-details', id] });
      setCommande(updatedCommande);
      toast.success(`✅ Statut mis à jour: ${getStatusText(updatedCommande.status)}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '❌ Erreur lors de la mise à jour');
    },
    onSettled: () => {
      setUpdating(false);
    }
  });

  // Fonction de chargement des détails
  const loadCommandeDetails = async (commandeId: number) => {
    try {
      setLoading(true);
      const data = await commandeService.getById(commandeId);

      console.log('📊 Détails commande chargés:', {
        id: data.id,
        numero: data.numero_commande,
        status: data.status,
        livreur: data.livreur,
        items: data.items?.length,
        total: data.total_amount
      });

      setCommande(data);
    } catch (error: any) {
      console.error('❌ Erreur chargement commande:', error);
      toast.error(error.response?.data?.message || 'Commande non trouvée');
      navigate('/pharmacien/commandes');
    } finally {
      setLoading(false);
    }
  };

  // Fonction de rafraîchissement
  const handleRefresh = () => {
    if (id) {
      loadCommandeDetails(parseInt(id));
      toast.success('🔄 Données actualisées');
    }
  };

  // Gestion des statuts
  const handleUpdateStatus = (newStatus: CommandeStatus) => {
    if (!commande || updating) return;

    const confirmMessage = {
      'en_attente': 'Confirmer cette commande ?', // CORRECTION: Ajout de en_attente
      'confirmee': 'Confirmer cette commande ?',
      'en_cours': 'Marquer la commande comme "En cours de préparation" ?',
      'livree': 'Confirmer la livraison de cette commande ?',
      'annulee': 'Annuler cette commande ? Cette action est irréversible.'
    }[newStatus];

    if (window.confirm(confirmMessage)) {
      setUpdating(true);
      updateStatusMutation.mutate({ id: commande.id, status: newStatus });
    }
  };

  const handleAssignLivreur = () => {
    if (!commande || !selectedLivreur) {
      toast.error('Veuillez sélectionner un livreur');
      return;
    }

    assignLivreurMutation.mutate({
      commandeId: commande.id,
      livreurId: selectedLivreur
    });
  };

  // Utilitaires
  const getStatusColor = (status: CommandeStatus) => {
    const colors = {
      'en_attente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmee': 'bg-blue-100 text-blue-800 border-blue-200',
      'en_cours': 'bg-green-100 text-green-800 border-green-200',
      'livree': 'bg-purple-100 text-purple-800 border-purple-200',
      'annulee': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: CommandeStatus) => {
    const texts = {
      'en_attente': '⏳ En attente',
      'confirmee': '✅ Confirmée',
      'en_cours': '📦 En cours',
      'livree': '🚚 Livrée',
      'annulee': '❌ Annulée'
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status: CommandeStatus) => {
    const icons = {
      'en_attente': <Clock className="h-5 w-5" />,
      'confirmee': <CheckCircle className="h-5 w-5" />,
      'en_cours': <Package className="h-5 w-5" />,
      'livree': <TruckIcon className="h-5 w-5" />,
      'annulee': <XCircle className="h-5 w-5" />
    };
    return icons[status];
  };

  const getPaymentMethodText = (method: string) => {
    const methods = {
      'cash': { text: '💵 Paiement à la livraison', color: 'text-green-600' },
      'mobile_money': { text: '📱 Mobile Money', color: 'text-purple-600' },
      'carte': { text: '💳 Carte bancaire', color: 'text-blue-600' }
    };
    return methods[method as keyof typeof methods] || { text: method, color: 'text-gray-600' };
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      'paye': 'bg-green-100 text-green-800 border-green-200',
      'en_attente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'echec': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const canUpdateStatus = (currentStatus: CommandeStatus, newStatus: CommandeStatus) => {
    const allowedTransitions: Record<CommandeStatus, CommandeStatus[]> = {
      'en_attente': ['confirmee', 'annulee'],
      'confirmee': ['en_cours', 'annulee'],
      'en_cours': ['livree', 'annulee'],
      'livree': [],
      'annulee': []
    };
    return allowedTransitions[currentStatus]?.includes(newStatus);
  };

  // Fonctions d'impression
  const handlePrint = () => {
    window.print();
    toast.success('🖨️ Préparation de l\'impression');
  };

  const generatePDF = () => {
    toast.success('📄 Génération du PDF en cours...');
    // Ici vous intégrerez une librairie PDF comme jsPDF
  };

  // Calculs
  const calculateTotalItems = () => {
    return commande?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  const calculateStockAlert = (item: any) => {
    const quantity = item.medicament?.quantity || 0;
    const required = item.quantity;

    if (quantity === 0) return { text: 'RUPTURE', color: 'bg-red-500' };
    if (quantity < required) return { text: 'STOCK FAIBLE', color: 'bg-orange-500' };
    if (quantity < required * 2) return { text: 'STOCK MOYEN', color: 'bg-yellow-500' };
    return { text: 'STOCK OK', color: 'bg-green-500' };
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="flex flex-col items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-20 w-20 border-4 border-blue-600 border-t-transparent rounded-full mb-6"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chargement de la commande</h2>
          <p className="text-gray-600">Préparation des détails...</p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (!commande) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-16">
            <div className="h-32 w-32 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Commande Introuvable</h1>
            <p className="text-gray-600 mb-8 text-lg">
              La commande que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium flex items-center justify-center shadow-lg"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour aux commandes
              </button>
              <button
                onClick={() => navigate('/pharmacien')}
                className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 font-medium flex items-center justify-center shadow-lg"
              >
                <Home className="h-5 w-5 mr-2" />
                Tableau de bord
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 print:bg-white print:p-0">
      {/* Header avec actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => navigate(-1)}
                className="p-3 bg-gradient-to-r from-white to-gray-50 rounded-xl hover:from-gray-50 hover:to-gray-100 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-center group"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Commande <span className="text-blue-600">#{commande.numero_commande}</span>
                </h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(commande.created_at), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <button
                onClick={() => setShowPrintOptions(!showPrintOptions)}
                className="px-5 py-2.5 bg-gradient-to-r from-white to-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium flex items-center shadow-sm hover:shadow-md transition-all"
              >
                <Printer className="h-5 w-5 mr-2" />
                Imprimer
                <ChevronRight className={`h-4 w-4 ml-2 transition-transform ${showPrintOptions ? 'rotate-90' : ''}`} />
              </button>

              {showPrintOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[200px] z-10 overflow-hidden"
                >
                  <button
                    onClick={handlePrint}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center border-b border-gray-100"
                  >
                    <Printer className="h-4 w-4 mr-3 text-gray-600" />
                    Impression rapide
                  </button>
                  <button
                    onClick={generatePDF}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-3 text-gray-600" />
                    Télécharger PDF
                  </button>
                </motion.div>
              )}
            </div>

            <button
              onClick={handleRefresh}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 rounded-xl hover:from-blue-100 hover:to-blue-200 font-medium flex items-center shadow-sm hover:shadow-md transition-all"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Actualiser
            </button>

            {commande.status !== 'annulee' && commande.status !== 'livree' && (
              <button
                onClick={() => handleUpdateStatus('annulee')}
                disabled={updating}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-medium flex items-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Annuler
              </button>
            )}
          </div>
        </div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-6 border-2 shadow-lg ${getStatusColor(commande.status)}`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/50">
                {getStatusIcon(commande.status)}
              </div>
              <div>
                <h2 className="text-xl font-bold">Statut de la commande</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-2xl font-bold">{getStatusText(commande.status)}</span>
                  {commande.livreur && (
                    <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-medium flex items-center">
                      <Truck className="h-3 w-3 mr-1" />
                      Livreur: {commande.livreur.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {canUpdateStatus(commande.status, 'confirmee') && (
                <button
                  onClick={() => handleUpdateStatus('confirmee')}
                  disabled={updating}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium flex items-center disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Confirmer
                </button>
              )}

              {canUpdateStatus(commande.status, 'en_cours') && (
                <button
                  onClick={() => handleUpdateStatus('en_cours')}
                  disabled={updating}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-medium flex items-center disabled:opacity-50"
                >
                  <Package className="h-5 w-5 mr-2" />
                  Préparer
                </button>
              )}

              {canUpdateStatus(commande.status, 'livree') && (
                <button
                  onClick={() => handleUpdateStatus('livree')}
                  disabled={updating}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-medium flex items-center disabled:opacity-50"
                >
                  <Truck className="h-5 w-5 mr-2" />
                  Marquer livrée
                </button>
              )}

              {commande.status === 'confirmee' && !commande.livreur && (
                <button
                  onClick={() => setAssignLivreurModal(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium flex items-center"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Assigner livreur
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
          {['details', 'articles', 'livraison', 'paiement'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ${activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center">
                {tab === 'details' && <User className="h-4 w-4 mr-2" />}
                {tab === 'articles' && <Package className="h-4 w-4 mr-2" />}
                {tab === 'livraison' && <Truck className="h-4 w-4 mr-2" />}
                {tab === 'paiement' && <CreditCard className="h-4 w-4 mr-2" />}
                {tab === 'details' && 'Informations'}
                {tab === 'articles' && 'Articles'}
                {tab === 'livraison' && 'Livraison'}
                {tab === 'paiement' && 'Paiement'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Client Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg mr-3">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                Informations Client & Livraison
              </h3>
              <span className="px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-full text-sm font-medium">
                Client #{commande.user_id}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Details */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{commande.user?.name || 'Client'}</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Client vérifié
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{commande.user?.email || 'Non spécifié'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-700 font-medium">{commande.delivery_phone}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center mb-3">
                    <MapPin className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-bold text-gray-900">Adresse de Livraison</h4>
                  </div>

                  {commande.delivery_address ? (
                    <>
                      <p className="text-gray-700">{commande.delivery_address}</p>
                      <button
                        onClick={() => {
                          const address = encodeURIComponent(commande.delivery_address!);
                          window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                        }}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Voir sur la carte
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">Adresse non spécifiée</p>
                  )}
                </div>

                {/* Order Summary */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <ClipboardCheck className="h-5 w-5 text-purple-600 mr-2" />
                      Résumé Commande
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Articles:</span>
                        <span className="font-medium">{calculateTotalItems()} produits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date commande:</span>
                        <span className="font-medium">
                          {format(new Date(commande.created_at), 'dd/MM/yy')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Heure:</span>
                        <span className="font-medium">
                          {format(new Date(commande.created_at), 'HH:mm')}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between text-lg">
                          <span className="font-bold">Total:</span>
                          <span className="font-bold text-green-700">
                            {commande.total_amount?.toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <CreditCard className="h-5 w-5 text-yellow-600 mr-2" />
                      Paiement
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Méthode:</span>
                        <span className={`font-medium ${getPaymentMethodText(commande.payment_method).color}`}>
                          {getPaymentMethodText(commande.payment_method).text}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Statut:</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${getPaymentStatusColor(commande.payment_status)}`}>
                          {commande.payment_status === 'paye' ? '✅ Payé' :
                            commande.payment_status === 'en_attente' ? '⏳ En attente' :
                              '❌ Échec'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Notes */}
              {commande.notes && (
                <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-5 w-5 text-gray-600 mr-2" />
                    <h4 className="font-bold text-gray-900">Notes du Client</h4>
                  </div>
                  <p className="text-gray-700 italic">"{commande.notes}"</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Pharmacy & Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Pharmacy Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg mr-3">
                <Store className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Votre Pharmacie</h3>
            </div>

            {commande.pharmacy ? (
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center mr-3">
                    <Store className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{commande.pharmacy.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{commande.pharmacy.address}</p>
                    <div className="flex items-center mt-2">
                      <Phone className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">{commande.pharmacy.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Statut</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs mt-1 ${commande.pharmacy.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {commande.pharmacy.is_active ? '🟢 Active' : '🔴 Inactive'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Garde</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs mt-1 ${commande.pharmacy.is_garde ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {commande.pharmacy.is_garde ? '🚨 De garde' : 'Normal'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Pharmacie non disponible</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/pharmacien/commandes/${commande.id}/edit`)}
                className="w-full px-4 py-3 bg-gradient-to-r from-white to-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium flex items-center justify-between shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-3 text-gray-600" />
                  Modifier commande
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => window.open(`tel:${commande.delivery_phone}`)}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 rounded-xl hover:from-green-100 hover:to-emerald-100 font-medium flex items-center justify-between shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-green-600" />
                  Appeler le client
                </div>
                <Smartphone className="h-4 w-4" />
              </button>

              <button
                onClick={() => setAssignLivreurModal(true)}
                disabled={commande.status !== 'confirmee' || !!commande.livreur}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 rounded-xl hover:from-purple-100 hover:to-indigo-100 font-medium flex items-center justify-between shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-3 text-purple-600" />
                  Assigner livreur
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg mr-3">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                Articles de la Commande
              </h3>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-full text-sm font-medium">
                {calculateTotalItems()} produits
              </span>
            </div>

            {commande.items && commande.items.length > 0 ? (
              <div className="space-y-4">
                {commande.items.map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                            {item.medicament?.image ? (
                              <img
                                src={item.medicament.image}
                                alt={item.medicament.name}
                                className="h-12 w-12 object-cover rounded-lg"
                              />
                            ) : (
                              <Pill className="h-8 w-8 text-blue-600" />
                            )}
                          </div>

                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">{item.medicament?.name || 'Médicament'}</h4>
                            <p className="text-gray-600 text-sm mt-1">{item.medicament?.description || 'Aucune description'}</p>

                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center text-sm">
                                <span className="text-gray-600">Quantité:</span>
                                <span className="font-bold text-gray-900 ml-1">{item.quantity}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <span className="text-gray-600">Prix unitaire:</span>
                                <span className="font-bold text-green-700 ml-1">
                                  {item.unit_price?.toLocaleString()} FCFA
                                </span>
                              </div>
                            </div>

                            {/* Stock Alert */}
                            <div className="mt-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${calculateStockAlert(item).color}`}>
                                {calculateStockAlert(item).text}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-green-700">
                          {(item.quantity * item.unit_price)?.toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Total */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total de la commande:</span>
                    <span className="text-2xl font-bold text-green-700">
                      {commande.total_amount?.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Aucun article trouvé dans cette commande</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Livraison Tab */}
        {activeTab === 'livraison' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg mr-3">
                  <Truck className="h-5 w-5 text-orange-600" />
                </div>
                Informations de Livraison
              </h3>
            </div>

            {commande.livraison ? (
              <div className="space-y-6">
                {/* Livreur Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <User className="h-5 w-5 text-blue-600 mr-2" />
                    Livreur Assigné
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{commande.livreur?.name || 'Non assigné'}</p>
                      {commande.livreur?.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          {commande.livreur.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Adresse de livraison */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <MapPin className="h-5 w-5 text-green-600 mr-2" />
                    Adresse de Livraison
                  </h4>
                  <p className="text-gray-700 mb-2">{commande.delivery_address}</p>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    Téléphone: {commande.delivery_phone}
                  </div>
                </div>

                {/* Statut de livraison */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <TruckIcon className="h-5 w-5 text-purple-600 mr-2" />
                    Statut de Livraison
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(commande.status)}`}>
                      {getStatusText(commande.status)}
                    </span>
                    {commande.livraison.estimated_delivery_time && (
                      <div className="text-sm text-gray-600">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Livraison prévue: {format(new Date(commande.livraison.estimated_delivery_time), 'dd/MM/yyyy HH:mm')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">Aucun livreur assigné à cette commande</p>
                {commande.status === 'confirmee' && (
                  <button
                    onClick={() => setAssignLivreurModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium flex items-center mx-auto"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Assigner un livreur
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Paiement Tab */}
        {activeTab === 'paiement' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <div className="p-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg mr-3">
                  <CreditCard className="h-5 w-5 text-yellow-600" />
                </div>
                Informations de Paiement
              </h3>
            </div>

            <div className="space-y-6">
              {/* Méthode de paiement */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-bold text-gray-900 mb-3">Méthode de Paiement</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Méthode:</span>
                  <span className={`font-medium ${getPaymentMethodText(commande.payment_method).color}`}>
                    {getPaymentMethodText(commande.payment_method).text}
                  </span>
                </div>
              </div>

              {/* Statut du paiement */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <h4 className="font-bold text-gray-900 mb-3">Statut du Paiement</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Statut:</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getPaymentStatusColor(commande.payment_status)}`}>
                    {commande.payment_status === 'paye' ? '✅ Payé' :
                      commande.payment_status === 'en_attente' ? '⏳ En attente' :
                        '❌ Échec'}
                  </span>
                </div>
              </div>

              {/* Montant */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-bold text-gray-900 mb-3">Montant</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total à payer:</span>
                  <span className="text-2xl font-bold text-green-700">
                    {commande.total_amount?.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {/* Détails du paiement Mobile Money */}
              {commande.payment_method === 'mobile_money' && commande.paiements && commande.paiements.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="font-bold text-gray-900 mb-3">Détails Mobile Money</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Opérateur:</span>
                      <span className="font-medium">{commande.paiements[0]?.operateur || 'Non spécifié'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Numéro transaction:</span>
                      <span className="font-medium">{commande.paiements[0]?.numero_transaction || 'Non spécifié'}</span>
                    </div>
                    {commande.paiements[0]?.reference && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Référence:</span>
                        <span className="font-medium text-sm">{commande.paiements[0].reference}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal d'assignation de livreur */}
      {assignLivreurModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <UserPlus className="h-6 w-6 text-purple-600 mr-2" />
                  Assigner un Livreur
                </h3>
                <button
                  onClick={() => setAssignLivreurModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {loadingLivreurs ? (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-600">Chargement des livreurs...</p>
                </div>
              ) : livreurs.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-gray-600 mb-4">Sélectionnez un livreur disponible :</p>
                  {livreurs.map((livreur: UserType) => (
                    <button
                      key={livreur.id}
                      onClick={() => setSelectedLivreur(livreur.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedLivreur === livreur.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{livreur.name}</p>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-1" />
                            {livreur.phone}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setAssignLivreurModal(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAssignLivreur}
                      disabled={!selectedLivreur}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Assigner
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4">Aucun livreur disponible</p>
                  <button
                    onClick={() => setAssignLivreurModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CommandeDetailPage;