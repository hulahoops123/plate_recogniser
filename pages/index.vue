<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-tl from-slate-200 to-yellow-600 text-center px-6">

    <!-- Title -->
    <nuxt-img class="rounded-sm shadow-sm" src="/images/icon.png"></nuxt-img>
    <h1 class="text-4xl font-semibold text-gray-800 drop-shadow-lg mt-12 mb-2 font-raleway border-blue-800 rounded-md bg-slate-200/70 border-4">
      PLATE SCANNER
    </h1>

    <!-- Centered Section -->
    <div class="flex-grow flex flex-col items-center justify-center space-y-8">
      <!-- Live Feed Box -->
      <div class="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden border-[6px] border-gray-800 shadow-2xl">
        <video ref="video" autoplay playsinline class="w-full h-full object-cover" />
      </div>

      <!-- Status Message -->
      <p class="text-base text-gray-700 tracking-wide">
          Plate Recognizer v1 &mdash; Device: {{ deviceId }}
      </p>
    </div>

    <!-- Footer -->
    <footer class="pb-6 text-xs text-gray-500">
      © - hulahoopswebdev
    </footer>
  </div>
</template>


<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const toast = useToast()
const { startScanning } = useScanner()

const deviceId = 'device-001'
const locationId = 'wash-bay-1'
const video = ref(null)

onMounted(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  video.value.srcObject = stream
  startScanning(video.value, deviceId, locationId)
})
</script>
