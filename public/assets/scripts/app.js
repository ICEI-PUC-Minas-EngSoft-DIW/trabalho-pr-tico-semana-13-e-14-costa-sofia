const API_BASE = 'http://localhost:3000';
const ENTITY = 'gallery';
const ENDPOINT = `${API_BASE}/${ENTITY}`;

async function apiGetAll() {
  const res = await fetch(ENDPOINT);
  if (!res.ok) throw new Error('Falha ao buscar dados');
  return res.json();
}

async function apiGetById(id) {
  const res = await fetch(`${ENDPOINT}/${id}`);
  if (!res.ok) throw new Error('Item não encontrado');
  return res.json();
}

async function apiCreate(item) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error('Falha ao criar item');
  return res.json();
}

async function apiUpdate(id, item) {
  const res = await fetch(`${ENDPOINT}/${id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error('Falha ao atualizar item');
  return res.json();
}

async function apiDelete(id) {
  const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Falha ao deletar item');
  return true;
}

async function renderHome() {
  const carouselContainer = document.querySelector('#carouselExampleAutoplaying .carousel-inner');
  const cardsContainer = document.getElementById('cards-container');

  try {
    const gallery = await apiGetAll();

    if (carouselContainer) {
      carouselContainer.innerHTML = '';
      gallery.forEach((item, index) => {
        const activeClass = index === 0 ? 'active' : '';
        const carouselItem = `
          <div class="carousel-item detalhescarousel ${activeClass}">
            <a href="detalhes.html?id=${item.id}">
              <img src="${item.imagem}" class="d-block w-100" alt="${item.titulo}" style="height:80vh; object-fit:cover;">
            </a>
          </div>
        `;
        carouselContainer.insertAdjacentHTML('beforeend', carouselItem);
      });
    }

    if (cardsContainer) {
      cardsContainer.innerHTML = '';
      gallery.forEach(item => {
        const card = `
          <div class="col-md-4 mb-4">
            <a href="detalhes.html?id=${item.id}" class="text-decoration-none">
              <div class="card h-500 bg-transparent border-light text-white">
                <img src="${item.imagem}" class="card-img-top" alt="${item.titulo}" style="object-fit: cover; height:500px;">
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title itenstitle">${item.titulo}</h5>
                  <p class="card-text">${item.descricao}</p>
                  <p class="mt-auto fw-bold">R$ ${Number(item.price).toFixed(2)}</p>
                </div>
              </div>
            </a>
          </div>
        `;
        cardsContainer.insertAdjacentHTML('beforeend', card);
      });
    }

  } catch (err) {
    console.error(err);
    if (cardsContainer) cardsContainer.innerHTML = `<p class="text-danger">Erro carregando dados: ${err.message}</p>`;
  }
}

async function renderDetalhes() {
  const itemDetalhes = document.getElementById('item-detalhes');
  if (!itemDetalhes) return;

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = parseInt(urlParams.get('id'));
  if (!itemId) {
    itemDetalhes.innerHTML = '<p class="text-danger text-center">ID inválido</p>';
    return;
  }

  try {
    const item = await apiGetById(itemId);

    itemDetalhes.innerHTML = `
      <div class="col-12 mb-3">
        <div class="item-image" style="
          width: 100%;
          height: 70vh;
          background-image: url('${item.imagem}');
          background-position: center;
          background-size: cover;
          border-radius: 0.5rem;
        "></div>
      </div>
      <div class="col-12 col-md-8 offset-md-2 text-start mt-4">
        <h3>${item.titulo}</h3>
        <p><strong>Descrição:</strong> ${item.descricao}</p>
        <p><strong>Conteúdo:</strong> ${item.conteudo}</p>
        <p><strong>Categoria:</strong> ${item.categoria}</p>
        <p><strong>Autor:</strong> ${item.autor}</p>
        <p><strong>Data:</strong> ${item.data}</p>
        <p><strong>Preço:</strong> R$ ${Number(item.price).toFixed(2)}</p>
        <div class="mt-3 d-flex gap-2">
          <button id="btn-edit" class="btn btn-warning">Editar</button>
          <button id="btn-delete" class="btn btn-danger">Excluir</button>
        </div>
      </div>

      <!-- Formulário de edição -->
      <section id="editar-item" class="py-5 d-none">
        <div class="container">
          <h3 class="text-center mb-4">Editar Item</h3>
          <form id="form-update" class="mx-auto" style="max-width: 600px;">
            <div class="mb-3"><label class="form-label">Título</label>
              <input type="text" class="form-control" name="titulo" required />
            </div>
            <div class="mb-3"><label class="form-label">Descrição</label>
              <input type="text" class="form-control" name="descricao" required />
            </div>
            <div class="mb-3"><label class="form-label">Conteúdo</label>
              <textarea class="form-control" name="conteudo" rows="3" required></textarea>
            </div>
            <div class="mb-3"><label class="form-label">Categoria</label>
              <input type="text" class="form-control" name="categoria" required />
            </div>
            <div class="mb-3"><label class="form-label">Autor</label>
              <input type="text" class="form-control" name="autor" required />
            </div>
            <div class="mb-3"><label class="form-label">Data</label>
              <input type="date" class="form-control" name="data" required />
            </div>
            <div class="mb-3"><label class="form-label">Imagem (URL)</label>
              <input type="url" class="form-control" name="imagem" required />
            </div>
            <div class="mb-3"><label class="form-label">Preço</label>
              <input type="number" step="0.01" class="form-control" name="price" required />
            </div>
            <button type="submit" class="btn btn-success w-100">Salvar Alterações</button>
          </form>
        </div>
      </section>
    `;

    const btnDelete = document.getElementById('btn-delete');
    if (btnDelete) {
      btnDelete.addEventListener('click', async () => {
        if (!confirm('Confirma exclusão deste item?')) return;
        try {
          await apiDelete(itemId);
          alert('Item excluído com sucesso!');
          window.location.href = 'index.html';
        } catch (err) {
          alert('Erro ao excluir: ' + err.message);
        }
      });
    }

    const btnEdit = document.getElementById('btn-edit');
    const sectionEdit = document.getElementById('editar-item');
    const formUpdate = document.getElementById('form-update');

    if (btnEdit && sectionEdit && formUpdate) {
      btnEdit.addEventListener('click', () => {
        sectionEdit.classList.remove('d-none');
        formUpdate.titulo.value = item.titulo;
        formUpdate.descricao.value = item.descricao;
        formUpdate.conteudo.value = item.conteudo;
        formUpdate.categoria.value = item.categoria;
        formUpdate.autor.value = item.autor;
        formUpdate.data.value = item.data;
        formUpdate.imagem.value = item.imagem;
        formUpdate.price.value = item.price;
        formUpdate.dataset.id = item.id;
      });

      formUpdate.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = formUpdate.dataset.id;
        const formData = new FormData(formUpdate);
        const obj = Object.fromEntries(formData.entries());
        if (obj.price) obj.price = Number(obj.price);
        try {
          await apiUpdate(id, obj);
          alert('Item atualizado com sucesso!');
          window.location.reload();
        } catch (err) {
          alert('Erro ao atualizar: ' + err.message);
        }
      });
    }

  } catch (err) {
    console.error(err);
    itemDetalhes.innerHTML = `<p class="text-danger text-center">Erro: ${err.message}</p>`;
  }
}


async function handleCreateForm(formElement) {
  const form = new FormData(formElement);
  const obj = Object.fromEntries(form.entries());
  if (obj.price) obj.price = Number(obj.price);
  try {
    await apiCreate(obj);
    alert('Criado com sucesso!');
    window.location.href = 'index.html';
  } catch (err) {
    alert('Erro ao criar: ' + err.message);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cards-container')) renderHome();
  if (document.getElementById('item-detalhes')) renderDetalhes();

  const formCreate = document.getElementById('form-create');
  if (formCreate) {
    formCreate.addEventListener('submit', (e) => {
      e.preventDefault();
      handleCreateForm(formCreate);
    });
  }
});
