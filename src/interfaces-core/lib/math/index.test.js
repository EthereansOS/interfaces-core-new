import './index'

describe('math utils', () => {
  test('sum numbers', () => {
    expect('2'.ethereansosAdd(5)).toEqual('7')
    expect(Number(2).ethereansosAdd(5)).toEqual('7')
  })

  test('subtract numbers', () => {
    expect('2'.ethereansosSub(5)).toEqual('-3')
    expect(Number(2).ethereansosSub(5)).toEqual('-3')
  })

  test('multiply numbers', () => {
    expect('2'.ethereansosMul(5)).toEqual('10')
    expect(Number(2).ethereansosMul(5)).toEqual('10')
  })

  test('divide numbers', () => {
    expect('20'.ethereansosDiv(5)).toEqual('4')
    expect(Number(20).ethereansosDiv(5)).toEqual('4')
  })
})
