const fs = require('fs');
const https = require('https');

const url = 'https://jdjpefsxwposeityyccl.supabase.co/rest/v1/posts?select=content&slug=eq.typed-arrays-trong-javascript-toi-uu-hieu-nang';

const options = {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkanBlZnN4d3Bvc2VpdHl5Y2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzQwNjYsImV4cCI6MjA5MjUxMDA2Nn0.J-m54zkr-kLQ2ZDFBGFYk07S6Eqr7YjLQ7RxbXM0p74',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkanBlZnN4d3Bvc2VpdHl5Y2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzQwNjYsImV4cCI6MjA5MjUxMDA2Nn0.J-m54zkr-kLQ2ZDFBGFYk07S6Eqr7YjLQ7RxbXM0p74'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    if (json && json[0] && json[0].content) {
      fs.writeFileSync('scratch/post_content.html', json[0].content);
      console.log('Successfully saved to scratch/post_content.html');
    } else {
      console.log('No content found', json);
    }
  });
}).on('error', (err) => {
  console.error(err);
});
