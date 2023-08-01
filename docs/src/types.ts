export interface StandingWave {
  eigenvalue: number
  eigenvector: number[]
}

export type MaybeStandingWaves = StandingWave[] | "loading"
