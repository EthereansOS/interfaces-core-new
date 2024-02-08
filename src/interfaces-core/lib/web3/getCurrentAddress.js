export default function getCurrentAddress() {
  return window.localStorage.getItem('walletAddress') ?? ''
}
