<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-xl font-semibold text-gray-700 mb-4">Stocks de la semaine en cours</h2>
    <div v-if="currentWeekData.length > 0">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <div v-else class="text-center text-gray-600">
      <p>Aucune donnée disponible pour la semaine en cours.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)
import type { SimulationResult, DailyStockLevel } from '@/interfaces'

const props = defineProps<{
  simulationResult: SimulationResult | null
}>()

// Fonction pour calculer le numéro de semaine ISO à partir d'une date (au format ISO)
function getWeekNumber(dateStr: string): number {
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)
  // Ajustement pour ISO : on déplace la date pour que la semaine commence le lundi
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const week1 = new Date(date.getFullYear(), 0, 4)
  return (
    1 +
    Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  )
}

// Calculer le numéro de semaine en cours à partir d'aujourd'hui
const currentWeekNumber = computed(() => {
  const today = new Date()
  return getWeekNumber(today.toISOString())
})

// Filtrer les données pour ne garder que celles de la semaine en cours
const currentWeekData = computed((): DailyStockLevel[] => {
  if (!props.simulationResult) return []
  return props.simulationResult.dailyStockLevels.filter(
    (day) => getWeekNumber(day.date) === currentWeekNumber.value,
  )
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const createChart = () => {
  if (!chartCanvas.value) return
  if (chartInstance) chartInstance.destroy()
  const labels = currentWeekData.value.map((day) => daysOfWeek[new Date(day.date).getDay()])
  const data = currentWeekData.value.map((day) => day.stockLevel)
  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Niveau de Stock',
          data,
          borderColor: 'rgba(66,153,225,1)',
          backgroundColor: 'rgba(66,153,225,0.2)',
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: {
          title: { display: true, text: 'Niveau de Stock' },
          beginAtZero: true,
          ticks: { stepSize: 3 },
        },
      },
    },
  })
}

onMounted(() => {
  createChart()
})

// Recréer le graphique si les données de la semaine changent
watch(
  () => currentWeekData.value,
  () => {
    if (chartCanvas.value) createChart()
  },
)
</script>

<style scoped></style>
