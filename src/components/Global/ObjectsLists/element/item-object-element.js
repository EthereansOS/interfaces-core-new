import style from '../objects-lists.module.css'

export default ({item}) => {
    return (
      <a className={style.TokenObject}>
        <figure>
            <img src={`${process.env.PUBLIC_URL}/img/test.jpg`}></img>
        </figure>
        <div className={style.ObjectInfo}>
          <div className={style.ObjectInfoAndLink}>
            <h5>{item.name} ({item.symbol})</h5>
            <a>Etherscan</a>
            <a className={style.LinkCool} target="_blank" >Item</a>
          </div>
          <div className={style.ObjectInfoBalance}>
            <p>{0}</p>
            <span>Balance</span>
          </div>
        </div>
      </a>
    )
  }