import CreateFarming from '../farming/create'

const Create = props => <CreateFarming {...props}/>

Create.menuVoice = {
    path : '/covenants/create/farming/:rewardTokenAddress',
    exact : false
}

export default Create