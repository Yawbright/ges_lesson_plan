// Test script to call the test-arkesel function
// Run this in your browser console or with: node test-arkesel-client.mjs

const supabaseUrl = 'https://xzgflafcenfnwiqexxuf.supabase.co';
const functionUrl = `${supabaseUrl}/functions/v1/test-arkesel`;

console.log('Testing Arkesel endpoint...');
console.log('URL:', functionUrl);

fetch(functionUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Z2ZsYWZjZW5mbndpcWV4eHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYzNzc0MTAsImV4cCI6MjAzMTk1MzQxMH0.4s1jJtmjkEJgxJq-iL5zxrMFLaKz2E5L4B3KjV8OnQI',
  },
})
  .then(res => {
    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers));
    return res.json();
  })
  .then(data => {
    console.log('Response data:', JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error('Error:', err.message);
  });
