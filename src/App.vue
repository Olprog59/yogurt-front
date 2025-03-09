<template>
  <div class="max-w-7xl mx-auto p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Optimisation de Stock de Yaourts</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Paramètres -->
      <div class="md:col-span-1">
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">Paramètres</h2>
          <div class="mb-4">
            <label for="initialStock" class="block text-gray-600 mb-1">Stock Initial</label>
            <input
              type="number"
              id="initialStock"
              v-model.number="parameters.initialStock"
              min="0"
              class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="mb-4">
            <label for="deliveryDelay" class="block text-gray-600 mb-1"
              >Délai de Livraison (jours)</label
            >
            <input
              type="number"
              id="deliveryDelay"
              v-model.number="parameters.deliveryDelay"
              min="1"
              class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="mb-4">
            <label for="packSize" class="block text-gray-600 mb-1">Taille du Paquet</label>
            <input
              type="number"
              id="packSize"
              v-model.number="parameters.packSize"
              min="1"
              class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <h3 class="text-lg font-medium text-gray-700 mt-6 mb-2">Consommation Hebdomadaire</h3>
          <div v-for="(day, index) in daysOfWeek" :key="index" class="mb-3 flex items-center">
            <label :for="'day-' + index" class="w-28 text-gray-600">{{ day }}</label>
            <input
              type="number"
              :id="'day-' + index"
              v-model.number="
                parameters.dailyConsumption[daysOfWeekKeys[index] as keyof DailyConsumption]
              "
              min="0"
              class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            @click="calculateOptimalStock"
            :disabled="isLoading"
            class="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ isLoading ? 'Calcul en cours...' : 'Calculer le stock optimal' }}
          </button>
        </div>
      </div>
      <!-- Résultats -->
      <div class="md:col-span-2 space-y-6">
        <div v-if="simulationResult && simulationResult.dailyStockLevels" class="mt-6">
          <CurrentWeekStockChart :simulationResult="simulationResult" />
        </div>
        <!-- Évolution du Stock -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">Évolution du Stock</h2>
          <div v-if="isLoading" class="flex justify-center my-6">
            <div
              class="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"
            ></div>
          </div>
          <div v-else-if="simulationResult && simulationResult.summary">
            <ul class="space-y-2">
              <li
                v-for="(val, key) in simulationResult.summary"
                :key="key"
                class="flex justify-between"
              >
                <span class="font-medium">{{ summaryLabels[key] || key }}</span>
                <span>{{ formatValue(val, key) }}</span>
              </li>
            </ul>
          </div>
          <div v-else class="text-center">
            <p class="text-gray-600">
              Veuillez lancer le calcul pour afficher l'évolution du stock
            </p>
          </div>
        </div>
        <!-- Recommandations d'Achat -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">Recommandations d'Achat</h2>
          <div v-if="isLoading" class="flex justify-center my-6">
            <div
              class="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"
            ></div>
          </div>
          <div
            v-else-if="simulationResult && simulationResult.purchaseRecommendations"
            class="overflow-x-auto"
          >
            <table class="min-w-full divide-gray-200 table-fixed">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-4 py-2 text-left text-gray-600">Date de commande</th>
                  <th class="px-4 py-2 text-left text-gray-600">Date de livraison</th>
                  <th class="px-4 py-2 text-left text-gray-600">Paquets à acheter</th>
                  <th class="px-4 py-2 text-left text-gray-600">Stock avant achat</th>
                  <th class="px-4 py-2 text-left text-gray-600">Stock après livraison</th>
                </tr>
              </thead>
              <tbody class="divide-gray-200">
                <tr
                  v-for="(recommendation, index) in simulationResult.purchaseRecommendations"
                  :key="index"
                  :class="{ 'bg-amber-100': isTodayInInterval(recommendation.orderDate) }"
                >
                  <td class="px-4 py-2 text-gray-700">
                    {{ formatDate(recommendation.orderDate) }}
                  </td>
                  <td class="px-4 py-2 text-gray-700">
                    {{ formatDate(recommendation.deliveryDate) }}
                  </td>
                  <td class="px-4 py-2 text-gray-700">{{ recommendation.packsToBuy }}</td>
                  <td class="px-4 py-2 text-gray-700">{{ recommendation.stockBeforePurchase }}</td>
                  <td class="px-4 py-2 text-gray-700">{{ recommendation.stockAfterDelivery }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center">
            <p class="text-gray-600">
              Veuillez lancer le calcul pour afficher les recommandations d'achat
            </p>
          </div>
        </div>
      </div>
      <div
        v-if="simulationResult && simulationResult.dailyStockLevels"
        class="bg-white shadow rounded-lg p-6"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import axios from 'axios'
import type { Parameters, SimulationResult, DailyConsumption } from '@/interfaces'
import CurrentWeekStockChart from './components/CurrentWeekStockChart.vue'

const parameters = reactive<Parameters>({
  initialStock: 6,
  deliveryDelay: 2,
  packSize: 2,
  dailyConsumption: {
    MONDAY: 3,
    TUESDAY: 3,
    WEDNESDAY: 3,
    THURSDAY: 3,
    FRIDAY: 3,
    SATURDAY: 4,
    SUNDAY: 4,
  },
})

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const daysOfWeekKeys = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

const simulationResult = ref<SimulationResult | null>(null)
const isLoading = ref(false)

async function calculateOptimalStock() {
  isLoading.value = true
  try {
    const response = await axios.post('http://localhost:8080/api/yogurt/optimize', parameters)
    simulationResult.value = response.data
  } catch (error) {
    console.error('Erreur lors du calcul du stock optimal:', error)
    alert('Une erreur est survenue lors du calcul.')
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function isTodayInInterval(startDate: string): boolean {
  const today = new Date()
  const start = new Date(startDate)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 7)
  return today >= start && today <= endDate
}

// Mappage des clés vers des labels en français
const summaryLabels: Record<string, string> = {
  totalPurchases: 'Total des Achats',
  totalYogurtsPurchased: 'Total des Yaourts Achetés',
  totalYogurtsConsumed: 'Total des Yaourts Consommés',
  averageStockLevel: 'Niveau de Stock Moyen',
  minimumStockLevel: 'Niveau de Stock Minimum',
  maximumStockLevel: 'Niveau de Stock Maximum',
  averagePacksToBuy: 'Moyenne des Paquets à Acheter',
}

const formatValue = (value: number, key: string): string => {
  if (key === 'averagePacksToBuy') {
    return value.toFixed(2).replace('.', ',')
  }
  return value.toLocaleString('fr-FR')
}

watch(
  parameters,
  () => {
    calculateOptimalStock()
  },
  { deep: true },
)
</script>
