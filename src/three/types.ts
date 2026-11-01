import type { Capabilities } from './capabilities'

/** What every scene module receives from <ThreeStage>. */
export type SceneContext = {
  caps: Capabilities
  /** The GPU dropped the context; the stage shows its poster again. */
  onContextLost: () => void
}

export type SceneHandle = {
  dispose(): void
}

export type SceneModule<TOptions, THandle extends SceneHandle> = {
  mount(host: HTMLElement, context: SceneContext, options: TOptions): Promise<THandle>
}
