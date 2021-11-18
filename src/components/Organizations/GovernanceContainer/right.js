import React from 'react'

export default ({element, proposalType}) => {
  return (
    <div>
        {proposalType === 'poll' && <>Poll</>}
        {proposalType === 'test' && <>A</>}
        {proposalType === 'gino' && <>B</>}
        {proposalType === 'paoli' && <>C</>}
        {proposalType === 'gigi' && <>D</>}
    </div>
  )
}