import CreateFarming from '../farming/create'

const Create = props => <CreateFarming {...props}/>

Create.menuVoice = {
    path : '/covenants/dapp/create/farming/:rewardTokenAddress',
    exact : false
}

export default Create