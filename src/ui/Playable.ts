
export interface Playable {
	playState: 'play' | 'pause' | 'stop'
	play(): void
	pause(): void
	togglePlayState(): void
}