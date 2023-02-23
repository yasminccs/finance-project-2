function createDivContainer(id) {
  const div = document.createElement("div");
  div.id = `div-${id}`;
  return div;
}
function createP(title) {
  const p = document.createElement("p");
  p.innerHTML = `<strong>Tipo de transação:</strong> ${title}`;
  return p;
}
function amountDisplay(value) {
  const span = document.createElement("span");
  const formater = Intl.NumberFormat("pt-BR", {
    compactDisplay: "long",
    currency: "BRL",
    style: "currency",
  }).format(value);
  span.textContent = formater
  const p = document.createElement('p')
  p.innerHTML = `<strong>Valor:</strong> `

  if (value > 0) {
    span.classList.add("credit");
  } else {
    span.classList.add("debit");
  }
  p.appendChild(span)
  return p;
}
function createDescription(description) {
  const p = document.createElement("p");
  p.innerHTML = `<strong>Descrição:</strong> ${description}`;
  return p;
}
function createDate() {
  const p = document.createElement("p");
  p.innerHTML = `<strong>Data:</strong> ${new Date()}`;
  return p;
}

function renderItems(transactions) {
  const divContainer = createDivContainer(transactions.id);
  const typeTransaction = createP(transactions.typeTrans);
  const amount = amountDisplay(transactions.value);
  const description = createDescription(transactions.description);
  const date = createDate();
  const btnEdit = createBtnEdit(transactions)
  const btnDelete = createBtnDelete(transactions.id)

  divContainer.append(typeTransaction, amount, description, date, btnEdit, btnDelete);
  document.querySelector("#allTransitions").appendChild(divContainer);
}

async function fetchTrans() {
  return await fetch("http://localhost:3000/transactions").then((res) =>
    res.json()
  );
}

let allTransactions = [];

document.addEventListener("DOMContentLoaded", async function setupTransactions() {
    const results = await fetchTrans();
    allTransactions.push(...results);
    allTransactions.forEach(renderItems);
    updateBalance();
  }
);

function updateBalance() {
  const balance = document.querySelector("#balance");
  const count = allTransactions.reduce(
    (acc, transactions) => acc + transactions.value,
    0
  );
  const formater = Intl.NumberFormat("pt-BR", {
    compactDisplay: "long",
    currency: "BRL",
    style: "currency",
  });
  balance.innerText = `Saldo: ${formater.format(count)}`;
}

document.querySelector("#typeTrans").addEventListener("click", ev => {
  const target = ev.target;
  const amountValue = document.querySelector("#nmrValue").value;
  const amount = document.querySelector("#nmrValue");
  if (target.id === "credit") {
    amount.value = amountValue * -1;
  } else if (target.id === "debit") {
    amount.value = amountValue * -1;
  }
});

async function saveTransactions(ev) {

  const id = document.querySelector("#id").value;

  const sectionData = {
    typeTrans: document.querySelector('select[name="options"]').value,
    value: Number(document.querySelector("#nmrValue").value),
    description: document.querySelector("#descript").value,
  };

  if (id) {
    const response = await fetch(`http://localhost:3000/transactions/${nmr}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sectionData),
    });
    const transaction = await response.json();

    const indexToRemove = allTransactions.findIndex((t) => t.id === id);
    allTransactions.splice(indexToRemove, 1, transaction);
    document.querySelector(`#div-${id}`).remove();
    renderItems(transaction);
  } else {
    const response = await fetch("http://localhost:3000/transactions", {
      method: "POST",
      body: JSON.stringify(sectionData),
      headers: {
        "Content-Type": "application/json",
      }
    });
    const transaction = await response.json();
    allTransactions.push(transaction)
    renderItems(transaction)
  }

  ev.target.reset()
  updateBalance()
}
document.querySelector("form").addEventListener("submit", saveTransactions);

function createBtnEdit(transaction){
    const btnEdit = document.createElement('button')
    btnEdit.id = 'editBtn'
    btnEdit.textContent = 'Editar'

    btnEdit.addEventListener('click', () => {
        document.querySelector("#id").value = transaction.id
        document.querySelector('select[name="options"]').value = transaction.typeTrans
        document.querySelector("#nmrValue").value = transaction.value
        document.querySelector("#descript").value = transaction.description
    })
    return btnEdit
}

function createBtnDelete(id){
    const btnDelete = document.createElement('button')
    btnDelete.classList.add('delete-btn')
    btnDelete.id = 'deleteBtn'
    btnDelete.textContent = 'Excluir'

    btnDelete.addEventListener('click', async () => {
        await fetch(`http://localhost:3000/transactions/${id}`, { method: "DELETE" })
        document.querySelector(`#div-${id}`).remove()
        const indexToRemove = allTransactions.findIndex((t) => t.id === id);
        allTransactions.splice(indexToRemove, 1);
        updateBalance();
    })
    return btnDelete
}