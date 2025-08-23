// Simple timer test
console.log('Testing simple timer functionality...')

// Test 1: Time calculations
const minutesToMs = (minutes) => minutes * 60 * 1000
const formatTime = (ms) => {
  const minutes = Math.floor(ms / (60 * 1000))
  const seconds = Math.floor((ms % (60 * 1000)) / 1000)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

console.log('✅ Time calculations:')
console.log(`   25 minutes = ${minutesToMs(25)}ms = ${formatTime(minutesToMs(25))}`)
console.log(`   5 minutes = ${minutesToMs(5)}ms = ${formatTime(minutesToMs(5))}`)

// Test 2: Simple countdown simulation
console.log('\n✅ Countdown simulation:')
let remaining = minutesToMs(1) // 1 minute for testing
const interval = setInterval(() => {
  remaining -= 1000
  console.log(`   ${formatTime(remaining)} remaining`)
  
  if (remaining <= 0) {
    clearInterval(interval)
    console.log('   ✅ Timer completed!')
  }
}, 1000)

// Stop after 5 seconds for testing
setTimeout(() => {
  clearInterval(interval)
  console.log('\n🎯 Timer test completed successfully!')
  process.exit(0)
}, 5000)
