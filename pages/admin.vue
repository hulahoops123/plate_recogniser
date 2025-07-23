<template>
    <div class="min-h-screen p-6 bg-gradient-to-br from-yellow-100 via-white to-slate-200 font-raleway">

        <!-- Locked View -->
        <div v-if="!unlocked"
            class="max-w-md mx-auto text-center bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-xl border border-gray-300">
            <nuxt-img src="/images/icon.png" alt="Logo" class="mx-auto mb-4 rounded shadow-sm " />
            <h1 class="text-2xl font-bold text-gray-800 mb-6 drop-shadow-sm">🔒 Admin Access</h1>

            <input v-model="passwordInput" type="password" placeholder="Enter password"
                class="w-full p-3 border border-gray-400 bg-white text-gray-800 placeholder-gray-400 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-300 transition"
                @keyup.enter="checkPassword" />


            <button @click="checkPassword"
                class="mt-6 w-full bg-blue-600 text-white py-3 font-semibold tracking-wide rounded hover:bg-blue-700 transition shadow-md">
                Unlock
            </button>
        </div>

        <!-- Admin Dashboard -->
        <div v-else class="max-w-6xl mx-auto mt-4 space-y-10">

            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                <!-- Title -->
                <div class="flex items-center">
                    <nuxt-img class="rounded-sm shadow-sm h-16" src="/images/icon.png" />

                    <h1
                        class="ml-4 text-2xl font-semibold text-gray-800 drop-shadow-lg font-raleway border-blue-800 rounded-md bg-slate-200/70 border-4 px-4 py-1">
                        PLATE SCANNER
                    </h1>
                </div>

                <div class="flex items-center gap-3">
                    <h1 class="text-3xl font-bold text-gray-800 drop-shadow-sm">📊 Daily Summary</h1>
                </div>

                <input type="date" v-model="selectedDate" @change="fetchPlates"
                    class="border border-gray-300 px-4 py-2 rounded shadow-sm bg-white text-gray-800" />
            </div>

            <!-- Live Status -->
            <div v-if="isToday" class="text-sm text-blue-700 italic font-medium">
                🔄 Live: <span class="font-bold">{{ plates.length }}</span> plates scanned today
            </div>

            <!-- Stats Card -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
                <div class="bg-white/90 backdrop-blur-md border border-gray-300 shadow-lg p-6 rounded-xl">
                    <p class="text-sm text-gray-500 uppercase tracking-wide">Total Scans</p>
                    <p class="text-2xl font-bold text-gray-800">{{ plates.length }}</p>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-auto bg-white/90 backdrop-blur-md border border-gray-300 shadow-lg rounded-xl p-4">
                <table class="min-w-full text-left text-sm text-gray-800">
                    <thead>
                        <tr class="border-b border-gray-300 font-semibold">
                            <th class="p-2">Plate</th>
                            <th class="p-2">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="p in plates" :key="p.id"
                            class="border-b border-gray-200 hover:bg-gray-50 transition">
                            <td class="p-2 font-mono tracking-wide">{{ p.plate }}</td>
                            <td class="p-2">{{ formatTime(p.timestamp) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</template>


<script setup>
const supabase = useSupabaseClient()

// State
const unlocked = ref(false)
const passwordInput = ref('')
const plates = ref([])

const selectedDate = ref(
    new Date().toISOString().split('T')[0] // default to today
)

// Computed
const uniqueCount = computed(() => plates.value.length)
const isToday = computed(() => {
    return selectedDate.value === new Date().toISOString().split('T')[0]
})

// Actions
const checkPassword = () => {
    if (passwordInput.value.trim() === 'akeahnaidoo') {
        unlocked.value = true
        fetchPlates()
    }
}

const fetchPlates = async () => {
    const start = new Date(selectedDate.value)
    const end = new Date(start)
    end.setDate(start.getDate() + 1)

    const { data, error } = await supabase
        .from('plates')
        .select('*')
        .gte('timestamp', start.toISOString())
        .lt('timestamp', end.toISOString())
        .order('timestamp', { ascending: false })

    if (error) {
        console.error('Fetch error:', error)
        return
    }

    plates.value = data
}

const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    })
}

// Auto-refresh every 30 seconds if viewing today
onMounted(() => {
    if (isToday.value) {
        const interval = setInterval(fetchPlates, 30_000)
        onUnmounted(() => clearInterval(interval))
    }
})
</script>
