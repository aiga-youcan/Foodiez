// ==========================================
// 1. ÉTAT GLOBAL (STATE) & CONFIG
// ==========================================
const API_URL = 'http://localhost:3000/orders';
let orders = []; // Stocke toutes les commandes
let currentView = 'dashboard'; // Vue par défaut

// Récupération des préférences depuis le LocalStorage
let currentFilter = localStorage.getItem('foodiez_filter') || 'all';
let isDarkMode = localStorage.getItem('foodiez_theme') === 'dark' || !localStorage.getItem('foodiez_theme'); // Dark par défaut

// ==========================================
// 2. INITIALISATION & ROUTING (SPA)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    fetchOrders(); // Charge les données puis affiche la vue par défaut
});

/**
 * Moteur de navigation de la SPA
 * Change la vue active et met à jour l'UI
 */
function navigate(view) {
    currentView = view;
    
    // 1. Mise à jour de l'UI de la Sidebar
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-orange-50', 'text-orange-600', 'dark:bg-orange-500/20', 'dark:text-orange-400');
        if (btn.id === `nav-${view}`) {
            btn.classList.add('bg-orange-50', 'text-orange-600', 'dark:bg-orange-500/20', 'dark:text-orange-400');
        }
    });

    // 2. Déclenchement de l'animation
    const appContent = document.getElementById('app-content');
    appContent.classList.remove('view-transition');
    void appContent.offsetWidth; // Force le reflow pour relancer l'animation CSS
    appContent.classList.add('view-transition');

    // 3. Rendu dynamique de la vue
    if (view === 'dashboard') renderDashboard();
    else if (view === 'orders') renderOrders();
    else if (view === 'settings') renderSettings();
}

// ==========================================
// 3. VUES DYNAMIQUES (RENDERS)
// ==========================================

function renderDashboard() {
    const appContent = document.getElementById('app-content');
    
    // Calcul des statistiques dynamiques
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        accepted: orders.filter(o => o.status === 'accepted').length,
        completed: orders.filter(o => o.status === 'completed').length,
        rejected: orders.filter(o => o.status === 'rejected').length
    };

    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-8">Vue d'ensemble</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-gray-500 dark:text-gray-400 font-medium">Total Commandes</h3>
                    <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300"><i class="fas fa-receipt"></i></div>
                </div>
                <p class="text-4xl font-bold">${stats.total}</p>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-yellow-600 dark:text-yellow-500 font-medium">En Attente</h3>
                    <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600"><i class="fas fa-clock"></i></div>
                </div>
                <p class="text-4xl font-bold text-yellow-600 dark:text-yellow-500">${stats.pending}</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-blue-600 dark:text-blue-500 font-medium">Acceptées</h3>
                    <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600"><i class="fas fa-fire-burner"></i></div>
                </div>
                <p class="text-4xl font-bold text-blue-600 dark:text-blue-500">${stats.accepted}</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-green-600 dark:text-green-500 font-medium">Terminées</h3>
                    <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600"><i class="fas fa-check-double"></i></div>
                </div>
                <p class="text-4xl font-bold text-green-600 dark:text-green-500">${stats.completed}</p>
            </div>
        </div>

        <div class="mt-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-lg font-bold mb-4">Activité Récente</h3>
            <div class="h-48 flex items-end gap-2" id="fake-chart">
                ${generateFakeChartBars()}
            </div>
        </div>
    `;
}

function renderOrders() {
    const appContent = document.getElementById('app-content');
    
    // Application du filtre sur l'état global
    const filteredOrders = currentFilter === 'all' 
        ? orders 
        : orders.filter(o => o.status === currentFilter);

    // Injection du HTML (Formulaire + Filtres + Liste)
    // On utilise onsubmit="return handleAddOrder(event)" pour intercepter la soumission
    appContent.innerHTML = `
        <div class="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div class="w-full lg:w-1/3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-4">
                <h2 class="text-xl font-bold mb-6"><i class="fas fa-plus-circle mr-2 text-orange-500"></i>Nouvelle Commande</h2>
                <form onsubmit="return handleAddOrder(event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Client</label>
                        <input type="text" id="input-client" required class="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none transition">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Plat</label>
                        <input type="text" id="input-meal" required class="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none transition">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Prix (DH)</label>
                        <input type="number" id="input-price" min="1" required class="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none transition">
                    </div>
                    <button type="submit" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition mt-4 shadow-lg shadow-orange-500/30">
                        Ajouter
                    </button>
                </form>
            </div>

            <div class="w-full lg:w-2/3">
                <div class="flex flex-wrap gap-2 mb-6">
                    ${['all', 'pending', 'accepted', 'completed', 'rejected'].map(status => `
                        <button onclick="setFilter('${status}')" class="px-4 py-2 rounded-full text-sm font-medium transition capitalize ${
                            currentFilter === status 
                            ? 'bg-orange-500 text-white shadow-md' 
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }">
                            ${status === 'all' ? 'Toutes' : status}
                        </button>
                    `).join('')}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${filteredOrders.length > 0 ? filteredOrders.map(order => generateOrderCard(order)).join('') : `
                        <div class="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                            <i class="fas fa-inbox text-4xl text-gray-400 mb-3"></i>
                            <p class="text-gray-500">Aucune commande trouvée.</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

function renderSettings() {
    const appContent = document.getElementById('app-content');
    appContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-8">Paramètres</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-4 mb-6">
                    <img src="https://ui-avatars.com/api/?name=Admin+Foodiez&background=f97316&color=fff" alt="Profile" class="w-16 h-16 rounded-full shadow-md">
                    <div>
                        <h3 class="text-xl font-bold">Admin Foodiez</h3>
                        <p class="text-gray-500">Manager du Restaurant</p>
                    </div>
                </div>
                <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <p><i class="fas fa-envelope mr-2"></i> admin@foodiez.com</p>
                    <p><i class="fas fa-map-marker-alt mr-2"></i> Rabat, Maroc</p>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                <div>
                    <h3 class="text-lg font-bold mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Apparence</h3>
                    <div class="flex justify-between items-center">
                        <span class="font-medium">Mode Sombre (Dark Mode)</span>
                        <button onclick="toggleTheme()" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}">
                            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}"></span>
                        </button>
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-bold text-red-500 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Zone Dangereuse</h3>
                    <p class="text-sm text-gray-500 mb-3">Attention, cette action supprimera toutes les commandes de la base de données. Irréversible.</p>
                    <button onclick="resetAllOrders()" class="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 px-4 py-2 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition">
                        <i class="fas fa-trash-alt mr-2"></i> Réinitialiser la base de données
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// 4. LOGIQUE API & CRUD
// ==========================================

async function fetchOrders() {
    toggleLoader(true);
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error();
        orders = await res.json();
        navigate(currentView); // Affiche la vue courante une fois les données chargées
    } catch (err) {
        showToast("Erreur de chargement JSON Server", "error");
    } finally {
        toggleLoader(false);
    }
}

async function handleAddOrder(e) {
    e.preventDefault(); // Stoppe le rechargement
    const newOrder = {
        client: document.getElementById('input-client').value.trim(),
        meal: document.getElementById('input-meal').value.trim(),
        price: Number(document.getElementById('input-price').value),
        status: "pending"
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOrder)
        });
        if (res.ok) {
            showToast("Commande ajoutée !", "success");
            fetchOrders(); // Recharge les données et l'UI
        }
    } catch (err) { showToast("Erreur d'ajout", "error"); }
}

async function updateOrder(id, newStatus) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            showToast(`Statut changé en: ${newStatus}`, "success");
            fetchOrders();
        }
    } catch (err) { showToast("Erreur de mise à jour", "error"); }
}

async function deleteOrder(id) {
    if (!confirm("Supprimer définitivement cette commande ?")) return;
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast("Commande supprimée", "success");
            fetchOrders();
        }
    } catch (err) { showToast("Erreur de suppression", "error"); }
}

// ==========================================
// 5. FONCTIONS UTILITAIRES & UI HELPERS
// ==========================================

function setFilter(status) {
    currentFilter = status;
    localStorage.setItem('foodiez_filter', status);
    renderOrders(); // Re-rend uniquement la vue actuelle sans appel réseau
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('foodiez_theme', isDarkMode ? 'dark' : 'light');
    applyTheme();
    if (currentView === 'settings') renderSettings(); // Met à jour le toggle visuel
}

function applyTheme() {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function toggleLoader(show) {
    const loader = document.getElementById('global-loader');
    show ? loader.classList.remove('hidden') : loader.classList.add('hidden');
}

function showToast(msg, type = "success") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const color = type === "success" ? "bg-green-500" : "bg-red-500";
    const icon = type === "success" ? "fa-check" : "fa-exclamation-triangle";
    
    toast.className = `${color} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 transform translate-y-10 opacity-0 transition-all duration-300 z-50`;
    toast.innerHTML = `<i class="fas ${icon}"></i> <span class="font-medium">${msg}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-10', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Génère le code HTML d'une carte commande
 */
function generateOrderCard(order) {
    const colors = {
        pending: 'border-yellow-500',
        accepted: 'border-blue-500',
        completed: 'border-green-500',
        rejected: 'border-red-500'
    };

    return `
        <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 ${colors[order.status]} hover:shadow-md transition">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-bold text-lg text-gray-800 dark:text-white">${order.client}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400"><i class="fas fa-utensils mr-1"></i> ${order.meal}</p>
                </div>
                <span class="font-bold text-lg text-orange-500">${order.price} DH</span>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                <div class="flex gap-2">
                    ${generateActionButtons(order)}
                </div>
                <button onclick="deleteOrder('${order.id}')" class="text-gray-400 hover:text-red-500 transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function generateActionButtons(order) {
    if (order.status === 'pending') {
        return `
            <button onclick="updateOrder('${order.id}', 'accepted')" class="text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">Accepter</button>
            <button onclick="updateOrder('${order.id}', 'rejected')" class="text-xs font-medium bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">Rejeter</button>
        `;
    } else if (order.status === 'accepted') {
        return `<button onclick="updateOrder('${order.id}', 'completed')" class="text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-100 transition"><i class="fas fa-check mr-1"></i> Terminer</button>`;
    }
    
    // Badge status for completed/rejected
    const bg = order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    const text = order.status === 'completed' ? 'Terminée' : 'Rejetée';
    return `<span class="${bg} px-3 py-1 rounded-lg text-xs font-medium">${text}</span>`;
}

// Fonction Bonus : Fake chart data
function generateFakeChartBars() {
    return Array.from({length: 12}).map(() => {
        const height = Math.floor(Math.random() * 80) + 20;
        return `<div class="flex-1 bg-orange-200 dark:bg-orange-500/30 rounded-t-sm hover:bg-orange-500 dark:hover:bg-orange-500 transition-colors cursor-pointer" style="height: ${height}%"></div>`;
    }).join('');
}

// Fonction Bonus : Reset DB
async function resetAllOrders() {
    if(!confirm("Êtes-vous absolument sûr ?")) return;
    
    toggleLoader(true);
    // JSON Server ne permet pas de DELETE all d'un coup, on boucle (version simplifiée pour l'exercice)
    try {
        for (const order of orders) {
            await fetch(`${API_URL}/${order.id}`, { method: 'DELETE' });
        }
        showToast("Base de données réinitialisée", "success");
        fetchOrders();
    } catch(e) {
        showToast("Erreur lors de la réinitialisation", "error");
        toggleLoader(false);
    }
}