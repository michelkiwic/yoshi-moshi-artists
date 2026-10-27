(()=>{
const measurementId='G-GLZ0H84MBV';
const storageKey='ym-analytics-consent-v1';
const readChoice=()=>{try{return localStorage.getItem(storageKey)}catch{return null}};
const saveChoice=value=>{try{localStorage.setItem(storageKey,value)}catch{}};
function enableAnalytics(){
  if(window.ymAnalyticsLoaded)return;
  window.ymAnalyticsLoaded=true;
  window.dataLayer=window.dataLayer||[];
  function gtag(){window.dataLayer.push(arguments)}
  window.gtag=gtag;
  gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  gtag('js',new Date());
  gtag('config',measurementId,{send_page_view:false});
  gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  gtag('event','page_view',{page_location:location.href,page_title:document.title,page_path:location.pathname});
  const script=document.createElement('script');
  script.async=true;
  script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(measurementId);
  document.head.append(script);
}
const analyticsToggle=document.getElementById('analytics-toggle');
const status=document.getElementById('analytics-settings-status');
function updateControl(){
  if(analyticsToggle)analyticsToggle.textContent=readChoice()==='rejected'?'Turn analytics on':'Turn analytics off';
}
if(analyticsToggle){
  analyticsToggle.addEventListener('click',()=>{
    if(readChoice()==='rejected'){
      saveChoice('accepted');
      enableAnalytics();
      if(status)status.textContent='Analytics has been turned on.';
    }else{
      saveChoice('rejected');
      if(window.ymAnalyticsLoaded)window.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      if(status)status.textContent='Analytics has been turned off.';
    }
    updateControl();
  });
  updateControl();
}
if(readChoice()!=='rejected')enableAnalytics();
})();
