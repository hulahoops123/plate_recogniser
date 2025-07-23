import Tesseract from 'tesseract.js'

export const useScanner = () => {
    let scanning = false

    const startScanning = (videoEl: HTMLVideoElement, deviceId: string, locationId: string) => {
        if (!process.client) return

        const canvas = document.createElement('canvas')
        const supabase = useSupabaseClient()
        const toast = useToast()

        setInterval(async () => {
            if (scanning || videoEl.readyState < 2) return
            scanning = true

            canvas.width = videoEl.videoWidth
            canvas.height = videoEl.videoHeight
            const ctx = canvas.getContext('2d')
            ctx?.drawImage(videoEl, 0, 0)

            try {
                const { data } = await Tesseract.recognize(canvas, 'eng')
                const rawText = data.text?.trim().replace(/\s/g, '').toUpperCase()
                console.log('🧾 Raw OCR text:', rawText)

                const plate = rawText?.match(/[A-Z0-9]{5,}/)?.[0]

                if (plate) {
                    console.log('🚗 Matched Plate:', plate)

                    // 1. Check if this plate already exists today
                    const today = new Date().toISOString().split('T')[0]
                    const { data: existing, error: lookupError } = await supabase
                        .from('plates')
                        .select('id')
                        .eq('plate', plate)
                        .gte('timestamp', today)
                        .limit(1)

                    if (lookupError) {
                        console.error('🔍 Lookup error:', lookupError)
                        toast.error({ title: "Lookup Failed", message: lookupError.message })
                    } else if (existing.length > 0) {
                        console.log('⚠️ Plate already recorded today — skipping insert')
                    } else {
                        // 2. Insert only if it hasn't been seen today
                        const { error } = await supabase.from('plates').insert({
                            plate,
                            timestamp: new Date().toISOString(),
                            device_id: deviceId,
                            location_id: locationId
                        })

                        if (error) {
                            console.error('❌ Supabase insert error:', error)
                            toast.error({
                                title: "Insert Failed",
                                message: error.message || 'Could not save plate'
                            })
                        } else {
                            toast.success({
                                title: "Plate Recorded",
                                message: plate
                            })
                            console.log('✅ Plate successfully inserted into Supabase')
                        }
                    }
                }
                else {
                    console.log('No plate detected.')
                }

            } catch (err) {
                console.error('OCR error:', err)
                toast.error({
                    title: 'OCR Failed',
                    message: 'Could not read number plate'
                })
            }

            scanning = false
        }, 10_000)
    }

    return { startScanning }
}
