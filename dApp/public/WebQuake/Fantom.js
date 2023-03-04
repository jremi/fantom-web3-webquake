Fantom = {};

Fantom.getWalletAddress = function () {
  const fantomData = {
    fantomAddress: window.ethereum.selectedAddress || '',
    fantomNetwork: window.ethereum.networkVersion || '',
    fantomAddressMessage: window.addressMessage || localStorage.getItem('addressMessage') || '', 
    fantomAddressSignature: window.addressSignature || localStorage.getItem('addressSignature') || '',
  };
  return `?fantom=${encodeURIComponent(JSON.stringify(fantomData))}`;
};
