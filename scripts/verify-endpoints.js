async function check() {
  const homeRes = await fetch('http://localhost:3000/');
  const homeHtml = await homeRes.text();
  console.log('Homepage status:', homeRes.status);
  console.log('Homepage has Top 10 Servicii Populare (should be false):', homeHtml.includes('Top 10 Servicii Populare'));
  console.log('Homepage has /explore?type=servicii:', homeHtml.includes('/explore?type=servicii'));

  const exploreRes = await fetch('http://localhost:3000/explore?type=servicii');
  const exploreHtml = await exploreRes.text();
  console.log('Explore status:', exploreRes.status);
  console.log('Explore has 1. Curatenie & Igienizare:', exploreHtml.includes('1. Cur\u0103\u021benie & Igienizare'));
  console.log('Explore has 10. Hostess:', exploreHtml.includes('10. Hostess & Primire Oaspe\u021bi'));
  console.log('Explore in service mode has space category "cocina" (should be false):', exploreHtml.includes('value="cocina"'));
}
check();
