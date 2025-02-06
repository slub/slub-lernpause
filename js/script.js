let lang = 'de';
const order = ['Motivation', 'Stressreduktion', 'Bewegung']



async function fetchGoogleSheetData() {
    const url = 'https://docs.google.com/spreadsheets/d/1_HKt_DSxewR-XaneTc88o6v3yyGV23sqKOFXHDCGz6Q/gviz/tq?tqx=out:json';

    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substring(47, text.length - 2));

        // to prevent repetition, if a row was selected we set selected to true, when all rows are selected wee reset them to false 
        rows = (json.table.rows.map(row => row.c.map(cell => cell?.v || ''))).map(row => row = { 'content': row, 'selected': false });

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
    let current_category = order[(order.indexOf(document.getElementById('category').textContent) + 1) % 3]
    let rows_subset = rows.filter((row) => row.content[2] == current_category);

    // select rows in this category that were not selected already
    let not_selected_subset = rows_subset.filter((row) => row.selected == false)

    // if all rows of current_category were selected, reset selection status 
    if (not_selected_subset.length == 0) {
        for (row of rows_subset) {
            rows[rows.indexOf(row)].selected = false
        }
        not_selected_subset = rows_subset.filter((row) => row.selected == false)
    }

    let selected_row = not_selected_subset[Math.floor(Math.random() * not_selected_subset.length)];
    rows[rows.indexOf(selected_row)].selected = true



    if (lang == 'en') {
        document.getElementById('title').textContent = selected_row.content[0 + 3];
        document.getElementById('description').innerHTML = selected_row.content[1 + 3];
        document.getElementById('category').textContent = selected_row.content[2 + 3];
    } else {
        document.getElementById('title').textContent = selected_row.content[0];
        document.getElementById('description').innerHTML = selected_row.content[1];
        document.getElementById('category').textContent = selected_row.content[2];
    }


}

document.getElementById('next-tip-button').addEventListener('click', selectRandomRow);

fetchGoogleSheetData();