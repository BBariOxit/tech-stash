export function calculateReadTime(text: string): number {
  if (!text) return 1;
  
  const WPM = 225; // Average reading speed of 225 words per minute
  // Split string by whitespaces to count words
  const wordCount = text.trim().split(/\s+/).length; 
  
  // Divide by WPM and round up
  const time = Math.ceil(wordCount / WPM); 
  
  // Return at least 1 minute
  return time === 0 ? 1 : time; 
}
