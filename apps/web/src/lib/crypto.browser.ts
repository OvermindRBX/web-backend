export function encryptdata(plaintext: string): string {
  try {
    return btoa(unescape(encodeURIComponent(plaintext)))
  } catch {
    return btoa(plaintext)
  }
}

export function decryptdata(ciphertext: string): string {
  try {
    return decodeURIComponent(escape(atob(ciphertext)))
  } catch {
    return atob(ciphertext)
  }
}

export async function encryptstream(readable: ReadableStream<Uint8Array>): Promise<ReadableStream<Uint8Array>> {
  const reader = readable.getReader()
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  
  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const text = decoder.decode(value)
          const encrypted = await encryptdata(text)
          controller.enqueue(encoder.encode(encrypted + "\n"))
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
}

export async function decryptstream(readable: ReadableStream<Uint8Array>): Promise<ReadableStream<Uint8Array>> {
  const reader = readable.getReader()
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let buffer = ""
  
  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            if (buffer.trim()) {
              try {
                const decrypted = await decryptdata(buffer.trim())
                controller.enqueue(encoder.encode(decrypted))
              } catch {}
            }
            break
          }
          
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                const decrypted = await decryptdata(line.trim())
                controller.enqueue(encoder.encode(decrypted))
              } catch {}
            }
          }
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
}
