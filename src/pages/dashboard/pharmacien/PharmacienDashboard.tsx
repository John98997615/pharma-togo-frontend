// src/pages/dashboard/pharmacien/PharmacienDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  MapPin,
  Settings,
  PlusCircle,
  BarChart3,
  Calendar,
  Store,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { pharmacyService } from '../../../services/api/pharmacy.service';
import { medicamentService } from '../../../services/api/medicament.service';
import { commandeService } from '../../../services/api/commande.service';
import { Commande, CommandeStatus } from '../../../types/commande.types';
import { Medicament } from '../../../types/medicament.types';
import { Pharmacy } from '../../../types/pharmacy.types';

const PharmacienDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loadingPharmacy, setLoadingPharmacy] = useState(true);
  const [retryCount, setRetryCount] = useState<number>(0); // AJOUTEZ CETTE LIGNE
  const [stats, setStats] = useState({
    totalMedicaments: 0,
    lowStock: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
  });

  // Fonction améliorée pour récupérer la pharmacie
  const fetchPharmacy = async (forceRefresh = false) => {
    setLoadingPharmacy(true);

    try {
      console.log('🔄 Fetching pharmacy data...');
      console.log('User object:', user);
      console.log('User pharmacy property:', user?.pharmacy);

      // ESSAI 1: Vérifier si la pharmacie est directement dans l'objet user
      if (user?.pharmacy && typeof user.pharmacy === 'object') {
        console.log('📦 Pharmacy found in user object:', user.pharmacy);

        // Si c'est un objet complet avec id, l'utiliser directement
        if (user.pharmacy.id && user.pharmacy.name) {
          console.log('✅ Using pharmacy from user object');
          setPharmacy(user.pharmacy as Pharmacy);
          setLoadingPharmacy(false);
          return;
        }
      }

      // ESSAI 2: Récupérer toutes les pharmacies et trouver celle de l'utilisateur
      console.log('🔍 Fetching all pharmacies to find user pharmacy...');
      const allPharmacies = await pharmacyService.getAll();
      console.log('All pharmacies:', allPharmacies);

      // Trouver la pharmacie qui appartient à cet utilisateur
      const userPharmacy = Array.isArray(allPharmacies)
        ? allPharmacies.find((p: Pharmacy) => p.user_id === user?.id)
        : null;

      if (userPharmacy) {
        console.log('✅ Found user pharmacy:', userPharmacy);
        setPharmacy(userPharmacy);

        // Mettre à jour l'utilisateur avec la pharmacie trouvée
        if (user) {
          const updatedUser = {
            ...user,
            pharmacy: userPharmacy
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          updateUser(updatedUser);
        }
      } else {
        console.log('❌ No pharmacy found for this user');
        setPharmacy(null);
      }

    } catch (error: any) {
      console.error('❌ Error in fetchPharmacy:', error);

      // Essayer une approche différente en cas d'erreur
      if (retryCount < 3 && !forceRefresh) {
        setRetryCount((prev: number) => prev + 1);
        console.log(`🔄 Retry attempt ${retryCount + 1}/3`);
        setTimeout(() => fetchPharmacy(true), 1000 * (retryCount + 1));
      } else {
        toast.error('Impossible de charger votre pharmacie. Contactez l\'administrateur.');
        setPharmacy(null);
      }
    } finally {
      setLoadingPharmacy(false);
    }
  };

  // Récupérer la pharmacie au chargement
  useEffect(() => {
    fetchPharmacy();
  }, [user]);

  // Récupérer les médicaments - seulement si pharmacie existe
  const { data: medicamentsData, isLoading: medicamentsLoading, refetch: refetchMedicaments } = useQuery({
    queryKey: ['pharmacy-medicaments', pharmacy?.id],
    queryFn: () => medicamentService.getAll({
      pharmacy_id: pharmacy?.id,
      per_page: 50
    }),
    enabled: !!pharmacy,
  });

  // Récupérer les commandes - seulement si pharmacie existe
  const { data: commandesData, isLoading: commandesLoading, refetch: refetchCommandes } = useQuery({
    queryKey: ['pharmacy-commandes', pharmacy?.id],
    queryFn: () => commandeService.getAll({
      pharmacy_id: pharmacy?.id,
      per_page: 10,
      date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }),
    enabled: !!pharmacy,
  });

  // Calculer les statistiques
  useEffect(() => {
    if (pharmacy && medicamentsData && commandesData) {
      console.log('🔄 Calcul des statistiques...');

      try {
        // Convertir les données en any pour éviter les erreurs TypeScript
        const medicamentsAny = medicamentsData as any;
        const commandesAny = commandesData as any;

        // Extraire les tableaux simplement
        const medicamentsArray = (
          Array.isArray(medicamentsAny) ? medicamentsAny :
            Array.isArray(medicamentsAny?.data) ? medicamentsAny.data :
              medicamentsAny?.data ? [medicamentsAny.data] : []
        ) as Medicament[];

        const commandesArray = (
          Array.isArray(commandesAny) ? commandesAny :
            Array.isArray(commandesAny?.data) ? commandesAny.data :
              commandesAny?.data ? [commandesAny.data] : []
        ) as Commande[];

        console.log('✅ Médicaments:', medicamentsArray.length);
        console.log('✅ Commandes:', commandesArray.length);

        // Calcul du revenu d'aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        let todayRevenue = 0;

        commandesArray.forEach((commande: Commande) => {
          if (commande.created_at && commande.created_at.startsWith(today)) {
            const amount = Number(commande.total_amount) || 0;
            todayRevenue += amount;
          }
        });

        // Mettre à jour les stats
        setStats({
          totalMedicaments: medicamentsArray.length,
          lowStock: medicamentsArray.filter(m => m.quantity < 10).length,
          pendingOrders: commandesArray.filter(c => c.status === 'en_attente').length,
          todayRevenue: todayRevenue,
          confirmedOrders: commandesArray.filter(c => c.status === 'confirmee').length,
          deliveredOrders: commandesArray.filter(c => c.status === 'livree').length,
        });

        console.log('💰 Revenu aujourd\'hui:', todayRevenue);
      } catch (error) {
        console.error('❌ Erreur calcul statistiques:', error);
      }
    }
  }, [pharmacy, medicamentsData, commandesData]);

  // Fonction pour forcer le rechargement
  const handleForceRefresh = () => {
    setRetryCount(0);
    fetchPharmacy(true);
    refetchMedicaments();
    refetchCommandes();
    toast.success('Actualisation en cours...');
  };

  const handleCreatePharmacy = () => {
    navigate('/pharmacien/pharmacy/create');
  };

  const toggleGarde = async () => {
    if (!pharmacy) return;
    try {
      const response = await pharmacyService.toggleGarde(pharmacy.id);
      setPharmacy({ ...pharmacy, is_garde: response.is_garde });
      toast.success(
        response.is_garde
          ? '✅ Pharmacie mise en garde avec succès'
          : '✅ Pharmacie retirée de la garde'
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification du statut');
    }
  };

  const getStatusColor = (status: CommandeStatus) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmee': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-green-100 text-green-800';
      case 'livree': return 'bg-purple-100 text-purple-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: CommandeStatus) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'confirmee': return 'Confirmée';
      case 'en_cours': return 'En cours';
      case 'livree': return 'Livrée';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  };

  // Afficher l'état de chargement
  if (loadingPharmacy) {
    return (
      <div className="p-6">
        {/* <DebugPanel /> */}
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement de votre pharmacie...</p>
          <button
            onClick={handleForceRefresh}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Si pas de pharmacie
  if (!pharmacy) {
    return (
      <div className="p-6">
        {/* <DebugPanel /> */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="h-20 w-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Store className="h-10 w-10 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Bienvenue, {user?.name} !
            </h2>

            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">État de votre compte</h3>
                <button
                  onClick={handleForceRefresh}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Vérifier
                </button>
              </div>

              <div className="text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rôle utilisateur:</span>
                  <span className="font-medium capitalize">{user?.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Statut compte:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${user?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user?.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pharmacie associée:</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                    Non trouvée
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              {user?.pharmacy
                ? "Votre compte a une pharmacie référencée mais elle n'a pas pu être chargée."
                : "Vous êtes pharmacien mais n'avez pas encore de pharmacie associée à votre compte."
              }
            </p>

            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">Options disponibles :</h3>
              <div className="space-y-3">
                <button
                  onClick={handleCreatePharmacy}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Créer une nouvelle pharmacie
                </button>

                <button
                  onClick={handleForceRefresh}
                  className="w-full px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium flex items-center justify-center"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Rechercher à nouveau ma pharmacie
                </button>

                <button
                  onClick={() => window.location.href = 'mailto:admin@pharmatogo.tg?subject=Problème%20pharmacie%20non%20chargée'}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Contacter l'administrateur
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-500 space-y-2">
              <p>User ID: {user?.id}</p>
              <p>Email: {user?.email}</p>
              <p>Rôle: {user?.role}</p>
              <p>Compte créé le: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si la pharmacie existe, afficher le dashboard normal
  return (
    <div className="p-6">
      {/* <DebugPanel /> */}

      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Tableau de bord Pharmacien
              </h1>
              <button
                onClick={handleForceRefresh}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                title="Actualiser"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center text-gray-600">
                <Store className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">{pharmacy.name}</span>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${pharmacy.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {pharmacy.is_active ? '🟢 ACTIVE' : '🔴 INACTIVE'}
                </span>
              </div>
            </div>
            <p className="text-gray-500 mt-1">{pharmacy.address}</p>
            <p className="text-sm text-gray-400 mt-1">
              • Créée le: {new Date(pharmacy.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleGarde}
              className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors ${pharmacy.is_garde
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              {pharmacy.is_garde ? '🚨 PHARMACIE DE GARDE' : 'Mettre en garde'}
            </button>

            <Link
              to="/pharmacien/settings"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Modifier
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Message de succès
      <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center">
          <Store className="h-5 w-5 text-green-600 mr-3" />
          <div>
            <span className="font-bold text-green-700">
              Pharmacie chargée avec succès !
            </span>
            <p className="text-green-600 text-sm mt-1">
              Bienvenue dans votre espace pharmacien. Vous pouvez maintenant gérer vos médicaments et commandes.
            </p>
          </div>
        </div>
      </div> */}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Médicaments</p>
              <p className="text-3xl font-bold mt-2">{stats.totalMedicaments}</p>
              <div className="flex items-center mt-2">
                <Package className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm text-gray-600">en stock</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <Link
            to="/pharmacien/medicaments"
            className="block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Gérer les médicaments →
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Commandes en attente</p>
              <p className="text-3xl font-bold mt-2 text-yellow-600">{stats.pendingOrders}</p>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">à traiter</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-50 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <Link
            to="/pharmacien/commandes"
            className="block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir les commandes →
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Rupture de stock</p>
              <p className="text-3xl font-bold mt-2 text-red-600">{stats.lowStock}</p>
              <div className="flex items-center mt-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-gray-600">produits</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <Link
            to="/pharmacien/medicaments?low_stock=true"
            className="block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Réapprovisionner →
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Revenu aujourd'hui</p>
              <p className="text-3xl font-bold mt-2 text-green-600">
                {stats.todayRevenue.toLocaleString()} FCFA
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-600">total</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <Link
            to="/pharmacien/statistics"
            className="block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir les stats →
          </Link>
        </motion.div>
      </div>

      {/* Alertes */}
      {stats.lowStock > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <span className="font-bold text-red-700">
                  {stats.lowStock} médicament(s) en rupture de stock
                </span>
                <p className="text-red-600 text-sm mt-1">
                  Veuillez réapprovisionner ces produits rapidement.
                </p>
              </div>
            </div>
            <Link
              to="/pharmacien/medicaments?low_stock=true"
              className="text-red-600 hover:text-red-800 font-medium flex items-center"
            >
              Gérer le stock →
            </Link>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Commandes récentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
              Commandes récentes
            </h3>
            <Link
              to="/pharmacien/commandes"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Voir toutes →
            </Link>
          </div>

          {commandesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement des commandes...</p>
            </div>
          ) : commandesData?.data?.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Aucune commande pour le moment</p>
              <p className="text-gray-400 text-sm mt-1">Les commandes apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commandesData?.data?.slice(0, 5).map((commande: Commande) => (
                <div
                  key={commande.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">#{commande.numero_commande}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(commande.status)}`}>
                        {getStatusText(commande.status)}
                      </span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <span>{commande.user?.name || 'Client'}</span>
                      <span className="mx-2">•</span>
                      <span>{commande.total_amount.toLocaleString()} FCFA</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(commande.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link
                    to={`/pharmacien/commandes/${commande.id}`}
                    className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Détails complets
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Médicaments en faible stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Stock faible
            </h3>
            <Link
              to="/pharmacien/medicaments?low_stock=true"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Voir tous →
            </Link>
          </div>

          {medicamentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement des médicaments...</p>
            </div>
          ) : !medicamentsData?.data?.some((m: Medicament) => m.quantity < 10) ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto mb-4 text-green-300" />
              <p className="text-gray-500">Stock optimal</p>
              <p className="text-gray-400 text-sm mt-1">Tous les médicaments ont un stock suffisant</p>
            </div>
          ) : (
            <div className="space-y-4">
              {medicamentsData?.data
                ?.filter((m: Medicament) => m.quantity < 10)
                .slice(0, 5)
                .map((medicament: Medicament) => (
                  <div
                    key={medicament.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      {medicament.image ? (
                        <img
                          src={medicament.image}
                          alt={medicament.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="font-medium">{medicament.name}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <span>Stock: {medicament.quantity}</span>
                          <div className="ml-3 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${medicament.quantity < 5 ? 'bg-red-500' :
                                medicament.quantity < 10 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                              style={{ width: `${(medicament.quantity / 50) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${medicament.quantity < 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {medicament.quantity < 5 ? 'CRITIQUE' : 'FAIBLE'}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/pharmacien/medicaments"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <PlusCircle className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium">Ajouter médicament</p>
                <p className="text-sm text-gray-600">Nouveau produit</p>
              </div>
            </div>
          </Link>

          <Link
            to="/pharmacien/commandes"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <ShoppingCart className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium">Gérer commandes</p>
                <p className="text-sm text-gray-600">Traiter les demandes</p>
              </div>
            </div>
          </Link>

          <Link
            to="/pharmacien/statistics"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium">Voir statistiques</p>
                <p className="text-sm text-gray-600">Analyser les ventes</p>
              </div>
            </div>
          </Link>

          <Link
            to="/pharmacien/settings"
            className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="font-medium">Paramètres</p>
                <p className="text-sm text-gray-600">Configurer la pharmacie</p>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PharmacienDashboard;