import test from 'node:test'
import assert from 'node:assert/strict'
import { createByteFallbackAssembler } from './byteFallback.mjs'

test('순수 바이트 폴백을 한글로 조립한다', () => {
  const a = createByteFallbackAssembler()
  assert.equal(a.push('<0xEC><0x90><0xAC>'), '쐬')
  assert.equal(a.finish(), '')
})

test('일반 텍스트와 섞인 폴백만 골라 조립한다', () => {
  const a = createByteFallbackAssembler()
  assert.equal(a.push('동해<0xEC><0x90><0xAC>바람'), '동해쐬바람')
})

test('바이트 토큰이 여러 content chunk로 나뉘어도 조립한다', () => {
  const a = createByteFallbackAssembler()
  assert.equal(a.push('<0xEC>'), '')
  assert.equal(a.push('<0x90>'), '')
  assert.equal(a.push('<0xAC>'), '쐬')
})

test('폴백 표기 자체가 chunk 경계에서 잘려도 조립한다', () => {
  const a = createByteFallbackAssembler()
  assert.equal(a.push('<0x'), '')
  assert.equal(a.push('EC><0x90><0xAC>'), '쐬')
})

test('일반 마크다운은 바꾸지 않는다', () => {
  const a = createByteFallbackAssembler()
  assert.equal(a.push('- **묵호항**: 산책하기 좋아요.'), '- **묵호항**: 산책하기 좋아요.')
})

test('끝까지 닫히지 않은 폴백 표기는 EOF에서 유실하지 않는다', () => {
  const a = createByteFallbackAssembler()
  assert.equal(a.push('동해<0x'), '동해')
  assert.equal(a.finish(), '<0x')
})
