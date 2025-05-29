"use strict";

async function getSQL(eo) {
  eo.preventDefault();

  const sqlReq = document.getElementById("request").value;

  try {
    const response = await fetch("/run", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ request: sqlReq }),
    });

    if (!response.ok) {
      throw new Error("Ошибка при выполнении запроса");
    }

    const data = await response.json();

    if(Array.isArray(data.result)) {
        displayData(data.result);
        document.getElementById("modifiedCount").innerHTML = '';
    } else {
        displayModifiedCount(data.modifiedCount);
        document.getElementById("dataTable").innerHTML = ''
    }

    
  } catch (err) {
    console.error(err);
  }

  function displayData(rows) {
    const table = document.getElementById("dataTable");

    table.innerHTML = "";

    if (rows.length > 0) {
      Object.keys(rows[0]).forEach((key) => {
        const th = document.createElement("th");
        th.textContent = key;
        table.appendChild(th);
      });

      rows.forEach((row) => {
        const tr = document.createElement("tr");
        Object.values(row).forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });
    }
  }
}

function displayModifiedCount(count) {
    const countDiv = document.getElementById("modifiedCount");
    countDiv.textContent = `Количество измененных строк: ${count}`
}
