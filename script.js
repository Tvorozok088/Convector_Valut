const API_URL = "https://api.exchangerate-api.com/v4/latest/";
let baseCurrency = "RUB";

const translations = {
  en: {
    title: "Currency Converter",
    currentRates: "Current exchange rates relative to",
    currency: "Currency",
    rate: "Rate",
    convert: "Convert",
    error: "Please enter a valid amount.",
    result: "Result",
    selectBaseCurrency: "Select base currency",
    switchToRussian: "Switch to Russian",
    switchToEnglish: "Switch to English",
  },
  ru: {
    title: "Конвертер валют",
    currentRates: "Текущие курсы валют относительно",
    currency: "Валюта",
    rate: "Курс",
    convert: "Конвертировать",
    error: "Введите корректную сумму.",
    result: "Результат",
    selectBaseCurrency: "Выберите базовую валюту",
    switchToRussian: "Переключиться на английсткий",
    switchToEnglish: "Switch to English",
  },
};



let currentLanguage = "en";

document
  .getElementById("converterBtn")
  .addEventListener("click", loadConverter);
document.getElementById("ratesBtn").addEventListener("click", loadRates);

function loadConverter() {
  document.getElementById("mainContent").innerHTML = `
        <h2>${translations[currentLanguage].title}</h2>
        <input type="number" id="amountInput" placeholder="${translations[currentLanguage].result}" min="0" step="0.01">
        <select id="fromCurrencySelect"></select>
        <select id="toCurrencySelect"></select>
        <button id="convertBtn">${translations[currentLanguage].convert}</button>
        <p class="result" id="conversionResult"></p>
        <p class="error" id="conversionError"></p>
        <button id="switchLanguageBtn">${translations[currentLanguage].switchToRussian}</button>
    `;

  const currencies = ["USD", "EUR", "RUB"];
  const fromCurrencySelect = document.getElementById("fromCurrencySelect");
  const toCurrencySelect = document.getElementById("toCurrencySelect");

  currencies.forEach((currency) => {
    fromCurrencySelect.innerHTML += `<option value="${currency}">${currency}</option>`;
    toCurrencySelect.innerHTML += `<option value="${currency}">${currency}</option>`;
  });

  document
    .getElementById("convertBtn")
    .addEventListener("click", convertCurrency);
  document
    .getElementById("switchLanguageBtn")
    .addEventListener("click", switchLanguage);
}

function loadRates() {
  document.getElementById("mainContent").innerHTML = `
        <h2>${translations[currentLanguage].currentRates} ${baseCurrency}</h2>
        <select id="baseCurrencySelect"></select>
        <div class="table-container">
            <table id="ratesTable">
                <thead>
                    <tr>
                        <th>${translations[currentLanguage].currency}</th>
                        <th>${translations[currentLanguage].rate}</th>
                    </tr>
                </thead>
                <tbody id="ratesList"></tbody>
            </table>
        </div>
        <button id="switchLanguageBtn">${translations[currentLanguage].switchToRussian}</button>
    `;

  const currencies = ["USD", "EUR", "RUB"];
  const baseCurrencySelect = document.getElementById("baseCurrencySelect");

  currencies.forEach((currency) => {
    baseCurrencySelect.innerHTML += `<option value="${currency}">${currency}</option>`;
  });

  baseCurrencySelect.value = baseCurrency;

  baseCurrencySelect.addEventListener("change", (event) => {
    baseCurrency = event.target.value;
    fetchRates();
  });

  fetchRates();
}

async function fetchRates() {
  try {
    const response = await fetch(API_URL + baseCurrency);
    const data = await response.json();
    displayRates(data.rates);
  } catch (error) {
    console.error("Ошибка при получении курсов валют:", error);
    document.getElementById("ratesList").innerHTML =
      '<tr><td colspan="2" class="error">Не удалось загрузить курсы валют.</td></tr>';
  }
}

function displayRates(rates) {
  const ratesList = document.getElementById("ratesList");
  ratesList.innerHTML = "";

  const baseRow = document.createElement("tr");
  baseRow.innerHTML = `<td>${baseCurrency}</td><td>1</td>`;
  ratesList.appendChild(baseRow);

  for (const [currency, rate] of Object.entries(rates)) {
    if (currency !== baseCurrency) {
      const listItem = document.createElement("tr");
      listItem.innerHTML = `<td>${currency}</td><td>${rate.toFixed(2)}</td>`;
      ratesList.appendChild(listItem);
    }
  }
}

async function convertCurrency() {
  const amount = parseFloat(document.getElementById("amountInput").value);
  const fromCurrency = document.getElementById("fromCurrencySelect").value;
  const toCurrency = document.getElementById("toCurrencySelect").value;

  if (isNaN(amount) || amount <= 0) {
    document.getElementById("conversionError").textContent =
      translations[currentLanguage].error;
    return;
  }

  try {
    const response = await fetch(API_URL + fromCurrency);
    const data = await response.json();
    const rate = data.rates[toCurrency];

    if (rate) {
      const result = (amount * rate).toFixed(2);
      document.getElementById(
        "conversionResult"
      ).textContent = `${amount} ${fromCurrency} = ${result} ${toCurrency}`;
      document.getElementById("conversionError").textContent = "";
    } else {
      document.getElementById("conversionError").textContent =
        "Не удалось получить курс.";
    }
  } catch (error) {
    console.error("Ошибка при конвертации:", error);
    document.getElementById("conversionError").textContent =
      "Ошибка при получении данных.";
  }
}

function switchLanguage() {
  currentLanguage = currentLanguage === "en" ? "ru" : "en";

  if (document.getElementById("amountInput")) {
    loadConverter();
  } else {
    loadRates();
  }
}

loadConverter();
