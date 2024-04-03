import React, { useEffect } from 'react'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import './card.component.css'

gsap.registerPlugin(MotionPathPlugin)

function Card({ ensData, chainId, account, triggerConnect }) {
  useEffect(() => {
    const tl = gsap
      .timeline()
      .set('svg', { opacity: 1 })
      .set('.scratches', { rotation: 70, x: 450, y: -10 })
      .set('#tri2', { scale: 0.5 })
      .from(
        '#cardMask rect',
        {
          scale: 0,
          rotation: -20,
          duration: 2,
          transformOrigin: '50% 50%',
          ease: 'expo.inOut',
        },
        0
      )

      .from(
        '.coil',
        {
          attr: { 'stroke-dashoffset': (i) => (i === 1 ? -28 : 28) },
          ease: 'none',
          duration: 1,
          repeat: -1,
        },
        1
      )
      .fromTo(
        '#orb1',
        { y: 160 },
        { y: -20, ease: 'circ', repeat: -1, yoyo: true, duration: 1 },
        0.8
      )
      .from(
        '.logoPt',
        { x: (i) => [18, -10][i], duration: 1.2, ease: 'expo.inOut' },
        0.9
      )
      .from(
        'svg text',
        { x: -40, duration: 1.1, ease: 'expo.inOut', stagger: 0.2 },
        1
      )
      .from(
        'svg image',
        { x: -40, duration: 1.1, ease: 'expo.inOut', stagger: 0.2 },
        1
      )
      .from(
        '.txtBox',
        {
          scaleX: 0,
          transformOrigin: '100% 0',
          duration: 1.1,
          ease: 'expo.inOut',
          stagger: 0.2,
        },
        1
      )
      .fromTo(
        '#wave1',
        { x: 0, y: 0 },
        { duration: 5, x: -701, y: 815, repeat: -1, ease: 'none' },
        0
      )
      .fromTo(
        '#wave2',
        { x: 0, y: 0 },
        { duration: 6, x: 804, y: -917, repeat: -1, ease: 'none' },
        0
      )

    let starShine = gsap
      .timeline()
      .set('#star', { scale: 0, transformOrigin: '50% 50%', x: 2, y: 10 })
      .to(
        '#star',
        {
          scale: 1,
          repeat: 1,
          yoyo: true,
          yoyoEase: true,
          duration: 0.4,
          ease: 'power4',
        },
        0
      )
      .fromTo(
        '#star',
        { rotate: -20 },
        { rotate: 120, duration: 0.8, ease: 'none' },
        0
      )

    return () => {
      tl.kill()
      starShine.kill()
    }
  }, [])

  return (
    <div>
      <svg
        className="profileArea"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 600 368">
        <defs>
          <mask id="chipMask"></mask>
          <mask id="cardMask">
            <rect rx="20" ry="20" fill="#fff" width="600" height="368" />
          </mask>
          <clipPath id="orbClip1">
            <use xlinkHref="#orb1" />
            <use xlinkHref="#orb2" />
          </clipPath>
        </defs>
        <g mask="url(#cardMask)">
          <rect className="bg" fill="#403b61" width="100%" height="100%" />
          <g
            fill="none"
            stroke="#f09243"
            strokeWidth="40"
            strokeDasharray="6 2 4 2.5 4 3 3.5 3">
            <path
              id="midC"
              className="coil"
              d="M352.7,333.4c-79.2-30.9-137.8-142.9-100.6-235.7S386.5-16.5,449.6-11.7"
            />
          </g>

          <g fill="#555"></g>

          <g fill="#F09242">
            <path
              id="wave2"
              d="M-941,1510c89-58,147-115,211-201s142-153,210-195s144-42,208-86s69-130,70-173s5-129,38-193 c0,0,17.5-27.5,30.9-40.1C-159.6,609.4-137,593-137,593c89-58,147-115,211-201s142-153,210-195s144-42,208-86s69-130,70-173 s5-129,38-193v1765H-941z"
            />
          </g>
          <g fill="#f08932">
            <path
              id="wave1"
              d="M1551.5-1044.5c0,0-63,27-131,91s-122,185-186,244s-163,152.7-206,263.3s-90,162.7-128,189.7c0,0-14,10-26,16 c-16,8-24,11-24,11s-63,27-131,91s-122,185-186,244s-163,152.7-206,263.3c-9,23.2-18.2,43.9-27.5,62.3c56.5,0,1255.5-0.1,1255.5-0.1 L1551.5-1044.5z"
            />
          </g>

          <g clipPath="url(#orbClip1)">
            <use xlinkHref="#wave2" fill="#3f7773" />
            <use xlinkHref="#wave1" fill="#271b13" />
          </g>

          <path
            id="star"
            fill="#fff"
            d="M397,17.6c3-3,6.1-9.1,6.1-9.1s0.8,3.8,4.5,7.6c6.1,6.1,9.1,6.1,9.1,6.1s-3,1.5-7.6,6.1 s-6.1,9.1-6.1,9.1s-2.3-5.3-6.1-9.1s-8.3-5.3-8.3-5.3S394,20.6,397,17.6z"
          />

          <g fill="#fff" strokeLinecap="round">
            <g clipPath="url(#txtBoxes)">
              {/* <img
                x="45"
                y="110"
                src={`${process.env.PUBLIC_URL}/img/logo.png`}
                style={{ filter: 'brightness(0%) invert(1)' }}
                width="200"
                height="100"></img> */}
              <image
                x="45"
                y="110"
                href={`${process.env.PUBLIC_URL}/img/logo.png`}
                style={{ filter: 'brightness(0%) invert(1)' }}
                width="200"
                height="100"
              />
              <text x="480" y="60" fontSize="18">
                <a onClick={triggerConnect}>Disconnect</a>
              </text>
              <text x="45" y="60" fontSize="26">
                Profile
              </text>
              <text x="45" y="230" fontSize="19" fontWeight="bold">
                Holder Name
              </text>
              <text x="45" y="260" fontSize="16">
                {ensData?.name ? `${ensData.name}` : '-'}
              </text>
              <text x="45" y="290" fontSize="19" fontWeight="bold">
                Address
              </text>
              <text x="45" y="320" fontSize="16">
                <a
                  href={`${getNetworkElement(
                    { context, chainId },
                    'etherscanURL'
                  )}address/${account}`}
                  target="_blank">
                  {account}
                </a>
              </text>
            </g>

            <rect
              mask="url(#chipMask)"
              rx="5"
              ry="5"
              x="89"
              y="125"
              width="250"
              height="100"
            />
          </g>
        </g>
      </svg>
    </div>
  )
}

export default Card
