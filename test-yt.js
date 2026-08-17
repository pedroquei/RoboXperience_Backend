const url = 'https://www.youtube.com/watch?v=qHUuWmEPf2A';
fetch(url)
  .then(res => res.text())
  .then(html => {
    const match = html.match(/"lengthSeconds":"(\d+)"/);
    console.log(match ? match[1] : 'Not found');
  })
  .catch(console.error);
