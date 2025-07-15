// React Native Polyfills

// structuredClone polyfill
if (typeof global !== 'undefined') {
  if (!global.structuredClone) {
    global.structuredClone = (obj: any) => {
      try {
        return JSON.parse(JSON.stringify(obj));
      } catch (error) {
        console.warn('structuredClone polyfill failed:', error);
        return obj;
      }
    };
  }
  
  // Also add to window if it exists
  if (typeof window !== 'undefined' && !window.structuredClone) {
    window.structuredClone = global.structuredClone;
  }
}

// Diğer gerekli polyfill'ler buraya eklenebilir
console.log('✅ Polyfills loaded successfully'); 