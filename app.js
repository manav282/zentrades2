let products = [];

function processFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  const csvOptionsContainer = document.getElementById('csvOptions');

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const fileContent = e.target.result;
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.json')) {
          csvOptionsContainer.style.display = 'none';
          processJSONFile(fileContent);
        } else if (fileName.endsWith('.csv')) {
          csvOptionsContainer.style.display = 'block';
        } else {
          console.error('Unsupported file format. Please upload a JSON or CSV file.');
        }
      } catch (error) {
        console.error('Error processing file:', error);
      }
    };
    reader.readAsText(file);
  }
}

function processJSONFile(jsonContent) {
  try {
    products = JSON.parse(jsonContent);
    populateDisplayOptions();
    displayData();
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
}

function importCSVData() {
  const fileInput = document.getElementById('fileInput');
  const delimiter = document.getElementById('delimiter').value;
  const encoding = document.getElementById('encoding').value;
  const hasHeader = document.getElementById('hasHeader').checked;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const fileContent = e.target.result;
      parseCSV(fileContent, delimiter, encoding, hasHeader);
    } catch (error) {
      console.error('Error processing CSV:', error);
    }
  };
  reader.readAsText(fileInput.files[0]);
}

function parseCSV(csvContent, delimiter, encoding, hasHeader) {
  Papa.parse(csvContent, {
    header: hasHeader,
    delimiter: delimiter,
    encoding: encoding,
    complete: function (results) {
      const csvData = results.data;
      // Update displayData based on the parsed CSV data
      products = { count: csvData.length, products: csvData };
      populateDisplayOptions();
      displayData();
    },
    error: function (error) {
      console.error('Error parsing CSV:', error.message);
    },
  });
}

function populateSelectOptions(selectId, options) {
  const select = document.getElementById(selectId);
  select.innerHTML = '';
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option;
    select.appendChild(optionElement);
  });
}

function displayData() {
  const productList = document.getElementById('productList');
  const displayFields = document.getElementById('displayFields');
  productList.innerHTML = '';

  if (products && products.count && products.products) {
    const productsArray = Object.values(products.products);

    if (productsArray.length > 0) {
      productsArray.sort((a, b) => b.popularity - a.popularity);

      const headerRow = productTable.tHead.insertRow();
      Array.from(displayFields.options).forEach(fieldOption => {
        const headerCell = document.createElement('th');
        headerCell.textContent = fieldOption.value[0].toUpperCase() + fieldOption.value.slice(1);
        headerRow.appendChild(headerCell);
      });

      productsArray.forEach(product => {
        const row = productList.insertRow();
        let idx = 0;

        Array.from(displayFields.options).forEach(fieldOption => {
          const field = fieldOption.value;
          row.insertCell(idx).textContent = product[field];
          idx++;
        });
      });
    } else {
      // If there is no data, display a message
      productList.innerHTML = 'No data to display';
    }

  } else {
    console.error('Invalid data format. Expected "products" property in the data.');
  }
}


function populateDisplayOptions() {
  const availableFields = document.getElementById('availableFields');

  if (products && products.count && products.products) {
    const fields = Object.keys(products.products[Object.keys(products.products)[0]]);

    fields.forEach(field => {
      const option = document.createElement('option');
      option.value = field;
      option.text = field;
      availableFields.add(option);
    });
  } else {
    console.error('Invalid data format. Expected "products" property in the data.');
  }
}


function addOption() {
  moveOptions('availableFields', 'displayFields');
}

function removeOption() {
  moveOptions('displayFields', 'availableFields');
}

function moveOptions(fromId, toId) {
  const fromSelect = document.getElementById(fromId);
  const toSelect = document.getElementById(toId);

  Array.from(fromSelect.selectedOptions).forEach(option => {
    toSelect.add(option);
  });
}
