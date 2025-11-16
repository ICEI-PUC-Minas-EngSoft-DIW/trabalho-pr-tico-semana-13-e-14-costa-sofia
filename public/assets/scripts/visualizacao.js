const API_BASE = 'http://localhost:3000/gallery';

// Busca os dados do JSON Server
async function carregarDados() {
  const res = await fetch(API_BASE);
  return res.json();
}

async function gerarGrafico() {
  const dados = await carregarDados();

  // Agrupar quantidade por autor
  const autores = {};
  dados.forEach(item => {
    if (!autores[item.autor]) autores[item.autor] = 0;
    autores[item.autor]++;
  });

  const labels = Object.keys(autores);
  const values = Object.values(autores);

  const ctx = document.getElementById('chartAutores');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Número de artes cadastradas',
        data: values,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', gerarGrafico);
