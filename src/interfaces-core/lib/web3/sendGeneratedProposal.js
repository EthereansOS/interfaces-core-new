import generateAndCompileContract from './generateAndCompileContract'

/**
 * Send generated proposal
 *
 * @param element
 * @param ctx
 * @param template
 * @param lines
 * @param descriptions
 * @param updates
 * @param prefixedLines
 * @param postFixedLines
 * @return {Object}
 */
function sendGeneratedProposal(
  element,
  ctx,
  template,
  lines,
  descriptions,
  updates,
  prefixedLines,
  postFixedLines
) {
  const initialContext = {
    element,
    functionalityName: '',
    functionalitySubmitable: true,
    functionalityMethodSignature: 'callOneTime(address)',
    functionalityReplace: '',
    functionalityInternal: false,
    functionalityNeedsSender: false,
    emergency: false,
    template,
    lines,
    descriptions,
    updates,
    prefixedLines,
    postFixedLines,
    sequentialOps: template && [
      {
        name: 'Generating Smart Contract proposal',
        async call(data) {
          const generatedAndCompiled = await generateAndCompileContract(
            data.template,
            data.lines,
            data.descriptions,
            data.updates,
            data.prefixedLines,
            data.postFixedLines
          )
          data.sourceCode = generatedAndCompiled.sourceCode
          data.selectedContract = generatedAndCompiled.selectedContract
        },
      },
    ],
  }
  return { ...initialContext, ...ctx }
}

export default sendGeneratedProposal
