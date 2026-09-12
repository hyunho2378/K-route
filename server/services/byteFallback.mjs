const FALLBACK_TOKEN = /<0x([0-9a-fA-F]{2})>/g
const INCOMPLETE_TOKEN = /^<(?:0(?:[xX](?:[0-9a-fA-F]{0,2})?)?)?$/

function splitIncompleteToken(text) {
  const start = text.lastIndexOf('<')
  if (start < 0) return { ready: text, carry: '' }
  const suffix = text.slice(start)
  return INCOMPLETE_TOKEN.test(suffix)
    ? { ready: text.slice(0, start), carry: suffix }
    : { ready: text, carry: '' }
}

function completePrefixLength(bytes) {
  let i = 0
  let cut = 0
  while (i < bytes.length) {
    const lead = bytes[i]
    const need = lead <= 0x7f ? 1
      : lead >= 0xc2 && lead <= 0xdf ? 2
        : lead >= 0xe0 && lead <= 0xef ? 3
          : lead >= 0xf0 && lead <= 0xf4 ? 4
            : 1
    if (bytes.length - i < need) break
    let valid = true
    for (let j = 1; j < need; j++) {
      if ((bytes[i + j] & 0xc0) !== 0x80) { valid = false; break }
    }
    i += valid ? need : 1
    cut = i
  }
  return cut
}

export function createByteFallbackAssembler({ maxDeferredChunks = 2 } = {}) {
  let tokenCarry = ''
  let pendingBytes = []
  let deferredText = ''
  let idleChunks = 0

  const flushCompleteBytes = () => {
    const cut = completePrefixLength(pendingBytes)
    if (!cut) return ''
    let out = Buffer.from(pendingBytes.slice(0, cut)).toString('utf8')
    pendingBytes = pendingBytes.slice(cut)
    if (!pendingBytes.length && deferredText) {
      out += deferredText
      deferredText = ''
    }
    return out
  }

  const forcePending = () => {
    const out = Buffer.from(pendingBytes).toString('utf8') + deferredText
    pendingBytes = []
    deferredText = ''
    idleChunks = 0
    return out
  }

  const appendPlain = (text) => {
    if (!text) return ''
    if (pendingBytes.length) { deferredText += text; return '' }
    return text
  }

  return {
    push(chunk = '') {
      const combined = tokenCarry + chunk
      const split = splitIncompleteToken(combined)
      tokenCarry = split.carry
      const ready = split.ready
      let out = ''
      let cursor = 0
      let sawByte = false

      FALLBACK_TOKEN.lastIndex = 0
      for (const match of ready.matchAll(FALLBACK_TOKEN)) {
        out += appendPlain(ready.slice(cursor, match.index))
        pendingBytes.push(parseInt(match[1], 16))
        sawByte = true
        out += flushCompleteBytes()
        cursor = match.index + match[0].length
      }
      out += appendPlain(ready.slice(cursor))

      if (pendingBytes.length) {
        idleChunks = sawByte ? 0 : idleChunks + 1
        if (idleChunks >= maxDeferredChunks) out += forcePending()
      } else {
        idleChunks = 0
      }
      return out
    },

    finish() {
      let out = appendPlain(tokenCarry)
      tokenCarry = ''
      out += flushCompleteBytes()
      if (pendingBytes.length) out += forcePending()
      else if (deferredText) { out += deferredText; deferredText = '' }
      return out
    }
  }
}
