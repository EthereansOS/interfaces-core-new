import CreateRoutine from '../routine/create'

const Create = props => <CreateRoutine {...props}/>

Create.menuVoice = {
    path : '/covenants/dapp/create/routine/:id',
    exact : false
}

export default Create