import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

export function useCustomFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        // For web, we'll use the Google Fonts link
        // For native, you would download and include the font files
        // Since we're using web fonts via CSS, we just mark as loaded
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true); // Still set to true to prevent blocking
      }
    }

    loadFonts();
  }, []);

  return fontsLoaded;
}
