import type { WaveComponent } from "./sidebar"
import type { StandingWave } from "./types"

/**
 * @param waveComponents - [{ index, coefficient }]
 * @param standingWaves - [{ eigenvalue, eigenvector }]
 * @param timestamp - time in milliseconds
 * @returns weighted sum of wave components
 */
export function weightedWave(
  waveComponents: WaveComponent[],
  standingWaves: StandingWave[],
  slowdown: number,
  timestamp: number
) {
  const wave = new Array(standingWaves[0].eigenvector.length).fill(0)
  const amplitudeMax = new Array(standingWaves[0].eigenvector.length).fill(0)
  for (const { index, coefficient } of waveComponents) {
    if (standingWaves[index] == null) continue
    const { eigenvector, eigenvalue } = standingWaves[index]
    const oscillation = Math.cos(timestamp * eigenvalue / slowdown)
    wave.forEach((_, i) => {
      wave[i] += coefficient * eigenvector[i] * oscillation
      amplitudeMax[i] += Math.abs(coefficient * eigenvector[i])
    })
  }
  const maxAmplitude = Math.max(...amplitudeMax)
  return wave.map(x => x / maxAmplitude)
}
