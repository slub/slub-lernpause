let lang = 'de';
const order = ['Motivation', 'Stressreduktion', 'Bewegung']



async function fetchGoogleSheetData() {
    const url = 'https://docs.google.com/spreadsheets/d/1_HKt_DSxewR-XaneTc88o6v3yyGV23sqKOFXHDCGz6Q/gviz/tq?tqx=out:json';

    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substring(47, text.length - 2));
        rows = json.table.rows.map(row => row.c.map(cell => cell?.v || ''));

        console.log(rows);

        // set an inital Category at random
        document.getElementById('category').textContent = order[Math.floor(Math.random() * 3)]
        selectRandomRow();

        document.getElementById('next-tip-button').style.display = 'block';
    } catch (error) {
        document.getElementById('title').textContent = 'Error loading data';
        console.error('Error fetching or parsing Google Sheet data:', error);
    }
}

function selectRandomRow() {
    if (rows.length === 0) {
        document.getElementById('title').textContent = 'No data available';
        document.getElementById('description').textContent = '';
        document.getElementById('category').textContent = '';
        return;
    }

    // read last category from order variable and take the next one to the right
    rows_subset = rows.filter((row) => row[2] == order[(order.indexOf(document.getElementById('category').textContent) + 1) % 3]);

    let selected_row = rows_subset[Math.floor(Math.random() * rows_subset.length)];




    if (lang == 'en') {
        document.getElementById('title').textContent = selected_row[0 + 3];
        document.getElementById('description').innerHTML = selected_row[1 + 3];
        document.getElementById('category').textContent = selected_row[2 + 3];
    } else {
        document.getElementById('title').textContent = selected_row[0];
        document.getElementById('description').innerHTML = selected_row[1];
        document.getElementById('category').textContent = selected_row[2];
    }


}

document.getElementById('next-tip-button').addEventListener('click', selectRandomRow);

fetchGoogleSheetData();