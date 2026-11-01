import { PMREMGenerator, type Texture, type WebGLRenderer } from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/**
 * Soft studio reflections generated on the GPU from a procedural room — no HDR
 * file to download.
 */
export function createEnvironment(renderer: WebGLRenderer): Texture {
  const pmrem = new PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const texture = pmrem.fromScene(room, 0.04).texture
  room.dispose()
  pmrem.dispose()
  return texture
}
