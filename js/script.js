let lang = 'de';
const order = ['Motivation', 'Stressreduktion', 'Bewegung']



async function fetchGoogleSheetData() {
    const url = 'https://docs.google.com/spreadsheets/d/1_HKt_DSxewR-XaneTc88o6v3yyGV23sqKOFXHDCGz6Q/gviz/tq?tqx=out:json';

    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substring(47, text.length - 2));

        // if a row was selected we increase the weight, to ensure that the same row gets not selected multiples time right after each other
        rows = (json.table.rows.map(row => row.c.map(cell => cell?.v || ''))).map(row => row = { 'content': row, 'weight': 0 });

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

    // now only select rows with lowest weight
    let min_weight = Math.min(...rows_subset.map(row => row.weight))
    rows_subset = rows_subset.filter((row) => row.weight == min_weight)

    // select row from rows with lowest weight in this category at random
    let selected_row = rows_subset[Math.floor(Math.random() * rows_subset.length)];

    // give weight to selected row (so that it can only be selected after five iterations in this category [if category has >5 entries])
    rows[rows.indexOf(selected_row)].weight = 5 * order.length + 1;
    for (let row_index in rows) {
        if (rows[row_index].weight != 0) {
            rows[row_index].weight--;
        }
    }

    // if (current_category == 'Bewegung') { console.log(rows_subset.map(rows => rows.content[0])) }

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


// // read last category from order variable and take the next one to the right
// let current_category = order[(order.indexOf(document.getElementById('category').textContent) + 1) % 3]
// let rows_subset = rows.filter((row) => row.content[2] == current_category);

// // select rows in this category that were not selected already
// let not_selected_subset = rows_subset.filter((row) => row.selected == false)

// // if all rows of current_category were selected, reset selection status 
// if (not_selected_subset.length == 0) {
//     for (row of rows_subset) {
//         rows[rows.indexOf(row)].selected = false
//     }
//     not_selected_subset = rows_subset.filter((row) => row.selected == false)
// }

// let selected_row = not_selected_subset[Math.floor(Math.random() * not_selected_subset.length)];
// rows[rows.indexOf(selected_row)].selected = true
// if (current_category == 'Bewegung') { console.log(current_category, rows.indexOf(selected_row)) }



// if (lang == 'en') {
//     document.getElementById('title').textContent = selected_row.content[0 + 3];
//     document.getElementById('description').innerHTML = selected_row.content[1 + 3];
//     document.getElementById('category').textContent = selected_row.content[2 + 3];
// } else {
//     document.getElementById('title').textContent = selected_row.content[0];
//     document.getElementById('description').innerHTML = selected_row.content[1];
//     document.getElementById('category').textContent = selected_row.content[2];
// }