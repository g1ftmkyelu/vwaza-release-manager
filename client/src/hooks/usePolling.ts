import { useEffect, useRef } from 'react';


const usePolling = (callback: () => Promise<void>, interval: number, enabled: boolean = true) => {
  const callbackRef = useRef(callback);


  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      try {
        await callbackRef.current();
      } catch (error) {
        console.error('Polling callback failed:', error);
      
      } finally {
    
        timeoutId = setTimeout(poll, interval);
      }
    };


    poll();


    return () => {
      clearTimeout(timeoutId);
    };
  }, [interval, enabled]);
};

export default usePolling;