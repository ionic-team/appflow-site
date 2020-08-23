export const importGsap = (callback: () => void) => {    
  if (window.gsap) return callback();

  const gsapCdn = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.min.js';
  const scriptAlreadyLoading = Array.from(document.scripts).some(script => {
    if (script.src === gsapCdn) {
      script.addEventListener('load', () => {
        callback();
      })
      return true;
    }
  });

  if (scriptAlreadyLoading) return;
  
  const script = document.createElement('script');
  script.src = gsapCdn;

  script.onload = () => {
    callback();
  }
  
  script.onerror = () => console.error('error loading gsap library from: ', gsapCdn);      

  document.body.appendChild(script);  
}